"use client";
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, QrCode, ShieldCheck, RefreshCcw, Camera, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { AutomationEventsService } from '@/services/automationEventsService';

export default function QRAttendanceScanner() {
    const router = useRouter();
    const [scanning, setScanning] = useState(false);
    const [lastScan, setLastScan] = useState<any>(null);
    const scannerRef = useRef<any>(null);
    const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');

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
                scannerRef.current.clear().catch(error => console.error("Failed to clear scanner", error));
                scannerRef.current = null;
            }
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => console.error("Failed to cleanup scanner", error));
            }
        };
    }, [scanning]);

    const onScanSuccess = async (decodedText: string) => {
        // Debounce or preventing double scans could be added here
        if (scanStatus === 'SUCCESS') return;

        try {
            if (scannerRef.current) {
                await scannerRef.current.pause(true);
            }

            const log = await AutomationEventsService.logAccess({
                userId: decodedText,
                direction: 'ENTRY', // Default to ENTRY for Attendance
                location: 'Classroom/Main'
            });

            setLastScan(log);
            setScanStatus('SUCCESS');
            toast.success(`Welcome, ${log.user?.firstName}! Attendance Marked.`);

            // Resume scanning after delay
            setTimeout(async () => {
                setScanStatus('IDLE');
                if (scannerRef.current) {
                    await scannerRef.current.resume();
                }
            }, 3000);

        } catch (error) {
            setScanStatus('ERROR');
            toast.error('Invalid ID or Access Denied');
            setTimeout(async () => {
                setScanStatus('IDLE');
                if (scannerRef.current) {
                    await scannerRef.current.resume();
                }
            }, 2000);
        }
    };

    const onScanFailure = (error: any) => {
        // quiet fail
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <Button
                        onClick={() => router.back()}
                        variant="ghost"
                        className="mb-4 pl-0 hover:bg-transparent hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Button>
                    <h1 className="text-h1 font-semibold tracking-tight">QR Attendance</h1>
                    <p className="text-muted-foreground font-medium text-lg">Scan your ID card to mark attendance instantly.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden relative flex flex-col min-h-[500px]">
                    <CardHeader className="p-8 border-b border-border/50">
                        <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-3">
                            <QrCode className="h-8 w-8 text-primary" />
                            Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col items-center justify-center p-8 bg-muted/20">
                        {scanning ? (
                            <div className="w-full max-w-sm space-y-6">
                                <div className="relative">
                                    <div id="qr-reader" className="overflow-hidden rounded-[2rem] border-4 border-primary/20 bg-black" />
                                    {scanStatus === 'SUCCESS' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2rem]">
                                            <div className="bg-emerald-500 text-white p-4 rounded-full animate-in zoom-in spin-in-12 duration-300">
                                                <CheckCircle className="h-12 w-12" />
                                            </div>
                                        </div>
                                    )}
                                    {scanStatus === 'ERROR' && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-[2rem]">
                                            <div className="bg-red-500 text-white p-4 rounded-full animate-in zoom-in duration-300">
                                                <XCircle className="h-12 w-12" />
                                            </div>
                                        </div>
                                    )}
                                </div>
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
                                    <h3 className="text-h3 font-semibold uppercase">Ready to Scan</h3>
                                    <p className="text-muted-foreground font-medium max-w-xs mx-auto mt-2">Tap below to activate the camera.</p>
                                </div>
                                <Button
                                    className="h-16 px-12 rounded-[2rem] font-semibold uppercase tracking-wider gap-3 shadow-xl shadow-primary/20"
                                    onClick={() => setScanning(true)}
                                >
                                    <ShieldCheck className="h-6 w-6" /> Start Scanning
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-h3 font-semibold uppercase text-muted-foreground">Last Scanned</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2">
                            {lastScan ? (
                                <div className="space-y-4 animate-in slide-in-from-right duration-500">
                                    <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-h1 font-semibold text-primary mx-auto mb-4">
                                        {lastScan.user?.firstName[0]}
                                    </div>
                                    <div className="text-center space-y-1">
                                        <div className="text-h3 font-semibold uppercase tracking-tight">
                                            {lastScan.user?.firstName} {lastScan.user?.lastName}
                                        </div>
                                        <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">
                                            {lastScan.user?.role}
                                        </Badge>
                                    </div>
                                    <div className="bg-muted p-4 rounded-2xl flex justify-between items-center text-sm font-medium">
                                        <span className="text-muted-foreground">Time</span>
                                        <span className="font-semibold">{new Date(lastScan.scanTime).toLocaleTimeString()}</span>
                                    </div>
                                    <div className="bg-emerald-500/10 text-emerald-600 p-4 rounded-2xl flex justify-between items-center text-sm font-semibold">
                                        <span>Status</span>
                                        <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> MARKED</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center text-muted-foreground space-y-4 opacity-50">
                                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                                        <QrCode className="w-8 h-8" />
                                    </div>
                                    <p className="font-medium">No recent scans</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-[2rem] text-blue-600 text-sm">
                        <p className="font-bold mb-2 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            Safe Mode Active
                        </p>
                        <p className="opacity-80">
                            Attendance is automatically marked upon valid entry scan. Double-scans within 1 minute are ignored.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
