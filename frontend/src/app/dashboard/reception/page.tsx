"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ReceptionService, AdmissionEnquiry, CallLog, VisitorLog, Complaint, PostalRecord } from "@/services/receptionService";
import { useAuth } from "@/context/AuthContext";
import {
    Users, Phone, UserCheck, MessageSquare, Mail,
    ArrowRight, Plus, Clock, TrendingUp, AlertCircle, Loader2
} from "lucide-react";

export default function ReceptionDashboard() {
    const { user, resolvedBranchId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        enquiries: 0,
        calls: 0,
        visitors: 0,
        complaints: 0,
        postal: 0
    });
    const [recentLogs, setRecentLogs] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (!resolvedBranchId) {
                setLoading(false);
                return;
            }
            try {
                const [enquiries, calls, visitors, complaints, postal] = await Promise.all([
                    ReceptionService.getEnquiries(resolvedBranchId),
                    ReceptionService.getCallLogs(resolvedBranchId),
                    ReceptionService.getVisitorLogs(resolvedBranchId),
                    ReceptionService.getComplaints(resolvedBranchId),
                    ReceptionService.getPostalRecords(resolvedBranchId)
                ]);

                setStats({
                    enquiries: enquiries.length,
                    calls: calls.length,
                    visitors: visitors.length,
                    complaints: complaints.length,
                    postal: postal.length
                });

                // Combine and sort for recent activity
                const combined = [
                    ...enquiries.map(item => ({ ...item, type: 'Enquiry', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' })),
                    ...calls.map(item => ({ ...item, type: 'Call', icon: Phone, color: 'text-purple-500', bg: 'bg-purple-50' })),
                    ...visitors.map(item => ({ ...item, type: 'Visitor', icon: UserCheck, color: 'text-green-500', bg: 'bg-green-50' })),
                    ...complaints.map(item => ({ ...item, type: 'Complaint', icon: MessageSquare, color: 'text-red-500', bg: 'bg-red-50' })),
                    ...postal.map(item => ({ ...item, type: 'Postal', icon: Mail, color: 'text-orange-500', bg: 'bg-orange-50' }))
                ].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                setRecentLogs(combined.slice(0, 10));
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error("Failed to fetch reception stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [resolvedBranchId]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const statCards = [
        { title: "Active Enquiries", value: stats.enquiries, icon: Users, color: "blue", href: "/dashboard/reception/enquiry" },
        { title: "Today's Calls", value: stats.calls, icon: Phone, color: "purple", href: "/dashboard/reception/call-log" },
        { title: "Visitor Log", value: stats.visitors, icon: UserCheck, color: "green", href: "/dashboard/reception/visitor-log" },
        { title: "Pending Complaints", value: stats.complaints, icon: MessageSquare, color: "red", href: "/dashboard/reception/complaint" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Reception Dashboard</h1>
                    <p className="text-muted-foreground mt-1">Overview of front-desk operations and communications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/reception/enquiry"
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        New Enquiry
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Link
                        key={i}
                        href={stat.href}
                        className="group bg-white/75 border border-border p-6 rounded-2xl hover:border-primary/50 transition-all shadow-sm flex flex-col gap-4"
                    >
                        <div className={`p-3 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-500 w-fit transition-transform group-hover:scale-110`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                            <h3 className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</h3>
                        </div>
                        <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                            View details <ArrowRight size={14} className="ml-1" />
                        </div>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white/75 border border-border rounded-2xl overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h2 className="font-bold flex items-center gap-2">
                                <Clock size={20} className="text-primary" />
                                Recent Activity
                            </h2>
                        </div>
                        <div className="divide-y divide-border">
                            {recentLogs.map((log, i) => (
                                <div key={i} className="p-4 hover:bg-muted/30 transition-colors flex items-center gap-4">
                                    <div className={`p-2.5 rounded-xl ${log.bg} ${log.color}`}>
                                        <log.icon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold truncate">{log.name || log.fromTitle || log.purpose}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${log.bg} ${log.color} uppercase tracking-wider`}>
                                                {log.type}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-medium text-muted-foreground">{log.status || log.callType || log.type}</p>
                                    </div>
                                </div>
                            ))}
                            {recentLogs.length === 0 && (
                                <div className="p-12 text-center text-muted-foreground">
                                    No recent activity found.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions & Info */}
                <div className="space-y-6">
                    <div className="bg-white/75 border border-border rounded-2xl p-6 space-y-4 shadow-sm">
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" />
                            Front Desk Insights
                        </h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Response Rate</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">85%</span>
                                    <span className="text-xs text-green-500 font-medium">+5% this week</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-green-500 w-[85%]" />
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl border border-border">
                                <p className="text-xs text-muted-foreground mb-1">Follow-up Efficiency</p>
                                <div className="flex items-center justify-between">
                                    <span className="font-bold">72%</span>
                                    <span className="text-xs text-blue-500 font-medium">+2% this week</span>
                                </div>
                                <div className="w-full h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[72%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center gap-2 text-primary">
                            <AlertCircle size={20} />
                            <h3 className="font-bold">Module Info</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            The Reception module centralizes all stakeholder interactions. Ensure you capture accurate contact details for better follow-up results.
                        </p>
                        <Link
                            href="/dashboard/reception/config"
                            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                        >
                            Configure Module <ArrowRight size={12} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
