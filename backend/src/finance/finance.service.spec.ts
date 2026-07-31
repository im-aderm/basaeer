import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeService } from '../realtime/realtime.service';
import { AuditService } from '../audit/audit.service';
import { GeneralLedgerService } from './general-ledger.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: PrismaService;

  const mockPrismaService: any = {
    invoice: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    },
    payment: {
      groupBy: jest.fn().mockResolvedValue([]),
    },
    $queryRaw: jest.fn(),
    $transaction: jest.fn((fn: any) => fn(mockPrismaService)),
  };
  const mockRealtimeService = { sendToBranch: jest.fn() };
  const mockAuditService = { logAction: jest.fn().mockResolvedValue(undefined) };
  const mockLedgerService = {
    postCreditNote: jest.fn().mockResolvedValue(undefined),
    postInvoice: jest.fn().mockResolvedValue(undefined),
    postPayment: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: RealtimeService, useValue: mockRealtimeService },
        { provide: AuditService, useValue: mockAuditService },
        { provide: GeneralLedgerService, useValue: mockLedgerService },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBranchFinancials', () => {
    it('should calculate totals and collection efficiency correctly', async () => {
      // Aggregate across: Invoice 1 (1000 total, 0 balance), Invoice 2 (500
      // total, 250 balance), Invoice 3 (500 total, 500 balance) — combined
      // totalInvoiced=2000, totalOutstanding=750.
      mockPrismaService.$queryRaw.mockResolvedValue([
        { totalInvoiced: 2000, totalOutstanding: 750 },
      ]);

      const result = await service.getBranchFinancials({
        branchId: 'branch-1',
      } as any);

      expect(result.totalInvoiced).toBe(2000);
      expect(result.totalOutstanding).toBe(750);
      expect(result.totalCollected).toBe(1250);
      expect(result.collectionEfficiency).toBe((1250 / 2000) * 100);
    });

    it('should handle zero invoices gracefully', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([
        { totalInvoiced: 0, totalOutstanding: 0 },
      ]);

      const result = await service.getBranchFinancials({
        branchId: 'branch-2',
      } as any);

      expect(result.totalInvoiced).toBe(0);
      expect(result.totalOutstanding).toBe(0);
      expect(result.totalCollected).toBe(0);
      expect(result.collectionEfficiency).toBe(0);
    });
  });

  const branchAdminCtx: TenantContext = {
    userId: 'admin-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  /**
   * Regression tests for the finding that the "already discounted" check
   * was a plain findFirst inside its own transaction, not a locked read or
   * conditional update — two concurrent requests could both pass it before
   * either committed, double-discounting the invoice.
   */
  describe('applyInvoiceDiscount', () => {
    const baseInvoice = {
      id: 'inv-1',
      branchId: 'branch-1',
      status: 'UNPAID',
      balance: 1000,
      discountAmount: null,
    };

    it('applies a discount via an atomic conditional update', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue(baseInvoice);
      mockPrismaService.invoice.updateMany.mockResolvedValue({ count: 1 });
      mockPrismaService.invoice.findUniqueOrThrow.mockResolvedValue({
        ...baseInvoice,
        balance: 900,
        discountAmount: 100,
      });

      await service.applyInvoiceDiscount(
        'inv-1',
        { discountType: 'FIXED', discountValue: 100, discountReason: 'test' },
        branchAdminCtx,
      );

      expect(mockPrismaService.invoice.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'inv-1', discountAmount: null },
        }),
      );
    });

    it('rejects when the atomic update matches zero rows (already discounted by a concurrent request)', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue(baseInvoice);
      mockPrismaService.invoice.updateMany.mockResolvedValue({ count: 0 });

      await expect(
        service.applyInvoiceDiscount(
          'inv-1',
          { discountType: 'FIXED', discountValue: 100, discountReason: 'test' },
          branchAdminCtx,
        ),
      ).rejects.toThrow(BadRequestException);
      expect(mockPrismaService.invoice.findUniqueOrThrow).not.toHaveBeenCalled();
    });
  });

  /**
   * Regression test for the finding that voidInvoice posted no GL entry at
   * all, leaving a voided invoice's receivable/income on the books forever.
   */
  describe('voidInvoice', () => {
    it('posts a credit-note reversal for the outstanding balance', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue({
        id: 'inv-2',
        branchId: 'branch-1',
        status: 'UNPAID',
        balance: 500,
        invoiceNumber: 'INV-002',
        payments: [],
      });
      mockPrismaService.invoice.update.mockResolvedValue({ id: 'inv-2', status: 'VOIDED' });

      await service.voidInvoice('inv-2', branchAdminCtx, 'test void');

      expect(mockLedgerService.postCreditNote).toHaveBeenCalledWith(
        expect.anything(),
        'branch-1',
        'inv-2',
        expect.objectContaining({ }),
      );
    });

    it('skips the GL reversal when there is no outstanding balance to write off', async () => {
      mockPrismaService.invoice.findFirst.mockResolvedValue({
        id: 'inv-3',
        branchId: 'branch-1',
        status: 'UNPAID',
        balance: 0,
        invoiceNumber: 'INV-003',
        payments: [],
      });
      mockPrismaService.invoice.update.mockResolvedValue({ id: 'inv-3', status: 'VOIDED' });

      await service.voidInvoice('inv-3', branchAdminCtx);

      expect(mockLedgerService.postCreditNote).not.toHaveBeenCalled();
    });
  });
});
