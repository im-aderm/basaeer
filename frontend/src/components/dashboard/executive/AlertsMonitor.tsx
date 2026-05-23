"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, AlertTriangle, Shield, TrendingDown } from "lucide-react";
import type { BranchKPI, ExecutiveFinance } from "@/types/analytics";

interface AlertsMonitorProps {
    branches: BranchKPI[];
    finance: ExecutiveFinance;
}

export default function AlertsMonitor({ branches, finance }: AlertsMonitorProps) {
    const alerts: Array<{ severity: "low" | "medium" | "high" | "critical"; category: string; title: string; description: string; branchName?: string }> = [];

    // Low attendance alerts
    branches.forEach((b) => {
        if (b.attendanceRate < 70) {
            alerts.push({
                severity: "high",
                category: "Attendance",
                title: "Critically Low Attendance",
                description: `${b.branchName} attendance is at ${b.attendanceRate}%`,
                branchName: b.branchName,
            });
        } else if (b.attendanceRate < 85) {
            alerts.push({
                severity: "medium",
                category: "Attendance",
                title: "Below Target Attendance",
                description: `${b.branchName} attendance is at ${b.attendanceRate}% (target: 85%)`,
                branchName: b.branchName,
            });
        }
    });

    // High outstanding debt
    finance.byBranch.forEach((b) => {
        if (b.outstanding > 500000) {
            alerts.push({
                severity: "critical",
                category: "Finance",
                title: "High Outstanding Debt",
                description: `${b.branchName} has ₦${(b.outstanding / 1000000).toFixed(1)}M unpaid`,
                branchName: b.branchName,
            });
        } else if (b.outstanding > 100000) {
            alerts.push({
                severity: "medium",
                category: "Finance",
                title: "Elevated Outstanding",
                description: `${b.branchName} has ₦${(b.outstanding / 1000).toFixed(0)}K unpaid`,
                branchName: b.branchName,
            });
        }
    });

    // Negative growth
    branches.forEach((b) => {
        if (b.growth < -10) {
            alerts.push({
                severity: "high",
                category: "Enrollment",
                title: "Enrollment Decline",
                description: `${b.branchName} lost ${Math.abs(b.growth)}% students this month`,
                branchName: b.branchName,
            });
        }
    });

    if (alerts.length === 0) {
        return (
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                        <Shield className="w-5 h-5" /> All Systems Normal
                    </CardTitle>
                    <CardDescription className="font-medium">No operational alerts detected</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    const severityIcon = {
        low: AlertCircle,
        medium: AlertTriangle,
        high: AlertCircle,
        critical: TrendingDown,
    };

    const severityColor = {
        low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
        medium: "bg-primary/10 text-primary border-primary/20",
        high: "bg-red-500/10 text-red-600 border-red-500/20",
        critical: "bg-red-500/20 text-red-700 border-red-500/30",
    };

    return (
        <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
            <CardHeader>
                <CardTitle className="text-h4 font-bold text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Alerts & Risk Monitor
                </CardTitle>
                <CardDescription className="font-medium">{alerts.length} alert(s) requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {alerts.sort((a, b) => {
                        const order = { critical: 0, high: 1, medium: 2, low: 3 };
                        return order[a.severity] - order[b.severity];
                    }).map((alert, i) => {
                        const Icon = severityIcon[alert.severity];
                        return (
                            <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border ${severityColor[alert.severity]}`}>
                                <Icon className="w-5 h-5 shrink-0" />
                                <div className="flex-1">
                                    <p className="font-bold text-sm">{alert.title}</p>
                                    <p className="text-xs opacity-80">{alert.description}</p>
                                </div>
                                <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-white/50">{alert.severity}</span>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
