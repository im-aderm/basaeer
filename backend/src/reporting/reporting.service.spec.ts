import { Test, TestingModule } from '@nestjs/testing';
import { ReportingService } from './reporting.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ReportingService', () => {
  let service: ReportingService;

  const mockPrismaService: any = {
    invoice: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { balance: null } }),
    },
    payment: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
      findMany: jest.fn().mockResolvedValue([]),
    },
    voucher: {
      aggregate: jest.fn().mockResolvedValue({ _sum: { amount: null } }),
    },
    student: {
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
    },
    class: {
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([]),
    },
    staff: {
      count: jest.fn().mockResolvedValue(0),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ReportingService>(ReportingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUnifiedDashboard', () => {
    it('should return dashboard analytics', async () => {
      const branchId = 'test-branch-id';

      const result = await service.getUnifiedDashboard(branchId);

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('charts');
    });
  });

  describe('getStudentAnalytics', () => {
    it('should return student analytics', async () => {
      const result = await service.getStudentAnalytics({
        branchId: 'test',
      });

      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('charts');
    });
  });

  describe('PDF Export Methods', () => {
    it('should generate student performance PDF', async () => {
      const branchId = 'test-branch-id';

      const result = await service.exportStudentPerformancePDF(branchId);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should generate fees PDF', async () => {
      const branchId = 'test-branch-id';

      const result = await service.exportFeesPDF(branchId);

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('generateExcel', () => {
    it('should generate Excel buffer', async () => {
      const result = await service.generateExcel(
        ['Name', 'Score'],
        [
          ['Alice', '95'],
          ['Bob', '87'],
        ],
      );

      expect(result).toBeInstanceOf(Buffer);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('generateCsv', () => {
    it('should generate CSV string', async () => {
      const result = await service.generateCsv(
        ['Name', 'Score'],
        [
          ['Alice', '95'],
          ['Bob', '87'],
        ],
      );

      expect(result).toContain('Name,Score');
      expect(result).toContain('Alice,95');
      expect(result).toContain('Bob,87');
    });
  });

  describe('fillTemplate', () => {
    it('should resolve placeholders in templates', async () => {
      const template = 'Hello {{name}}, welcome to {{school}}';
      const data = { name: 'John', school: 'Basaer Academy' };

      const result = await service.fillTemplate(template, data);

      expect(result).toBe('Hello John, welcome to Basaer Academy');
    });
  });
});
