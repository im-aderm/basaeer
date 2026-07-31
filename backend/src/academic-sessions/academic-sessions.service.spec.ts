import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AcademicSessionsService } from './academic-sessions.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression tests for the finding that this controller had no role check
 * and its service ignored the tenant context entirely: any authenticated
 * user could read/create/update/delete another branch's academic session,
 * and remove() always threw because it queried a Student.sessionId field
 * that doesn't exist in the schema.
 */
describe('AcademicSessionsService', () => {
  let service: AcademicSessionsService;
  let prisma: any;

  const branchAdminCtx: TenantContext = {
    userId: 'u1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    const countMock = jest.fn().mockResolvedValue(0);
    prisma = {
      academicSession: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      branch: { findUnique: jest.fn() },
      exam: { count: countMock },
      assessmentRecord: { count: countMock },
      resultSummary: { count: countMock },
      assignment: { count: countMock },
      gPARecord: { count: countMock },
      idCard: { count: countMock },
      voucher: { count: countMock },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AcademicSessionsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AcademicSessionsService>(AcademicSessionsService);
  });

  it('findOne only matches a session within the caller branch', async () => {
    prisma.academicSession.findFirst.mockResolvedValue(null);
    await expect(service.findOne('s1', branchAdminCtx)).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.academicSession.findFirst).toHaveBeenCalledWith({
      where: { id: 's1', branchId: 'branch-1' },
    });
  });

  it('update 404s instead of mutating a session outside the caller branch', async () => {
    prisma.academicSession.findFirst.mockResolvedValue(null);
    await expect(
      service.update('s1', { name: 'x' }, branchAdminCtx),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.academicSession.update).not.toHaveBeenCalled();
  });

  it('remove 404s instead of deleting a session outside the caller branch', async () => {
    prisma.academicSession.findFirst.mockResolvedValue(null);
    await expect(service.remove('s1', branchAdminCtx)).rejects.toThrow(
      NotFoundException,
    );
    expect(prisma.academicSession.delete).not.toHaveBeenCalled();
  });

  it('remove checks real dependent models, not a nonexistent Student.sessionId field', async () => {
    prisma.academicSession.findFirst.mockResolvedValue({
      id: 's1',
      branchId: 'branch-1',
      status: 'UPCOMING',
    });
    prisma.academicSession.delete.mockResolvedValue({ id: 's1' });

    await service.remove('s1', branchAdminCtx);

    expect(prisma.exam.count).toHaveBeenCalledWith({ where: { sessionId: 's1' } });
    expect(prisma.academicSession.delete).toHaveBeenCalledWith({ where: { id: 's1' } });
  });

  it('remove blocks deletion when a dependent model has rows for this session', async () => {
    prisma.academicSession.findFirst.mockResolvedValue({
      id: 's1',
      branchId: 'branch-1',
      status: 'UPCOMING',
    });
    prisma.exam.count.mockResolvedValueOnce(3);

    await expect(service.remove('s1', branchAdminCtx)).rejects.toThrow(
      BadRequestException,
    );
    expect(prisma.academicSession.delete).not.toHaveBeenCalled();
  });

  it('getActiveSession scopes by branchId when provided', async () => {
    prisma.academicSession.findFirst.mockResolvedValue(null);
    await service.getActiveSession('branch-1');
    expect(prisma.academicSession.findFirst).toHaveBeenCalledWith({
      where: { branchId: 'branch-1', status: 'CURRENT' },
    });
  });
});
