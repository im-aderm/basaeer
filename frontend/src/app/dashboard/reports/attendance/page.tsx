"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    Clock, 
    UserX, 
    CheckCircle, 
    Download, 
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaer/shared-types";
import { toast } from "sonner";

export default function AttendanceReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [chronicAbsentees, setChronicAbsentees] = useState<any[]>([]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const [reportRes, chronicRes] = await Promise.all([
                api.get<AnalyticsData>("/reporting/attendance"),
                api.get("/attendance/analytics/chronic?threshold=15")
            ]);
            setData(reportRes.data);
            setChronicAbsentees(chronicRes.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch attendance analytics:", error);
            toast.error("Failed to load attendance analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Attendance Intelligence</h1>
                    <p className="text-muted-foreground font-medium mt-1">Real-time tracking of student and staff presence.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Attendance
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Class
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Average Attendance"
                    value={data?.summary.find(s => s.label === 'Average Attendance')?.value || "0%"}
                    icon={CheckCircle}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Absentees Today"
                    value={data?.summary.find(s => s.label === 'Absentees Today')?.value || "0"}
                    icon={UserX}
                    color="red"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Late Arrivals"
                    value={data?.summary.find(s => s.label === 'Late Arrivals')?.value || "0"}
                    icon={Clock}
                    color="orange"
                    loading={loading}
                />
            </div>

            <AnalyticsChart
                title="Weekly Attendance Trend"
                description="Institution-wide attendance rate per day"
                data={data?.charts.attendance || []}
                type="line"
                dataKey="rate"
                color="#3b82f6"
                height={400}
                loading={loading}
            />

            {/* Chronic Absentees */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-h3 font-semibold uppercase tracking-tight text-slate-400">Chronic Absentees</h2>
                        <p className="text-muted-foreground font-medium">Students with {'>'}15% absence rate.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chronicAbsentees.length > 0 ? (
                        chronicAbsentees.map((item) => (
                            <div 
                                key={item.studentId}
                                className="bg-white border border-border/50 rounded-[2rem] p-6 flex items-center justify-between group hover:border-red-200 transition-all hover:shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center text-xl font-bold group-hover:bg-red-600 group-hover:text-white transition-all">
                                        {item.student?.firstName[0]}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 leading-tight">
                                            {item.student?.firstName} {item.student?.lastName}
                                        </h4>
                                        <p className="text-xs font-bold text-muted-foreground uppercase mt-1">
                                            {item.student?.class?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-black text-red-600 leading-none">
                                        {Math.round(item.percentage)}%
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">Absent</div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-12 text-center bg-muted/5 rounded-[2.5rem] border-2 border-dashed border-border/50">
                            <CheckCircle className="w-12 h-12 mx-auto text-emerald-200 mb-2" />
                            <p className="font-bold text-slate-400">Excellent! No chronic absentees found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
