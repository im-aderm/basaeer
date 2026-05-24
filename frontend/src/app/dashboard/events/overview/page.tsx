'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useNotification } from '@/context/NotificationContext';
import { EventsService, EventAnalytics } from '@/services/eventsService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Users, DollarSign, Award, Clock, Percent, ArrowRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function EventsOverviewPage() {
    const { showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<EventAnalytics | null>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await EventsService.getAnalytics();
            setData(res);
        } catch (error) {
            showError("Failed to fetch event analytics data");
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
                <span className="ml-2 font-semibold text-sm">Loading event metrics...</span>
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Events Overview</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Track registration statistics, payment verifications, and program analytics.</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/dashboard/events">
                            <Button variant="outline" className="h-10 rounded-xl font-semibold border-primary/10">View Events Table</Button>
                        </Link>
                        <Link href="/dashboard/events/create">
                            <Button className="h-10 px-5 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/10">
                                <Sparkles className="h-4.5 w-4.5" /> Launch Event
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Key Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Events</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600"><Calendar className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{stats.totalEvents}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Active Events</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-50 text-emerald-600"><Clock className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{stats.activeEvents}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Applicants</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-50 text-purple-600"><Users className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{stats.totalApplicants}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Revenue</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-50 text-emerald-600"><DollarSign className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground" title={`₦${stats.revenueGenerated}`}>
                                ₦{stats.revenueGenerated.toLocaleString()}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Review</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-600"><Users className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{stats.pendingApprovals}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Occupancy</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600"><Percent className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{stats.occupancyRate}%</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions Board */}
                <div className="grid gap-6 md:grid-cols-4 bg-muted/20 p-4 rounded-2xl border border-primary/10">
                    <Link href="/dashboard/events/create" className="bg-card hover:bg-primary/5 border border-primary/10 hover:border-primary/30 p-4 rounded-xl transition-all shadow-sm">
                        <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                            Create Event <ArrowRight size={14} />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Configure packages, locations, dates, and customize applications.</p>
                    </Link>
                    <Link href="/dashboard/events/applications" className="bg-card hover:bg-primary/5 border border-primary/10 hover:border-primary/30 p-4 rounded-xl transition-all shadow-sm">
                        <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                            Review Applications <ArrowRight size={14} />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Review passport uploads, academic requirements, and verify age restrictions.</p>
                    </Link>
                    <Link href="/dashboard/events/payments" className="bg-card hover:bg-primary/5 border border-primary/10 hover:border-primary/30 p-4 rounded-xl transition-all shadow-sm">
                        <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                            Verify Payments <ArrowRight size={14} />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Confirm bank statement receipts, match proof of payment uploads, approve packages.</p>
                    </Link>
                    <Link href="/dashboard/events/gallery" className="bg-card hover:bg-primary/5 border border-primary/10 hover:border-primary/30 p-4 rounded-xl transition-all shadow-sm">
                        <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                            Media Gallery <ArrowRight size={14} />
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">Manage event galleries, cover banners, brochure PDFs, and media content.</p>
                    </Link>
                </div>

                {/* Charts Area */}
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Area Chart: Applications over time */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm md:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Applications Trend</CardTitle>
                            <CardDescription>Event application submissions over the past 6 months</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.applicationsOverTime || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                                    <Area type="monotone" dataKey="applications" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorApps)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Pie Chart: Package Popularity */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Program / Package Popularity</CardTitle>
                            <CardDescription>Applicant distribution by package</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80 flex flex-col justify-center">
                            {data?.packagePopularity && data.packagePopularity.length > 0 ? (
                                <div className="h-full w-full flex flex-col justify-between">
                                    <div className="flex-1 min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.packagePopularity}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {data.packagePopularity.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(value) => [`${value} applicants`, 'Count']} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="grid grid-cols-2 gap-1.5 pt-2 text-[10px] font-semibold text-muted-foreground">
                                        {data.packagePopularity.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-1.5 truncate">
                                                <div className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                                <span className="truncate">{entry.name} ({entry.value})</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-medium">No package data available.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Gender Distribution */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Gender Distribution</CardTitle>
                            <CardDescription>Applicant ratios</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex flex-col justify-center">
                            {data?.genderDistribution && data.genderDistribution.length > 0 ? (
                                <div className="h-full w-full flex items-center gap-4">
                                    <div className="flex-1 h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.genderDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={65}
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
                                    <div className="space-y-2 shrink-0">
                                        {data.genderDistribution.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-2 font-bold text-xs">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: index === 0 ? "#3b82f6" : "#ec4899" }}></div>
                                                <span>{entry.name}: {entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-medium">No gender data available.</div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Age Distribution */}
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Age Distribution</CardTitle>
                            <CardDescription>Applicant age brackets</CardDescription>
                        </CardHeader>
                        <CardContent className="h-64 flex flex-col justify-center">
                            {data?.ageDistribution && data.ageDistribution.length > 0 ? (
                                <div className="h-full w-full flex items-center gap-4">
                                    <div className="flex-1 h-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={data.ageDistribution}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={65}
                                                    dataKey="value"
                                                >
                                                    {data.ageDistribution.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="space-y-2 shrink-0">
                                        {data.ageDistribution.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-2 font-bold text-xs">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[(index + 2) % COLORS.length] }}></div>
                                                <span>{entry.name}: {entry.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground text-xs font-medium">No age data available.</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </RequireBranch>
    );
}
