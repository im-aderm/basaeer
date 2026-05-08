import { Injectable, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { QRService } from './qr.service';
import { RealtimeService } from '../realtime/realtime.service';
import { CommsService } from '../comms/comms.service';

@Injectable()
export class AttendanceService {
    constructor(
        private prisma: PrismaService,
        private qrService: QRService,
        private realtimeService: RealtimeService,
        private commsService: CommsService
    ) { }

    async processQRScan(payload: string, sessionId: string, context: TenantContext) {
        const { studentId, branchId } = this.qrService.verifyQRPayload(payload);

        if (branchId !== context.branchId) {
            throw new UnauthorizedException('Student does not belong to this branch');
        }

        const session = await this.prisma.attendanceSession.findFirst({
            where: TenantHelper.applyIsolation({ id: sessionId, isActive: true }, context)
        });
        if (!session) throw new NotFoundException('Active attendance session not found');

        // Check scan cooldown (prevent fraud/double scan)
        const recentScan = await this.prisma.attendanceScan.findFirst({
            where: {
                studentId,
                sessionId,
                scanTime: { gte: new Date(Date.now() - 60000) } // 1 minute cooldown
            }
        });
        if (recentScan) return { success: true, alreadyScanned: true };

        // Log the scan
        await this.prisma.attendanceScan.create({
            data: {
                studentId,
                sessionId,
                branchId: context.branchId,
            }
        });

        // Mark attendance
        const attendance = await this.markAttendance({
            studentId,
            sessionId,
            date: session.date.toISOString(),
            status: 'PRESENT',
            remarks: 'QR Scan'
        }, context);

        // Realtime update to teacher/admin
        this.realtimeService.sendToBranch(context.branchId, 'attendance_update', {
            sessionId,
            studentId,
            status: 'PRESENT',
            type: 'QR'
        });

        return { success: true, attendance };
    }

    async markAttendance(dto: CreateAttendanceDto, context: TenantContext) {
        const { studentId, date, status, remarks, sectionId, sessionId } = dto;
        const branchId = context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Ownership check for student
        const student = await this.prisma.student.findFirst({
            where: TenantHelper.applyIsolation({ id: studentId }, context),
            include: { parent: { select: { email: true, phone: true } } }
        });
        if (!student) throw new ForbiddenException('Student not found in your branch');

        const result = await this.prisma.attendance.upsert({
            where: {
                studentId_date_sessionId: {
                    studentId,
                    date: attendanceDate,
                    sessionId: sessionId || '', // Use empty string for global daily attendance if null
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
                sessionId,
                branchId,
            },
            include: {
                student: { select: { firstName: true, lastName: true } }
            }
        });

        // Trigger Parent Notification for Absence
        if (status === 'ABSENT' && student.parent?.phone) {
            this.commsService.createBulkSmsCampaign({
                message: `Dear Parent, ${student.firstName} was marked ABSENT today, ${attendanceDate.toLocaleDateString()}.`,
                recipientGroup: 'PARENT',
                branchId
            });
        }

        // Emit realtime update if it's for a session
        if (sessionId) {
            this.realtimeService.sendToBranch(branchId, 'attendance_update', {
                sessionId,
                studentId,
                status,
                studentName: `${result.student.firstName} ${result.student.lastName}`
            });
        }

        return result;
    }

    async markBulkAttendance(dto: { records: CreateAttendanceDto[] }, context: TenantContext) {
        const branchId = context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        // Note: For large bulks, we should validate students efficiently
        const studentIds = dto.records.map(r => r.studentId);
        const validStudents = await this.prisma.student.findMany({
            where: TenantHelper.applyIsolation({ id: { in: studentIds } }, context),
            select: { id: true }
        });
        const validStudentIds = new Set(validStudents.map(s => s.id));

        const results = await this.prisma.$transaction(
            dto.records.filter(r => validStudentIds.has(r.studentId)).map((record) => {
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
                        sessionId: record.sessionId,
                        branchId,
                    },
                });
            })
        );

        // Broadcast bulk update if applicable
        if (dto.records.length > 0 && dto.records[0].sessionId) {
            this.realtimeService.sendToBranch(branchId, 'attendance_bulk_update', {
                sessionId: dto.records[0].sessionId,
                count: results.length
            });
        }

        return results;
    }

    async findBySectionAndDate(sectionId: string, date: string, context: TenantContext, skip?: number, take: number = 100) {
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        return this.prisma.attendance.findMany({
            where: TenantHelper.applyIsolation({
                sectionId,
                date: searchDate,
            }, context),
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
        return this.prisma.attendance.findMany({
            where: TenantHelper.applyIsolation({ studentId }, context),
            orderBy: { date: 'desc' },
        });
    }

    async getStats(context: TenantContext) {
        const branchId = context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const [
            totalStudents,
            studentsPresent,
            totalStaff,
            staffPresent
        ] = await Promise.all([
            this.prisma.student.count({ where: { branchId, user: { isActive: true } } }),
            this.prisma.attendance.count({
                where: {
                    branchId,
                    date: today,
                    status: { in: ['PRESENT', 'LATE'] }
                }
            }),
            this.prisma.staff.count({ where: { user: { branchId, isActive: true } } }),
            this.prisma.staffAttendance.count({
                where: {
                    branchId,
                    date: today,
                    status: { in: ['PRESENT', 'LATE'] }
                }
            })
        ]);

        return {
            totalStudents,
            studentsPresent,
            totalStaff,
            staffPresent
        };
    }
}
