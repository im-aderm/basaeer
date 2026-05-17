'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    QrCode,
    ShieldCheck,
    History,
    ArrowUpRight,
    ArrowDownLeft,
    User,
    Clock,
    Camera,
    RefreshCcw
} from 'lucide-react';
import { AutomationEventsService, AccessLog } from '@/services/automationEventsService';
import { toast } from 'sonner';

export default function AccessControlPage() {
    const { user, resolvedBranchId } = useAuth();
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [scanning, setScanning] = useState(false);
    const [direction, setDirection] = useState<'ENTRY' | 'EXIT'>('ENTRY');
    const [lastScan, setLastScan] = useState<any>(null);
    const scannerRef = useRef<any>(null);

    const fetchLogs = async () => {
        try {
            const data = await AutomationEventsService.getLogs();
            setLogs(data);
        } catch (error) {
            toast.error('Failed to load access logs');
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    useEffect(() => {
        if (scanning) {
            import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
                scannerRef.current = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    /* verbose= */ false
                );
                scannerRef.current.render(onScanSuccess, onScanFailure);
            });
        } else {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error: unknown) => { if (process.env.NODE_ENV === 'development') if (process.env.NODE_ENV === 'development') console.error("Failed to clear scanner", error); });
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch((error: unknown) => { if (process.env.NODE_ENV === 'development') if (process.env.NODE_ENV === 'development') console.error("Failed to cleanup scanner", error); });
            }
        };
    }, [scanning]);

    const onScanSuccess = async (decodedText: string) => {
        try {
            const log = await AutomationEventsService.logAccess({
                userId: decodedText,
                direction,
                location: 'Main Entrance'
            });
            setLastScan(log);
            toast.success(`${log.user?.firstName} ${log.direction} LOGGED`);
            fetchLogs();
            // Audio feedback would be nice here
        } catch (error) {
            toast.error('Invalid ID or Access Denied');
        }
    };

    const onScanFailure = (error: any) => {
        // quiet fail for continuous scanning
    };

    return (
        <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Campus Access</h1>
                    <p className="text-muted-foreground font-medium mt-1">Real-time entry/exit monitoring and security logs.</p>
                </div>
                <div className="flex bg-muted/50 p-1 rounded-2xl shadow-sm border border-border/50">
                    <Button
                        variant="ghost"
                        className={`h-12 rounded-xl font-semibold px-6 transition-all ${direction === 'ENTRY' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'opacity-40'}`}
                        onClick={() => setDirection('ENTRY')}
                    >
                        Entry
                    </Button>
                    <Button
                        variant="ghost"
                        className={`h-12 rounded-xl font-semibold px-6 transition-all ${direction === 'EXIT' ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' : 'opacity-40'}`}
                        onClick={() => setDirection('EXIT')}
                    >
                        Exit
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-18rem)]">
                {/* Scanner Interface */}
                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden relative flex flex-col">
                    <CardHeader className="p-8 border-b border-border/50">
                        <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-3">
                            <QrCode className="h-8 w-8 text-primary" />
                            Live Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
                        {scanning ? (
                            <div className="w-full max-w-sm space-y-6">
                                <div id="qr-reader" className="overflow-hidden rounded-[2rem] border-4 border-primary/20 bg-black" />
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl font-semibold uppercase tracking-wider gap-2 border-primary/20"
                                    onClick={() => setScanning(false)}
                                >
                                    <RefreshCcw className="h-5 w-5" /> Stop Scanner
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-6">
                                <div className="h-48 w-48 rounded-[3rem] bg-background border-2 border-dashed border-primary/20 flex items-center justify-center mx-auto group hover:border-primary transition-all duration-500">
                                    <Camera className="h-20 w-20 text-primary/10 group-hover:scale-110 group-hover:text-primary/30 transition-all" />
                                </div>
                                <div>
                                    <h3 className="text-h3 font-semibold">Scanner Ready</h3>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto mt-2">Activate camera to begin logging student and staff movements.</p>
                                </div>
                                <Button
                                    className="h-16 px-12 rounded-[2rem] font-semibold uppercase tracking-wider gap-3 shadow-xl shadow-primary/20"
                                    onClick={() => setScanning(true)}
                                >
                                    <ShieldCheck className="h-6 w-6" /> Start Monitoring
                                </Button>
                            </div>
                        )}
                    </CardContent>

                    {lastScan && (
                        <div className="absolute bottom-8 left-8 right-8 animate-in slide-in-from-bottom-8 duration-500">
                            <div className="p-6 rounded-3xl bg-primary text-white shadow-2xl flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center text-h3 font-semibold">
                                        {lastScan.user?.firstName[0]}
                                    </div>
                                    <div>
                                        <div className="font-semibold uppercase tracking-tight">{lastScan.user?.firstName} {lastScan.user?.lastName}</div>
                                        <Badge variant="secondary" className="bg-white/10 text-white rounded-lg border-none text-[10px] font-semibold mt-1">
                                            {lastScan.user?.role} • {lastScan.direction}
                                        </Badge>
                                    </div>
                                </div>
                                <Clock className="h-8 w-8 text-white/20" />
                            </div>
                        </div>
                    )}
                </Card>

                {/* Live History Logs */}
                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden flex flex-col">
                    <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-3">
                                <History className="h-8 w-8 text-primary" />
                                Activity Feed
                            </CardTitle>
                        </div>
                        <Badge variant="outline" className="rounded-lg font-semibold uppercase text-[10px] opacity-50 px-4">Live Updates</Badge>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="p-4 space-y-2">
                            {logs.map((log) => (
                                <div key={log.id} className="p-4 rounded-2xl bg-muted/30 flex items-center justify-between group hover:bg-muted transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${log.direction === 'ENTRY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                            {log.direction === 'ENTRY' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <div className="font-semibold uppercase text-sm">{log.user?.firstName} {log.user?.lastName}</div>
                                            <div className="text-[10px] font-bold text-muted-foreground opacity-50">{log.user?.role} • {log.location || 'Entrance'}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-semibold">{new Date(log.scanTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="text-[10px] font-bold text-muted-foreground opacity-30">{new Date(log.scanTime).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </Card>
            </div>
        </div>
        </RequireBranch>
    );
}
