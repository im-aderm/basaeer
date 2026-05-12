import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface LeaveBalance {
  totalAllowed: number;
  taken: number;
  remaining: number;
  type: string;
}

const LEAVE_ANNUAL_CAPS: Record<string, number> = {
  SICK: 12,
  CASUAL: 12,
  ANNUAL: 21,
  MATERNITY: 84,
  PATERNITY: 10,
  STUDY: 14,
  UNPAID: 365,
};

const MAX_CONSECUTIVE_DAYS: Record<string, number> = {
  SICK: 7,
  CASUAL: 5,
  ANNUAL: 21,
};

@Injectable()
export class LeaveValidationService {
  constructor(private prisma: PrismaService) {}

  async validateLeaveRequest(
    staffId: string,
    type: string,
    startDate: Date,
    endDate: Date,
    branchId: string,
  ): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!LEAVE_ANNUAL_CAPS[type]) {
      errors.push(`Invalid leave type: ${type}`);
      return { valid: false, errors };
    }

    const staff = await this.prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) {
      errors.push('Staff not found');
      return { valid: false, errors };
    }

    if (startDate > endDate) {
      errors.push('Start date cannot be after end date');
    }

    const daysRequested = this.calculateDays(startDate, endDate);

    // Check maximum consecutive days
    const maxConsecutive = MAX_CONSECUTIVE_DAYS[type];
    if (maxConsecutive && daysRequested > maxConsecutive) {
      errors.push(
        `${type} leave cannot exceed ${maxConsecutive} consecutive days`,
      );
    }

    // Check overlap with existing approved/pending leaves
    const overlapping = await this.prisma.leaveRequest.findFirst({
      where: {
        staffId,
        status: { in: ['PENDING', 'APPROVED'] },
        AND: [{ startDate: { lte: endDate } }, { endDate: { gte: startDate } }],
      },
    });

    if (overlapping) {
      errors.push('This date range overlaps with an existing leave request');
    }

    // Check annual caps
    const balance = await this.getLeaveBalance(staffId, type, branchId);
    if (balance.remaining < daysRequested) {
      errors.push(
        `Insufficient leave balance. Requested: ${daysRequested} days, remaining: ${balance.remaining} days`,
      );
    }

    return { valid: errors.length === 0, errors };
  }

  async getLeaveBalance(
    staffId: string,
    type: string,
    branchId: string,
  ): Promise<LeaveBalance> {
    const annualCap = LEAVE_ANNUAL_CAPS[type] || 0;

    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear + 1, 0, 1);

    const approvedLeaves = await this.prisma.leaveRequest.findMany({
      where: {
        staffId,
        type,
        status: 'APPROVED',
        startDate: { gte: yearStart },
        endDate: { lt: yearEnd },
      },
    });

    let takenDays = 0;
    for (const leave of approvedLeaves) {
      const days = this.calculateDays(leave.startDate, leave.endDate);
      takenDays += days;
    }

    return {
      totalAllowed: annualCap,
      taken: takenDays,
      remaining: Math.max(0, annualCap - takenDays),
      type,
    };
  }

  async getAllLeaveBalances(
    staffId: string,
    branchId: string,
  ): Promise<LeaveBalance[]> {
    return Promise.all(
      Object.keys(LEAVE_ANNUAL_CAPS).map((type) =>
        this.getLeaveBalance(staffId, type, branchId),
      ),
    );
  }

  private calculateDays(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
  }
}
