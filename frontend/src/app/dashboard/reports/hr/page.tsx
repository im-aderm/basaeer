"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    Briefcase, 
    UserCheck, 
    Shield, 
    Download, 
    Filter,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaer/shared-types";
import { toast } from "sonner";

export default function HRReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/hr");
            setData(response.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch HR analytics:", error);
            toast.error("Failed to load HR analytics");
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
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Human Resources</h1>
                    <p className="text-muted-foreground font-medium mt-1">Workforce distribution, role management, and personnel insights.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Staff List
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Roles
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Total Staff"
                    value={data?.summary.find(s => s.label === 'Total Staff')?.value || 0}
                    icon={Briefcase}
                    color="blue"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Active Personnel"
                    value={data?.summary.find(s => s.label === 'Active Personnel')?.value || 0}
                    icon={UserCheck}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Staff Roles"
                    value={data?.summary.find(s => s.label === 'Total Roles')?.value || 0}
                    icon={Shield}
                    color="orange"
                    loading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AnalyticsChart
                    title="Role Distribution"
                    description="Workforce breakdown by institutional role"
                    data={data?.charts.roles || []}
                    type="bar"
                    dataKey="value"
                    color="#f59e0b"
                    loading={loading}
                />
                <AnalyticsChart
                    title="Gender Diversity"
                    data={data?.charts.gender || []}
                    type="pie"
                    dataKey="value"
                    nameKey="name"
                    loading={loading}
                />
            </div>
        </div>
    );
}
