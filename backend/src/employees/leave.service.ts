import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto } from './dto/hr-ops.dto';

@Injectable()
export class LeaveService {
    constructor(private prisma: PrismaService) { }

    async applyLeave(staffId: string, dto: CreateLeaveRequestDto) {
        const staff = await this.prisma.staff.findUnique({ where: { id: staffId } });
        if (!staff) throw new NotFoundException('Staff not found');

        return this.prisma.leaveRequest.create({
            data: {
                staffId,
                type: dto.type,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                reason: dto.reason,
                status: 'PENDING',
            },
        });
    }

    async updateLeaveStatus(requestId: string, dto: UpdateLeaveStatusDto) {
        const request = await this.prisma.leaveRequest.findUnique({ where: { id: requestId } });
        if (!request) throw new NotFoundException('Leave request not found');

        return this.prisma.leaveRequest.update({
            where: { id: requestId },
            data: { status: dto.status },
        });
    }

    async getBranchLeaveRequests(branchId: string) {
        return this.prisma.leaveRequest.findMany({
            where: {
                staff: {
                    user: { branchId },
                },
            },
            include: {
                staff: {
                    include: { user: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getStaffLeaves(staffId: string) {
        return this.prisma.leaveRequest.findMany({
            where: { staffId },
            orderBy: { startDate: 'desc' },
        });
    }
}
