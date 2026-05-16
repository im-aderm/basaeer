"use client";

import { useState, useEffect } from "react";
import { reportingService } from "@/services/reportingService";
import type { StudentAnalyticsData } from "@/types/dashboard";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { DashboardGrid, DashboardSplit } from "@/components/dashboard/DashboardGrid";
import { Users, UserCheck, CalendarPlus, CalendarCheck, Loader2, AlertCircle } from "lucide-react";

export default function StudentReportsPage() {
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await reportingService.getStudentAnalytics();
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load student analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  const genderData = data?.byGender?.map(g => ({ name: g.gender, value: g.count })) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div>
        <h1 className="text-h1 font-bold tracking-tight text-primary">Student Analytics</h1>
        <p className="text-muted-foreground font-medium mt-1">Enrollment, demographics, and performance insights</p>
      </div>

      <DashboardGrid cols={4}>
        <StatCardWidget title="Total Students" value={data?.total ?? 0} icon={Users} color="blue" />
        <StatCardWidget title="Active" value={data?.active ?? 0} icon={UserCheck} color="green" />
        <StatCardWidget title="New This Year" value={data?.newThisYear ?? 0} icon={CalendarPlus} color="purple" />
        <StatCardWidget title="New This Term" value={data?.newThisTerm ?? 0} icon={CalendarCheck} color="orange" />
      </DashboardGrid>

      <DashboardSplit>
        <ChartWidget
          title="Students by Class"
          data={data?.byClass ?? []}
          type="bar"
          dataKey="count"
          nameKey="className"
          color="#00a0e1"
        />
        <ChartWidget
          title="Gender Breakdown"
          data={genderData}
          type="pie"
          dataKey="value"
          nameKey="name"
        />
      </DashboardSplit>
    </div>
  );
}
