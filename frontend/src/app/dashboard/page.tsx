"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Users, Briefcase, DollarSign, TrendingUp, GraduationCap, Bus, Calendar, Loader2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        staff: 0,
        revenue: "₦0.0"
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get("/reporting/dashboard");
                const data = response.data;
                setStats({
                    students: data.academic.totalStudents || 0,
                    staff: data.hr.totalStaff || 0,
                    revenue: `₦${data.finance.totalPaid?.toLocaleString() || '0.0'}`
                });
            } catch (error) {
                const msg = error instanceof Error ? error.message : "Failed to load dashboard";
                setError(msg);
                toast.error("Could not load dashboard data");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

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
                <p className="text-lg font-semibold text-destructive">Failed to load dashboard</p>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Hero Section */}
            <div className="bg-card rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-border/50 p-10 lg:p-16 relative overflow-hidden border-t-8 border-t-primary">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <GraduationCap size={32} />
                        </div>
                        <h1 className="text-h1 tracking-tight">Dashboard Overview</h1>
                    </div>

                    <p className="text-body text-muted-foreground max-w-2xl">
                        Welcome back, <span className="text-primary font-semibold">{user?.firstName}</span>!
                        Your management portal is active for <span className="font-medium text-foreground">{user?.role?.replace('_', ' ')}</span>.
                    </p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Total Students", value: stats.students, trend: "Live Count", icon: Users, color: "text-blue-500" },
                            { title: "Active Staff", value: stats.staff, trend: "Current", icon: Briefcase, color: "text-green-500" },
                            { title: "Fees Revenue", value: stats.revenue, trend: "Draft", icon: DollarSign, color: "text-orange-500" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-10 hover:bg-muted/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                                <h3 className="text-label mb-4 group-hover:text-primary transition-colors flex items-center gap-2">
                                    <stat.icon size={12} className={stat.color} /> {stat.title}
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <p className="text-h1 font-semibold tracking-tight">{stat.value}</p>
                                    <span className="text-primary text-label mb-1">{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative background elements */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-blue-500/20">
                    <h3 className="text-h3 mb-4 flex items-center gap-3"><Bus className="text-blue-500" /> Transport</h3>
                    <p className="text-body text-muted-foreground mb-8">Manage fleet logistics, routes, and student assignments efficiently.</p>
                    <a href="/dashboard/transport" className="inline-flex items-center gap-2 text-btn text-blue-500 hover:gap-4 transition-all">
                        Open Transport Dashboard <TrendingUp size={16} />
                    </a>
                </Card>

                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-green-500/20">
                    <h3 className="text-h3 mb-4 flex items-center gap-3"><Users className="text-green-500" /> Students</h3>
                    <p className="text-body text-muted-foreground mb-8">Comprehensive directory, admissions, and student performance tracking.</p>
                    <a href="/dashboard/students" className="inline-flex items-center gap-2 text-btn text-green-500 hover:gap-4 transition-all">
                        Open Student Dashboard <TrendingUp size={16} />
                    </a>
                </Card>

                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-purple-500/20">
                    <h3 className="text-h3 mb-4 flex items-center gap-3"><Calendar className="text-purple-500" /> Academic</h3>
                    <p className="text-body text-muted-foreground mb-8">Handle class schedules, exams, and academic sessions effortlessly.</p>
                    <a href="/dashboard/academics" className="inline-flex items-center gap-2 text-btn text-purple-500 hover:gap-4 transition-all">
                        Manage Academics <TrendingUp size={16} />
                    </a>
                </Card>
            </div>
        </div>
    );
}
