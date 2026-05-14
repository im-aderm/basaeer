"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { Package, AlertTriangle, Box, AlertCircle, Loader2 } from "lucide-react";
import api from "@/lib/api";

export default function InventoryReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<{
    totalProducts?: number;
    lowStockItems?: number;
    totalUnits?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/reporting/dashboard");
      setData(response.data?.inventory ?? null);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-destructive">
        <AlertCircle className="w-12 h-12 mb-4" />
        <p className="text-lg font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Inventory Logistics</h1>
        <p className="text-muted-foreground font-medium mt-1">Stock levels, asset management, and procurement</p>
      </div>

      {/*
        Placeholder until a dedicated inventory analytics endpoint is built.
        Data is fetched from the legacy /reporting/dashboard route.
      */}

      <DashboardGrid cols={3}>
        <StatCardWidget
          title="Products"
          value={data?.totalProducts ?? 0}
          icon={Box}
          color="blue"
        />
        <StatCardWidget
          title="Low Stock Items"
          value={data?.lowStockItems ?? 0}
          icon={AlertTriangle}
          color="red"
        />
        <StatCardWidget
          title="Total Units"
          value={data?.totalUnits ?? 0}
          icon={Package}
          color="green"
        />
      </DashboardGrid>

      <ChartWidget
        title="Stock by Category"
        description="Distribution of assets across departments"
        data={[]}
        type="bar"
        dataKey="value"
        nameKey="name"
        color="#f59e0b"
        height={350}
      />
    </div>
  );
}
