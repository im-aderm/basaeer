import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFeeCategoryDto } from './dto/create-fee-category.dto';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { CreateExpenseCategoryDto, CreateVoucherDto } from './dto/voucher.dto';
import {
  PaymentStatus,
  InvoiceStatus,
  PaymentMethod,
  VoucherStatus,
  VoucherType,
} from '../generated/client/client';
import { Decimal } from '@prisma/client/runtime/library';
import { Prisma } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { RealtimeService } from '../realtime/realtime.service';
import { AuditService } from '../audit/audit.service';
import { GeneralLedgerService } from './general-ledger.service';
import { ApplyDiscountDto } from './dto/apply-discount.dto';
import { computeDiscount, discountCapsFromEnv } from './discount.util';

@Injectable()
export class FinanceService {
  private readonly logger = new Logger(FinanceService.name);

  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeService,
    private audit: AuditService,
    private ledger: GeneralLedgerService,
  ) {}

  async createFeeCategory(dto: CreateFeeCategoryDto, context: TenantContext) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    return this.prisma.feeCategory.create({ data: { ...dto, branchId } });
  }

  async createFeeStructure(dto: CreateFeeStructureDto, context: TenantContext) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    return this.prisma.feeStructure.create({ data: { ...dto, branchId } });
  }

  async getFeeCategories(context: TenantContext) {
    return this.prisma.feeCategory.findMany({
      where: TenantHelper.applyIsolation({}, context),
    });
  }

  async getFeeStructures(context: TenantContext) {
    return this.prisma.feeStructure.findMany({
      where: TenantHelper.applyIsolation({}, context),
      include: { category: true, class: true },
    });
  }

  async createInvoice(dto: CreateInvoiceDto, context: TenantContext) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    const { studentId, dueDate, items } = dto;
    const totalAmount = items.reduce(
      (sum, item) => sum.plus(new Decimal(item.amount)),
      new Decimal(0),
    );

    return this.prisma
      .$transaction(async (tx) => {
        // Verify student ownership
        const student = await tx.student.findFirst({
          where: TenantHelper.applyIsolation({ id: studentId }, context),
        });
        if (!student)
          throw new ForbiddenException('Student not found in your branch');

        // Generate unique invoice number using atomic counter
        const counter = await tx.counter.upsert({
          where: { branchId_model: { branchId, model: 'Invoice' } },
          update: { lastValue: { increment: 1 } },
          create: { branchId, model: 'Invoice', lastValue: 1 },
        });

        const invoiceNumber = `INV-${new Date().getFullYear()}-${counter.lastValue.toString().padStart(4, '0')}`;

        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber,
            studentId,
            dueDate: new Date(dueDate),
            totalAmount,
            balance: totalAmount,
            branchId,
            status: InvoiceStatus.UNPAID,
            items: {
              create: items.map((item) => ({
                amount: item.amount,
                categoryId: item.categoryId,
              })),
            },
          },
          include: {
            items: true,
            student: { select: { firstName: true, lastName: true } },
          },
        });

        // Post to General Ledger: Debit Receivables, Credit Income. Let a
        // posting failure roll back the whole transaction — silently
        // swallowing it here previously let the invoice commit with no
        // matching GL entry, drifting the ledger from the books over time.
        await this.ledger.postInvoice(tx, branchId, invoice.id, totalAmount);

        return invoice;
      })
      .then(async (invoice) => {
        this.realtime.sendToBranch(branchId, 'finance.invoice_created', {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          studentId,
          totalAmount,
          dueDate: new Date(dueDate).toISOString(),
        });
        await this.audit.logAction(
          context.userId,
          'INVOICE_CREATED',
          'FINANCE',
          branchId,
          { invoiceId: invoice.id, invoiceNumber: invoice.invoiceNumber, studentId, totalAmount: totalAmount.toString() },
        );
        return invoice;
      });
  }

  async recordPayment(dto: RecordPaymentDto, context: TenantContext) {
    const { invoiceId, amount, method, transactionId, proofUrl, notes } = dto;

    return this.prisma
      .$transaction(async (tx) => {
        // Verify invoice ownership
        const invoice = await tx.invoice.findFirst({
          where: TenantHelper.applyIsolation({ id: invoiceId }, context, { softDelete: true }),
        });

        if (!invoice)
          throw new NotFoundException('Invoice not found or access denied');
        if (Number(invoice.balance) <= 0)
          throw new BadRequestException('Invoice is already fully paid');

        const status =
          method === PaymentMethod.BANK_TRANSFER
            ? PaymentStatus.PENDING
            : PaymentStatus.COMPLETED;

        const payment = await tx.payment.create({
          data: {
            invoiceId,
            branchId: invoice.branchId,
            amount,
            method,
            status,
            transactionId,
            proofUrl,
            notes,
          },
        });

        if (status === PaymentStatus.COMPLETED) {
          await this.updateInvoiceBalance(tx, invoiceId, amount);
          // Post to General Ledger: Debit Cash, Credit Receivables. As
          // above, a posting failure now rolls back the whole transaction
          // instead of leaving a payment recorded with no GL entry.
          await this.ledger.postPayment(tx, invoice.branchId, payment.id, new Decimal(amount));
        }

        return payment;
      })
      .then(async (payment) => {
        this.realtime.sendToBranch(
          context.branchId || '',
          'finance.payment_recorded',
          {
            paymentId: payment.id,
            invoiceId,
            amount,
            method,
            status,
          },
        );
        await this.audit.logAction(
          context.userId,
          'PAYMENT_RECORDED',
          'FINANCE',
          context.branchId || undefined,
          { paymentId: payment.id, invoiceId, amount, method, status },
        );
        return payment;
      });
  }

  /**
   * Applies a discount to a fee invoice (percentage or fixed), reducing the
   * outstanding balance. Restricted to approvers, capped, reason-required, and
   * audited. A matching credit note is posted to the general ledger so the
   * books stay balanced, and a discount can only be applied once per invoice.
   */
  async applyInvoiceDiscount(
    invoiceId: string,
    dto: ApplyDiscountDto,
    context: TenantContext,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findFirst({
        where: TenantHelper.applyIsolation({ id: invoiceId }, context),
      });
      if (!invoice) throw new NotFoundException('Invoice not found');
      if (invoice.status === InvoiceStatus.VOIDED) {
        throw new BadRequestException('Cannot discount a voided invoice.');
      }
      if (invoice.discountAmount != null) {
        throw new BadRequestException(
          'A discount has already been applied to this invoice.',
        );
      }

      const balance = new Decimal(invoice.balance);
      if (balance.lte(0)) {
        throw new BadRequestException(
          'This invoice has no outstanding balance to discount.',
        );
      }

      const { discountAmount, netAmount } = computeDiscount(
        balance,
        { type: dto.discountType, value: dto.discountValue },
        discountCapsFromEnv(),
      );

      const newStatus = netAmount.lte(0)
        ? InvoiceStatus.PAID
        : invoice.status;

      // Atomic compare-and-swap: the WHERE clause re-checks discountAmount
      // is still null as part of the same UPDATE statement, so if two
      // concurrent requests both pass the findFirst check above, Postgres
      // serializes their UPDATEs on this row and only the first one to
      // commit actually matches — the second affects 0 rows here instead of
      // silently double-discounting the invoice.
      const { count } = await tx.invoice.updateMany({
        where: { id: invoice.id, discountAmount: null },
        data: {
          balance: netAmount,
          status: newStatus,
          discountType: dto.discountType,
          discountValue: new Decimal(dto.discountValue),
          discountAmount,
          discountReason: dto.discountReason,
          discountedById: context.userId,
          discountedAt: new Date(),
        },
      });
      if (count === 0) {
        throw new BadRequestException(
          'A discount has already been applied to this invoice.',
        );
      }
      const updated = await tx.invoice.findUniqueOrThrow({
        where: { id: invoice.id },
      });

      // Keep the ledger balanced: a discount is a credit note against the
      // receivable/income accounts.
      await this.ledger
        .postCreditNote(tx, invoice.branchId, invoice.id, discountAmount)
        .catch((e) =>
          this.logger.error(
            `GL credit note failed for discount on invoice ${invoice.id}: ${e.message}`,
          ),
        );

      await this.audit
        .logAction(
          context.userId,
          'DISCOUNT_APPLIED',
          'finance',
          invoice.branchId,
          {
            invoiceId: invoice.id,
            discountType: dto.discountType,
            discountValue: dto.discountValue,
            discountAmount: discountAmount.toString(),
            before: { balance: balance.toString(), status: invoice.status },
            after: { balance: netAmount.toString(), status: newStatus },
          },
          dto.discountReason,
        )
        .catch(() => undefined);

      return updated;
    });
  }

  private async updateInvoiceBalance(
    tx: any,
    invoiceId: string,
    amountPaid: number,
  ) {
    const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice) return;

    const paid = new Decimal(amountPaid);
    const balance = new Decimal(invoice.balance);
    const total = new Decimal(invoice.totalAmount);

    // Detect overpayment and credit excess to student account
    if (paid.gt(balance)) {
      const excess = paid.minus(balance);
      await this.creditStudentAccount(tx, invoice.studentId, invoice.branchId, excess, invoiceId);
    }

    const newBalance = Decimal.max(0, balance.minus(paid));

    let newStatus: InvoiceStatus = InvoiceStatus.PARTIALLY_PAID;
    if (newBalance.eq(0)) {
      newStatus = InvoiceStatus.PAID;
    } else if (newBalance.eq(total)) {
      newStatus = InvoiceStatus.UNPAID;
    }

    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        balance: newBalance,
        status: newStatus,
      },
    });
  }

  private async creditStudentAccount(
    tx: any,
    studentId: string,
    branchId: string,
    amount: Decimal,
    referenceInvoiceId: string,
  ) {
    const numericAmount = amount.toNumber();

    const account = await tx.studentAccount.upsert({
      where: { studentId },
      update: { creditBalance: { increment: numericAmount } },
      create: { studentId, branchId, creditBalance: amount },
    });

    await tx.creditTransaction.create({
      data: {
        studentAccountId: account.id,
        type: 'OVERPAYMENT',
        amount,
        description: `Excess payment credited from invoice ${referenceInvoiceId}`,
        referenceId: referenceInvoiceId,
        branchId,
      },
    });
  }

  async verifyPayment(
    paymentId: string,
    isApproved: boolean,
    context: TenantContext,
  ) {
    return this.prisma
      .$transaction(async (tx) => {
        const payment = await tx.payment.findUnique({
          where: { id: paymentId },
          include: { invoice: true },
        });

        if (!payment) throw new NotFoundException('Payment not found');

        // Ownership check through invoice
        if (
          !context.isSuperAdmin &&
          payment.invoice.branchId !== context.branchId
        ) {
          throw new ForbiddenException(
            'You do not have access to this payment',
          );
        }

        if (payment.status !== PaymentStatus.PENDING) {
          throw new BadRequestException('Payment is not in pending state');
        }

        if (isApproved) {
          await tx.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.COMPLETED },
          });

          await this.updateInvoiceBalance(
            tx,
            payment.invoiceId,
            Number(payment.amount),
          );
        } else {
          await tx.payment.update({
            where: { id: paymentId },
            data: { status: PaymentStatus.REJECTED },
          });
        }

        return {
          message: isApproved ? 'Payment approved' : 'Payment rejected',
        };
      })
      .then(async (result) => {
        this.realtime.sendToBranch(
          context.branchId || '',
          'finance.payment_verified',
          {
            paymentId,
            invoiceId: '',
            approved: isApproved,
          },
        );
        await this.audit.logAction(
          context.userId,
          'PAYMENT_VERIFIED',
          'FINANCE',
          context.branchId || undefined,
          { paymentId, approved: isApproved },
        );
        return result;
      });
  }

  async getStudentInvoices(studentId: string, context: TenantContext) {
    // Ownership check
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });
    if (!student) throw new ForbiddenException('Access denied');

    return this.prisma.invoice.findMany({
      where: { studentId },
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBranchFinancials(context: TenantContext) {
    const branchFilter = context.branchId
      ? Prisma.sql`WHERE "branchId" = ${context.branchId}`
      : Prisma.empty;
    const invoices = await this.prisma.$queryRaw<{ totalInvoiced: number; totalOutstanding: number }[]>`
      SELECT 
        COALESCE(SUM("totalAmount"), 0)::FLOAT as "totalInvoiced",
        COALESCE(SUM("balance"), 0)::FLOAT as "totalOutstanding"
      FROM "Invoice"
      ${branchFilter}
    `;

    const totals = invoices[0];
    const totalInvoiced = Number(totals.totalInvoiced);
    const totalOutstanding = Number(totals.totalOutstanding);
    const totalCollected = totalInvoiced - totalOutstanding;

    const paymentMethodBreakdown = await this.prisma.payment.groupBy({
      by: ['method'],
      where: {
        status: 'COMPLETED',
        invoice: TenantHelper.applyIsolation({}, context),
      },
      _sum: { amount: true },
    });

    const paymentMethods = paymentMethodBreakdown.map((row) => ({
      method: row.method,
      total: row._sum.amount || 0,
    }));

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      collectionEfficiency:
        totalInvoiced > 0 ? (totalCollected / totalInvoiced) * 100 : 0,
      paymentMethods,
    };
  }

  async createExpenseCategory(
    dto: CreateExpenseCategoryDto,
    context: TenantContext,
  ) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    return this.prisma.expenseCategory.create({ data: { ...dto, branchId } });
  }

  async getExpenseCategories(context: TenantContext) {
    return this.prisma.expenseCategory.findMany({
      where: TenantHelper.applyIsolation({}, context),
    });
  }

  async createVoucher(dto: CreateVoucherDto, context: TenantContext) {
    const branchId = dto.branchId || context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    const voucher = await this.prisma.$transaction(async (tx) => {
      const counter = await tx.counter.upsert({
        where: { branchId_model: { branchId, model: 'Voucher' } },
        update: { lastValue: { increment: 1 } },
        create: { branchId, model: 'Voucher', lastValue: 1 },
      });

      const voucherNumber = `VCH-${new Date().getFullYear()}-${counter.lastValue.toString().padStart(4, '0')}`;

      return tx.voucher.create({
        data: {
          ...dto,
          branchId,
          voucherNumber,
          type: dto.type || VoucherType.EXPENSE,
          status: 'PENDING',
        },
      });
    });

    await this.audit.logAction(
      context.userId,
      'VOUCHER_CREATED',
      'FINANCE',
      branchId,
      { voucherId: voucher.id, voucherNumber: voucher.voucherNumber, amount: dto.amount },
    );

    return voucher;
  }

  async updateVoucherStatus(
    id: string,
    status: VoucherStatus,
    context: TenantContext,
  ) {
    const voucher = await this.prisma.voucher.findFirst({
      where: TenantHelper.applyIsolation({ id }, context),
    });
    if (!voucher) throw new NotFoundException('Voucher not found');

    const updated = await this.prisma.voucher.update({
      where: { id },
      data: {
        status,
        approvedByUserId: status === 'APPROVED' ? context.userId : null,
      },
    });

    // Post PAYMENT_ON_ACCOUNT vouchers to student account when approved
    if (status === VoucherStatus.APPROVED && voucher.type === VoucherType.PAYMENT_ON_ACCOUNT && voucher.studentId) {
      const amount = new Decimal(voucher.amount);
      const account = await this.prisma.studentAccount.upsert({
        where: { studentId: voucher.studentId },
        update: { creditBalance: { increment: amount } },
        create: { studentId: voucher.studentId, branchId: voucher.branchId, creditBalance: amount },
      });
      await this.prisma.creditTransaction.create({
        data: {
          studentAccountId: account.id,
          type: 'OVERPAYMENT',
          amount,
          description: `Payment on account — voucher ${voucher.voucherNumber}`,
          referenceId: voucher.id,
          branchId: voucher.branchId,
        },
      });
    }

    // Post to General Ledger when voucher is approved
    if (status === VoucherStatus.APPROVED) {
      await this.ledger.postVoucher(
        this.prisma as any, // Not inside a tx, so use prisma directly
        voucher.branchId,
        voucher.id,
        new Decimal(voucher.amount),
      ).catch((e) => {
        this.logger.error(`GL posting failed for voucher ${voucher.id}: ${e.message}`);
      });
    }

    await this.audit.logAction(
      context.userId,
      'VOUCHER_STATUS_UPDATED',
      'FINANCE',
      voucher.branchId,
      { voucherId: id, newStatus: status, previousStatus: voucher.status },
    );

    return updated;
  }

  async getVouchers(context: TenantContext, skip?: number, take: number = 100) {
    return this.prisma.voucher.findMany({
      where: TenantHelper.applyIsolation({}, context) as any,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 100,
      include: { category: true, approvedBy: true },
      orderBy: { date: 'desc' },
    });
  }

  async getCashflow(context: TenantContext, months: number = 6) {
    const branchId = context.branchId || '';
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    const incomeData: any[] = await this.prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        SUM(amount)::FLOAT as total
      FROM "Payment"
      WHERE status = 'COMPLETED' 
        AND "branchId" = ${branchId}
        AND "createdAt" >= ${since}
      GROUP BY month
    `;

    const expenseData: any[] = await this.prisma.$queryRaw`
      SELECT 
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(amount)::FLOAT as total
      FROM "Voucher"
      WHERE status IN ('APPROVED', 'PAID')
        AND "branchId" = ${branchId}
        AND date >= ${since}
      GROUP BY month
    `;

    const monthsData: Record<string, { income: number; expenses: number }> = {};
    for (let i = 0; i < months; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthsData[key] = { income: 0, expenses: 0 };
    }

    for (const d of incomeData) {
      if (monthsData[d.month]) monthsData[d.month].income = d.total;
    }

    for (const d of expenseData) {
      if (monthsData[d.month]) monthsData[d.month].expenses = d.total;
    }

    return Object.entries(monthsData)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
      }))
      .reverse();
  }

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async markOverdueInvoices() {
    const now = new Date();
    const result = await this.prisma.invoice.updateMany({
      where: {
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { lt: now },
      },
      data: { status: InvoiceStatus.OVERDUE },
    });
    if (result.count > 0) {
      this.logger.log(`Marked ${result.count} invoices as OVERDUE`);
    }
  }

  async voidInvoice(invoiceId: string, context: TenantContext, reason?: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: TenantHelper.applyIsolation({ id: invoiceId }, context),
      include: { payments: { where: { status: PaymentStatus.COMPLETED } } },
    });

    if (!invoice) throw new NotFoundException('Invoice not found');
    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Cannot void a fully paid invoice');
    }
    if (invoice.status === InvoiceStatus.VOIDED) {
      throw new BadRequestException('Invoice is already voided');
    }

    const outstandingBalance = new Decimal(invoice.balance);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.VOIDED,
          balance: new Decimal(0),
        },
      });

      // Voiding writes off the outstanding receivable/income for whatever
      // balance remained — payments already received were already reflected
      // via postPayment and are untouched. Previously this posted no GL
      // entry at all, so a voided invoice's receivable/income stayed on the
      // books forever, diverging the ledger from the invoice records.
      if (outstandingBalance.gt(0)) {
        await this.ledger.postCreditNote(
          tx,
          invoice.branchId,
          invoice.id,
          outstandingBalance,
        );
      }

      await this.audit.logAction(
        context.userId,
        'INVOICE_VOIDED',
        'FINANCE',
        invoice.branchId,
        { invoiceId, invoiceNumber: invoice.invoiceNumber, reason },
      );

      return updated;
    });
  }
}
