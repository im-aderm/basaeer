import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    async markAttendance(dto: CreateAttendanceDto) {
        const { studentId, date, status, remarks, sectionId } = dto;
        const attendanceDate = new Date(date);
        attendanceDate.setHours(0, 0, 0, 0);

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
            },
        });
    }

    async findBySectionAndDate(sectionId: string, date: string) {
        const searchDate = new Date(date);
        searchDate.setHours(0, 0, 0, 0);

        return this.prisma.attendance.findMany({
            where: {
                sectionId,
                date: searchDate,
            },
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

    async getStudentAttendance(studentId: string) {
        return this.prisma.attendance.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
        });
    }
}
