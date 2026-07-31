import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AssignmentsService } from './assignments.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

/**
 * Regression tests for the finding that submitAssignment/findByStudent
 * checked branch membership but not ownership — a STUDENT caller could
 * submit homework as, or view the submission status of, a different
 * student in the same branch just by passing their id.
 */
describe('AssignmentsService ownership checks', () => {
  let service: AssignmentsService;
  let prisma: any;

  const studentCtx = (userId: string): TenantContext => ({
    userId,
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.STUDENT,
  });

  beforeEach(async () => {
    prisma = {
      student: { findFirst: jest.fn() },
      assignment: { findFirst: jest.fn() },
      submission: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssignmentsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AssignmentsService>(AssignmentsService);
  });

  it('submitAssignment rejects a student submitting on behalf of another student', async () => {
    prisma.assignment.findFirst.mockResolvedValue({ id: 'a1', branchId: 'branch-1' });
    prisma.student.findFirst.mockResolvedValue({
      id: 'other-student',
      userId: 'other-student-user',
      parentId: null,
    });

    await expect(
      service.submitAssignment(
        { assignmentId: 'a1', studentId: 'other-student', contentUrl: 'x' },
        studentCtx('me'),
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.submission.upsert).not.toHaveBeenCalled();
  });

  it('submitAssignment allows a student submitting their own homework', async () => {
    prisma.assignment.findFirst.mockResolvedValue({ id: 'a1', branchId: 'branch-1' });
    prisma.student.findFirst.mockResolvedValue({
      id: 'my-student-id',
      userId: 'me',
      parentId: null,
    });
    prisma.submission.upsert.mockResolvedValue({ id: 'sub1' });

    await service.submitAssignment(
      { assignmentId: 'a1', studentId: 'my-student-id', contentUrl: 'x' },
      studentCtx('me'),
    );
    expect(prisma.submission.upsert).toHaveBeenCalled();
  });

  it('findByStudent rejects a student looking up another student', async () => {
    prisma.student.findFirst.mockResolvedValue({
      sectionId: 's1',
      classId: 'c1',
      userId: 'other-student-user',
      parentId: null,
    });

    await expect(
      service.findByStudent('other-student', studentCtx('me')),
    ).rejects.toThrow(ForbiddenException);
  });

  it('findByStudent 404s when the student is not found in the caller branch', async () => {
    prisma.student.findFirst.mockResolvedValue(null);
    await expect(
      service.findByStudent('missing', studentCtx('me')),
    ).rejects.toThrow(NotFoundException);
  });
});
