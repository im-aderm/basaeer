"use client";

import { useState, useEffect } from "react";
import {
    Bus,
    MapPin,
    Users,
    Navigation,
    Plus,
    ArrowRight,
    ShieldCheck,
    Map
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { transportService } from "@/services/transportService";

export default function TransportDashboard() {
    const [stats, setStats] = useState({
        totalVehicles: 0,
        totalRoutes: 0,
        assignedStudents: 0,
        activeStatus: "Operational"
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            transportService.getVehicles(),
            transportService.getRoutes(),
            transportService.getAssignmentsCount()
        ]).then(([vehicles, routes, countData]) => {
            setStats({
                totalVehicles: vehicles.length,
                totalRoutes: routes.length,
                assignedStudents: countData.count,
                activeStatus: "Operational"
            });
            setLoading(false);
        });
    }, []);

    const transportActions = [
        {
            title: "Manage Routes",
            description: "Define and update bus routes",
            icon: MapPin,
            href: "/dashboard/transport/routes",
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            title: "Fleet Management",
            description: "Track and manage school vehicles",
            icon: Bus,
            href: "/dashboard/transport/vehicles",
            color: "text-green-500",
            bg: "bg-green-500/10"
        },
        {
            title: "Student Assignment",
            description: "Assign students to vehicles/routes",
            icon: Users,
            href: "/dashboard/transport/assign",
            color: "text-orange-500",
            bg: "bg-orange-500/10"
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Bus className="text-primary w-10 h-10" />
                        Transport Logistics
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Manage the school's fleet, routes, and student commutes.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard/transport/assign">
                        <Button variant="outline" className="gap-2 rounded-2xl h-14 px-6 font-semibold border-2 border-primary/20 hover:bg-primary/5 transition-all text-lg">
                            Assignment Directory
                        </Button>
                    </Link>
                    <Link href="/dashboard/transport/vehicles">
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Add Vehicle
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Active Fleet", value: stats.totalVehicles, icon: Bus, trend: "Units" },
                    { label: "Total Routes", value: stats.totalRoutes, icon: Map, trend: "Active" },
                    { label: "Assigned Pupils", value: stats.assignedStudents, icon: Users, trend: "Commuting" },
                    { label: "Fleet Status", value: stats.activeStatus, icon: ShieldCheck, trend: "Secure" }
                ].map((item, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-2xl shadow-primary/5 p-8 border-t-8 border-t-primary/10 hover:border-t-primary transition-all group">
                        <div className="flex justify-between items-center mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <item.icon size={24} />
                            </div>
                            <span className="text-xs font-semibold bg-muted px-3 py-1 rounded-full text-muted-foreground">{item.trend}</span>
                        </div>
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">{item.label}</h3>
                        <p className="text-h1 font-semibold mt-1">{loading ? "..." : item.value}</p>
                    </Card>
                ))}
            </div>

            {/* Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {transportActions.map((action, i) => (
                    <Link key={i} href={action.href}>
                        <Card className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 p-10 hover:shadow-primary/10 transition-all group relative overflow-hidden border-b-8 border-b-primary/10 hover:border-b-primary">
                            <div className={`w-20 h-20 rounded-[2rem] ${action.bg} ${action.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                                <action.icon size={40} />
                            </div>
                            <h3 className="text-h1 font-semibold mb-3 tracking-tighter">{action.title}</h3>
                            <p className="text-muted-foreground font-bold mb-6 leading-relaxed">{action.description}</p>
                            <div className="flex items-center gap-2 font-semibold text-primary group-hover:gap-4 transition-all uppercase tracking-[0.2em] text-[10px]">
                                Open Module <Navigation size={12} />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Large Activity Card */}
            <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 p-12 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                    <div>
                        <h3 className="text-h1 font-semibold mb-6 tracking-tighter">Transport Efficiency</h3>
                        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">
                            Monitor the real-time status of the school's logistics network. Every route and vehicle is optimized for student safety and punctuality.
                        </p>
                        <div className="space-y-4">
                            <div className="h-4 bg-muted/50 rounded-full overflow-hidden">
                                <div className="w-[85%] h-full bg-primary animate-in slide-in-from-left duration-1000" />
                            </div>
                            <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
                                <span>Fleet Utilization</span>
                                <span className="text-primary">85% Capacity</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-muted/30 rounded-[2.5rem] p-10 border border-border/50">
                        <h4 className="font-semibold text-h3 mb-4">Logistics Summary</h4>
                        <div className="space-y-4">
                            {[
                                { l: "Avg Trip Duration", v: "42 Mins" },
                                { l: "Maintenance Checks", v: "4 Pending" },
                                { l: "Next Route Update", v: "24 Jan 2024" }
                            ].map((row, i) => (
                                <div key={i} className="flex justify-between items-center py-3 border-b border-border/20 last:border-0">
                                    <span className="text-sm font-bold text-muted-foreground">{row.l}</span>
                                    <span className="font-semibold text-foreground">{row.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
