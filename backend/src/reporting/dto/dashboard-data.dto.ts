export class MonthlyTrendItem {
  month: string;
  collected: number;
  invoiced: number;
}

export class StudentsByClassItem {
  className: string;
  count: number;
}

export class StaffByDepartmentItem {
  department: string;
  count: number;
}

export class AcademicSummary {
  totalStudents: number;
  newThisMonth: number;
  activeClasses: number;
  studentsByClass: StudentsByClassItem[];
}

export class HRSummary {
  totalStaff: number;
  activeStaff: number;
  byDepartment: StaffByDepartmentItem[];
}

export class FinanceSummary {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  monthlyTrend: MonthlyTrendItem[];
}

export class AttendanceSummary {
  todayRate: number;
  present: number;
  absent: number;
  total: number;
  weeklyTrend: { date: string; rate: number }[];
}

export class SummaryItem {
  label: string;
  value: string | number;
  trend?: { value: number; isPositive: boolean };
  icon?: string;
  color?: string;
}

export class DashboardData {
  summary: SummaryItem[];
  academic: AcademicSummary;
  hr: HRSummary;
  finance: FinanceSummary;
  attendance: AttendanceSummary;
}

// ── Student Analytics ──
export class GenderDistributionItem {
  gender: string;
  count: number;
}

export class StudentAnalyticsData {
  total: number;
  active: number;
  byGender: GenderDistributionItem[];
  byClass: StudentsByClassItem[];
  newThisYear: number;
  newThisTerm: number;
}

// ── Finance Analytics ──
export class CategoryRevenueItem {
  category: string;
  amount: number;
}

export class MonthlyCashflowItem {
  month: string;
  income: number;
  expenses: number;
}

export class FinanceAnalyticsData {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  byCategory: CategoryRevenueItem[];
  monthlyCashflow: MonthlyCashflowItem[];
}

// ── HR Analytics ──
export class StaffStatusItem {
  status: string;
  count: number;
}

export class HRAnalyticsData {
  totalStaff: number;
  byStatus: StaffStatusItem[];
  byDepartment: StaffByDepartmentItem[];
  payrollTotal: number;
  payrollPending: number;
}

// ── Academic Analytics ──
export class AcademicAnalyticsData {
  totalClasses: number;
  totalSections: number;
  studentsPerClass: number;
  averageClassSize: number;
  subjectCount: number;
}

// ── Attendance Analytics ──
export class WeeklyTrendItem {
  date: string;
  present: number;
  absent: number;
  rate: number;
}

export class MonthlySummaryItem {
  month: string;
  rate: number;
  totalDays: number;
}

export class AttendanceAnalyticsData {
  todayRate: number;
  weeklyTrend: WeeklyTrendItem[];
  monthlySummary: MonthlySummaryItem[];
}
