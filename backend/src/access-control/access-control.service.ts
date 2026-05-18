import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '../generated/client/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccessLogDto } from './dto/access-control.dto';
import { AttendanceService } from '../attendance/attendance.service';
import { AutomationService } from '../automation/automation.service';
@Injectable()
export class AccessControlService {
  constructor(
    private prisma: PrismaService,
    private attendanceService: AttendanceService,
    private automationService: AutomationService,
  ) {}

  async logAccess(branchId: string, dto: CreateAccessLogDto, sessionId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Check for Automation
    if (user.role === UserRole.STUDENT && dto.direction === 'ENTRY') {
      const configs = await this.automationService.getConfigs(branchId);
      const attendanceConfig = configs.find(
        (c) => c.type === 'ATTENDANCE_ON_ENTRY',
      );

      if (attendanceConfig && attendanceConfig.isEnabled) {
        const student = await this.prisma.student.findFirst({
          where: { userId: user.id },
        });
        if (student && student.sectionId) {
          await this.attendanceService.markAttendance(
            {
              studentId: student.id,
              date: new Date().toISOString(),
              status: 'PRESENT',
              remarks: 'Auto-marked via QR Entry',
              sectionId: student.sectionId,
            },
            {
              branchId,
              sessionId: sessionId || null,
              userId: user.id,
              isSuperAdmin: false,
              role: user.role,
            },
          );
        }
      }
    }

    return this.prisma.campusAccessLog.create({
      data: {
        ...dto,
        branchId,
        sessionId: sessionId,
      },
      include: {
        user: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
    });
  }

  async getBranchLogs(branchId: string, limit: number = 50) {
    return this.prisma.campusAccessLog.findMany({
      where: { branchId },
      include: {
        user: {
          select: { firstName: true, lastName: true, role: true },
        },
      },
      orderBy: { scanTime: 'desc' },
      take: limit,
    });
  }

  async getUserLogs(userId: string) {
    return this.prisma.campusAccessLog.findMany({
      where: { userId },
      orderBy: { scanTime: 'desc' },
    });
  }
}
