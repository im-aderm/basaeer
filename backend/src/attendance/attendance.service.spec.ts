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

/**
 * Regression test for the finding that this service emitted
 * 'attendance_update'/'attendance_bulk_update' (underscored) while the
 * frontend (and the typed RealtimeEventMap) listens for 'attendance.marked'
 * / 'attendance.bulk_synced' (dotted) — the name mismatch meant these
 * realtime pushes never reached any listener.
 */
describe('AttendanceService realtime event names', () => {
  let service: AttendanceService;
  let prisma: any;
  let realtimeService: { sendToBranch: jest.Mock };

  const branchAdminCtx: TenantContext = {
    userId: 'admin-1',
    branchId: 'branch-1',
    isSuperAdmin: false,
    role: UserRole.BRANCH_ADMIN,
  };

  beforeEach(async () => {
    realtimeService = { sendToBranch: jest.fn() };
    prisma = {
      attendanceSession: { findFirst: jest.fn().mockResolvedValue(null) },
      student: {
        findFirst: jest.fn().mockResolvedValue({
          firstName: 'A',
          lastName: 'B',
          sectionId: 'sec-1',
          parent: null,
        }),
      },
      attendance: {
        findFirst: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({
          id: 'att-1',
          student: { firstName: 'A', lastName: 'B' },
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttendanceService,
        { provide: PrismaService, useValue: prisma },
        { provide: QRService, useValue: {} },
        { provide: RealtimeService, useValue: realtimeService },
        { provide: CommsService, useValue: { sendSms: jest.fn() } },
        { provide: AuditService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get<AttendanceService>(AttendanceService);
  });

  it('markAttendance emits "attendance.marked", not "attendance_update"', async () => {
    await service.markAttendance(
      {
        studentId: 'student-1',
        date: '2026-01-01',
        status: 'PRESENT',
        sessionId: 'session-1',
      } as any,
      branchAdminCtx,
    );

    expect(realtimeService.sendToBranch).toHaveBeenCalledWith(
      'branch-1',
      'attendance.marked',
      expect.any(Object),
    );
  });
});
