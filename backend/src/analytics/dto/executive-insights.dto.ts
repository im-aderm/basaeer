export type InsightType = 'positive' | 'warning' | 'critical' | 'info';
export type InsightTrend = 'up' | 'down' | 'stable';

export interface ExecutiveInsightDto {
  type: InsightType;
  title: string;
  message: string;
  branchId?: string;
  branchName?: string;
  metric: string;
  value: number;
  trend: InsightTrend;
}
