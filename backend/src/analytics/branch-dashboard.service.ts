import { Injectable, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import {
  BranchOverviewDto,
  BranchDailyOpsDto,
  BranchAcademicDto,
  BranchFinanceDto,
} from './dto/branch-overview.dto';

@Injectable()
export class BranchDashboardService {
  private readonly logger = new Logger(BranchDashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview(branchId: string, ctx: TenantContext): Promise<BranchOverviewDto> {
    // Enforce tenant isolation
    if (ctx.role !== 'SUPER_ADMIN' && ctx.branchId !== branchId) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = new Date(now.toDateString());

    const [
      totalStudents,
      newThisMonth,
      totalStaff,
      activeStaff,
      attendanceToday,
      totalRevenue,
      totalOutstanding,
      activeClasses,
      totalBeds,
      occupiedBeds,
    ] = await Promise.all([
      this.prisma.student.count({ where: { branchId, deletedAt: null } }),
      this.prisma.student.count({
        where: { branchId, deletedAt: null, createdAt: { gte: monthStart } },
      }),
      this.prisma.staff.count({ where: { user: { branchId } } }),
      this.prisma.staff.count({ where: { user: { branchId }, status: 'ACTIVE' } }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: { branchId, date: { gte: todayStart } },
        _count: { id: true },
      }),
      this.prisma.payment.aggregate({
        where: { branchId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { branchId, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
        _sum: { balance: true },
      }),
      this.prisma.class.count({ where: { branchId } }),
      this.prisma.bed.count({ where: { room: { hostel: { branchId } } } }),
      this.prisma.hostelAllocation.count({ where: { branchId, isActive: true } }),
    ]);

    const present = attendanceToday
      .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
      .reduce((sum, a) => sum + a._count.id, 0);
    const totalAtt = attendanceToday.reduce((sum, a) => sum + a._count.id, 0);

    return {
      branchId,
      totalStudents,
      newThisMonth,
      totalStaff,
      activeStaff,
      attendanceRate: totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0,
      attendancePresent: present,
      attendanceAbsent: totalAtt - present,
      revenue: totalRevenue._sum.amount?.toNumber() ?? 0,
      outstanding: totalOutstanding._sum.balance?.toNumber() ?? 0,
      activeClasses,
      hostelOccupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
    };
  }

  async getDailyOps(branchId: string, ctx: TenantContext): Promise<BranchDailyOpsDto> {
    if (ctx.role !== 'SUPER_ADMIN' && ctx.branchId !== branchId) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const now = new Date();
    const todayStart = new Date(now.toDateString());
    const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const [
      recentAdmissions,
      upcomingExams,
      staffOnLeave,
    ] = await Promise.all([
      this.prisma.student.findMany({
        where: { branchId, deletedAt: null, createdAt: { gte: todayStart } },
        select: { id: true, firstName: true, lastName: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.exam.findMany({
        where: { branchId, startsAt: { gte: now }, endsAt: { lte: weekEnd } },
        select: { id: true, title: true, startsAt: true, endsAt: true },
        orderBy: { startsAt: 'asc' },
        take: 5,
      }),
      this.prisma.leaveRequest.findMany({
        where: {
          staff: { user: { branchId } },
          status: 'APPROVED',
          endDate: { gte: now },
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          reason: true,
          staff: { select: { user: { select: { firstName: true, lastName: true } } } },
        },
        take: 5,
      }),
    ]);

    return {
      recentAdmissions,
      upcomingExams,
      staffOnLeave,
    };
  }

  async getFinance(branchId: string, ctx: TenantContext): Promise<BranchFinanceDto> {
    if (ctx.role !== 'SUPER_ADMIN' && ctx.branchId !== branchId) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const last6Months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      last6Months.push(d);
    }

    const [totalRevenue, totalOutstanding, recentPayments, expenses] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { branchId, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { branchId, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
        _sum: { balance: true },
      }),
      this.prisma.payment.findMany({
        where: { branchId, status: 'COMPLETED' },
        select: { amount: true, createdAt: true, method: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.voucher.aggregate({
        where: { branchId },
        _sum: { amount: true },
      }),
    ]);

    // Optimized: single query for monthly cashflow
    const monthlyRevenue = await this.prisma.payment.groupBy({
      by: ['createdAt'],
      where: { branchId, status: 'COMPLETED', createdAt: { gte: last6Months[0] } },
      _sum: { amount: true },
    });

    const cashflow = last6Months.map((month) => {
      const monthStr = month.toLocaleString('default', { month: 'short', year: '2-digit' });
      const monthPayments = monthlyRevenue.filter((p) => {
        const d = new Date(p.createdAt);
        return d.getMonth() === month.getMonth() && d.getFullYear() === month.getFullYear();
      });
      return {
        month: monthStr,
        collected: monthPayments.reduce((sum, p) => sum + (p._sum.amount?.toNumber() ?? 0), 0),
      };
    });

    return {
      totalRevenue: totalRevenue._sum.amount?.toNumber() ?? 0,
      totalOutstanding: totalOutstanding._sum.balance?.toNumber() ?? 0,
      totalExpenses: expenses._sum?.amount?.toNumber() ?? 0,
      recentPayments,
      cashflow,
    };
  }

  async getAttendance(branchId: string, ctx: TenantContext): Promise<any> {
    if (ctx.role !== 'SUPER_ADMIN' && ctx.branchId !== branchId) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Optimized: single groupBy for 30-day trend
    const trendRaw = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { branchId, date: { gte: thirtyDaysAgo } },
      _count: { id: true },
    });

    const trendMap = new Map<string, { date: string; present: number; total: number }>();
    for (const row of trendRaw) {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, { date: dateKey, present: 0, total: 0 });
      }
      const entry = trendMap.get(dateKey)!;
      entry.total += row._count.id;
      if (row.status === 'PRESENT' || row.status === 'LATE') {
        entry.present += row._count.id;
      }
    }

    const trend = Array.from(trendMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => ({
        date: e.date,
        rate: e.total > 0 ? Math.round((e.present / e.total) * 100) : 0,
      }));

    return { trend };
  }

  async getAcademics(branchId: string, ctx: TenantContext): Promise<BranchAcademicDto> {
    if (ctx.role !== 'SUPER_ADMIN' && ctx.branchId !== branchId) {
      throw new ForbiddenException('Access denied to this branch');
    }

    const [totalClasses, totalSubjects, classesWithStudents] = await Promise.all([
      this.prisma.class.count({ where: { branchId } }),
      this.prisma.subject.count({ where: { branchId } }),
      this.prisma.class.findMany({
        where: { branchId },
        select: {
          name: true,
          _count: { select: { students: { where: { deletedAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      totalClasses,
      totalSubjects,
      studentsPerClass: classesWithStudents.map((c) => ({
        className: c.name,
        count: c._count.students,
      })),
    };
  }
}
