"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsService } from "@/services/analyticsService";
import { Loader2, Globe, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import GlobalKPICards from "./GlobalKPICards";
import BranchComparison from "./BranchComparison";
import PerformanceLeaderboard from "./PerformanceLeaderboard";
import TimeSeriesAnalytics from "./TimeSeriesAnalytics";
import ExecutiveInsights from "./ExecutiveInsights";
import AlertsMonitor from "./AlertsMonitor";

export default function ExecutiveDashboard() {
    const { data: overview, isLoading: loadingOverview } = useQuery({
        queryKey: ["executive-overview"],
        queryFn: analyticsService.getExecutiveOverview,
        refetchInterval: 60_000,
    });

    const { data: finance, isLoading: loadingFinance } = useQuery({
        queryKey: ["executive-finance"],
        queryFn: analyticsService.getExecutiveFinance,
        refetchInterval: 120_000,
    });

    const { data: attendance, isLoading: loadingAttendance } = useQuery({
        queryKey: ["executive-attendance"],
        queryFn: analyticsService.getExecutiveAttendance,
        refetchInterval: 60_000,
    });

    const { data: branches, isLoading: loadingBranches } = useQuery({
        queryKey: ["executive-branches"],
        queryFn: analyticsService.getExecutiveBranches,
        refetchInterval: 300_000,
    });

    const { data: trends, isLoading: loadingTrends } = useQuery({
        queryKey: ["executive-trends", "30d"],
        queryFn: () => analyticsService.getExecutiveTrends("30d"),
        refetchInterval: 180_000,
    });

    const { data: insights, isLoading: loadingInsights } = useQuery({
        queryKey: ["executive-insights"],
        queryFn: analyticsService.getExecutiveInsights,
        refetchInterval: 300_000,
    });

    const isLoading = loadingOverview || loadingFinance || loadingAttendance || loadingBranches || loadingTrends;

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Loading executive dashboard...</p>
                </div>
            </div>
        );
    }

    if (!overview || !finance || !attendance || !branches || !trends) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-semibold text-muted-foreground">Unable to load executive data</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-10 pb-20">
            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-[3.5rem] border border-primary/10 p-8 md:p-12 relative overflow-hidden"
            >
                <div className="absolute -right-20 -top-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                            <Globe size={32} />
                        </div>
                        <div>
                            <h1 className="text-h1 font-bold tracking-tight text-primary">Executive Analytics Center</h1>
                            <p className="text-body text-muted-foreground max-w-2xl">
                                Network-wide intelligence across all {overview.activeBranches} active campuses.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Section A: Global KPIs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <GlobalKPICards data={overview} />
            </motion.div>

            {/* Section B: Branch Comparison */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <BranchComparison branches={branches} finance={finance} attendance={attendance} />
            </motion.div>

            {/* Section C: Performance Leaderboard */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <PerformanceLeaderboard branches={branches} />
            </motion.div>

            {/* Section D: Time Series */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <TimeSeriesAnalytics trends={trends} />
            </motion.div>

            {/* Section E: Executive Insights */}
            {insights && insights.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <ExecutiveInsights insights={insights} />
                </motion.div>
            )}

            {/* Section F: Alerts Monitor */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <AlertsMonitor branches={branches} finance={finance} />
            </motion.div>
        </div>
    );
}
