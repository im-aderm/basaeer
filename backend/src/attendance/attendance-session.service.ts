import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';

@Injectable()
export class AttendanceSessionService {
    constructor(private prisma: PrismaService) { }

    async createSession(dto: {
        name?: string,
        classId?: string,
        sectionId?: string,
        subjectId?: string,
        date?: string,
        startTime?: string,
        endTime?: string
    }, context: TenantContext) {
        const branchId = context.branchId;
        if (!branchId) throw new ForbiddenException('Branch context required');

        return this.prisma.attendanceSession.create({
            data: {
                ...dto,
                date: dto.date ? new Date(dto.date) : new Date(),
                startTime: dto.startTime ? new Date(dto.startTime) : undefined,
                endTime: dto.endTime ? new Date(dto.endTime) : undefined,
                branchId,
                teacherId: context.userId
            }
        });
    }

    async updateSession(id: string, dto: any, context: TenantContext) {
        const session = await this.prisma.attendanceSession.findFirst({
            where: TenantHelper.applyIsolation({ id }, context)
        });
        if (!session) throw new NotFoundException('Session not found');
        if (session.isLocked) throw new ForbiddenException('Cannot update a locked session');

        return this.prisma.attendanceSession.update({
            where: { id },
            data: dto
        });
    }

    async getActiveSessions(context: TenantContext) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return this.prisma.attendanceSession.findMany({
            where: TenantHelper.applyIsolation({
                isActive: true,
                date: { gte: today }
            }, context),
            include: {
                class: { select: { name: true } },
                section: { select: { name: true } },
                subject: { select: { name: true } },
                teacher: { include: { user: { select: { firstName: true, lastName: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async lockSession(id: string, context: TenantContext) {
        const session = await this.prisma.attendanceSession.findFirst({
            where: TenantHelper.applyIsolation({ id }, context)
        });
        if (!session) throw new NotFoundException('Session not found');

        return this.prisma.attendanceSession.update({
            where: { id },
            data: { isLocked: true, isActive: false }
        });
    }

    async closeSession(id: string, context: TenantContext) {
        const session = await this.prisma.attendanceSession.findFirst({
            where: TenantHelper.applyIsolation({ id }, context)
        });
        if (!session) throw new NotFoundException('Session not found');

        return this.prisma.attendanceSession.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async getSessionDetails(id: string, context: TenantContext) {
        return this.prisma.attendanceSession.findFirst({
            where: TenantHelper.applyIsolation({ id }, context),
            include: {
                records: {
                    include: {
                        student: { select: { firstName: true, lastName: true } }
                    }
                }
            }
        });
    }
}
