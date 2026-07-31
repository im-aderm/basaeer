import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { OnlineExamsService } from './online-exams.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression tests for the finding that createQuestion/getQuestionsByGroup/
 * createExam took no tenant context at all and trusted client-supplied ids
 * unchecked — a branch admin could create a question in, or read questions
 * from, another branch's question group.
 */
describe('OnlineExamsService branch scoping on admin writes', () => {
  let service: OnlineExamsService;
  let prisma: any;

  const branchAdminCtx: TenantContext = {
    userId: 'admin-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    prisma = {
      questionGroup: { create: jest.fn(), findFirst: jest.fn() },
      question: { create: jest.fn(), findMany: jest.fn() },
      onlineExam: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [OnlineExamsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<OnlineExamsService>(OnlineExamsService);
  });

  it('createQuestion 404s for a question group outside the caller branch', async () => {
    prisma.questionGroup.findFirst.mockResolvedValue(null);
    await expect(
      service.createQuestion({ groupId: 'g1' } as any, branchAdminCtx),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.question.create).not.toHaveBeenCalled();
  });

  it('createQuestion proceeds once the group is confirmed in-branch', async () => {
    prisma.questionGroup.findFirst.mockResolvedValue({ id: 'g1', branchId: 'branch-1' });
    prisma.question.create.mockResolvedValue({ id: 'q1' });
    await service.createQuestion({ groupId: 'g1' } as any, branchAdminCtx);
    expect(prisma.question.create).toHaveBeenCalled();
  });

  it('getQuestionsByGroup 404s for a group outside the caller branch', async () => {
    prisma.questionGroup.findFirst.mockResolvedValue(null);
    await expect(
      service.getQuestionsByGroup('g1', branchAdminCtx),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.question.findMany).not.toHaveBeenCalled();
  });

  it('createExam 404s for a question group outside the caller branch', async () => {
    prisma.questionGroup.findFirst.mockResolvedValue(null);
    await expect(
      service.createExam(
        { groupId: 'g1', scheduledDate: '2026-01-01' } as any,
        branchAdminCtx,
      ),
    ).rejects.toThrow(NotFoundException);
    expect(prisma.onlineExam.create).not.toHaveBeenCalled();
  });

  it('createExam forces the caller own branchId regardless of dto.branchId for non-super-admins', async () => {
    prisma.questionGroup.findFirst.mockResolvedValue({ id: 'g1', branchId: 'branch-1' });
    prisma.onlineExam.create.mockResolvedValue({ id: 'e1' });

    await service.createExam(
      { groupId: 'g1', scheduledDate: '2026-01-01', branchId: 'attacker-branch' } as any,
      branchAdminCtx,
    );

    expect(prisma.onlineExam.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ branchId: 'branch-1' }) }),
    );
  });
});
