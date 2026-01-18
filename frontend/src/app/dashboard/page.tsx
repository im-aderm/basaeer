"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Users, Briefcase, DollarSign, TrendingUp, GraduationCap, Bus, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        students: 0,
        staff: 0,
        revenue: "₦0.0"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [stdRes, staffRes] = await Promise.all([
                    api.get("/students"),
                    api.get("/employees")
                ]);
                setStats({
                    students: stdRes.data.length,
                    staff: staffRes.data.length,
                    revenue: "₦0.0"
                });
            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchStats();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Hero Section */}
            <div className="bg-card rounded-[3.5rem] shadow-2xl shadow-primary/5 border border-border/50 p-10 lg:p-16 relative overflow-hidden border-t-8 border-t-primary">
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <GraduationCap size={32} />
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-foreground italic tracking-tight uppercase">Dashboard Overview</h2>
                    </div>

                    <p className="text-xl lg:text-2xl text-muted-foreground font-medium max-w-2xl leading-relaxed italic">
                        Welcome back, <span className="text-primary font-black uppercase tracking-wider">{user?.firstName}</span>!
                        Your management portal is active for <span className="font-bold text-foreground border-b-4 border-primary/20">{user?.role?.replace('_', ' ')}</span>.
                    </p>

                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Total Students", value: stats.students, trend: "Live Count", icon: Users, color: "text-blue-500" },
                            { title: "Active Staff", value: stats.staff, trend: "Current", icon: Briefcase, color: "text-green-500" },
                            { title: "Fees Revenue", value: stats.revenue, trend: "Draft", icon: DollarSign, color: "text-orange-500" }
                        ].map((stat, i) => (
                            <div key={i} className="bg-muted/30 border border-border/50 rounded-[2.5rem] p-10 hover:bg-muted/50 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 group-hover:text-primary transition-colors flex items-center gap-2">
                                    <stat.icon size={12} className={stat.color} /> {stat.title}
                                </h3>
                                <div className="flex items-end gap-3 relative z-10">
                                    <p className="text-5xl font-black italic tracking-tighter">{loading ? "..." : stat.value}</p>
                                    <span className="text-primary font-black text-[10px] mb-2 uppercase tracking-widest">{stat.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/5 rounded-full blur-[100px]"></div>
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Quick Links / Navigation Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-blue-500/20">
                    <h3 className="text-2xl font-black italic mb-6 flex items-center gap-3"><Bus className="text-blue-500" /> Transport</h3>
                    <p className="text-muted-foreground font-medium italic mb-8">Manage fleet logistics, routes, and student assignments efficiently.</p>
                    <a href="/dashboard/transport" className="inline-flex items-center gap-2 font-black text-blue-500 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                        Open Transport Dashboard <TrendingUp size={16} />
                    </a>
                </Card>

                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-green-500/20">
                    <h3 className="text-2xl font-black italic mb-6 flex items-center gap-3"><Users className="text-green-500" /> Students</h3>
                    <p className="text-muted-foreground font-medium italic mb-8">Comprehensive directory, admissions, and student performance tracking.</p>
                    <a href="/dashboard/students" className="inline-flex items-center gap-2 font-black text-green-500 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                        Open Student Dashboard <TrendingUp size={16} />
                    </a>
                </Card>

                <Card className="rounded-[3rem] p-10 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 border-b-purple-500/20">
                    <h3 className="text-2xl font-black italic mb-6 flex items-center gap-3"><Calendar className="text-purple-500" /> Academic</h3>
                    <p className="text-muted-foreground font-medium italic mb-8">Handle class schedules, exams, and academic sessions effortlessly.</p>
                    <a href="/dashboard/academics" className="inline-flex items-center gap-2 font-black text-purple-500 hover:gap-4 transition-all uppercase tracking-widest text-xs">
                        Manage Academics <TrendingUp size={16} />
                    </a>
                </Card>
            </div>
        </div>
    );
}
