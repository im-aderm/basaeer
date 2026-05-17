export interface BranchAcademicItemDto {
  branchId: string;
  branchName: string;
  branchCode: string;
  totalClasses: number;
  totalStudents: number;
  totalSubjects: number;
  averageClassSize: number;
}

export interface ExecutiveAcademicsDto {
  totalClasses: number;
  totalStudents: number;
  byBranch: BranchAcademicItemDto[];
}
