"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    Users, 
    UserCheck, 
    School, 
    Download, 
    Filter,
    FileBarChart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaeer/shared-types";
import { toast } from "sonner";

export default function StudentReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/students");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch student analytics:", error);
            toast.error("Failed to load student analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    const handleExport = async () => {
        try {
            const response = await api.get("/reporting/export/performance", {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_performance_report.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            toast.error("Failed to export report");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Student Analytics</h1>
                    <p className="text-muted-foreground font-medium mt-1">Comprehensive insights into enrollment, demographics, and performance.</p>
                </div>
                <div className="flex gap-4">
                    <Button 
                        variant="outline" 
                        onClick={handleExport}
                        className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5"
                    >
                        <Download size={18} />
                        Export PDF
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Data
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Total Students"
                    value={data?.summary.find(s => s.label === 'Total Students')?.value || 0}
                    icon={Users}
                    color="blue"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Active Students"
                    value={data?.summary.find(s => s.label === 'Active Students')?.value || 0}
                    icon={UserCheck}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Total Classes"
                    value={data?.summary.find(s => s.label === 'Classes')?.value || 0}
                    icon={School}
                    color="purple"
                    loading={loading}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalyticsChart
                    title="Enrollment Growth"
                    description="Monthly student admission trends"
                    data={data?.charts.admissions || []}
                    type="line"
                    dataKey="count"
                    loading={loading}
                />
                <AnalyticsChart
                    title="Class Distribution"
                    description="Students per grade level"
                    data={data?.charts.classes || []}
                    type="bar"
                    dataKey="value"
                    color="#8b5cf6"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <AnalyticsChart
                    title="Gender Breakdown"
                    data={data?.charts.gender || []}
                    type="pie"
                    dataKey="value"
                    nameKey="name"
                    height={250}
                    loading={loading}
                />
                
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-[3rem] border border-border/50 p-8 h-full flex flex-col justify-center items-center text-center space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileBarChart size={32} />
                        </div>
                        <h3 className="text-h3 font-semibold">Detailed Demographics</h3>
                        <p className="text-muted-foreground max-w-xs">
                            Access granular student data including age, religion, and regional distribution.
                        </p>
                        <Button variant="ghost" className="text-primary font-bold">
                            View Full Table
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
