import { Test, TestingModule } from '@nestjs/testing';
import { PayrollService } from './payroll.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PayrollService', () => {
  let service: PayrollService;
  let prisma: PrismaService;

  const mockPrismaService = {
    staff: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    salaryTemplate: {
      upsert: jest.fn(),
    },
    payroll: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayrollService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PayrollService>(PayrollService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrUpdateSalaryTemplate', () => {
    it('should create a new salary template', async () => {
      const dto = {
        staffId: 'staff-123',
        basicSalary: 50000,
        allowances: { housing: 10000 },
        deductions: { tax: 5000 },
        netSalary: 55000,
      };

      mockPrismaService.staff.findUnique.mockResolvedValue({ id: 'staff-123' });
      mockPrismaService.salaryTemplate.upsert.mockResolvedValue({
        id: 'template-123',
        ...dto,
      });

      const result = await service.createOrUpdateSalaryTemplate(dto);

      expect(result).toBeDefined();
      expect(result.staffId).toBe('staff-123');
      expect(result.netSalary).toBe(55000);
      expect(mockPrismaService.salaryTemplate.upsert).toHaveBeenCalled();
    });

    it('should throw NotFoundException if staff not found', async () => {
      const dto = {
        staffId: 'invalid-staff',
        basicSalary: 50000,
        netSalary: 50000,
      };

      mockPrismaService.staff.findUnique.mockResolvedValue(null);

      await expect(service.createOrUpdateSalaryTemplate(dto)).rejects.toThrow(
        'Staff not found',
      );
    });
  });

  describe('generateMonthlyPayroll', () => {
    it('should generate payroll for active staff with templates', async () => {
      const dto = {
        branchId: 'branch-123',
        month: 1,
        year: 2026,
      };

      const mockStaff = [
        {
          id: 'staff-1',
          salaryTemplate: { netSalary: 50000 },
        },
        {
          id: 'staff-2',
          salaryTemplate: { netSalary: 60000 },
        },
      ];

      mockPrismaService.staff.findMany.mockResolvedValue(mockStaff);
      mockPrismaService.payroll.findFirst.mockResolvedValue(null);
      mockPrismaService.payroll.create.mockImplementation((data) =>
        Promise.resolve({ id: 'payroll-123', ...data.data }),
      );

      const result = await service.generateMonthlyPayroll(dto);

      expect(result.entries).toHaveLength(2);
      expect(result.message).toContain('2 new payroll entries');
      expect(mockPrismaService.payroll.create).toHaveBeenCalledTimes(2);
    });

    it('should skip staff with existing payroll for the month', async () => {
      const dto = {
        branchId: 'branch-123',
        month: 1,
        year: 2026,
      };

      const mockStaff = [
        {
          id: 'staff-1',
          salaryTemplate: { netSalary: 50000 },
        },
      ];

      mockPrismaService.staff.findMany.mockResolvedValue(mockStaff);
      mockPrismaService.payroll.findFirst.mockResolvedValue({
        id: 'existing-payroll',
      });

      const result = await service.generateMonthlyPayroll(dto);

      expect(result.entries).toHaveLength(0);
      expect(mockPrismaService.payroll.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if no staff with templates', async () => {
      const dto = {
        branchId: 'branch-123',
        month: 1,
        year: 2026,
      };

      mockPrismaService.staff.findMany.mockResolvedValue([]);

      await expect(service.generateMonthlyPayroll(dto)).rejects.toThrow(
        'No active staff with salary templates found in this branch',
      );
    });
  });

  describe('getStaffPayrollHistory', () => {
    it('should return payroll history for a staff member', async () => {
      const staffId = 'staff-123';
      const mockHistory = [
        { id: 'pay-1', month: 12, year: 2025, amountPaid: 50000 },
        { id: 'pay-2', month: 11, year: 2025, amountPaid: 50000 },
      ];

      mockPrismaService.payroll.findMany.mockResolvedValue(mockHistory);

      const result = await service.getStaffPayrollHistory(staffId);

      expect(result).toHaveLength(2);
      expect(result[0].month).toBe(12);
    });
  });

  describe('markAsPaid', () => {
    it('should update payroll status to PAID', async () => {
      const payrollId = 'payroll-123';
      const mockUpdated = {
        id: payrollId,
        status: 'PAID',
        paymentDate: expect.any(Date),
      };

      mockPrismaService.payroll.update.mockResolvedValue(mockUpdated);

      const result = await service.markAsPaid(payrollId);

      expect(result.status).toBe('PAID');
      expect(result.paymentDate).toBeDefined();
      expect(mockPrismaService.payroll.update).toHaveBeenCalledWith({
        where: { id: payrollId },
        data: { status: 'PAID', paymentDate: expect.any(Date) },
      });
    });
  });
});
