"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from "recharts";
import type { BranchKPI, ExecutiveFinance, ExecutiveAttendance } from "@/types/analytics";

interface BranchComparisonProps {
    branches: BranchKPI[];
    finance: ExecutiveFinance;
    attendance: ExecutiveAttendance;
}

const COLORS = ["#281e37", "#00a0e1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4"];

export default function BranchComparison({ branches, finance, attendance }: BranchComparisonProps) {
    const enrollmentData = branches.map((b) => ({ name: b.branchCode, students: b.students, staff: b.staff }));
    const revenueData = finance.byBranch.map((b, i) => ({ name: b.branchCode, revenue: b.revenue, outstanding: b.outstanding, fill: COLORS[i % COLORS.length] }));
    const attendanceData = attendance.byBranch.map((b) => ({ name: b.branchCode, rate: b.attendanceRate }));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enrollment Comparison */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary">Enrollment by Branch</CardTitle>
                    <CardDescription className="font-medium">Student and staff distribution</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={enrollmentData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="students" fill="#281e37" radius={[8, 8, 0, 0]} name="Students" />
                            <Bar dataKey="staff" fill="#00a0e1" radius={[8, 8, 0, 0]} name="Staff" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Revenue Contribution */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary">Revenue Contribution</CardTitle>
                    <CardDescription className="font-medium">Share of total revenue by branch</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={revenueData}
                                dataKey="revenue"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                            >
                                {revenueData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: unknown) => `₦${Number(value).toLocaleString()}`} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Attendance Comparison */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary">Attendance Comparison</CardTitle>
                    <CardDescription className="font-medium">Today&apos;s attendance rate by branch</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={attendanceData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={60} />
                            <Tooltip formatter={(value: unknown) => `${Number(value)}%`} />
                            <Bar dataKey="rate" fill="#10b981" radius={[0, 8, 8, 0]} name="Attendance Rate" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Outstanding Debt Heatmap */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary">Outstanding Debt</CardTitle>
                    <CardDescription className="font-medium">Unpaid fees by branch</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {finance.byBranch
                            .sort((a, b) => b.outstanding - a.outstanding)
                            .map((b, i) => {
                                const maxDebt = Math.max(...finance.byBranch.map((x) => x.outstanding), 1);
                                const pct = (b.outstanding / maxDebt) * 100;
                                const severity = pct > 70 ? "bg-red-500" : pct > 40 ? "bg-primary/60" : "bg-primary";
                                return (
                                    <div key={b.branchId} className="flex items-center gap-4">
                                        <span className="text-sm font-bold w-16">{b.branchCode}</span>
                                        <div className="flex-1 h-8 bg-muted/30 rounded-xl overflow-hidden">
                                            <div className={`h-full ${severity} rounded-xl transition-all duration-500`} style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-sm font-bold w-24 text-right">₦{(b.outstanding / 1000).toFixed(0)}K</span>
                                    </div>
                                );
                            })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
