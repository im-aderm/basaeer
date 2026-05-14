"use client";

import { useState, useEffect } from "react";
import { reportingService } from "@/services/reportingService";
import type { FinanceAnalyticsData } from "@/types/dashboard";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";
import { ChartWidget } from "@/components/dashboard/widgets/ChartWidget";
import { DashboardGrid, DashboardSplit } from "@/components/dashboard/DashboardGrid";
import { CreditCard, AlertTriangle, Percent, Loader2, AlertCircle } from "lucide-react";

const currencyFormatter = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `₦${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const percentFormatter = (value: string | number) => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  return `${num.toFixed(1)}%`;
};

export default function FeesReportsPage() {
  const [data, setData] = useState<FinanceAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await reportingService.getFinanceAnalytics();
        if (mounted) setData(result);
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : "Failed to load fees analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      <div>
        <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Fees & Collections</h1>
        <p className="text-muted-foreground font-medium mt-1">Tuition, payment tracking, and outstanding balances</p>
      </div>

      <DashboardGrid cols={3}>
        <StatCardWidget title="Total Collected" value={data?.totalRevenue ?? 0} icon={CreditCard} color="green" formatter={currencyFormatter} />
        <StatCardWidget title="Outstanding" value={data?.totalOutstanding ?? 0} icon={AlertTriangle} color="red" formatter={currencyFormatter} />
        <StatCardWidget title="Collection Rate" value={data?.collectionRate ?? 0} icon={Percent} color="blue" formatter={percentFormatter} />
      </DashboardGrid>

      <DashboardSplit>
        <ChartWidget
          title="Revenue Trend"
          data={data?.monthlyCashflow ?? []}
          type="line"
          dataKey="income"
          nameKey="month"
          color="#10b981"
          height={350}
        />
        <div />
      </DashboardSplit>
    </div>
  );
}
