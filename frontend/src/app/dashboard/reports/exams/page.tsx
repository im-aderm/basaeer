"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportingService } from "@/services/reportingService";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { Card } from "@/components/ui/card";
import { BookOpen, GraduationCap, Book, AlertCircle, Loader2 } from "lucide-react";
import type { AcademicAnalyticsData } from "@/types/dashboard";

export default function AcademicReportsPage() {
  const { user, resolvedBranchId } = useAuth();
  const [data, setData] = useState<AcademicAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const result = await reportingService.getAcademicAnalytics();
      setData(result);
    } catch {
      setError("Failed to load academic analytics");
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
        <h1 className="text-h1 font-bold tracking-tight text-primary">Academic Excellence</h1>
        <p className="text-muted-foreground font-medium mt-1">Curriculum progress, results, and subject performance</p>
      </div>

      <DashboardGrid cols={3}>
        <StatCardWidget
          title="Total Classes"
          value={data?.totalClasses}
          icon={BookOpen}
          color="blue"
        />
        <StatCardWidget
          title="Total Sections"
          value={data?.totalSections}
          icon={GraduationCap}
          color="green"
        />
        <StatCardWidget
          title="Subjects"
          value={data?.subjectCount}
          icon={Book}
          color="purple"
        />
      </DashboardGrid>

      <DashboardGrid cols={2}>
        <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8">
          <p className="text-label text-muted-foreground mb-2">Students Per Class</p>
          <p className="text-h1 font-semibold tracking-tight">
            {data?.studentsPerClass ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Average number of students per class</p>
        </Card>
        <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8">
          <p className="text-label text-muted-foreground mb-2">Average Class Size</p>
          <p className="text-h1 font-semibold tracking-tight">
            {data?.averageClassSize ?? "—"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Average class size across all sections</p>
        </Card>
      </DashboardGrid>
    </div>
  );
}
