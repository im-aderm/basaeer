export interface BranchAttendanceItemDto {
  branchId: string;
  branchName: string;
  branchCode: string;
  attendanceRate: number;
  present: number;
  absent: number;
  total: number;
}

export interface AttendanceTrendDto {
  date: string;
  rate: number;
}

export interface ExecutiveAttendanceDto {
  overallRate: number;
  byBranch: BranchAttendanceItemDto[];
  trend: AttendanceTrendDto[];
}
