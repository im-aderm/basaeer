import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto, UpdateLeaveStatusDto } from './dto/hr-ops.dto';
import { LeaveValidationService } from './leave-validation.service';
import { RealtimeService } from '../realtime/realtime.service';

@Injectable()
export class LeaveService {
  constructor(
    private prisma: PrismaService,
    private leaveValidation: LeaveValidationService,
    private realtime: RealtimeService,
  ) {}

  async applyLeave(
    staffId: string,
    dto: CreateLeaveRequestDto,
    branchId: string,
  ) {
    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
      include: { user: { select: { firstName: true, lastName: true } } },
    });
    if (!staff) throw new NotFoundException('Staff not found');

    const validation = await this.leaveValidation.validateLeaveRequest(
      staffId,
      dto.type,
      new Date(dto.startDate),
      new Date(dto.endDate),
      branchId,
    );

    if (!validation.valid) {
      throw new BadRequestException(validation.errors.join('; '));
    }

    const leave = await this.prisma.leaveRequest.create({
      data: {
        staffId,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        reason: dto.reason,
        status: 'PENDING',
        branchId,
      },
    });

    const staffName =
      `${staff.user?.firstName || ''} ${staff.user?.lastName || ''}`.trim();
    this.realtime.sendToBranch(branchId, 'hr.leave_applied', {
      leaveId: leave.id,
      staffId,
      staffName,
      type: dto.type,
      startDate: dto.startDate,
      endDate: dto.endDate,
    });

    return leave;
  }

  async updateLeaveStatus(requestId: string, dto: UpdateLeaveStatusDto) {
    const request = await this.prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        staff: {
          include: {
            user: {
              select: { firstName: true, lastName: true, branchId: true },
            },
          },
        },
      },
    });
    if (!request) throw new NotFoundException('Leave request not found');

    const updated = await this.prisma.leaveRequest.update({
      where: { id: requestId },
      data: { status: dto.status as any },
    });

    if (dto.status === 'APPROVED' || dto.status === 'REJECTED') {
      const staffName =
        `${request.staff.user?.firstName || ''} ${request.staff.user?.lastName || ''}`.trim();
      const branchId = request.staff.user?.branchId || '';
      this.realtime.sendToBranch(branchId, 'hr.leave_approved', {
        leaveId: requestId,
        staffId: request.staffId,
        staffName,
        type: request.type,
        approved: dto.status === 'APPROVED',
      });
    }

    return updated;
  }

  async getStaffLeaves(staffId: string) {
    return this.prisma.leaveRequest.findMany({
      where: { staffId },
      orderBy: { startDate: 'desc' },
    });
  }

  async getBranchLeaveRequests(branchId: string) {
    return this.prisma.leaveRequest.findMany({
      where: {
        staff: { user: { branchId } },
      },
      include: {
        staff: { include: { user: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getLeaveBalances(staffId: string, branchId: string) {
    return this.leaveValidation.getAllLeaveBalances(staffId, branchId);
  }
}
