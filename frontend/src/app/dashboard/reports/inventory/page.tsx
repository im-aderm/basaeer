"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AnalyticsCard } from "@/components/reporting/AnalyticsCard";
import { AnalyticsChart } from "@/components/reporting/AnalyticsChart";
import { 
    Box, 
    AlertTriangle, 
    Package, 
    Download, 
    Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";

export default function InventoryReportsPage() {
    const { user } = useAuth();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await api.get("/reporting/dashboard");
            setData(response.data.inventory);
        } catch (error) {
            console.error("Failed to fetch inventory analytics:", error);
            toast.error("Failed to load inventory analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchAnalytics();
    }, [user]);

    const inventoryData = [
        { name: 'Stationery', value: 450 },
        { name: 'Furniture', value: 120 },
        { name: 'Electronics', value: 85 },
        { name: 'Uniforms', value: 320 },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Inventory Logistics</h1>
                    <p className="text-muted-foreground font-medium mt-1">Stock levels, asset management, and procurement tracking.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download size={18} />
                        Export Inventory
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter size={18} />
                        Filter Category
                    </Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnalyticsCard
                    title="Total Products"
                    value={data?.totalProducts || 0}
                    icon={Box}
                    color="blue"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Low Stock Warning"
                    value={data?.lowStockItems || 0}
                    icon={AlertTriangle}
                    color="red"
                    loading={loading}
                />
                <AnalyticsCard
                    title="Total Units"
                    value={data?.totalUnits || 0}
                    icon={Package}
                    color="green"
                    loading={loading}
                />
            </div>

            <AnalyticsChart
                title="Stock by Category"
                description="Distribution of assets across departments"
                data={inventoryData}
                type="bar"
                dataKey="value"
                color="#f59e0b"
                height={400}
                loading={loading}
            />
        </div>
    );
}
