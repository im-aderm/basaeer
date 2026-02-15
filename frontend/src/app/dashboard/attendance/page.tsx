"use client";

import { useState, useEffect } from "react";
import { Users, Briefcase, Calendar, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import api from "@/lib/api";
import { AttendanceService } from "@/services/attendanceService";

export default function AttendanceDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({
        studentsPresent: 0,
        staffPresent: 0,
        totalStudents: 0,
        totalStaff: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await AttendanceService.getStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to fetch attendance stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tight">Attendance Overview</h1>
                    <p className="text-muted-foreground text-lg">Manage and track daily attendance</p>
                </div>
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-xl border border-border/50">
                    <Calendar className="text-primary" />
                    <span className="font-bold italic text-lg">{format(new Date(), 'MMMM dd, yyyy')}</span>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-[2rem] border-none shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6 relative overflow-hidden">
                        <Users className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                        <div className="relative z-10">
                            <p className="text-blue-100 font-bold uppercase tracking-widest text-xs">Students Present</p>
                            <h3 className="text-4xl font-black italic mt-2">{stats.studentsPresent}<span className="text-xl opacity-60">/{stats.totalStudents}</span></h3>
                            <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                                <div className="bg-white h-full" style={{ width: `${(stats.studentsPresent / stats.totalStudents) * 100}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6 relative overflow-hidden">
                        <Briefcase className="absolute -right-4 -bottom-4 w-32 h-32 text-white/10" />
                        <div className="relative z-10">
                            <p className="text-purple-100 font-bold uppercase tracking-widest text-xs">Staff Present</p>
                            <h3 className="text-4xl font-black italic mt-2">{stats.staffPresent}<span className="text-xl opacity-60">/{stats.totalStaff}</span></h3>
                            <div className="mt-4 bg-white/20 h-2 rounded-full overflow-hidden">
                                <div className="bg-white h-full" style={{ width: `${(stats.staffPresent / stats.totalStaff) * 100}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Navigation Cards */}
            <h2 className="text-2xl font-black italic mt-8">Mark Attendance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div
                    onClick={() => router.push('/dashboard/attendance/student')}
                    className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors" />
                    <div className="p-8 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Users size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic text-slate-900">Student Attendance</h3>
                            <p className="text-muted-foreground mt-2">Manage daily attendance for classes and sections.</p>
                            <Button className="mt-4 rounded-xl font-bold bg-blue-600 hover:bg-blue-700">Go to Students &rarr;</Button>
                        </div>
                    </div>
                </div>

                <div
                    onClick={() => router.push('/dashboard/attendance/employee')}
                    className="group relative cursor-pointer overflow-hidden rounded-[2.5rem] bg-white border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-purple-500/5 group-hover:bg-purple-500/10 transition-colors" />
                    <div className="p-8 flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                            <Briefcase size={40} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic text-slate-900">Staff Attendance</h3>
                            <p className="text-muted-foreground mt-2">Track daily attendance for teachers and staff members.</p>
                            <Button className="mt-4 rounded-xl font-bold bg-purple-600 hover:bg-purple-700">Go to Staff &rarr;</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
