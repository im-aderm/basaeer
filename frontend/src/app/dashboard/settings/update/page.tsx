"use client";

import { useState } from "react";
import { RefreshCw, Download, CheckCircle2, AlertCircle, History, Package, ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function SystemUpdatePage() {
    const [checking, setChecking] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [progress, setProgress] = useState(0);
    const [versionInfo, setVersionInfo] = useState({
        current: "v2.4.0",
        latest: "v2.4.0",
        lastChecked: "2024-05-15 08:00 AM",
        status: "up-to-date" as "up-to-date" | "available" | "updating"
    });

    const releaseNotes = [
        {
            version: "v2.4.0",
            date: "2024-05-10",
            type: "Major",
            changes: [
                "Integrated new accounting module with Nigerian tax standards.",
                "Improved student attendance tracking with RFID support.",
                "Enhanced dashboard performance by 40%.",
                "Fixed minor UI bugs in the reports section."
            ]
        },
        {
            version: "v2.3.5",
            date: "2024-04-28",
            type: "Patch",
            changes: [
                "Updated library management system filters.",
                "Fixed session timeout issues on mobile devices.",
                "Added support for multiple file uploads in assignments."
            ]
        }
    ];

    const checkUpdates = () => {
        setChecking(true);
        // Simulate API call
        setTimeout(() => {
            setChecking(false);
            setVersionInfo(prev => ({
                ...prev,
                latest: "v2.4.1",
                status: "available",
                lastChecked: new Date().toLocaleString()
            }));
            toast.info("A new version v2.4.1 is available!");
        }, 2000);
    };

    const startUpdate = () => {
        setUpdating(true);
        setVersionInfo(prev => ({ ...prev, status: "updating" }));
        
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 5;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
                clearInterval(interval);
                setUpdating(false);
                setVersionInfo({
                    current: "v2.4.1",
                    latest: "v2.4.1",
                    status: "up-to-date",
                    lastChecked: new Date().toLocaleString()
                });
                toast.success("System updated successfully to v2.4.1");
            }
        }, 200);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">System Update</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage platform versions and software updates.</p>
                </div>
                <Button 
                    onClick={checkUpdates} 
                    disabled={checking || updating}
                    variant="outline"
                    className="h-12 px-6 rounded-2xl gap-2 border-border/50 hover:bg-muted"
                >
                    <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
                    Check for Updates
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2 rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-primary/20">
                    <CardHeader className="bg-primary/5 pb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Package className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-h3 font-semibold">Version Status</CardTitle>
                                    <CardDescription className="font-medium">Current installation details.</CardDescription>
                                </div>
                            </div>
                            <Badge variant={versionInfo.status === 'up-to-date' ? 'default' : 'secondary'} className="rounded-full px-4 py-1">
                                {versionInfo.status === 'up-to-date' ? 'System Up to Date' : 'Update Available'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-8 space-y-8">
                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Current Version</p>
                                <p className="text-3xl font-bold tracking-tight">{versionInfo.current}</p>
                            </div>
                            <div className="space-y-1 text-right">
                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Last Checked</p>
                                <p className="text-sm font-medium">{versionInfo.lastChecked}</p>
                            </div>
                        </div>

                        {versionInfo.status === 'available' && (
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-600">
                                        <ArrowUpCircle className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-amber-900">New Version Available ({versionInfo.latest})</p>
                                        <p className="text-sm text-amber-700">Security patches and performance improvements are ready.</p>
                                    </div>
                                </div>
                                <Button onClick={startUpdate} className="rounded-xl bg-amber-600 hover:bg-amber-700">
                                    Install Now
                                </Button>
                            </div>
                        )}

                        {updating && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="font-semibold flex items-center gap-2">
                                        <Download className="h-4 w-4 animate-bounce" />
                                        Downloading & Installing Update...
                                    </p>
                                    <p className="text-sm font-bold">{progress}%</p>
                                </div>
                                <Progress value={progress} className="h-3 rounded-full" />
                            </div>
                        )}

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                            {versionInfo.status === 'up-to-date' ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                            <p className="text-sm font-medium">
                                {versionInfo.status === 'up-to-date' 
                                    ? "Your system is running the latest stable version. No action is required." 
                                    : "A newer version is available. We recommend updating to stay secure and get latest features."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-blue-500/20">
                    <CardHeader className="bg-blue-500/5 pb-4">
                        <div className="flex items-center gap-3">
                            <History className="h-5 w-5 text-blue-600" />
                            <CardTitle className="text-lg font-semibold">Release History</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        {releaseNotes.map((note, index) => (
                            <div key={index} className="space-y-3 relative pb-6 last:pb-0">
                                {index !== releaseNotes.length - 1 && (
                                    <div className="absolute left-2.5 top-8 bottom-0 w-px bg-border/50" />
                                )}
                                <div className="flex items-start gap-3">
                                    <div className="mt-1.5 h-5 w-5 rounded-full bg-blue-100 border-2 border-blue-500 flex-shrink-0" />
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold">{note.version}</span>
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold py-0 h-4">
                                                {note.type}
                                            </Badge>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{note.date}</p>
                                        <ul className="text-xs space-y-1.5 text-muted-foreground pt-1">
                                            {note.changes.map((change, i) => (
                                                <li key={i} className="flex items-start gap-1.5">
                                                    <span className="text-blue-500 mt-1">•</span>
                                                    <span>{change}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
