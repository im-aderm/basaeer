import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FinanceService', () => {
  let service: FinanceService;
  let prisma: PrismaService;

  const mockPrismaService = {
    invoice: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: PrismaService, useValue: mockPrismaService },
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
      // Mock data:
      // Invoice 1: 1000 total, 0 balance (fully paid)
      // Invoice 2: 500 total, 250 balance (partially paid)
      // Invoice 3: 500 total, 500 balance (unpaid)
      const mockInvoices = [
        { totalAmount: 1000, balance: 0 },
        { totalAmount: 500, balance: 250 },
        { totalAmount: 500, balance: 500 },
      ];

      (mockPrismaService.invoice.findMany as jest.Mock).mockResolvedValue(mockInvoices);

      const result = await service.getBranchFinancials({ branchId: 'branch-1' } as any);

      expect(prisma.invoice.findMany).toHaveBeenCalledWith({
        where: { branchId: 'branch-1' },
        select: { totalAmount: true, balance: true },
      });

      expect(result.totalInvoiced).toBe(2000);
      expect(result.totalOutstanding).toBe(750);
      expect(result.totalCollected).toBe(1250);
      expect(result.collectionEfficiency).toBe((1250 / 2000) * 100);
    });

    it('should handle zero invoices gracefully', async () => {
      (mockPrismaService.invoice.findMany as jest.Mock).mockResolvedValue([]);

      const result = await service.getBranchFinancials({ branchId: 'branch-2' } as any);

      expect(result.totalInvoiced).toBe(0);
      expect(result.totalOutstanding).toBe(0);
      expect(result.totalCollected).toBe(0);
      expect(result.collectionEfficiency).toBe(0);
    });
  });
});
