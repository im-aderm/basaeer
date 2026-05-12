"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    CreditCard, 
    TrendingUp, 
    AlertCircle, 
    Download, 
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaer/shared-types";
import { toast } from "sonner";

export default function FeesReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/finance", {
                params: { type: 'INVOICE' }
            });
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch fees analytics:", error);
            toast.error("Failed to load fees analytics");
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
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Fees & Collections</h1>
                    <p className="text-muted-foreground font-medium mt-1">Detailed monitoring of tuition, transportation, and special fees.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Ledger
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Status
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Total Collected"
                    value={data?.summary.find(s => s.label === 'Total Revenue')?.value || "₦0.0"}
                    icon={CreditCard}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Expected Income"
                    value="₦1,240,000"
                    icon={TrendingUp}
                    color="blue"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Total Outstanding"
                    value="₦185,000"
                    icon={AlertCircle}
                    color="red"
                    loading={loading}
                />
            </div>

            <AnalyticsChart
                title="Collection Performance"
                description="Cumulative fees collected vs projections"
                data={data?.charts.revenue || []}
                type="line"
                dataKey="revenue"
                color="#10b981"
                height={400}
                loading={loading}
            />
        </div>
    );
}
