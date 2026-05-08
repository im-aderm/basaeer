"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Loader2, QrCode, User, Clock, CheckCircle, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";

export default function QRSubmissionsPage() {
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
            toast.error("Failed to load scan history");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase">Scan Audit Trail</h1>
                    <p className="text-muted-foreground font-medium">Real-time log of all QR scans across the campus.</p>
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-2xl font-bold gap-2" onClick={fetchScans}>
                    <Clock size={18} />
                    Refresh Logs
                </Button>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-sm overflow-hidden bg-white">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-2">
                            <QrCode className="w-6 h-6 text-primary" />
                            Recent Submissions
                        </CardTitle>
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input placeholder="Search student..." className="h-11 pl-10 w-64 rounded-xl" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : scans.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30 text-left">
                                    <tr>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider">User</th>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider">Location</th>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider">Direction</th>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {scans.map((scan) => (
                                        <tr key={scan.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                                                        <User className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 uppercase text-sm">
                                                            {scan.user?.firstName} {scan.user?.lastName}
                                                        </div>
                                                        <div className="text-[10px] font-black text-slate-400">{scan.userId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <Badge variant="outline" className="rounded-full border-border/50 px-3 py-1 font-bold text-slate-600">
                                                    {scan.location}
                                                </Badge>
                                            </td>
                                            <td className="p-6">
                                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                                                    scan.direction === 'ENTRY' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'
                                                }`}>
                                                    {scan.direction}
                                                </div>
                                            </td>
                                            <td className="p-6 text-right font-black text-slate-400 text-xs">
                                                {format(new Date(scan.scanTime), 'PPpp')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-4 opacity-50">
                            <QrCode className="w-16 h-16 mx-auto text-muted-foreground" />
                            <p className="font-bold uppercase tracking-widest text-slate-400">No scans found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
