import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async markAttendance(dto: CreateAttendanceDto, context: TenantContext) {
        const { studentId, date, status, remarks, sectionId } = dto;
        const branchId = context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

        // Ownership check for student
        const student = await this.prisma.student.findFirst({
            where: TenantHelper.applyIsolation({ id: studentId }, context)
        });
        if (!student) throw new ForbiddenException('Student not found in your branch');

        return this.prisma.attendance.upsert({
            where: {
                studentId_date: {
                    studentId,
                    date: attendanceDate,
                },
            },
            update: {
                status,
                remarks,
                sectionId,
            },
            create: {
                studentId,
                date: attendanceDate,
                status,
                remarks,
                sectionId,
                branchId,
            },
        });
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

        return this.prisma.$transaction(
            dto.records.filter(r => validStudentIds.has(r.studentId)).map((record) => {
                const attendanceDate = new Date(record.date);
                attendanceDate.setHours(0, 0, 0, 0);

                return this.prisma.attendance.upsert({
                    where: {
                        studentId_date: {
                            studentId: record.studentId,
                            date: attendanceDate,
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
                        branchId,
                    },
                });
            })
        );
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
