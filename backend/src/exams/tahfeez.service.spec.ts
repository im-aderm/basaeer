import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TahfeezService } from './tahfeez.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

describe('TahfeezService.report ownership check', () => {
  let service: TahfeezService;
  let prisma: any;

  const parentCtx: TenantContext = {
    userId: 'parent-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.PARENT,
  };

  beforeEach(async () => {
    prisma = {
      student: { findFirst: jest.fn() },
      tahfeezAssessment: { findMany: jest.fn().mockResolvedValue([]) },
      tahfeezMemorizationProgress: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [TahfeezService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<TahfeezService>(TahfeezService);
  });

  it('rejects a parent viewing a report for a student that is not their child', async () => {
    prisma.student.findFirst.mockResolvedValue({
      userId: 'someone',
      parentId: 'a-different-parent',
    });
    await expect(service.report('student-1', parentCtx)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('allows a parent viewing their own child\'s report', async () => {
    prisma.student.findFirst.mockResolvedValue({
      userId: 'someone',
      parentId: 'parent-1',
    });
    await expect(service.report('student-1', parentCtx)).resolves.toBeDefined();
  });
});
