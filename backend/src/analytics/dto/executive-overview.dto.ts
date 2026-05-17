export type TrendPeriod = '7d' | '30d' | '90d' | '1y';

export interface ExecutiveOverviewDto {
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

export interface BranchComparisonDto {
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

export interface ExecutiveTrendDto {
  date: string;
  revenue: number;
  attendance: number;
}
