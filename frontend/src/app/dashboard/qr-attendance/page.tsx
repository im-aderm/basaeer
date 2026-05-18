"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, QrCode, ShieldCheck, RefreshCcw, Camera, CheckCircle, XCircle, Wifi, WifiOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import { useRealtimeEvent } from '@/hooks/useRealtime';

export default function QRAttendanceScanner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');

    const { showSuccess, showError, showInfo } = useNotification();
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState<any>(null);
    const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR' | 'OFFLINE_QUEUED'>('IDLE');
    const [sessionInfo, setSessionDetails] = useState<any>(null);
    const [isOnline, setIsOnline] = useState(true);
    const [offlineQueue, setOfflineQueue] = useState<any[]>([]);
    const scannerRef = useRef<any>(null);

    // Sync state with local storage
    useEffect(() => {
        const stored = localStorage.getItem('attendance_offline_queue');
        if (stored) setOfflineQueue(JSON.parse(stored));

        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        setIsOnline(navigator.onLine);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (sessionId) {
            fetchSessionDetails();
        }
    }, [sessionId]);

    const fetchSessionDetails = async () => {
        try {
            const res = await api.get(`/attendance/sessions/${sessionId}`);
            setSessionDetails(res.data);
        } catch (error) {
            showError("Failed to load session details");
        }
    };

    // Real-time updates from other scanners or manual marks
    useRealtimeEvent('attendance_update', (data: any) => {
        if (data.sessionId === sessionId) {
            // We could update a local roster here
            showInfo(`${data.studentName} marked ${data.status}`);
        }
    });

    useEffect(() => {
        if (scanning) {
            import('html5-qrcode').then(({ Html5QrcodeScanner }) => {
                scannerRef.current = new Html5QrcodeScanner(
                    "qr-reader",
                    { fps: 15, qrbox: { width: 250, height: 250 } },
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
        if (scanStatus === 'SUCCESS' || scanStatus === 'OFFLINE_QUEUED') return;

        try {
            if (scannerRef.current) await scannerRef.current.pause(true);

            if (!isOnline) {
                queueOfflineScan(decodedText);
                return;
            }

            const res = await api.post('/attendance/scan', {
                payload: decodedText,
                sessionId
            });

            if (res.data.alreadyScanned) {
                showInfo("Student already scanned recently");
                setScanStatus('IDLE');
            } else {
                setLastScan(res.data.attendance);
                setScanStatus('SUCCESS');
                showSuccess(`Marked: ${res.data.attendance.student.firstName}`);
            }

            setTimeout(async () => {
                setScanStatus('IDLE');
                if (scannerRef.current) await scannerRef.current.resume();
            }, 1500);

        } catch (error: any) {
            setScanStatus('ERROR');
            showError(error.response?.data?.message || 'Invalid QR or Access Denied');
            setTimeout(async () => {
                setScanStatus('IDLE');
                if (scannerRef.current) await scannerRef.current.resume();
            }, 2000);
        }
    };

    const queueOfflineScan = (payload: string) => {
        const newScan = { payload, sessionId, timestamp: new Date().toISOString() };
        const updatedQueue = [...offlineQueue, newScan];
        setOfflineQueue(updatedQueue);
        localStorage.setItem('attendance_offline_queue', JSON.stringify(updatedQueue));
        
        setScanStatus('OFFLINE_QUEUED');
        showInfo("Offline: Scan queued for sync");

        setTimeout(async () => {
            setScanStatus('IDLE');
            if (scannerRef.current) await scannerRef.current.resume();
        }, 1000);
    };

    const syncOfflineQueue = async () => {
        if (offlineQueue.length === 0) return;
        
        try {
            await api.post('/attendance/scan/bulk', { scans: offlineQueue });
            setOfflineQueue([]);
            localStorage.removeItem('attendance_offline_queue');
        showSuccess("Sync complete!");
        } catch (error) {
            showError("Sync failed");
        }
    };

    const onScanFailure = (error: any) => {
        // quiet fail
    };

    if (!sessionId) {
        return (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <QrCode className="w-20 h-20 text-muted-foreground/20" />
                <h2 className="text-h2 font-bold tracking-tight text-primary">No Session Selected</h2>
                <p className="text-muted-foreground">Please select an active session from the sessions page.</p>
                <Button onClick={() => router.push('/dashboard/attendance/sessions')}>Go to Sessions</Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-4 pl-0 hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">QR Scanner</h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        {sessionInfo ? `${sessionInfo.name || 'Session'} | ${sessionInfo.class?.name}-${sessionInfo.section?.name}` : 'Loading session...'}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isOnline ? (
                        <Badge className="bg-emerald-500 text-white gap-2 py-1 px-3">
                            <Wifi size={14} /> ONLINE
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="gap-2 py-1 px-3">
                            <WifiOff size={14} /> OFFLINE
                        </Badge>
                    )}
                    {offlineQueue.length > 0 && (
                        <Button variant="outline" size="sm" className="rounded-full gap-2 border-orange-200 text-orange-600 bg-orange-50 hover:bg-orange-100" onClick={syncOfflineQueue}>
                            <RefreshCcw size={14} className={scanStatus === 'IDLE' ? '' : 'animate-spin'} />
                            Sync {offlineQueue.length} Pending
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden relative flex flex-col min-h-[500px]">
                    <CardHeader className="p-8 border-b border-border/50">
                        <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                            <Camera className="h-8 w-8" />
                            Live Camera
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
                        {scanning ? (
                            <div className="w-full max-w-sm space-y-6">
                                <div className="relative group">
                                    <div id="qr-reader" className="overflow-hidden rounded-[2.5rem] border-4 border-white shadow-2xl bg-black" />
                                    
                                    {/* Scan Overlays */}
                                    {scanStatus === 'SUCCESS' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/80 backdrop-blur-sm rounded-[2.5rem] animate-in fade-in zoom-in duration-200">
                                            <div className="bg-white text-emerald-500 p-6 rounded-full shadow-2xl">
                                                <CheckCircle className="h-16 w-16 animate-bounce" />
                                            </div>
                                        </div>
                                    )}
                                    {scanStatus === 'OFFLINE_QUEUED' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/80 backdrop-blur-sm rounded-[2.5rem] animate-in fade-in zoom-in duration-200">
                                            <div className="bg-white text-blue-500 p-6 rounded-full shadow-2xl">
                                                <WifiOff className="h-16 w-16" />
                                            </div>
                                        </div>
                                    )}
                                    {scanStatus === 'ERROR' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/80 backdrop-blur-sm rounded-[2.5rem] animate-in fade-in zoom-in duration-200">
                                            <div className="bg-white text-red-500 p-6 rounded-full shadow-2xl">
                                                <XCircle className="h-16 w-16" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Corner Accents */}
                                    <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl opacity-50" />
                                    <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl opacity-50" />
                                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl opacity-50" />
                                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl opacity-50" />
                                </div>
                                <Button
                                    variant="outline"
                                    className="w-full h-14 rounded-2xl font-bold uppercase tracking-wider gap-2 bg-white border-border/50 hover:bg-muted"
                                    onClick={() => setScanning(false)}
                                >
                                    <RefreshCcw className="h-5 w-5" /> Stop Scanner
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-8">
                                <div className="h-56 w-56 rounded-[3.5rem] bg-white border-2 border-dashed border-primary/20 flex items-center justify-center mx-auto group hover:border-primary hover:rotate-3 transition-all duration-500 shadow-xl">
                                    <QrCode className="h-24 w-24 text-primary/10 group-hover:text-primary transition-all duration-500" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold text-slate-800">Ready to Scan</h3>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto">Position the student's ID card QR code in front of the camera.</p>
                                </div>
                                <Button
                                    className="h-16 px-12 rounded-[2rem] font-bold uppercase tracking-wider gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    onClick={() => setScanning(true)}
                                >
                                    <ShieldCheck className="h-6 w-6" /> Start Scanning
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden bg-white">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-h3 font-semibold uppercase text-slate-400">Last Scanned</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2">
                            {lastScan ? (
                                <div className="space-y-6 animate-in slide-in-from-right duration-500">
                                    <div className="flex items-center gap-6">
                                        <div className="h-24 w-24 rounded-[2rem] bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary shadow-inner">
                                            {lastScan.student?.firstName[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-3xl font-black text-slate-800 tracking-tight leading-none">
                                                {lastScan.student?.firstName}
                                            </div>
                                            <div className="text-xl font-bold text-slate-500 uppercase tracking-wide">
                                                {lastScan.student?.lastName}
                                            </div>
                                            <Badge className="bg-primary/5 text-primary border-primary/10 font-bold px-3 py-1">STUDENT</Badge>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                            <span className="text-xs font-black text-slate-400 uppercase block mb-1">Time</span>
                                            <span className="text-lg font-bold text-slate-700">{new Date(lastScan.createdAt).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
                                            <span className="text-xs font-black text-emerald-400 uppercase block mb-1">Status</span>
                                            <span className="text-lg font-bold text-emerald-600 flex items-center gap-2">
                                                <CheckCircle className="w-5 h-5" /> PRESENT
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-50">
                                    <div className="w-20 h-20 rounded-[2rem] bg-muted/50 flex items-center justify-center border-2 border-dashed border-border">
                                        <QrCode className="w-10 h-10 text-muted-foreground/30" />
                                    </div>
                                    <p className="font-bold text-lg">No recent scans</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem] relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                            <ShieldCheck className="w-32 h-32" />
                        </div>
                        <h4 className="font-black text-primary uppercase tracking-widest text-sm mb-3 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            System Intelligence
                        </h4>
                        <p className="text-slate-600 font-medium leading-relaxed">
                            QR validation is cryptographically signed and tenant-isolated. 
                            Duplicate scans for the same session are automatically filtered.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
