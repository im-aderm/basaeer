"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportingService } from "@/services/reportingService";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { DashboardGrid, DashboardSplit } from "@/components/dashboard/DashboardGrid";
import { CheckCircle, Users, Calendar, AlertCircle, Loader2 } from "lucide-react";
import type { AttendanceAnalyticsData } from "@/types/dashboard";

const formatPercent = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

export default function AttendanceReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<AttendanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const result = await reportingService.getAttendanceAnalytics();
      setData(result);
    } catch {
      setError("Failed to load attendance analytics");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const weeklyAverage = !data?.weeklyTrend?.length
    ? 0 : data.weeklyTrend.reduce((acc, w) => acc + w.rate, 0) / data.weeklyTrend.length;

  const monthlyAverage = !data?.monthlySummary?.length
    ? 0 : data.monthlySummary.reduce((acc, m) => acc + m.rate, 0) / data.monthlySummary.length;

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
        <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Attendance Intelligence</h1>
        <p className="text-muted-foreground font-medium mt-1">Real-time attendance tracking and trends</p>
      </div>

      <DashboardGrid cols={3}>
        <StatCardWidget
          title="Today's Rate"
          value={data?.todayRate}
          icon={CheckCircle}
          color="green"
          formatter={formatPercent}
        />
        <StatCardWidget
          title="Weekly Average"
          value={weeklyAverage}
          icon={Users}
          color="blue"
          formatter={formatPercent}
        />
        <StatCardWidget
          title="Monthly Average"
          value={monthlyAverage}
          icon={Calendar}
          color="purple"
          formatter={formatPercent}
        />
      </DashboardGrid>

      <DashboardSplit>
        <ChartWidget
          title="Weekly Trend"
          description="Daily attendance rate for the current week"
          data={data?.weeklyTrend}
          type="bar"
          dataKey="rate"
          nameKey="date"
          color="#3b82f6"
          height={350}
        />
        <ChartWidget
          title="Monthly Summary"
          description="Monthly attendance rate trend"
          data={data?.monthlySummary}
          type="line"
          dataKey="rate"
          nameKey="month"
          color="#8b5cf6"
          height={350}
        />
      </DashboardSplit>
    </div>
  );
}
