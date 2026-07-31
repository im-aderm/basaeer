import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { QRService } from './qr.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CommsService } from '../comms/comms.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AttendanceService {
  constructor(
    private prisma: PrismaService,
    private qrService: QRService,
    private realtimeService: RealtimeService,
    private commsService: CommsService,
    private audit: AuditService,
  ) {}

  async processQRScan(
    payload: string,
    sessionId: string,
    context: TenantContext,
  ) {
    const { studentId, branchId } = this.qrService.verifyQRPayload(payload);

    if (branchId !== context.branchId) {
      throw new UnauthorizedException('Student does not belong to this branch');
    }

    const session = await this.prisma.attendanceSession.findFirst({
      where: TenantHelper.applyIsolation(
        { id: sessionId, isActive: true },
        context,
      ),
    });
    if (!session)
      throw new NotFoundException('Active attendance session not found');

    // Check scan cooldown (prevent fraud/double scan)
    const recentScan = await this.prisma.attendanceScan.findFirst({
      where: {
        studentId,
        sessionId,
        scanTime: { gte: new Date(Date.now() - 60000) }, // 1 minute cooldown
      },
    });
    if (recentScan) return { success: true, alreadyScanned: true };

    // Log the scan
    await this.prisma.attendanceScan.create({
      data: {
        studentId,
        sessionId,
        branchId: context.branchId,
      },
    });

    // Mark attendance
    const attendance = await this.markAttendance(
      {
        studentId,
        sessionId,
        date: session.date.toISOString(),
        status: 'PRESENT',
        remarks: 'QR Scan',
      },
      context,
    );

    // Realtime update to teacher/admin
    this.realtimeService.sendToBranch(context.branchId, 'attendance.marked', {
      sessionId,
      studentId,
      status: 'PRESENT',
      type: 'QR',
    });

    return { success: true, attendance };
  }

  async bulkSyncScans(
    dto: {
      scans: { payload: string; sessionId: string; timestamp?: string }[];
    },
    context: TenantContext,
  ) {
    const branchId = context.branchId;
    const results: Array<{
      studentId?: string;
      payload?: string;
      success: boolean;
      error?: string;
    }> = [];

    for (const scan of dto.scans) {
      try {
        const { studentId, branchId: scanBranchId } =
          this.qrService.verifyQRPayload(scan.payload);
        if (scanBranchId !== branchId) continue;

        // Mark attendance with the timestamp from the scan if provided
        await this.markAttendance(
          {
            studentId,
            sessionId: scan.sessionId,
            date: scan.timestamp || new Date().toISOString(),
            status: 'PRESENT',
            remarks: 'Offline QR Sync',
          },
          context,
        );

        results.push({ studentId, success: true });
      } catch (error: any) {
        results.push({
          payload: scan.payload,
          success: false,
          error: error.message,
        });
      }
    }

    return { success: true, processed: results.length, results };
  }

  async markAttendance(dto: CreateAttendanceDto, context: TenantContext) {
    const { studentId, date, status, remarks, sectionId, sessionId } = dto;
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Session Lock Check
    if (sessionId) {
      const session = await this.prisma.attendanceSession.findFirst({
        where: TenantHelper.applyIsolation({ id: sessionId }, context),
      });
      if (session?.isLocked)
        throw new ForbiddenException(
          'Cannot modify attendance for a locked session',
        );
    }

    // Ownership check for student
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      include: { parent: { select: { email: true, phone: true } } },
    });
    if (!student)
      throw new ForbiddenException('Student not found in your branch');

    // Get existing record to check for status change
    const existing = await this.prisma.attendance.findFirst({
      where: {
        studentId,
        date: attendanceDate,
        sessionId: sessionId || '',
      },
    });

    const result = await this.prisma.attendance.upsert({
      where: {
        studentId_date_sessionId: {
          studentId,
          date: attendanceDate,
          sessionId: sessionId || '',
        },
      },
      update: {
        status,
        remarks,
        sectionId: sectionId || student.sectionId,
      },
      create: {
        studentId,
        date: attendanceDate,
        status,
        remarks,
        sectionId: sectionId || student.sectionId,
        sessionId: sessionId || '',
        branchId,
      },
      include: {
        student: { select: { firstName: true, lastName: true } },
      },
    });

    // Trigger Parent Notification for Absence/Lateness (only if status changed)
    if (student.parent?.phone && existing?.status !== status) {
      if (status === 'ABSENT' || status === 'LATE') {
        this.commsService.sendSms({
          phone: student.parent.phone,
          message: `Dear Parent, ${student.firstName} was marked ${status} today, ${attendanceDate.toLocaleDateString()}.`,
          branchId,
        });
      }
    }

    // Emit realtime update if it's for a session
    if (sessionId) {
      this.realtimeService.sendToBranch(branchId, 'attendance.marked', {
        sessionId,
        studentId,
        status,
        studentName: `${result.student.firstName} ${result.student.lastName}`,
      });
    }

    await this.audit.log({
      action: status === 'PRESENT' ? 'MARK_PRESENT' : `MARK_${status}`,
      module: 'ATTENDANCE',
      context,
      targetId: result.id,
      targetType: 'Attendance',
      afterState: { studentId, date: date, status, remarks },
    });

    return result;
  }

  async markBulkAttendance(
    dto: { records: CreateAttendanceDto[] },
    context: TenantContext,
  ) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    if (dto.records.length === 0) return [];

    // Session Lock Check (assuming all records in a bulk are for the same session)
    const sessionId = dto.records[0].sessionId;
    if (sessionId) {
      const session = await this.prisma.attendanceSession.findFirst({
        where: TenantHelper.applyIsolation({ id: sessionId }, context),
      });
      if (session?.isLocked)
        throw new ForbiddenException(
          'Cannot modify attendance for a locked session',
        );
    }

    // Note: For large bulks, we should validate students efficiently
    const studentIds = dto.records.map((r) => r.studentId);
    const validStudents = await this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
      select: { id: true },
    });
    const validStudentIds = new Set(validStudents.map((s) => s.id));

    const results = await this.prisma.$transaction(
      dto.records
        .filter((r) => validStudentIds.has(r.studentId))
        .map((record) => {
          const attendanceDate = new Date(record.date);
          attendanceDate.setHours(0, 0, 0, 0);

          return this.prisma.attendance.upsert({
            where: {
              studentId_date_sessionId: {
                studentId: record.studentId,
                date: attendanceDate,
                sessionId: record.sessionId || '',
              },
            },
            update: {
              status: record.status,
              remarks: record.remarks,
              sectionId: record.sectionId,
            },
            create: {
              studentId: record.studentId,
              date: attendanceDate,
              status: record.status,
              remarks: record.remarks,
              sectionId: record.sectionId,
              sessionId: record.sessionId || '',
              branchId,
            },
          });
        }),
    );

    // Broadcast bulk update if applicable
    if (dto.records.length > 0 && dto.records[0].sessionId) {
      this.realtimeService.sendToBranch(branchId, 'attendance.bulk_synced', {
        sessionId: dto.records[0].sessionId,
        count: results.length,
      });
    }

    return results;
  }

  async findBySectionAndDate(
    sectionId: string,
    date: string,
    context: TenantContext,
    skip?: number,
    take: number = 100,
  ) {
    const searchDate = new Date(date);
    searchDate.setHours(0, 0, 0, 0);

    return this.prisma.attendance.findMany({
      where: TenantHelper.applyIsolation(
        {
          sectionId,
          date: searchDate,
        },
        context,
      ),
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : 100,
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async getStudentAttendance(studentId: string, context: TenantContext) {
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
      select: { userId: true, parentId: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    TenantHelper.assertOwnStudentRecord(student, context);

    return this.prisma.attendance.findMany({
      where: TenantHelper.applyIsolation({ studentId }, context),
      orderBy: { date: 'desc' },
    });
  }

  async getStudentQR(studentId: string, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    const student = await this.prisma.student.findFirst({
      where: TenantHelper.applyIsolation({ id: studentId }, context),
    });
    if (!student) throw new NotFoundException('Student not found');

    return {
      studentId: student.id,
      qrPayload: this.qrService.generateQRPayload(student.id, branchId),
    };
  }

  async bulkGenerateQR(studentIds: string[], context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    const students = await this.prisma.student.findMany({
      where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
    });

    return students.map((s) => ({
      studentId: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      qrPayload: this.qrService.generateQRPayload(s.id, branchId),
    }));
  }

  async getStats(context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalStudents, studentsPresent, totalStaff, staffPresent] =
      await Promise.all([
        this.prisma.student.count({
          where: { branchId, user: { isActive: true } },
        }),
        this.prisma.attendance.count({
          where: {
            branchId,
            date: today,
            status: { in: ['PRESENT', 'LATE'] },
          },
        }),
        this.prisma.staff.count({
          where: { user: { branchId, isActive: true } },
        }),
        this.prisma.staffAttendance.count({
          where: {
            branchId,
            date: today,
            status: { in: ['PRESENT', 'LATE'] },
          },
        }),
      ]);

    return {
      totalStudents,
      studentsPresent,
      totalStaff,
      staffPresent,
    };
  }

  async getTrends(days: number = 30, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const attendance = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: {
        branchId,
        date: { gte: startDate },
      },
      _count: {
        _all: true,
      },
    });

    // Format data for frontend charts
    const trends: Record<string, any> = {};
    attendance.forEach((item) => {
      const dateStr = item.date.toISOString().split('T')[0];
      if (!trends[dateStr]) trends[dateStr] = { date: dateStr };
      trends[dateStr][item.status] = (item._count as any)._all;
    });

    return Object.values(trends).sort((a: any, b: any) =>
      a.date.localeCompare(b.date),
    );
  }

  async getChronicAbsentees(threshold: number = 20, context: TenantContext) {
    const branchId = context.branchId;
    if (!branchId) throw new ForbiddenException('Branch context required');

    // This is a more complex query, usually done with raw SQL or aggregation
    // We'll approximate by counting total records vs absences per student
    const stats = await this.prisma.attendance.groupBy({
      by: ['studentId'],
      where: { branchId },
      _count: { _all: true },
    });

    const absences = await this.prisma.attendance.groupBy({
      by: ['studentId'],
      where: {
        branchId,
        status: 'ABSENT',
      },
      _count: { _all: true },
    });

    const absenceMap = new Map(
      absences.map((a) => [a.studentId, (a._count as any)._all]),
    );

    const chronic = stats
      .map((s) => {
        const total = (s._count as any)._all;
        const absentCount = absenceMap.get(s.studentId) || 0;
        const percentage = (absentCount / total) * 100;

        return {
          studentId: s.studentId,
          total,
          absentCount,
          percentage,
        };
      })
      .filter((c) => c.percentage >= threshold);

    // Include student names
    const studentIds = chronic.map((c) => c.studentId);
    const students = await this.prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        class: { select: { name: true } },
      },
    });

    const studentMap = new Map(students.map((s) => [s.id, s]));

    return chronic
      .map((c) => ({
        ...c,
        student: studentMap.get(c.studentId),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }

  async getMyClassAttendance(context: TenantContext) {
    const staff = await this.prisma.staff.findUnique({
      where: { userId: context.userId },
      include: {
        classes: {
          include: {
            students: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
            sections: true,
          },
        },
      },
    });
    if (!staff || staff.classes.length === 0) {
      return { message: 'No class assigned', attendance: [], classes: [] };
    }

    const sectionIds = staff.classes.flatMap((c) => c.sections.map((s) => s.id));
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = sectionIds.length > 0
      ? await this.prisma.attendance.findMany({
          where: { sectionId: { in: sectionIds }, date: today },
          include: {
            student: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
            session: true,
          },
          orderBy: { createdAt: 'desc' },
        })
      : [];

    return {
      classes: staff.classes.map((c) => ({
        id: c.id,
        name: c.name,
        studentCount: c.students.length,
        sectionCount: c.sections.length,
      })),
      todayAttendance: attendance,
    };
  }
}
