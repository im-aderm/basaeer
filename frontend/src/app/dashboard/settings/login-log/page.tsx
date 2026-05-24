"use client";

import { useState, useEffect } from "react";
import { LogIn, Search, Filter, Calendar, ShieldCheck, ShieldAlert, Laptop, MapPin, Loader2 } from "lucide-react";
import { DataTable } from "@/components/DataTable";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AuditLogService, AuditLogEntry } from "@/services/auditLogService";
import { STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function LoginLogPage() {
    const [logs, setLogs] = useState<AuditLogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadLogs();
    }, [page, statusFilter, dateFrom, dateTo]);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const res = await AuditLogService.getLogs({
                action: statusFilter !== "all" ? statusFilter : undefined,
                startDate: dateFrom || undefined,
                endDate: dateTo || undefined,
                page,
                limit: 50,
            });
            setLogs(res.items);
            setTotalPages(res.totalPages);
        } catch {
            setLogs([]);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            header: "User",
            accessor: (log: AuditLogEntry) => (
                <div className="font-medium text-foreground">
                    {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Unknown'}
                </div>
            )
        },
        {
            header: "Action",
            accessor: (log: AuditLogEntry) => (
                <span className="text-sm">{log.action}</span>
            )
        },
        {
            header: "IP Address",
            accessor: (log: AuditLogEntry) => (
                <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                    <span>{log.ipAddress || "—"}</span>
                </div>
            )
        },
        {
            header: "Module",
            accessor: (log: AuditLogEntry) => (
                <span className="text-sm capitalize">{log.module}</span>
            )
        },
        {
            header: "Status",
            accessor: (log: AuditLogEntry) => {
                const isSuccess = log.action === 'LOGIN';
                return (
                    <Badge variant={isSuccess ? 'default' : 'destructive'} className="rounded-lg px-2 py-0.5">
                        {isSuccess ? (
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
                );
            }
        },
        {
            header: "Details",
            accessor: (log: AuditLogEntry) => (
                <div className="text-muted-foreground text-sm max-w-[200px] truncate">
                    {log.details || "—"}
                </div>
            )
        },
        {
            header: "Timestamp",
            accessor: (log: AuditLogEntry) => (
                <div className="text-muted-foreground whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                </div>
            )
        }
    ];

    const filteredLogs = (logs ?? []).filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const userName = log.user ? `${log.user.firstName} ${log.user.lastName}`.toLowerCase() : '';
        return userName.includes(term) ||
               (log.ipAddress || '').includes(term) ||
               (log.details || '').toLowerCase().includes(term);
    });

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Login Activity & Audit Logs</h1>
                    <p className="text-foreground/60 font-medium mt-1 text-[12px]">Monitor user access and security events across the platform.</p>
                </div>
            </div>

            <Card className="rounded-2xl shadow-2xl overflow-hidden">
                <CardHeader className="bg-primary/5 pb-4 border-b border-primary/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LogIn className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-[12px] font-semibold">Access Logs</CardTitle>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search logs..."
                                    className="pl-9 w-[200px] md:w-[250px] rounded-xl"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[140px] rounded-xl">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        <SelectValue placeholder="Status" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Actions</SelectItem>
                                    <SelectItem value="LOGIN">Login</SelectItem>
                                    <SelectItem value="LOGIN_FAILED">Failed Login</SelectItem>
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-2 bg-background border rounded-xl px-3 py-1.5 h-10">
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
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                            <ShieldCheck className="h-12 w-12 mb-3" />
                            <p className="text-sm">No audit logs found</p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={filteredLogs} />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}