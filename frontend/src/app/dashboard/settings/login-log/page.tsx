"use client";

import { useState } from "react";
import { LogIn, Search, Filter, Calendar, ShieldCheck, ShieldAlert, Laptop, MapPin } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface LoginLog {
    id: string;
    user: string;
    ip: string;
    device: string;
    location: string;
    status: 'success' | 'failed';
    timestamp: string;
}

const mockLogs: LoginLog[] = [
    {
        id: '1',
        user: 'Admin User',
        ip: '192.168.1.1',
        device: 'Chrome / Windows 11',
        location: 'Lagos, Nigeria',
        status: 'success',
        timestamp: '2024-05-15 10:30:25'
    },
    {
        id: '2',
        user: 'John Doe',
        ip: '102.89.45.12',
        device: 'Safari / iPhone 14',
        location: 'Abuja, Nigeria',
        status: 'success',
        timestamp: '2024-05-15 09:15:10'
    },
    {
        id: '3',
        user: 'Jane Smith',
        ip: '197.210.64.5',
        device: 'Firefox / MacOS',
        location: 'Ibadan, Nigeria',
        status: 'failed',
        timestamp: '2024-05-14 22:45:30'
    },
    {
        id: '4',
        user: 'Unknown',
        ip: '45.12.33.190',
        device: 'Edge / Windows 10',
        location: 'Moscow, Russia',
        status: 'failed',
        timestamp: '2024-05-14 18:20:15'
    },
    {
        id: '5',
        user: 'Super Admin',
        ip: '192.168.1.1',
        device: 'Chrome / Linux',
        location: 'Lagos, Nigeria',
        status: 'success',
        timestamp: '2024-05-14 14:10:05'
    }
];

export default function LoginLogPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const columns = [
        {
            header: "User",
            accessor: (log: LoginLog) => (
                <div className="font-medium text-foreground">{log.user}</div>
            )
        },
        {
            header: "IP Address",
            accessor: (log: LoginLog) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                    <span>{log.ip}</span>
                </div>
            )
        },
        {
            header: "Device / Browser",
            accessor: (log: LoginLog) => (
                <div className="flex items-center gap-2">
                    <Laptop className="h-3 w-3 text-muted-foreground" />
                    <span>{log.device}</span>
                </div>
            )
        },
        {
            header: "Location",
            accessor: (log: LoginLog) => (
                <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3 text-muted-foreground" />
                    <span>{log.location}</span>
                </div>
            )
        },
        {
            header: "Status",
            accessor: (log: LoginLog) => (
                <Badge variant={log.status === 'success' ? 'default' : 'destructive'} className="rounded-lg px-2 py-0.5">
                    {log.status === 'success' ? (
                        <div className="flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Successful</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <ShieldAlert className="h-3 w-3" />
                            <span>Failed Attempt</span>
                        </div>
                    )}
                </Badge>
            )
        },
        {
            header: "Timestamp",
            accessor: (log: LoginLog) => (
                <div className="text-muted-foreground whitespace-nowrap">
                    {log.timestamp}
                </div>
            )
        }
    ];

    const filteredLogs = mockLogs.filter(log => {
        const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             log.ip.includes(searchTerm) || 
                             log.location.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || log.status === statusFilter;
        
        // Simple date filtering (mock)
        const matchesDate = true; 
        
        return matchesSearch && matchesStatus && matchesDate;
    });

    return (
        <div className="space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Login activity & Audit Logs</h1>
                    <p className="text-muted-foreground font-medium mt-1">Monitor user access and security events across the platform.</p>
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden">
                <CardHeader className="bg-muted/30 pb-6 border-b border-border/50">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LogIn className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-xl font-semibold">Access Logs</CardTitle>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input 
                                    placeholder="Search logs..." 
                                    className="pl-9 w-[200px] md:w-[250px] rounded-xl border-border/50"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] rounded-xl border-border/50">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="success">Successful</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 bg-background border border-border/50 rounded-xl px-3 py-1.5 h-10">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <input 
                                    type="date" 
                                    className="bg-transparent border-none focus:ring-0 text-sm" 
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                                <span className="text-muted-foreground text-xs font-bold px-1">TO</span>
                                <input 
                                    type="date" 
                                    className="bg-transparent border-none focus:ring-0 text-sm" 
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <DataTable 
                        columns={columns} 
                        data={filteredLogs}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
