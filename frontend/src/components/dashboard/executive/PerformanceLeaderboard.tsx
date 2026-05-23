"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Trophy, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import type { BranchKPI } from "@/types/analytics";

interface PerformanceLeaderboardProps {
    branches: BranchKPI[];
}

export default function PerformanceLeaderboard({ branches }: PerformanceLeaderboardProps) {
    const sorted = [...branches].sort((a, b) => {
        const scoreA = a.attendanceRate * 0.3 + (a.growth > 0 ? a.growth : 0) * 0.3 + (a.revenue / Math.max(branches.reduce((s, x) => s + x.revenue, 0), 1)) * 100 * 0.4;
        const scoreB = b.attendanceRate * 0.3 + (b.growth > 0 ? b.growth : 0) * 0.3 + (b.revenue / Math.max(branches.reduce((s, x) => s + x.revenue, 0), 1)) * 100 * 0.4;
        return scoreB - scoreA;
    });

    const top = sorted.slice(0, 3);
    const bottom = sorted.slice(-3).reverse();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-primary flex items-center gap-2">
                        <Trophy className="w-5 h-5" /> Top Performers
                    </CardTitle>
                    <CardDescription className="font-medium">Based on academics, revenue, and attendance</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {top.map((b, i) => (
                            <div key={b.branchId} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${i === 0 ? "bg-primary/20 text-primary" : i === 1 ? "bg-gray-400/20 text-gray-500" : "bg-primary/10 text-primary/80"}`}>
                                    #{i + 1}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground">{b.branchName}</p>
                                    <p className="text-xs text-muted-foreground">{b.branchCode}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-bold">{b.attendanceRate}% att.</p>
                                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                        <TrendingUp className="w-3 h-3 text-primary" /> +{b.growth}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Risk Areas */}
            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-h4 font-bold text-red-600 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Risk Areas
                    </CardTitle>
                    <CardDescription className="font-medium">Branches requiring immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {bottom.map((b) => (
                            <div key={b.branchId} className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 hover:bg-red-500/10 transition-colors border border-red-500/10">
                                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground">{b.branchName}</p>
                                    <p className="text-xs text-muted-foreground">{b.branchCode}</p>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-bold text-red-600">{b.attendanceRate}% att.</p>
                                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1">
                                        <TrendingDown className="w-3 h-3 text-red-500" /> {b.growth}%
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
