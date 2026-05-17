export interface BranchOverviewDto {
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

export interface BranchDailyOpsDto {
  recentAdmissions: Array<{
    id: string;
    firstName: string;
    lastName: string;
    createdAt: Date;
  }>;
  upcomingExams: Array<{
    id: string;
    title: string;
    startsAt: Date | null;
    endsAt: Date | null;
  }>;
  staffOnLeave: Array<{
    id: string;
    startDate: Date;
    endDate: Date;
    reason: string;
    staff: { user: { firstName: string; lastName: string } };
  }>;
}

export interface BranchFinanceDto {
  totalRevenue: number;
  totalOutstanding: number;
  totalExpenses: number;
  recentPayments: Array<{
    amount: any;
    createdAt: Date;
    method: string;
  }>;
  cashflow: Array<{
    month: string;
    collected: number;
  }>;
}

export interface BranchAcademicDto {
  totalClasses: number;
  totalSubjects: number;
  studentsPerClass: Array<{
    className: string;
    count: number;
  }>;
}
