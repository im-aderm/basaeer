import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AttendanceService } from './attendance.service';
import { PrismaService } from '../prisma/prisma.service';
import { QRService } from './qr.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CommsService } from '../comms/comms.service';
import { AuditService } from '../audit/audit.service';
import { UserRole } from '../generated/client/client';
import { TenantContext } from '../auth/branch.guard';

describe('AttendanceService.getStudentAttendance ownership check', () => {
  let service: AttendanceService;
  let prisma: any;

  const studentCtx: TenantContext = {
    userId: 'me',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.STUDENT,
  };

  beforeEach(async () => {
    prisma = {
      student: { findFirst: jest.fn() },
      attendance: { findMany: jest.fn().mockResolvedValue([]) },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: QRService, useValue: {} },
        { provide: RealtimeService, useValue: {} },
        { provide: CommsService, useValue: {} },
        { provide: AuditService, useValue: {} },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('rejects a student viewing another student\'s attendance history', async () => {
    prisma.student.findFirst.mockResolvedValue({
      userId: 'someone-else',
      parentId: null,
    });
    await expect(
      service.getStudentAttendance('other-student', studentCtx),
    ).rejects.toThrow(ForbiddenException);
    expect(prisma.attendance.findMany).not.toHaveBeenCalled();
  });

  it('allows a student viewing their own attendance history', async () => {
    prisma.student.findFirst.mockResolvedValue({ userId: 'me', parentId: null });
    await service.getStudentAttendance('my-student-id', studentCtx);
    expect(prisma.attendance.findMany).toHaveBeenCalled();
  });
});
