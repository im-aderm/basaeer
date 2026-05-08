"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    DollarSign, 
    TrendingDown, 
    Activity, 
    Download, 
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { AnalyticsData } from "@basaeer/shared-types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get<AnalyticsData>("/reporting/finance");
            setData(response.data);
        } catch (error) {
            console.error("Failed to fetch finance analytics:", error);
            toast.error("Failed to load financial analytics");
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
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Financial Intelligence</h1>
                    <p className="text-muted-foreground font-medium mt-1">Revenue tracking, expense management, and profit analysis.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Statements
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Select Period
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Total Revenue"
                    value={data?.summary.find(s => s.label === 'Total Revenue')?.value || "₦0.0"}
                    icon={DollarSign}
                    color="green"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Total Expenses"
                    value={data?.summary.find(s => s.label === 'Total Expenses')?.value || "₦0.0"}
                    icon={TrendingDown}
                    color="red"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Net Profit"
                    value={data?.summary.find(s => s.label === 'Net Profit')?.value || "₦0.0"}
                    icon={Activity}
                    color="blue"
                    loading={loading}
                />
            </div>

            {/* Main Chart */}
            <AnalyticsChart
                title="Revenue Stream"
                description="Monthly collection trends across the institution"
                data={data?.charts.revenue || []}
                type="line"
                dataKey="revenue"
                color="#10b981"
                height={400}
                loading={loading}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                    <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
                        <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                            <ArrowUpRight className="text-green-500" /> Recent Incomes
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Tuition Fee - Grade {10+i}</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Transaction #INV-00{i}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-green-600">+₦45,000</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">Today, 10:24 AM</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                    <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
                        <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                            <ArrowDownRight className="text-red-500" /> Major Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                            <TrendingDown size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">Utility Bill - May 2026</p>
                                            <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-50">Voucher #VOU-98{i}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-red-600">-₦12,500</p>
                                        <p className="text-[10px] font-bold text-muted-foreground">Yesterday</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
