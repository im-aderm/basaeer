'use client';

import React, { useState, useEffect } from 'react';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useNotification } from '@/context/NotificationContext';
import { EventsService, EventAnalytics } from '@/services/eventsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, TrendingUp, Users, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AnalyticsPage() {
    const { showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<EventAnalytics | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await EventsService.getAnalytics();
            setData(res);
        } catch (error) {
            showError("Failed to fetch analytics data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 font-semibold text-sm">Loading advanced analytics...</span>
            </div>
        );
    }

    const stats = data?.stats || {
        totalEvents: 0,
        activeEvents: 0,
        totalApplicants: 0,
        revenueGenerated: 0,
        pendingApprovals: 0,
        occupancyRate: 0,
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Event Analytics</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Explore registration trends, demographic analytics, conversion rates, and financial reports.</p>
                    </div>
                    <Button onClick={loadData} variant="outline" className="h-10 rounded-xl font-bold border-primary/10 gap-1.5 text-muted-foreground">
                        <RefreshCw size={15} /> Reload Data
                    </Button>
                </div>

                {/* Visual Charts grid */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* Bar Chart: Applications over time */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Applications Bar Chart</CardTitle>
                            <CardDescription>Monthly registration volume comparison</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.applicationsOverTime || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                                    <Bar dataKey="applications" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={25} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Bar Chart: Package Popularity */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Package Demand Analytics</CardTitle>
                            <CardDescription>Comparative popularity of structured event packages</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72">
                            {data?.packagePopularity && data.packagePopularity.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={data.packagePopularity} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                                        <Bar dataKey="value" fill="#10B981" radius={[4, 4, 0, 0]} barSize={25} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No package stats available.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Gender split */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Gender Ratios</CardTitle>
                            <CardDescription>Event participation by gender</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 flex flex-col justify-center">
                            {data?.genderDistribution && data.genderDistribution.length > 0 ? (
                                <div className="h-full w-full flex items-center justify-around">
                                    <div className="h-48 w-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.genderDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {data.genderDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? "#3b82f6" : "#ec4899"} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-3 font-bold text-sm text-foreground/80">
                                        {data.genderDistribution.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-2">
                                                <div className="h-3.5 w-3.5 rounded-full shrink-0" style={{ backgroundColor: index === 0 ? "#3b82f6" : "#ec4899" }}></div>
                                                <span>{entry.name}: {entry.value} ({Math.round((entry.value / stats.totalApplicants)*100 || 0)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No gender data available.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Age Demographics */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold text-foreground">Age Demographics</CardTitle>
                            <CardDescription>Breakdown of applicants by age groups</CardDescription>
                        </CardHeader>
                        <CardContent className="h-72 flex flex-col justify-center">
                            {data?.ageDistribution && data.ageDistribution.length > 0 ? (
                                <div className="h-full w-full flex items-center justify-around">
                                    <div className="h-48 w-48">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.ageDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={70}
                                                    paddingAngle={2}
                                                    dataKey="value"
                                                >
                                                    {data.ageDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 font-semibold text-xs text-foreground/70">
                                        {data.ageDistribution.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-2 font-bold text-xs">
                                                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span>{entry.name}: {entry.value} ({Math.round((entry.value / stats.totalApplicants)*100 || 0)}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-semibold">No age demographics available.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireBranch>
    );
}
