"use client";

import { useState, useEffect } from "react";
import { reportingService } from "@/services/reportingService";
import type {
  StudentAnalyticsData,
  FinanceAnalyticsData,
  HRAnalyticsData,
  AcademicAnalyticsData,
  AttendanceAnalyticsData,
} from "@/types/dashboard";
import {
  FileText, Download, TrendingUp, Users, DollarSign, BookOpen,
  Calendar, Briefcase, Loader2, AlertCircle, School, GraduationCap,
  BarChart3, PieChart, LineChart
} from "lucide-react";
import { Card } from "@/components/ui/card";

function formatCurrency(amount: number | undefined | null): string {
  if (amount == null) return "₦0";
  return `₦${amount.toLocaleString()}`;
}

function formatPercent(rate: number | undefined | null): string {
  if (rate == null) return "—";
  return `${rate}%`;
}

type LoadingData = Record<string, boolean>;

export default function ReportsPage() {
  const [studentData, setStudentData] = useState<StudentAnalyticsData | null>(null);
  const [financeData, setFinanceData] = useState<FinanceAnalyticsData | null>(null);
  const [hrData, setHrData] = useState<HRAnalyticsData | null>(null);
  const [academicData, setAcademicData] = useState<AcademicAnalyticsData | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState<LoadingData>({ student: true, finance: true, hr: true, academic: true, attendance: true });
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchSection = async (key: string, fetcher: () => Promise<any>, setter: (d: any) => void) => {
      try {
        const data = await fetcher();
        setter(data);
        setErrors((e) => ({ ...e, [key]: null }));
      } catch (err: any) {
        setErrors((e) => ({ ...e, [key]: err?.message || "Failed to load" }));
      } finally {
        setLoading((l) => ({ ...l, [key]: false }));
      }
    };

    fetchSection("student", () => reportingService.getStudentAnalytics(), setStudentData);
    fetchSection("finance", () => reportingService.getFinanceAnalytics(), setFinanceData);
    fetchSection("hr", () => reportingService.getHRAnalytics(), setHrData);
    fetchSection("academic", () => reportingService.getAcademicAnalytics(), setAcademicData);
    fetchSection("attendance", () => reportingService.getAttendanceAnalytics(), setAttendanceData);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
          <BarChart3 size={32} />
        </div>
        <div>
          <h1 className="text-h1 tracking-tight">Enterprise Reports</h1>
          <p className="text-body text-muted-foreground">Comprehensive insights across all departments</p>
        </div>
      </div>

      {/* Student Analytics */}
      <ReportSection
        title="Student Analytics"
        icon={<Users className="w-5 h-5" />}
        color="blue"
        loading={loading.student}
        error={errors.student}
      >
        {studentData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Total Students" value={studentData.total} />
            <MiniStat label="Active" value={studentData.active} />
            <MiniStat label="New This Year" value={studentData.newThisYear} />
            <MiniStat label="This Term" value={studentData.newThisTerm} />
          </div>
        )}
      </ReportSection>

      {/* Financial Analytics */}
      <ReportSection
        title="Financial Summary"
        icon={<DollarSign className="w-5 h-5" />}
        color="green"
        loading={loading.finance}
        error={errors.finance}
      >
        {financeData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStat label="Revenue" value={formatCurrency(financeData.totalRevenue)} />
              <MiniStat label="Outstanding" value={formatCurrency(financeData.totalOutstanding)} />
              <MiniStat label="Collection Rate" value={formatPercent(financeData.collectionRate)} />
              <MiniStat label="Monthly Trend" value={`${financeData.monthlyCashflow.length} months`} />
            </div>
            {financeData.monthlyCashflow.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold text-muted-foreground">Cashflow (Last 6 Months)</p>
                <div className="space-y-1.5">
                  {financeData.monthlyCashflow.map((m) => (
                    <div key={m.month} className="flex items-center gap-3 text-sm">
                      <span className="w-20 font-medium shrink-0">{m.month}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${Math.min((m.income / Math.max(...financeData.monthlyCashflow.map((x) => x.income), 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="w-24 text-right text-muted-foreground">{formatCurrency(m.income)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ReportSection>

      {/* HR Analytics */}
      <ReportSection
        title="HR Statistics"
        icon={<Briefcase className="w-5 h-5" />}
        color="purple"
        loading={loading.hr}
        error={errors.hr}
      >
        {hrData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MiniStat label="Total Staff" value={hrData.totalStaff} />
              <MiniStat label="Payroll (Paid)" value={formatCurrency(hrData.payrollTotal)} />
              <MiniStat label="Payroll (Pending)" value={formatCurrency(hrData.payrollPending)} />
              <MiniStat label="Departments" value={hrData.byDepartment.length} />
            </div>
            {hrData.byStatus.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">By Status</p>
                <div className="flex flex-wrap gap-2">
                  {hrData.byStatus.map((s) => (
                    <span key={s.status} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${s.status === "ACTIVE" ? "bg-green-500" : "bg-amber-500"}`} />
                      {s.status} ({s.count})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ReportSection>

      {/* Academic Analytics */}
      <ReportSection
        title="Academic Overview"
        icon={<BookOpen className="w-5 h-5" />}
        color="orange"
        loading={loading.academic}
        error={errors.academic}
      >
        {academicData && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MiniStat label="Classes" value={academicData.totalClasses} />
            <MiniStat label="Sections" value={academicData.totalSections} />
            <MiniStat label="Students/Class" value={academicData.studentsPerClass} />
            <MiniStat label="Subjects" value={academicData.subjectCount} />
          </div>
        )}
      </ReportSection>

      {/* Attendance Analytics */}
      <ReportSection
        title="Attendance Overview"
        icon={<Calendar className="w-5 h-5" />}
        color="blue"
        loading={loading.attendance}
        error={errors.attendance}
      >
        {attendanceData && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MiniStat label="Today's Rate" value={formatPercent(attendanceData.todayRate)} />
              <MiniStat label="Weekly Trend" value={`${attendanceData.weeklyTrend.length} days`} />
              <MiniStat label="Monthly Summary" value={`${attendanceData.monthlySummary.length} months`} />
            </div>
            {attendanceData.weeklyTrend.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">This Week</p>
                <div className="flex items-end gap-2 h-20">
                  {attendanceData.weeklyTrend.map((d) => (
                    <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${d.rate}%`, minHeight: d.rate > 0 ? "4px" : "0" }}
                      />
                      <span className="text-[10px] text-muted-foreground">{d.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </ReportSection>
    </div>
  );
}

// ── Sub-components ──

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-muted/30 border border-border/50 rounded-2xl p-4">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-xl font-bold text-foreground">{value ?? "—"}</p>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-6 w-48 bg-muted rounded" />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-muted rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function SectionError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-2xl bg-destructive/5 border border-destructive/20">
      <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}

function ReportSection({
  title, icon, color, loading, error, children
}: {
  title: string;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
  error: string | null;
  children: React.ReactNode;
}) {
  const borderColor =
    color === "blue" ? "border-t-blue-500/30" :
    color === "green" ? "border-t-green-500/30" :
    color === "purple" ? "border-t-purple-500/30" :
    color === "orange" ? "border-t-orange-500/30" :
    "border-t-primary/30";

  return (
    <Card className={`rounded-[2.5rem] p-8 border-border/50 shadow-xl bg-card/50 border-t-8 ${borderColor}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl bg-${color}-500/10 flex items-center justify-center text-${color}-500`}>
          {icon}
        </div>
        <h2 className="text-h3">{title}</h2>
      </div>
      {loading ? <SectionSkeleton /> : error ? <SectionError message={error} /> : children}
    </Card>
  );
}
