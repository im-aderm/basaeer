export interface BranchFinanceItemDto {
  branchId: string;
  branchName: string;
  branchCode: string;
  revenue: number;
  outstanding: number;
  collectionRate: number;
}

export interface ExecutiveFinanceDto {
  totalRevenue: number;
  totalOutstanding: number;
  collectionRate: number;
  byBranch: BranchFinanceItemDto[];
}
