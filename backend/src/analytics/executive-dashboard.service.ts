import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import {
  ExecutiveOverviewDto,
  BranchComparisonDto,
  ExecutiveTrendDto,
  TrendPeriod,
} from './dto/executive-overview.dto';
import { ExecutiveFinanceDto } from './dto/executive-finance.dto';
import { ExecutiveAttendanceDto } from './dto/executive-attendance.dto';
import { ExecutiveAcademicsDto } from './dto/executive-academics.dto';
import { ExecutiveInsightDto } from './dto/executive-insights.dto';

@Injectable()
export class ExecutiveDashboardService {
  private readonly logger = new Logger(ExecutiveDashboardService.name);

  constructor(private prisma: PrismaService) {}

  async getOverview(ctx: TenantContext): Promise<ExecutiveOverviewDto> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      totalStudents,
      studentsThisMonth,
      studentsLastMonth,
      totalStaff,
      activeStaff,
      totalRevenue,
      totalOutstanding,
      attendanceToday,
      totalBranches,
      activeBranches,
      academicAvg,
      totalBeds,
      occupiedBeds,
    ] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.student.count({
        where: { deletedAt: null, createdAt: { gte: monthStart } },
      }),
      this.prisma.student.count({
        where: { deletedAt: null, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } },
      }),
      this.prisma.staff.count(),
      this.prisma.staff.count({ where: { status: 'ACTIVE' } }),
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
        _sum: { balance: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['status'],
        where: {
          date: { gte: new Date(now.toDateString()), lte: new Date(now.toDateString() + ' 23:59:59') },
        },
        _count: { id: true },
      }),
      this.prisma.branch.count(),
      this.prisma.branch.count({ where: { isActive: true } }),
      this.prisma.resultSummary.aggregate({
        where: { isActive: true },
        _avg: { average: true },
      }),
      this.prisma.bed.count(),
      this.prisma.hostelAllocation.count({ where: { isActive: true } }),
    ]);

    const presentCount = attendanceToday
      .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
      .reduce((sum, a) => sum + a._count.id, 0);
    const totalAttendance = attendanceToday.reduce((sum, a) => sum + a._count.id, 0);
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    const studentGrowth = studentsLastMonth > 0
      ? Math.round(((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100)
      : 0;

    const totalRevenueNum = totalRevenue._sum.amount?.toNumber() ?? 0;
    const totalOutstandingNum = totalOutstanding._sum.balance?.toNumber() ?? 0;
    const academicAvgNum = academicAvg._avg.average ?? 0;
    const hostelOccupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    return {
      totalStudents,
      studentGrowth,
      totalStaff,
      activeStaff,
      totalRevenue: totalRevenueNum,
      totalOutstanding: totalOutstandingNum,
      attendanceRate,
      totalBranches,
      activeBranches,
      collectionRate: (totalRevenueNum + totalOutstandingNum) > 0
        ? Math.round((totalRevenueNum / (totalRevenueNum + totalOutstandingNum)) * 100)
        : 0,
      academicAverage: Math.round(academicAvgNum),
      hostelOccupancyRate,
    };
  }

  async getFinance(ctx: TenantContext): Promise<ExecutiveFinanceDto> {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const branchFinances = await Promise.all(
      branches.map(async (branch) => {
        const [revenue, outstanding] = await Promise.all([
          this.prisma.payment.aggregate({
            where: { branchId: branch.id, status: 'COMPLETED' },
            _sum: { amount: true },
          }),
          this.prisma.invoice.aggregate({
            where: { branchId: branch.id, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
            _sum: { balance: true },
          }),
        ]);
        const rev = revenue._sum.amount?.toNumber() ?? 0;
        const out = outstanding._sum.balance?.toNumber() ?? 0;
        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          revenue: rev,
          outstanding: out,
          collectionRate: (rev + out) > 0 ? Math.round((rev / (rev + out)) * 100) : 0,
        };
      }),
    );

    const totalRevenue = branchFinances.reduce((sum, b) => sum + b.revenue, 0);
    const totalOutstanding = branchFinances.reduce((sum, b) => sum + b.outstanding, 0);

    return {
      totalRevenue,
      totalOutstanding,
      collectionRate: (totalRevenue + totalOutstanding) > 0
        ? Math.round((totalRevenue / (totalRevenue + totalOutstanding)) * 100)
        : 0,
      byBranch: branchFinances,
    };
  }

  async getAttendance(ctx: TenantContext): Promise<ExecutiveAttendanceDto> {
    const now = new Date();
    const todayStart = new Date(now.toDateString());
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const branchAttendance = await Promise.all(
      branches.map(async (branch) => {
        const today = await this.prisma.attendance.groupBy({
          by: ['status'],
          where: { branchId: branch.id, date: { gte: todayStart } },
          _count: { id: true },
        });
        const present = today
          .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
          .reduce((sum, a) => sum + a._count.id, 0);
        const total = today.reduce((sum, a) => sum + a._count.id, 0);
        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
          present,
          absent: total - present,
          total,
        };
      }),
    );

    // Optimized: single groupBy for 30-day trend
    const trendRaw = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { date: { gte: thirtyDaysAgo } },
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

    return {
      overallRate: branchAttendance.reduce((sum, b) => sum + b.attendanceRate, 0) / (branches.length || 1),
      byBranch: branchAttendance,
      trend,
    };
  }

  async getAcademics(ctx: TenantContext): Promise<ExecutiveAcademicsDto> {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const branchAcademics = await Promise.all(
      branches.map(async (branch) => {
        const [totalClasses, totalStudents, totalSubjects] = await Promise.all([
          this.prisma.class.count({ where: { branchId: branch.id } }),
          this.prisma.student.count({ where: { branchId: branch.id, deletedAt: null } }),
          this.prisma.subject.count({ where: { branchId: branch.id } }),
        ]);
        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          totalClasses,
          totalStudents,
          totalSubjects,
          averageClassSize: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
        };
      }),
    );

    return {
      totalClasses: branchAcademics.reduce((sum, b) => sum + b.totalClasses, 0),
      totalStudents: branchAcademics.reduce((sum, b) => sum + b.totalStudents, 0),
      byBranch: branchAcademics,
    };
  }

  async getBranchComparison(ctx: TenantContext): Promise<BranchComparisonDto[]> {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const comparisons = await Promise.all(
      branches.map(async (branch) => {
        const [
          students,
          studentsThisMonth,
          studentsLastMonth,
          staff,
          revenue,
          outstanding,
          attendanceToday,
        ] = await Promise.all([
          this.prisma.student.count({ where: { branchId: branch.id, deletedAt: null } }),
          this.prisma.student.count({
            where: { branchId: branch.id, deletedAt: null, createdAt: { gte: monthStart } },
          }),
          this.prisma.student.count({
            where: { branchId: branch.id, deletedAt: null, createdAt: { gte: lastMonthStart, lt: monthStart } },
          }),
          this.prisma.staff.count({ where: { user: { branchId: branch.id } } }),
          this.prisma.payment.aggregate({
            where: { branchId: branch.id, status: 'COMPLETED' },
            _sum: { amount: true },
          }),
          this.prisma.invoice.aggregate({
            where: { branchId: branch.id, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
            _sum: { balance: true },
          }),
          this.prisma.attendance.groupBy({
            by: ['status'],
            where: {
              branchId: branch.id,
              date: { gte: new Date(now.toDateString()) },
            },
            _count: { id: true },
          }),
        ]);

        const present = attendanceToday
          .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
          .reduce((sum, a) => sum + a._count.id, 0);
        const totalAtt = attendanceToday.reduce((sum, a) => sum + a._count.id, 0);

        return {
          branchId: branch.id,
          branchName: branch.name,
          branchCode: branch.code,
          students,
          staff,
          revenue: revenue._sum.amount?.toNumber() ?? 0,
          outstanding: outstanding._sum.balance?.toNumber() ?? 0,
          attendanceRate: totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0,
          growth: studentsLastMonth > 0
            ? Math.round(((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100)
            : (studentsThisMonth > 0 ? 100 : 0),
        };
      }),
    );

    return comparisons;
  }

  async getTrends(ctx: TenantContext, period: TrendPeriod = '30d'): Promise<ExecutiveTrendDto[]> {
    const now = new Date();
    let startDate: Date;
    switch (period) {
      case '7d': startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); break;
      case '30d': startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); break;
      case '90d': startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); break;
      case '1y': startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000); break;
      default: startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Optimized: single groupBy for revenue trend
    const revenueRaw = await this.prisma.payment.findMany({
      where: { status: 'COMPLETED', createdAt: { gte: startDate } },
      select: { amount: true, createdAt: true },
    });

    const revenueMap = new Map<string, number>();
    for (const p of revenueRaw) {
      const dateKey = p.createdAt.toISOString().split('T')[0];
      revenueMap.set(dateKey, (revenueMap.get(dateKey) || 0) + p.amount.toNumber());
    }

    // Optimized: single groupBy for attendance trend
    const attendanceRaw = await this.prisma.attendance.groupBy({
      by: ['date', 'status'],
      where: { date: { gte: startDate } },
      _count: { id: true },
    });

    const attendanceMap = new Map<string, { present: number; total: number }>();
    for (const row of attendanceRaw) {
      const dateKey = row.date.toISOString().split('T')[0];
      if (!attendanceMap.has(dateKey)) {
        attendanceMap.set(dateKey, { present: 0, total: 0 });
      }
      const entry = attendanceMap.get(dateKey)!;
      entry.total += row._count.id;
      if (row.status === 'PRESENT' || row.status === 'LATE') {
        entry.present += row._count.id;
      }
    }

    // Build date range
    const days: Date[] = [];
    const current = new Date(startDate);
    while (current <= now) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const trends: ExecutiveTrendDto[] = days.map((day) => {
      const dateKey = day.toISOString().split('T')[0];
      const att = attendanceMap.get(dateKey);
      return {
        date: dateKey,
        revenue: revenueMap.get(dateKey) ?? 0,
        attendance: att ? Math.round((att.present / att.total) * 100) : 0,
      };
    });

    return trends;
  }

  async getInsights(ctx: TenantContext): Promise<ExecutiveInsightDto[]> {
    const comparisons = await this.getBranchComparison(ctx);
    const finance = await this.getFinance(ctx);
    const attendance = await this.getAttendance(ctx);

    const insights: ExecutiveInsightDto[] = [];

    // Revenue insights
    const sortedByRevenue = [...comparisons].sort((a, b) => b.revenue - a.revenue);
    if (sortedByRevenue.length > 0) {
      const top = sortedByRevenue[0];
      insights.push({
        type: 'positive',
        title: 'Top Revenue Branch',
        message: `${top.branchName} leads with ₦${top.revenue.toLocaleString()} in revenue.`,
        branchId: top.branchId,
        branchName: top.branchName,
        metric: 'revenue',
        value: top.revenue,
        trend: 'up',
      });
    }

    // Attendance warnings
    const lowAttendance = comparisons.filter((b) => b.attendanceRate < 70);
    if (lowAttendance.length > 0) {
      insights.push({
        type: 'warning',
        title: 'Low Attendance Alert',
        message: `${lowAttendance.length} branch(es) have attendance below 70%: ${lowAttendance.map((b) => b.branchName).join(', ')}.`,
        metric: 'attendance',
        value: lowAttendance.length,
        trend: 'down',
      });
    }

    // Outstanding debt
    const highDebt = finance.byBranch.filter((b) => b.outstanding > 100000);
    if (highDebt.length > 0) {
      const highest = highDebt.sort((a, b) => b.outstanding - a.outstanding)[0];
      insights.push({
        type: 'critical',
        title: 'High Outstanding Debt',
        message: `${highest.branchName} has ₦${highest.outstanding.toLocaleString()} in unpaid fees.`,
        branchId: highest.branchId,
        branchName: highest.branchName,
        metric: 'outstanding',
        value: highest.outstanding,
        trend: 'down',
      });
    }

    // Growth insights
    const growing = comparisons.filter((b) => b.growth > 10);
    if (growing.length > 0) {
      const top = growing.sort((a, b) => b.growth - a.growth)[0];
      insights.push({
        type: 'positive',
        title: 'Strong Enrollment Growth',
        message: `${top.branchName} grew by ${top.growth}% this month.`,
        branchId: top.branchId,
        branchName: top.branchName,
        metric: 'growth',
        value: top.growth,
        trend: 'up',
      });
    }

    // Overall attendance trend
    const overallRate = attendance.overallRate;
    if (overallRate > 85) {
      insights.push({
        type: 'positive',
        title: 'Strong Overall Attendance',
        message: `Network-wide attendance is at ${overallRate}%, above the 85% target.`,
        metric: 'attendance',
        value: overallRate,
        trend: 'up',
      });
    } else if (overallRate < 75) {
      insights.push({
        type: 'warning',
        title: 'Attendance Below Target',
        message: `Network-wide attendance is at ${overallRate}%, below the 85% target.`,
        metric: 'attendance',
        value: overallRate,
        trend: 'down',
      });
    }

    return insights;
  }
}
