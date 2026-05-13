import { Test, TestingModule } from '@nestjs/testing';
import { LeaveService } from './leave.service';
import { PrismaService } from '../prisma/prisma.service';

describe('LeaveService', () => {
  let service: LeaveService;
  let prisma: PrismaService;

  const mockContext = {
    userId: 'user-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: 'HR' as any,
  };

  const mockPrismaService = {
    staff: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    leaveRequest: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaveService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LeaveService>(LeaveService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('applyLeave', () => {
    it('should create a leave request', async () => {
      const staffId = 'staff-123';
      const dto = {
        type: 'ANNUAL',
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        reason: 'Family vacation',
      };

      const mockLeaveRequest = {
        id: 'leave-123',
        staffId,
        ...dto,
        status: 'PENDING',
      };

      mockPrismaService.staff.findUnique.mockResolvedValue({ id: staffId });
      mockPrismaService.leaveRequest.create.mockResolvedValue(mockLeaveRequest);

      const result = await service.applyLeave(staffId, dto, 'branch-test');

      expect(result).toBeDefined();
      expect(result.staffId).toBe(staffId);
      expect(result.status).toBe('PENDING');
      expect(mockPrismaService.leaveRequest.create).toHaveBeenCalledWith({
        data: {
          staffId,
          type: dto.type,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          reason: dto.reason,
          status: 'PENDING',
        },
      });
    });
  });

  describe('updateLeaveStatus', () => {
    it('should approve a leave request', async () => {
      const requestId = 'leave-123';
      const dto = { status: 'APPROVED' as const };

      const mockRequest = {
        id: requestId,
        status: 'PENDING',
      };

      const mockUpdated = {
        id: requestId,
        status: 'APPROVED',
      };

      mockPrismaService.leaveRequest.findFirst.mockResolvedValue(mockRequest);
      mockPrismaService.leaveRequest.update.mockResolvedValue(mockUpdated);

      const result = await service.updateLeaveStatus(requestId, dto, mockContext);

      expect(result.status).toBe('APPROVED');
      expect(mockPrismaService.leaveRequest.update).toHaveBeenCalledWith({
        where: { id: requestId },
        data: { status: 'APPROVED' },
      });
    });

    it('should reject a leave request', async () => {
      const requestId = 'leave-123';
      const dto = { status: 'REJECTED' as const };

      const mockRequest = {
        id: requestId,
        status: 'PENDING',
      };

      const mockUpdated = {
        id: requestId,
        status: 'REJECTED',
      };

      mockPrismaService.leaveRequest.findFirst.mockResolvedValue(mockRequest);
      mockPrismaService.leaveRequest.update.mockResolvedValue(mockUpdated);

      const result = await service.updateLeaveStatus(requestId, dto, mockContext);

      expect(result.status).toBe('REJECTED');
    });
  });

  describe('getBranchLeaveRequests', () => {
    it('should return all leave requests for a branch', async () => {
      const branchId = 'branch-123';
      const mockRequests = [
        { id: 'leave-1', status: 'PENDING', staff: { user: { branchId } } },
        { id: 'leave-2', status: 'APPROVED', staff: { user: { branchId } } },
      ];

      mockPrismaService.leaveRequest.findMany.mockResolvedValue(mockRequests);

      const result = await service.getBranchLeaveRequests(branchId);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.leaveRequest.findMany).toHaveBeenCalled();
    });
  });

  describe('getStaffLeaves', () => {
    it('should return leave history for a staff member', async () => {
      const staffId = 'staff-123';
      const mockLeaves = [
        { id: 'leave-1', type: 'ANNUAL', status: 'APPROVED' },
        { id: 'leave-2', type: 'SICK', status: 'PENDING' },
      ];

      mockPrismaService.staff.findFirst.mockResolvedValue({ id: staffId });
      mockPrismaService.leaveRequest.findMany.mockResolvedValue(mockLeaves);

      const result = await service.getStaffLeaves(staffId, mockContext);

      expect(result).toHaveLength(2);
      expect(mockPrismaService.leaveRequest.findMany).toHaveBeenCalledWith({
        where: { staffId },
        orderBy: { startDate: 'desc' },
      });
    });
  });
});
