import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TranscriptService } from './transcript.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReportingService } from '../reporting/reporting.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

describe('TranscriptService.pdf ownership check', () => {
  let service: TranscriptService;
  let prisma: any;

  const studentCtx: TenantContext = {
    userId: 'me',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    prisma = {
      transcript: { findFirst: jest.fn() },
      student: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranscriptService,
        { provide: PrismaService, useValue: prisma },
        {
          provide: ReportingService,
          useValue: { generatePdf: jest.fn().mockResolvedValue(Buffer.from('pdf')) },
        },
      ],
    }).compile();

    service = module.get<TranscriptService>(TranscriptService);
  });

  it('rejects a student downloading another student\'s transcript', async () => {
    prisma.transcript.findFirst.mockResolvedValue({
      id: 't1',
      studentId: 'other-student',
      data: {},
      checksum: 'x',
    });
    prisma.student.findUnique.mockResolvedValue({
      userId: 'other-student-user',
      parentId: null,
    });

    await expect(service.pdf('t1', studentCtx)).rejects.toThrow(ForbiddenException);
  });

  it('allows a student downloading their own transcript', async () => {
    prisma.transcript.findFirst.mockResolvedValue({
      id: 't1',
      studentId: 'my-student-id',
      data: {},
      checksum: 'x',
    });
    prisma.student.findUnique.mockResolvedValue({ userId: 'me', parentId: null });

    await expect(service.pdf('t1', studentCtx)).resolves.toBeDefined();
  });
});
