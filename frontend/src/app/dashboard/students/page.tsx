"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import {
    Users,
    UserPlus,
    GraduationCap,
    TrendingUp,
    Award,
    ClipboardList,
    ArrowRight,
    Loader2,
    AlertCircle
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentService } from "@/services/studentService";
import { useNotification } from '@/context/NotificationContext';

export default function StudentsDashboard() {
    const { showError } = useNotification();
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        activeClasses: 0,
        attendance: "94.2%"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        StudentService.getStats()
            .then((statsData) => {
                setStats({
                    total: statsData.total,
                    newThisMonth: statsData.newThisMonth,
                    activeClasses: statsData.activeClasses,
                    attendance: statsData.attendanceRate
                });
            })
            .catch((err: unknown) => {
                const errMsg = err instanceof Error ? err.message : String(err);
                setError("Could not load student statistics");
                showError("Failed to load student data");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-semibold text-destructive">{error}</p>
            </div>
        );
    }

    const quickActions = [
        {
            title: "Student List",
            description: "View and manage all student records",
            icon: Users,
            href: "/dashboard/students/list",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "New Admission",
            description: "Enroll a new student into the system",
            icon: UserPlus,
            href: "/dashboard/students/admission",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: "Certificates",
            description: "Issue and manage student certificates",
            icon: Award,
            href: "/dashboard/students/certificates",
            color: "text-primary",
            bg: "bg-primary/10"
        },
        {
            title: "Attendance",
            description: "View daily attendance reports",
            icon: ClipboardList,
            href: "/dashboard/attendance/student",
            color: "text-primary",
            bg: "bg-primary/10"
        }
    ];

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <GraduationCap className="text-primary w-7 h-7" />
                        Student Operations
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">Comprehensive overview of the student body and academic status.</p>
                </div>
                <Link href="/dashboard/students/admission">
                    <Button className="gap-2 rounded-2xl h-11 px-6 font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <UserPlus size={18} /> Enroll Student
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Total Students", value: stats.total, icon: Users, trend: "+12%" },
                    { label: "Academic Levels", value: stats.activeClasses, icon: GraduationCap, trend: "Active" },
                    { label: "Avg Attendance", value: stats.attendance, icon: ClipboardList, trend: "Daily" },
                    { label: "New Enrollments", value: stats.newThisMonth, icon: TrendingUp, trend: "This Month" }
                ].map((item, i) => (
                    <Card key={i} className="rounded-2xl border-border/50 shadow-lg p-6 border-t-4 border-t-primary/10 hover:border-t-primary transition-all group">
                        <div className="flex justify-between items-center mb-3">
                            <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <item.icon size={20} />
                            </div>
                            <span className="text-label bg-muted px-2 py-1 rounded-full">{item.trend}</span>
                        </div>
                        <p className="text-label mb-1">{item.label}</p>
                        <p className="text-h1">{item.value}</p>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-3xl border-border/50 shadow-lg p-8">
                    <h3 className="text-h3 mb-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ArrowRight size={18} />
                        </div>
                        Quick Navigation
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group">
                                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <action.icon size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-body font-medium">{action.title}</p>
                                        <p className="text-secondary">{action.description}</p>
                                    </div>
                                    <ArrowRight className="text-muted-foreground group-hover:translate-x-1 transition-transform" size={16} />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-3xl border-border/50 shadow-lg p-8 overflow-hidden relative border-t-4 border-t-primary">
                    <div className="relative z-10">
                        <h3 className="text-h3 mb-1">Recent Activity</h3>
                        <p className="text-secondary mb-6">Stay updated with the latest changes.</p>

                        <div className="text-center py-8 text-muted-foreground">
                            <p className="text-sm">No recent activity to display</p>
                        </div>

                        <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                            <h4 className="text-body font-semibold text-primary mb-1 text-center">Need Help?</h4>
                            <p className="text-secondary text-center">Contact the administrative support team at support@basaer.com if you encounter any issues.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
        </RequireBranch>
    );
}
