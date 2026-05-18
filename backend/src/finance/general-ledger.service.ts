import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Decimal } from '@prisma/client/runtime/library';
import { AccountType, EntrySide, JournalType } from '../generated/client/client';

interface PostingLine {
  accountCode: string;
  side: EntrySide;
  amount: Decimal;
  description?: string;
}

@Injectable()
export class GeneralLedgerService {
  private readonly logger = new Logger(GeneralLedgerService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Seed the default Chart of Accounts for a branch.
   * Creates standard accounts: Cash, Receivables, Payables, Income, Expenses, Equity.
   */
  async seedChartOfAccounts(branchId: string, userId: string) {
    const existing = await this.prisma.chartOfAccount.findFirst({
      where: { branchId },
    });
    if (existing) return { message: 'Chart of Accounts already seeded' };

    const accounts = [
      { code: '1000', name: 'Assets', type: AccountType.ASSET },
      { code: '1100', name: 'Cash & Bank', type: AccountType.ASSET, parent: '1000' },
      { code: '1101', name: 'Bank Account', type: AccountType.ASSET, parent: '1100' },
      { code: '1200', name: 'Accounts Receivable', type: AccountType.ASSET, parent: '1000' },
      { code: '1201', name: 'Student Fees Receivable', type: AccountType.ASSET, parent: '1200' },
      { code: '2000', name: 'Liabilities', type: AccountType.LIABILITY },
      { code: '2100', name: 'Accounts Payable', type: AccountType.LIABILITY, parent: '2000' },
      { code: '2200', name: 'Student Credit Balances', type: AccountType.LIABILITY, parent: '2000' },
      { code: '2300', name: 'Tax Payable', type: AccountType.LIABILITY, parent: '2000' },
      { code: '4000', name: 'Income', type: AccountType.INCOME },
      { code: '4100', name: 'School Fees Income', type: AccountType.INCOME, parent: '4000' },
      { code: '4200', name: 'Other Income', type: AccountType.INCOME, parent: '4000' },
      { code: '5000', name: 'Expenses', type: AccountType.EXPENSE },
      { code: '5100', name: 'Salaries & Wages', type: AccountType.EXPENSE, parent: '5000' },
      { code: '5200', name: 'Utilities', type: AccountType.EXPENSE, parent: '5000' },
      { code: '5300', name: 'Maintenance', type: AccountType.EXPENSE, parent: '5000' },
      { code: '5400', name: 'General Expenses', type: AccountType.EXPENSE, parent: '5000' },
      { code: '6000', name: 'Equity', type: AccountType.EQUITY },
      { code: '6100', name: 'Retained Earnings', type: AccountType.EQUITY, parent: '6000' },
    ];

    // Create parent accounts first, then children
    const parents = accounts.filter((a) => !('parent' in a && a.parent));
    const children = accounts.filter((a) => 'parent' in a && a.parent);

    for (const acct of parents) {
      await this.prisma.chartOfAccount.create({
        data: { code: acct.code, name: acct.name, type: acct.type, branchId },
      });
    }

    for (const acct of children) {
      const parent = await this.prisma.chartOfAccount.findFirst({
        where: { code: acct.parent!, branchId },
      });
      await this.prisma.chartOfAccount.create({
        data: {
          code: acct.code,
          name: acct.name,
          type: acct.type,
          branchId,
          parentId: parent?.id,
        },
      });
    }

    this.logger.log(`Seeded Chart of Accounts for branch ${branchId}`);
    return { message: `Seeded ${accounts.length} accounts` };
  }

  /**
   * Get account by code for a branch. Creates it if it doesn't exist.
   */
  private async getOrCreateAccount(
    tx: any,
    branchId: string,
    code: string,
    name: string,
    type: AccountType,
  ) {
    let account = await tx.chartOfAccount.findFirst({
      where: { code, branchId },
    });
    if (!account) {
      account = await tx.chartOfAccount.create({
        data: { code, name, type, branchId },
      });
    }
    return account;
  }

  /**
   * Post a journal entry with balanced debits and credits.
   */
  async postJournal(
    tx: any,
    params: {
      journalType: JournalType;
      referenceId: string;
      description?: string;
      branchId: string;
      sessionId?: string;
      lines: PostingLine[];
    },
  ) {
    const { journalType, referenceId, description, branchId, sessionId, lines } = params;

    // Verify debits equal credits
    let totalDebits = new Decimal(0);
    let totalCredits = new Decimal(0);
    for (const line of lines) {
      if (line.side === EntrySide.DEBIT) {
        totalDebits = totalDebits.plus(line.amount);
      } else {
        totalCredits = totalCredits.plus(line.amount);
      }
    }

    if (!totalDebits.eq(totalCredits)) {
      this.logger.error(
        `Unbalanced journal: debits=${totalDebits}, credits=${totalCredits} for ref=${referenceId}`,
      );
      throw new Error(
        `Journal entry is not balanced. Debits: ${totalDebits}, Credits: ${totalCredits}`,
      );
    }

    const journal = await tx.journalEntry.create({
      data: {
        journalType,
        referenceId,
        description,
        date: new Date(),
        branchId,
        sessionId,
      },
    });

    for (const line of lines) {
      const account = await tx.chartOfAccount.findFirst({
        where: { code: line.accountCode, branchId },
      });
      if (!account) {
        this.logger.warn(
          `Account ${line.accountCode} not found for branch ${branchId}, creating...`,
        );
        continue;
      }

      await tx.generalLedgerEntry.create({
        data: {
          journalId: journal.id,
          accountId: account.id,
          side: line.side,
          amount: line.amount,
          description: line.description,
          branchId,
          sessionId,
        },
      });
    }

    return journal;
  }

  /**
   * Post invoice creation: Debit Receivables, Credit Income.
   */
  async postInvoice(
    tx: any,
    branchId: string,
    invoiceId: string,
    totalAmount: Decimal,
    sessionId?: string,
  ) {
    return this.postJournal(tx, {
      journalType: JournalType.INVOICE,
      referenceId: invoiceId,
      description: `Invoice ${invoiceId}`,
      branchId,
      sessionId,
      lines: [
        {
          accountCode: '1201',
          side: EntrySide.DEBIT,
          amount: totalAmount,
          description: 'Student Fees Receivable',
        },
        {
          accountCode: '4100',
          side: EntrySide.CREDIT,
          amount: totalAmount,
          description: 'School Fees Income',
        },
      ],
    });
  }

  /**
   * Post payment receipt: Debit Cash, Credit Receivables.
   */
  async postPayment(
    tx: any,
    branchId: string,
    paymentId: string,
    amount: Decimal,
    sessionId?: string,
  ) {
    return this.postJournal(tx, {
      journalType: JournalType.PAYMENT,
      referenceId: paymentId,
      description: `Payment ${paymentId}`,
      branchId,
      sessionId,
      lines: [
        {
          accountCode: '1101',
          side: EntrySide.DEBIT,
          amount,
          description: 'Cash / Bank Receipt',
        },
        {
          accountCode: '1201',
          side: EntrySide.CREDIT,
          amount,
          description: 'Reduce Receivables',
        },
      ],
    });
  }

  /**
   * Post voucher approval: Debit Expense, Credit Cash.
   */
  async postVoucher(
    tx: any,
    branchId: string,
    voucherId: string,
    amount: Decimal,
    sessionId?: string,
  ) {
    return this.postJournal(tx, {
      journalType: JournalType.VOUCHER,
      referenceId: voucherId,
      description: `Voucher ${voucherId}`,
      branchId,
      sessionId,
      lines: [
        {
          accountCode: '5400',
          side: EntrySide.DEBIT,
          amount,
          description: 'General Expenses',
        },
        {
          accountCode: '1101',
          side: EntrySide.CREDIT,
          amount,
          description: 'Cash / Bank Payment',
        },
      ],
    });
  }

  /**
   * Post credit note: Debit Income, Credit Receivables (reversal).
   */
  async postCreditNote(
    tx: any,
    branchId: string,
    creditNoteId: string,
    amount: Decimal,
    sessionId?: string,
  ) {
    return this.postJournal(tx, {
      journalType: JournalType.CREDIT_NOTE,
      referenceId: creditNoteId,
      description: `Credit Note ${creditNoteId}`,
      branchId,
      sessionId,
      lines: [
        {
          accountCode: '4100',
          side: EntrySide.DEBIT,
          amount,
          description: 'Reduce Fee Income',
        },
        {
          accountCode: '1201',
          side: EntrySide.CREDIT,
          amount,
          description: 'Reduce Receivables',
        },
      ],
    });
  }

  /**
   * Get trial balance for a branch.
   */
  async getTrialBalance(branchId: string) {
    const entries = await this.prisma.generalLedgerEntry.findMany({
      where: { branchId },
      include: { account: { select: { code: true, name: true, type: true } } },
    });

    const balances = new Map<
      string,
      { code: string; name: string; type: AccountType; debits: number; credits: number }
    >();

    for (const e of entries) {
      const key = e.account.code;
      if (!balances.has(key)) {
        balances.set(key, {
          code: e.account.code,
          name: e.account.name,
          type: e.account.type,
          debits: 0,
          credits: 0,
        });
      }
      const b = balances.get(key)!;
      if (e.side === EntrySide.DEBIT) {
        b.debits += e.amount.toNumber();
      } else {
        b.credits += e.amount.toNumber();
      }
    }

    const result = Array.from(balances.values()).map((b) => ({
      ...b,
      balance: b.debits - b.credits,
    }));

    const totalDebits = result.reduce((sum, r) => sum + r.debits, 0);
    const totalCredits = result.reduce((sum, r) => sum + r.credits, 0);

    return {
      accounts: result,
      totalDebits,
      totalCredits,
      isBalanced: Math.abs(totalDebits - totalCredits) < 0.01,
    };
  }
}
