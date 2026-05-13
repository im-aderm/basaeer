"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    BookOpen, 
    Book, 
    FileText, 
    Download, 
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaer/shared-types";
import { toast } from "sonner";

export default function AcademicReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/academic");
            setData(response.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch academic analytics:", error);
            toast.error("Failed to load academic analytics");
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
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Academic Excellence</h1>
                    <p className="text-muted-foreground font-medium mt-1">Curriculum progress, examination results, and subject performance.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Rankings
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Exams
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Academic Classes"
                    value={data?.summary.find(s => s.label === 'Academic Classes')?.value || 0}
                    icon={BookOpen}
                    color="blue"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Active Subjects"
                    value={data?.summary.find(s => s.label === 'Active Subjects')?.value || 0}
                    icon={Book}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Conducted Exams"
                    value={data?.summary.find(s => s.label === 'Conducted Exams')?.value || 0}
                    icon={FileText}
                    color="purple"
                    loading={loading}
                />
            </div>

            <AnalyticsChart
                title="Examination Performance"
                description="Average scores across recent assessments"
                data={data?.charts.exams || []}
                type="line"
                dataKey="score"
                color="#8b5cf6"
                height={400}
                loading={loading}
            />
        </div>
    );
}
