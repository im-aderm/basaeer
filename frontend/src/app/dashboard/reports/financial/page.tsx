"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportingService } from "@/services/reportingService";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { DashboardGrid, DashboardSplit } from "@/components/dashboard/DashboardGrid";
import { DollarSign, AlertCircle, TrendingUp, Loader2 } from "lucide-react";
import type { FinanceAnalyticsData } from "@/types/dashboard";

const formatNaira = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₦${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatPercent = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

export default function FinancialReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const result = await reportingService.getFinanceAnalytics();
      setData(result);
    } catch {
      setError("Failed to load financial analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Financial Intelligence</h1>
        <p className="text-muted-foreground font-medium mt-1">Revenue, expenses, and profit analysis</p>
      </div>

      <DashboardGrid cols={3}>
        <StatCardWidget
          title="Total Revenue"
          value={data?.totalRevenue}
          icon={DollarSign}
          color="green"
          formatter={formatNaira}
        />
        <StatCardWidget
          title="Total Outstanding"
          value={data?.totalOutstanding}
          icon={AlertCircle}
          color="red"
          formatter={formatNaira}
        />
        <StatCardWidget
          title="Collection Rate"
          value={data?.collectionRate}
          icon={TrendingUp}
          color="blue"
          formatter={formatPercent}
        />
      </DashboardGrid>

      <DashboardSplit>
        <ChartWidget
          title="Income Trend"
          description="Monthly income over time"
          data={data?.monthlyCashflow}
          type="line"
          dataKey="income"
          nameKey="month"
          color="#10b981"
          height={350}
        />
        <ChartWidget
          title="Expenses Trend"
          description="Monthly expenses over time"
          data={data?.monthlyCashflow}
          type="line"
          dataKey="expenses"
          nameKey="month"
          color="#ef4444"
          height={350}
        />
      </DashboardSplit>
    </div>
  );
}
