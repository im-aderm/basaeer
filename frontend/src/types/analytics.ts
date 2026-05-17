export interface ExecutiveOverview {
    totalStudents: number;
    studentGrowth: number;
    totalStaff: number;
    activeStaff: number;
    totalRevenue: number;
    totalOutstanding: number;
    attendanceRate: number;
    totalBranches: number;
    activeBranches: number;
    collectionRate: number;
    academicAverage: number;
    hostelOccupancyRate: number;
}

export interface BranchKPI {
    branchId: string;
    branchName: string;
    branchCode: string;
    students: number;
    staff: number;
    revenue: number;
    outstanding: number;
    attendanceRate: number;
    growth: number;
}

export interface BranchFinanceItem {
    branchId: string;
    branchName: string;
    branchCode: string;
    revenue: number;
    outstanding: number;
    collectionRate: number;
}

export interface ExecutiveFinance {
    totalRevenue: number;
    totalOutstanding: number;
    collectionRate: number;
    byBranch: BranchFinanceItem[];
}

export interface BranchAttendanceItem {
    branchId: string;
    branchName: string;
    branchCode: string;
    attendanceRate: number;
    present: number;
    absent: number;
    total: number;
}

export interface AttendanceTrend {
    date: string;
    rate: number;
}

export interface ExecutiveAttendance {
    overallRate: number;
    byBranch: BranchAttendanceItem[];
    trend: AttendanceTrend[];
}

export interface BranchAcademicItem {
    branchId: string;
    branchName: string;
    branchCode: string;
    totalClasses: number;
    totalStudents: number;
    totalSubjects: number;
    averageClassSize: number;
}

export interface ExecutiveAcademics {
    totalClasses: number;
    totalStudents: number;
    byBranch: BranchAcademicItem[];
}

export interface TrendDataPoint {
    date: string;
    revenue: number;
    attendance: number;
}

export type InsightType = 'positive' | 'warning' | 'critical' | 'info';
export type InsightTrend = 'up' | 'down' | 'stable';

export interface ExecutiveInsight {
    type: InsightType;
    title: string;
    message: string;
    branchId?: string;
    branchName?: string;
    metric: string;
    value: number;
    trend: InsightTrend;
}

export interface BranchOverview {
    branchId: string;
    totalStudents: number;
    newThisMonth: number;
    totalStaff: number;
    activeStaff: number;
    attendanceRate: number;
    attendancePresent: number;
    attendanceAbsent: number;
    revenue: number;
    outstanding: number;
    activeClasses: number;
    hostelOccupancyRate: number;
}

export interface BranchDailyOps {
    recentAdmissions: Array<{
        id: string;
        firstName: string;
        lastName: string;
        createdAt: string;
    }>;
    upcomingExams: Array<{
        id: string;
        title: string;
        startsAt: string | null;
        endsAt: string | null;
    }>;
    staffOnLeave: Array<{
        id: string;
        startDate: string;
        endDate: string;
        reason: string;
        staff: { user: { firstName: string; lastName: string } };
    }>;
}

export interface BranchFinance {
    totalRevenue: number;
    totalOutstanding: number;
    totalExpenses: number;
    recentPayments: Array<{
        amount: number;
        createdAt: string;
        method: string;
    }>;
    cashflow: Array<{
        month: string;
        collected: number;
    }>;
}

export interface BranchAcademics {
    totalClasses: number;
    totalSubjects: number;
    studentsPerClass: Array<{
        className: string;
        count: number;
    }>;
}
