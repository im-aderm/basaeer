"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import { Loader2, Users, Briefcase, DollarSign, Percent, Target, GraduationCap, Bed, Calendar, FileText, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import BranchContextBanner from "@/components/BranchContextBanner";

interface BranchDashboardProps {
    branchId: string;
}

export default function BranchDashboard({ branchId }: BranchDashboardProps) {
    const { data: overview, isLoading: loadingOverview } = useQuery({
        queryKey: ["branch-overview", branchId],
        queryFn: () => analyticsService.getBranchOverview(branchId),
        refetchInterval: 60_000,
    });

    const { data: dailyOps, isLoading: loadingOps } = useQuery({
        queryKey: ["branch-daily-ops", branchId],
        queryFn: () => analyticsService.getBranchDailyOps(branchId),
        refetchInterval: 120_000,
    });

    const { data: finance, isLoading: loadingFinance } = useQuery({
        queryKey: ["branch-finance", branchId],
        queryFn: () => analyticsService.getBranchFinance(branchId),
        refetchInterval: 120_000,
    });

    const { data: attendance, isLoading: loadingAttendance } = useQuery({
        queryKey: ["branch-attendance", branchId],
        queryFn: () => analyticsService.getBranchAttendance(branchId),
        refetchInterval: 60_000,
    });

    const { data: academics, isLoading: loadingAcademics } = useQuery({
        queryKey: ["branch-academics", branchId],
        queryFn: () => analyticsService.getBranchAcademics(branchId),
        refetchInterval: 300_000,
    });

    const isLoading = loadingOverview || loadingOps || loadingFinance || loadingAttendance || loadingAcademics;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (!overview) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Unable to load branch data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            <BranchContextBanner />

            {/* Section A: Branch KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCardWidget
                    title="Total Students"
                    value={overview.totalStudents}
                    subtitle={overview.newThisMonth ? `+${overview.newThisMonth} this month` : ""}
                    icon={Users}
                    color="blue"
                />
                <StatCardWidget
                    title="Attendance Today"
                    value={`${overview.attendanceRate}%`}
                    subtitle={`${overview.attendancePresent} present · ${overview.attendanceAbsent} absent`}
                    icon={Percent}
                    color="purple"
                    formatter={(v) => `${v}%`}
                />
                <StatCardWidget
                    title="Revenue"
                    value={overview.revenue}
                    icon={DollarSign}
                    color="orange"
                    formatter={(v) => `₦${Number(v).toLocaleString()}`}
                />
                <StatCardWidget
                    title="Outstanding Fees"
                    value={overview.outstanding}
                    icon={Target}
                    color="red"
                    formatter={(v) => `₦${Number(v).toLocaleString()}`}
                />
                <StatCardWidget
                    title="Active Staff"
                    value={overview.activeStaff}
                    subtitle={`of ${overview.totalStaff} total`}
                    icon={Briefcase}
                    color="green"
                />
                <StatCardWidget
                    title="Active Classes"
                    value={overview.activeClasses}
                    icon={GraduationCap}
                    color="primary"
                />
                <StatCardWidget
                    title="Hostel Occupancy"
                    value={`${overview.hostelOccupancyRate}%`}
                    icon={Bed}
                    color="blue"
                    subtitle={overview.hostelOccupancyRate > 0 ? `${overview.hostelOccupancyRate}% beds filled` : "No allocations"}
                />
                <StatCardWidget
                    title="Pending Exams"
                    value={dailyOps?.upcomingExams.length ?? 0}
                    icon={FileText}
                    color="orange"
                />
            </div>

            {/* Section B: Daily Operations */}
            {dailyOps && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                        <CardHeader>
                            <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                                <Calendar className="w-5 h-5" /> Recent Admissions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dailyOps.recentAdmissions.length > 0 ? (
                                    dailyOps.recentAdmissions.map((a) => (
                                        <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {a.firstName[0]}{a.lastName[0]}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-sm">{a.firstName} {a.lastName}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No admissions today</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                        <CardHeader>
                            <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                                <FileText className="w-5 h-5" /> Upcoming Exams
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dailyOps.upcomingExams.length > 0 ? (
                                    dailyOps.upcomingExams.map((e) => (
                                        <div key={e.id} className="p-3 rounded-xl bg-muted/20">
                                            <p className="font-bold text-sm">{e.title}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {e.startsAt ? new Date(e.startsAt).toLocaleDateString() : "TBD"}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No upcoming exams</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                        <CardHeader>
                            <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                                <Clock className="w-5 h-5" /> Staff on Leave
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dailyOps.staffOnLeave.length > 0 ? (
                                    dailyOps.staffOnLeave.map((l) => (
                                        <div key={l.id} className="p-3 rounded-xl bg-muted/20">
                                            <p className="font-bold text-sm">{l.staff.user.firstName} {l.staff.user.lastName}</p>
                                            <p className="text-xs text-muted-foreground">{l.reason}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-4">No staff on leave</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Section C: Academic Analytics */}
            {academics && academics.studentsPerClass.length > 0 && (
                <ChartWidget
                    title="Students by Class"
                    description="Enrollment distribution"
                    data={academics.studentsPerClass}
                    type="bar"
                    dataKey="count"
                    nameKey="className"
                    color="#281e37"
                />
            )}

            {/* Section D: Financial Analytics */}
            {finance && finance.cashflow.length > 0 && (
                <ChartWidget
                    title="Monthly Cashflow"
                    description="Revenue collection trend"
                    data={finance.cashflow}
                    type="bar"
                    dataKey="collected"
                    nameKey="month"
                    color="#00a0e1"
                />
            )}

            {/* Section E: Attendance Trend */}
            {attendance && attendance.trend.length > 0 && (
                <ChartWidget
                    title="Attendance Trend"
                    description="Last 30 days"
                    data={attendance.trend}
                    type="line"
                    dataKey="rate"
                    nameKey="date"
                    color="#10b981"
                />
            )}
        </div>
    );
}
