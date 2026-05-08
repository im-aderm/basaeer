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
import { AnalyticsData } from "@basaeer/shared-types";
import { toast } from "sonner";

export default function AttendanceReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/attendance");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch attendance analytics:", error);
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
        </div>
    );
}
