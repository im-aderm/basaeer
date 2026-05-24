"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Loader2, QrCode, User, Clock, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNotification } from '@/context/NotificationContext';
import api from "@/lib/api";
import { format } from "date-fns";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from "@/lib/table-styles";

export default function QRSubmissionsPage() {
    const { showError } = useNotification();
    const [loading, setLoading] = useState(true);
    const [scans, setScans] = useState<any[]>([]);

    useEffect(() => {
        fetchScans();
    }, []);

    const fetchScans = async () => {
        try {
            setLoading(true);
            // Fetching campus access logs as they are the closest to raw scans for now
            const res = await api.get('/access-control/logs');
            setScans(res.data);
        } catch (error) {
            showError("Failed to load scan history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Scan Audit Trail</h1>
                    <p className="text-foreground/60 font-medium text-[12px]">Real-time log of all QR scans across the campus.</p>
                </div>
                <Button variant="outline" className="h-10 px-4 rounded-2xl font-bold gap-2 text-[12px]" onClick={fetchScans}>
                    <Clock size={16} />
                    Refresh Logs
                </Button>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-4 border-b border-primary/20 bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <CardTitle className="text-[14px] font-semibold uppercase flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-primary" />
                            Recent Submissions
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-3 h-3" />
                                <Input placeholder="Search student..." className="h-9 pl-9 w-64 rounded-xl text-[12px]" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : scans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead className={TABLE_HEADER}>
                                    <tr>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>User</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Location</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Direction</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Time</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-primary/5 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 uppercase text-[12px]">
                                                            {scan.user?.firstName} {scan.user?.lastName}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400">{scan.userId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <Badge variant="outline" className="rounded-full border-primary/20 px-2 py-0.5 font-bold text-slate-600 text-[12px]">
                                                    {scan.location}
                                                </Badge>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                                    scan.direction === 'ENTRY' ? 'bg-primary/10 text-primary' : 'bg-primary/5 text-primary/70'
                                                }`}>
                                                    {scan.direction}
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL + " text-right font-black text-slate-400"}>
                                                {format(new Date(scan.scanTime), 'PPpp')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-3 opacity-50">
                            <QrCode className="w-10 h-10 mx-auto text-foreground/60" />
                            <p className="font-bold uppercase tracking-widest text-slate-400 text-[12px]">No scans found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
