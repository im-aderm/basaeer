import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExamsService } from './exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from '../reporting/reporting.service';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { UserRole, Term } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression tests for the finding that lockResults/lockResultsBatch/
 * toggleEligibility took no tenant context at all: a branch admin from one
 * campus could lock/unlock results or toggle exam eligibility for a
 * student/section in a different branch just by knowing the id.
 */
describe('ExamsService legacy result-lock / eligibility branch scoping', () => {
  let service: ExamsService;
  let prisma: any;

  const otherBranchCtx: TenantContext = {
    userId: 'u1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      student: { findFirst: jest.fn() },
      section: { findFirst: jest.fn() },
      resultSummary: { upsert: jest.fn(), updateMany: jest.fn() },
      assessmentRecord: { update: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExamsService,
        { provide: PrismaService, useValue: prisma },
        { provide: ReportingService, useValue: {} },
        { provide: BranchBrandingService, useValue: {} },
      ],
    }).compile();

    service = module.get<ExamsService>(ExamsService);
  });

  it('lockResults 404s for a student outside the caller branch', async () => {
    prisma.student.findFirst.mockResolvedValue(null);
    await expect(
      service.lockResults('student-9', 'session-1', Term.FIRST, true, otherBranchCtx),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.student.findFirst).toHaveBeenCalledWith({
      where: { id: 'student-9', branchId: 'branch-1' },
      select: { branchId: true },
    });
    expect(prisma.resultSummary.upsert).not.toHaveBeenCalled();
  });

  it('lockResultsBatch 404s for a section outside the caller branch', async () => {
    prisma.section.findFirst.mockResolvedValue(null);
    await expect(
      service.lockResultsBatch('section-9', 'session-1', Term.FIRST, true, otherBranchCtx),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.section.findFirst).toHaveBeenCalledWith({
      where: { id: 'section-9', branchId: 'branch-1' },
      select: { id: true },
    });
    expect(prisma.resultSummary.updateMany).not.toHaveBeenCalled();
  });

  it('toggleEligibility 404s for a student outside the caller branch', async () => {
    prisma.student.findFirst.mockResolvedValue(null);
    await expect(
      service.toggleEligibility(
        'student-9',
        'subject-1',
        'session-1',
        Term.FIRST,
        false,
        otherBranchCtx,
      ),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.assessmentRecord.update).not.toHaveBeenCalled();
  });

  it('lockResults proceeds once the student is confirmed in-branch', async () => {
    prisma.student.findFirst.mockResolvedValue({ branchId: 'branch-1' });
    prisma.resultSummary.upsert.mockResolvedValue({ id: 'rs1' });
    await service.lockResults('student-1', 'session-1', Term.FIRST, true, otherBranchCtx);
    expect(prisma.resultSummary.upsert).toHaveBeenCalled();
  });
});
