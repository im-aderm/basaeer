"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { reportingService } from "@/services/reportingService";
import type { DashboardData } from "@/types/dashboard";
import { Users, Briefcase, DollarSign, Calendar, TrendingUp, GraduationCap, Printer } from "lucide-react";
import { Loader2, AlertCircle, School } from "lucide-react";
import { useRealtimeDashboard } from "@/hooks/useRealtimeDashboard";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { DashboardGrid, DashboardSplit } from "@/components/dashboard/DashboardGrid";
import OnboardingGuide from "@/components/dashboard/OnboardingGuide";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    if (!user) return;
    try {
      const result = await reportingService.getDashboard();
      setData(result);
      setError(null);
    } catch (err: any) {
      if (!data) setError(err?.message || "Failed to load");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError(null);
    fetchDashboard().finally(() => setLoading(false));
  }, [user]);

  useRealtimeDashboard(fetchDashboard);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-semibold text-destructive">Failed to load dashboard</p>
        <p className="text-sm text-muted-foreground max-w-md text-center">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <School className="w-12 h-12 text-muted-foreground" />
        <p className="text-lg font-semibold text-muted-foreground">No Data Available</p>
        <p className="text-sm text-muted-foreground">Dashboard data could not be retrieved.</p>
      </div>
    );
  }

  const ac = data.academic;
  const fin = data.finance;
  const att = data.attendance;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Hero */}
      <div className="bg-card rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-border/50 p-6 md:p-10 lg:p-16 relative overflow-hidden border-t-8 border-t-primary">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <GraduationCap size={32} />
            </div>
            <div>
              <h1 className="text-h1 tracking-tight">Dashboard Overview</h1>
            </div>
            <button onClick={() => window.print()} className="ml-auto px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2">
              <Printer size={16} /> Export
            </button>
          </div>
          <p className="text-body text-muted-foreground max-w-2xl mb-8">
            Welcome back, <span className="text-primary font-semibold">{user?.firstName}</span>!
            Your management portal is active for <span className="font-medium text-foreground">{user?.role?.replace(/_/g, " ")}</span>.
          </p>

          {/* Stat cards using widget system */}
          <DashboardGrid>
            <StatCardWidget
              title="Total Students"
              value={ac.totalStudents}
              subtitle={ac.newThisMonth ? `+${ac.newThisMonth} this month` : ""}
              icon={Users}
              color="blue"
            />
            <StatCardWidget
              title="Active Staff"
              value={data.hr.activeStaff}
              subtitle={data.hr.totalStaff ? `of ${data.hr.totalStaff} total` : ""}
              icon={Briefcase}
              color="green"
            />
            <StatCardWidget
              title="Revenue"
              value={fin.totalRevenue}
              icon={DollarSign}
              color="orange"
              subtitle={fin.collectionRate ? `${fin.collectionRate}% collection rate` : ""}
              formatter={(v) => `₦${Number(v).toLocaleString()}`}
            />
            <StatCardWidget
              title="Attendance Today"
              value={att.todayRate}
              subtitle={att.total ? `${att.present} present · ${att.absent} absent` : ""}
              icon={Calendar}
              color="purple"
              formatter={(v) => `${v}%`}
            />
          </DashboardGrid>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Role-specific widgets */}
      <RoleDashboard data={data} loading={false} />

      {/* Charts */}
      <DashboardSplit>
        <ChartWidget
          title="Revenue Trend"
          description="Monthly revenue for the last 6 months"
          data={fin.monthlyTrend}
          type="bar"
          dataKey="collected"
          nameKey="month"
          color="#00a0e1"
        />
        <ChartWidget
          title="Students by Class"
          description="Enrollment distribution across classes"
          data={ac.studentsByClass}
          type="bar"
          dataKey="count"
          nameKey="className"
          color="#281e37"
        />
      </DashboardSplit>

      <OnboardingGuide />
    </div>
  );
}
