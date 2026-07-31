'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
    Timer,
    Clock,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { commsService, ScheduledJob } from '@/services/commsService';

export default function CronJobsPage() {
    const { showSuccess, showError } = useNotification();
    const [jobs, setJobs] = useState<ScheduledJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await commsService.getScheduledJobs();
                setJobs(response.data);
            } catch (error) {
                showError('Failed to load scheduled jobs');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleToggle = async (job: ScheduledJob) => {
        setTogglingId(job.id);
        const nextEnabled = !job.isEnabled;
        try {
            await commsService.toggleScheduledJob(job.id, nextEnabled);
            setJobs(prev => prev.map(j => j.id === job.id ? { ...j, isEnabled: nextEnabled } : j));
            showSuccess(nextEnabled ? 'Job enabled' : 'Job disabled');
        } catch (error) {
            showError('Failed to update job');
        } finally {
            setTogglingId(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading scheduled jobs...</p>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Scheduled Jobs</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Enable or disable dynamically scheduled background jobs. The core automated
                        tasks (birthday wishes, fee reminders, attendance alerts) run on a fixed daily
                        schedule and are managed from Settings &gt; Automation instead.
                    </p>
                </div>

                {jobs.length === 0 ? (
                    <Card className="rounded-[2rem] border-border/50 shadow-lg">
                        <CardContent className="p-12 text-center space-y-2">
                            <Timer className="h-10 w-10 text-muted-foreground mx-auto" />
                            <p className="text-lg font-bold">No scheduled jobs configured</p>
                            <p className="text-muted-foreground">
                                Dynamically scheduled jobs will appear here once one has been created.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <Card key={job.id} className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden border-l-8 border-l-primary/30">
                                <CardContent className="p-8">
                                    <div className="flex flex-col lg:flex-row justify-between gap-8">
                                        <div className="flex-1 space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Timer className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="text-xl font-bold">{job.name}</h3>
                                                        {job.isEnabled ? (
                                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">Active</Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="bg-muted text-muted-foreground px-3">Disabled</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-muted-foreground font-mono text-sm mt-1">{job.cron}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                    <Clock className="h-4 w-4" />
                                                    <span>Last run: <span className="text-foreground font-bold">{job.lastRun || 'Never'}</span></span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                    <RefreshCw className="h-4 w-4" />
                                                    <span>Next run: <span className="text-foreground font-bold">{job.nextRun || 'Not scheduled'}</span></span>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                                    {job.status === 'SUCCESS' ? (
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                    ) : job.status === 'FAILED' ? (
                                                        <AlertCircle className="h-4 w-4 text-destructive" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-blue-500" />
                                                    )}
                                                    <span>Status: <span className={`font-bold capitalize ${
                                                        job.status === 'SUCCESS' ? 'text-emerald-500' :
                                                        job.status === 'FAILED' ? 'text-destructive' : 'text-blue-500'
                                                    }`}>{job.status.toLowerCase()}</span></span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 self-start">
                                            {togglingId === job.id ? (
                                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                            ) : (
                                                <Switch
                                                    checked={job.isEnabled}
                                                    onCheckedChange={() => handleToggle(job)}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </RequireBranch>
    );
}
