"use client";

import { useState, useEffect } from "react";
import {
    Users,
    UserPlus,
    GraduationCap,
    TrendingUp,
    Award,
    ClipboardList,
    Search,
    ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StudentService, Student } from "@/services/studentService";
import { ClassService } from "@/services/classService";

export default function StudentsDashboard() {
    const [stats, setStats] = useState({
        total: 0,
        newThisMonth: 0,
        activeClasses: 0,
        attendance: "94.2%"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            StudentService.getAll(),
            ClassService.getAll()
        ]).then(([students, classes]) => {
            setStats({
                total: students.length,
                newThisMonth: Math.floor(students.length * 0.05), // Mock trend
                activeClasses: classes.length,
                attendance: "94.2%"
            });
            setLoading(false);
        });
    }, []);

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
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Certificates",
            description: "Issue and manage student certificates",
            icon: Award,
            href: "/dashboard/students/certificates",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        },
        {
            title: "Attendance",
            description: "View daily attendance reports",
            icon: ClipboardList,
            href: "/dashboard/attendance/student",
            color: "text-purple-500",
            bg: "bg-purple-500/10"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic">
                        <GraduationCap className="text-primary w-10 h-10" />
                        Student Operations
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium italic">Comprehensive overview of the student body and academic status.</p>
                </div>
                <Link href="/dashboard/students/admission">
                    <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <UserPlus size={20} /> Enroll Student
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
                    <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-2xl shadow-primary/5 p-8 border-t-8 border-t-primary/10 hover:border-t-primary transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <item.icon size={24} />
                            </div>
                            <span className="text-xs font-black bg-muted px-3 py-1 rounded-full text-muted-foreground uppercase">{item.trend}</span>
                        </div>
                        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">{item.label}</h3>
                        <p className="text-3xl font-black italic mt-1">{loading ? "..." : item.value}</p>
                    </Card>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 p-10 bg-card/50 backdrop-blur-sm">
                    <h3 className="text-2xl font-black italic mb-8 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ArrowRight size={24} />
                        </div>
                        Quick Navigation
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href}>
                                <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-muted/20 hover:bg-muted/40 transition-all border border-transparent hover:border-border/50 group">
                                    <div className={`w-14 h-14 rounded-2xl ${action.bg} ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                        <action.icon size={28} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-xl italic">{action.title}</h4>
                                        <p className="text-sm text-muted-foreground font-medium">{action.description}</p>
                                    </div>
                                    <ArrowRight className="text-muted-foreground group-hover:translate-x-2 transition-transform" />
                                </div>
                            </Link>
                        ))}
                    </div>
                </Card>

                <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 p-10 bg-card/50 overflow-hidden relative border-t-8 border-t-primary">
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black italic mb-2 tracking-tight">Recent Activity</h3>
                        <p className="text-muted-foreground font-medium italic mb-8">Stay updated with the latest changes.</p>

                        <div className="space-y-6">
                            {[
                                "New student enrolled in Grade 10A",
                                "Attendance report generated for Branch A",
                                "15 Certificates issued to Grade 12",
                                "ID Cards sent for printing"
                            ].map((activity, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                                    <p className="text-sm font-bold text-muted-foreground leading-relaxed italic">{activity}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10">
                            <h4 className="font-black italic text-primary text-xl mb-2 text-center">Need Help?</h4>
                            <p className="text-xs text-center text-muted-foreground font-bold leading-relaxed px-4">Contact the administrative support team at support@basaeer.com if you encounter any issues.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
