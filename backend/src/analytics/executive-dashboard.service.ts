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
    const daysInCurrentMonth = now.getDate();
    const lastMonthSameDayStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSameDayEnd = new Date(now.getFullYear(), now.getMonth() - 1, Math.min(daysInCurrentMonth, new Date(now.getFullYear(), now.getMonth(), 0).getDate()), 23, 59, 59);

    const [
      totalStudents,
      studentsThisMonth,
      studentsLastMonth,
      totalStaff,
      activeStaff,
      totalRevenue,
      totalOutstanding,
      totalInvoiced,
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
        where: { deletedAt: null, createdAt: { gte: lastMonthSameDayStart, lte: lastMonthSameDayEnd } },
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
      this.prisma.invoice.aggregate({
        _sum: { totalAmount: true },
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

    // Compare same-length periods for growth rate (not partial month vs full month)
    const studentGrowth = studentsLastMonth > 0
      ? Math.round(((studentsThisMonth - studentsLastMonth) / studentsLastMonth) * 100)
      : 0;

    const totalRevenueNum = totalRevenue._sum.amount?.toNumber() ?? 0;
    const totalOutstandingNum = totalOutstanding._sum.balance?.toNumber() ?? 0;
    const totalInvoicedNum = totalInvoiced._sum.totalAmount?.toNumber() ?? 0;
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
      collectionRate: totalInvoicedNum > 0
        ? Math.round(((totalInvoicedNum - totalOutstandingNum) / totalInvoicedNum) * 100)
        : 0,
      academicAverage: Math.round(Number(academicAvgNum)),
      hostelOccupancyRate,
    };
  }

  async getFinance(ctx: TenantContext): Promise<ExecutiveFinanceDto> {
    const branches = await this.prisma.branch.findMany({
      where: { isActive: true },
      select: { id: true, name: true, code: true },
    });

    const branchIds = branches.map((b) => b.id);

    // Single queries with GROUP BY instead of N per-branch queries
    const [revenueByBranch, outstandingByBranch] = await Promise.all([
      this.prisma.payment.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
        _sum: { balance: true },
      }),
    ]);

    const revenueMap = new Map(revenueByBranch.map((r) => [r.branchId, r._sum.amount?.toNumber() ?? 0]));
    const outstandingMap = new Map(outstandingByBranch.map((o) => [o.branchId, o._sum.balance?.toNumber() ?? 0]));

    const branchFinances = branches.map((branch) => {
      const rev = revenueMap.get(branch.id) ?? 0;
      const out = outstandingMap.get(branch.id) ?? 0;
      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        revenue: rev,
        outstanding: out,
        collectionRate: (rev + out) > 0 ? Math.round((rev / (rev + out)) * 100) : 0,
      };
    });

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

    const branchIds = branches.map((b) => b.id);

    // Single query with GROUP BY branchId instead of N per-branch queries
    const attendanceByBranch = await this.prisma.attendance.groupBy({
      by: ['branchId', 'status'],
      where: { branchId: { in: branchIds }, date: { gte: todayStart } },
      _count: { id: true },
    });

    const branchAttendance = branches.map((branch) => {
      const rows = attendanceByBranch.filter((a) => a.branchId === branch.id);
      const present = rows
        .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
        .reduce((sum, a) => sum + a._count.id, 0);
      const total = rows.reduce((sum, a) => sum + a._count.id, 0);
      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        attendanceRate: total > 0 ? Math.round((present / total) * 100) : 0,
        present,
        absent: total - present,
        total,
      };
    });

    // Single groupBy for 30-day trend (already optimized)
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

    const branchIds = branches.map((b) => b.id);

    // Single queries with GROUP BY instead of N per-branch queries
    const [classesByBranch, studentsByBranch, subjectsByBranch] = await Promise.all([
      this.prisma.class.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds } },
        _count: { id: true },
      }),
      this.prisma.student.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.subject.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds } },
        _count: { id: true },
      }),
    ]);

    const classesMap = new Map(classesByBranch.map((c) => [c.branchId, c._count.id]));
    const studentsMap = new Map(studentsByBranch.map((s) => [s.branchId, s._count.id]));
    const subjectsMap = new Map(subjectsByBranch.map((s) => [s.branchId, s._count.id]));

    const branchAcademics = branches.map((branch) => {
      const totalClasses = classesMap.get(branch.id) ?? 0;
      const totalStudents = studentsMap.get(branch.id) ?? 0;
      const totalSubjects = subjectsMap.get(branch.id) ?? 0;
      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        totalClasses,
        totalStudents,
        totalSubjects,
        averageClassSize: totalClasses > 0 ? Math.round(totalStudents / totalClasses) : 0,
      };
    });

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

    const branchIds = branches.map((b) => b.id);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Single queries with GROUP BY branchId instead of N×7 per-branch queries
    const [
      studentsByBranch,
      studentsThisMonth,
      studentsLastMonth,
      staffByBranch,
      revenueByBranch,
      outstandingByBranch,
      attendanceByBranch,
    ] = await Promise.all([
      this.prisma.student.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, deletedAt: null },
        _count: { id: true },
      }),
      this.prisma.student.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, deletedAt: null, createdAt: { gte: monthStart } },
        _count: { id: true },
      }),
      this.prisma.student.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, deletedAt: null, createdAt: { gte: lastMonthStart, lt: monthStart } },
        _count: { id: true },
      }),
      this.prisma.user.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, staff: { isNot: null } },
        _count: { id: true },
      }),
      this.prisma.payment.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['branchId'],
        where: { branchId: { in: branchIds }, status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
        _sum: { balance: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['branchId', 'status'],
        where: { branchId: { in: branchIds }, date: { gte: new Date(now.toDateString()) } },
        _count: { id: true },
      }),
    ]);

    const studentsMap = new Map(studentsByBranch.map((s) => [s.branchId, s._count.id]));
    const studentsThisMap = new Map(studentsThisMonth.map((s) => [s.branchId, s._count.id]));
    const studentsLastMap = new Map(studentsLastMonth.map((s) => [s.branchId, s._count.id]));
    const staffMap = new Map(staffByBranch.map((s) => [s.branchId, s._count.id]));
    const revenueMap = new Map(revenueByBranch.map((r) => [r.branchId, r._sum.amount?.toNumber() ?? 0]));
    const outstandingMap = new Map(outstandingByBranch.map((o) => [o.branchId, o._sum.balance?.toNumber() ?? 0]));

    return branches.map((branch) => {
      const branchAtt = attendanceByBranch.filter((a) => a.branchId === branch.id);
      const present = branchAtt
        .filter((a) => a.status === 'PRESENT' || a.status === 'LATE')
        .reduce((sum, a) => sum + a._count.id, 0);
      const totalAtt = branchAtt.reduce((sum, a) => sum + a._count.id, 0);
      const students = studentsMap.get(branch.id) ?? 0;
      const sThis = studentsThisMap.get(branch.id) ?? 0;
      const sLast = studentsLastMap.get(branch.id) ?? 0;

      return {
        branchId: branch.id,
        branchName: branch.name,
        branchCode: branch.code,
        students,
        staff: staffMap.get(branch.id) ?? 0,
        revenue: revenueMap.get(branch.id) ?? 0,
        outstanding: outstandingMap.get(branch.id) ?? 0,
        attendanceRate: totalAtt > 0 ? Math.round((present / totalAtt) * 100) : 0,
        growth: sLast > 0
          ? Math.round(((sThis - sLast) / sLast) * 100)
          : (sThis > 0 ? 100 : 0),
      };
    });
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
