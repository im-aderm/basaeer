export interface MonthlyTrendItem {
  month: string;
  collected: number;
  invoiced: number;
}

export interface StudentsByClassItem {
  className: string;
  count: number;
}

export interface StaffByDepartmentItem {
  department: string;
  count: number;
}

export interface AcademicSummary {
  totalStudents: number;
  newThisMonth: number;
  activeClasses: number;
  studentsByClass: StudentsByClassItem[];
}

export interface HRSummary {
  totalStaff: number;
  activeStaff: number;
  byDepartment: StaffByDepartmentItem[];
}

export interface FinanceSummary {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  monthlyTrend: MonthlyTrendItem[];
}

export interface AttendanceSummary {
  todayRate: number;
  present: number;
  absent: number;
  total: number;
  weeklyTrend: { date: string; rate: number }[];
}

export interface DashboardSummaryItem {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: string;
  color?: string;
}

export interface DashboardData {
  summary: DashboardSummaryItem[];
  academic: AcademicSummary;
  hr: HRSummary;
  finance: FinanceSummary;
  attendance: AttendanceSummary;
}

// ── Student Analytics ──
export interface GenderDistributionItem {
  gender: string;
  count: number;
}

export interface StudentAnalyticsData {
  total: number;
  active: number;
  byGender: GenderDistributionItem[];
  byClass: StudentsByClassItem[];
  newThisYear: number;
  newThisTerm: number;
}

// ── Finance Analytics ──
export interface CategoryRevenueItem {
  category: string;
  amount: number;
}

export interface MonthlyCashflowItem {
  month: string;
  income: number;
  expenses: number;
}

export interface FinanceAnalyticsData {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  byCategory: CategoryRevenueItem[];
  monthlyCashflow: MonthlyCashflowItem[];
}

// ── HR Analytics ──
export interface StaffStatusItem {
  status: string;
  count: number;
}

export interface HRAnalyticsData {
  totalStaff: number;
  byStatus: StaffStatusItem[];
  byDepartment: StaffByDepartmentItem[];
  payrollTotal: number;
  payrollPending: number;
}

// ── Academic Analytics ──
export interface AcademicAnalyticsData {
  totalClasses: number;
  totalSections: number;
  studentsPerClass: number;
  averageClassSize: number;
  subjectCount: number;
}

// ── Attendance Analytics ──
export interface WeeklyTrendItem {
  date: string;
  present: number;
  absent: number;
  rate: number;
}

export interface MonthlySummaryItem {
  month: string;
  rate: number;
  totalDays: number;
}

export interface AttendanceAnalyticsData {
  todayRate: number;
  weeklyTrend: WeeklyTrendItem[];
  monthlySummary: MonthlySummaryItem[];
}
