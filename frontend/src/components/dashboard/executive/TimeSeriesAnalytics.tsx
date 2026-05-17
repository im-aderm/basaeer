"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { TrendDataPoint } from "@/types/analytics";

interface TimeSeriesAnalyticsProps {
    trends: TrendDataPoint[];
}

type Period = "7d" | "30d" | "90d" | "1y";

export default function TimeSeriesAnalytics({ trends }: TimeSeriesAnalyticsProps) {
    const [period, setPeriod] = useState<Period>("30d");

    const periods: { key: Period; label: string }[] = [
        { key: "7d", label: "7D" },
        { key: "30d", label: "30D" },
        { key: "90d", label: "90D" },
        { key: "1y", label: "1Y" },
    ];

    const displayData = trends.slice(period === "7d" ? -7 : period === "30d" ? -30 : period === "90d" ? -90 : -365);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-h4 font-bold text-primary">Performance Trends</h3>
                <div className="flex gap-2">
                    {periods.map((p) => (
                        <button
                            key={p.key}
                            onClick={() => setPeriod(p.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${period === p.key ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-h4 font-bold text-primary">Revenue Trend</CardTitle>
                        <CardDescription className="font-medium">Daily revenue over selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
                                <Tooltip formatter={(value: unknown) => `₦${Number(value).toLocaleString()}`} />
                                <Area type="monotone" dataKey="revenue" stroke="#00a0e1" fill="#00a0e1" fillOpacity={0.15} strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Attendance Trend */}
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-white">
                    <CardHeader>
                        <CardTitle className="text-h4 font-bold text-primary">Attendance Trend</CardTitle>
                        <CardDescription className="font-medium">Daily attendance rate over selected period</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={displayData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip formatter={(value: unknown) => `${Number(value)}%`} />
                                <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
