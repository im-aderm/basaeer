import { Controller, Get, UseGuards, Req, Query } from '@nestjs/common';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(ApiKeyGuard)
@Controller('public-api')
export class PublicApiController {
    constructor(private readonly prisma: PrismaService) {}

    @Get('students')
    async getStudents(@Req() req: any, @Query('classId') classId?: string) {
        return this.prisma.student.findMany({
            where: {
                branchId: req.branchId,
                ...(classId && { classId })
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNo: true,
                class: { select: { name: true } }
            }
        });
    }

    @Get('attendance/summary')
    async getAttendanceSummary(@Req() req: any, @Query('date') date?: string) {
        const targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        return this.prisma.attendance.groupBy({
            by: ['status'],
            where: {
                student: { branchId: req.branchId },
                date: {
                    gte: targetDate,
                    lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000)
                }
            },
            _count: true
        });
    }
}
