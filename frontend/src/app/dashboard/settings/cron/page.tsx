'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
    Timer, 
    Save, 
    Play, 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    Loader2,
    RefreshCw
} from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface CronJob {
    id: string;
    name: string;
    description: string;
    schedule: string;
    enabled: boolean;
    lastRun?: string;
    nextRun?: string;
    status: 'idle' | 'running' | 'failed' | 'success';
}

const DEFAULT_JOBS: CronJob[] = [
    { 
        id: 'attendance-report', 
        name: 'Daily Attendance Report', 
        description: 'Generates and sends daily attendance summaries to administrators.',
        schedule: '0 18 * * *', 
        enabled: true, 
        lastRun: '2024-05-20 18:00:01',
        nextRun: '2024-05-21 18:00:00',
        status: 'success'
    },
    { 
        id: 'fee-reminders', 
        name: 'Fee Payment Reminders', 
        description: 'Sends automated SMS/Email reminders for pending fee payments.',
        schedule: '0 9 * * 1', 
        enabled: true, 
        lastRun: '2024-05-13 09:00:05',
        nextRun: '2024-05-20 09:00:00',
        status: 'success'
    },
    { 
        id: 'system-backup', 
        name: 'Full System Backup', 
        description: 'Creates a complete database and file system backup.',
        schedule: '0 2 * * *', 
        enabled: true, 
        lastRun: '2024-05-20 02:00:15',
        nextRun: '2024-05-21 02:00:00',
        status: 'success'
    },
    { 
        id: 'inactive-users-cleanup', 
        name: 'Cleanup Inactive Sessions', 
        description: 'Removes expired login sessions and temporary system files.',
        schedule: '*/30 * * * *', 
        enabled: false, 
        status: 'idle'
    },
];

export default function CronJobsPage() {
    const { showSuccess, showError, showInfo } = useNotification();
    const [jobs, setJobs] = useState<CronJob[]>(DEFAULT_JOBS);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await fetch('/api/cron-jobs');
                if (response.ok) {
                    const data = await response.json();
                    setJobs(data.jobs || DEFAULT_JOBS);
                }
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch cron jobs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleToggle = (id: string) => {
        setJobs(prev => prev.map(job => 
            job.id === id ? { ...job, enabled: !job.enabled } : job
        ));
    };

    const handleScheduleChange = (id: string, schedule: string) => {
        setJobs(prev => prev.map(job => 
            job.id === id ? { ...job, schedule } : job
        ));
    };

    const handleRunNow = async (id: string) => {
        showInfo(`Triggering job: ${id}...`);
        try {
            const response = await fetch(`/api/cron-jobs/${id}/run`, { method: 'POST' });
            if (response.ok) {
                showSuccess('Job started successfully');
            } else {
                throw new Error('Failed to run job');
            }
        } catch (error) {
            showError('Failed to trigger job');
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/cron-jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jobs: jobs.map(({ id, schedule, enabled }) => ({ id, schedule, enabled })) })
            });
            
            if (response.ok) {
                showSuccess('Cron jobs updated successfully');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            showError('Failed to save cron configurations');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Loading automated tasks...</p>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Cron Jobs</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Manage automated system tasks and background processes.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                >
                    {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </Button>
            </div>

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
                                                {job.enabled ? (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">Active</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-muted text-muted-foreground px-3">Disabled</Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground font-medium mt-1">{job.description}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span>Last run: <span className="text-foreground font-bold">{job.lastRun || 'Never'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            <RefreshCw className="h-4 w-4" />
                                            <span>Next run: <span className="text-foreground font-bold">{job.nextRun || 'Scheduled'}</span></span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                                            {job.status === 'success' ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : job.status === 'failed' ? (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            ) : (
                                                <Clock className="h-4 w-4 text-blue-500" />
                                            )}
                                            <span>Status: <span className={`font-bold capitalize ${
                                                job.status === 'success' ? 'text-emerald-500' : 
                                                job.status === 'failed' ? 'text-destructive' : 'text-blue-500'
                                            }`}>{job.status}</span></span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col justify-center items-stretch sm:items-center lg:items-end gap-4 min-w-[200px]">
                                    <div className="flex items-center gap-4 bg-muted/30 p-2 rounded-2xl border border-border/50">
                                        <Input 
                                            value={job.schedule}
                                            onChange={(e) => handleScheduleChange(job.id, e.target.value)}
                                            className="w-32 h-10 border-none bg-transparent font-mono font-bold text-center"
                                        />
                                        <div className="h-6 w-px bg-border/50 mx-1" />
                                        <div className="pr-2">
                                            <Switch 
                                                checked={job.enabled}
                                                onCheckedChange={() => handleToggle(job.id)}
                                            />
                                        </div>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="lg"
                                        className="rounded-2xl font-bold gap-2 hover:bg-primary/5 hover:text-primary border-primary/20"
                                        onClick={() => handleRunNow(job.id)}
                                    >
                                        <Play className="h-4 w-4" />
                                        Run Now
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            </div>
        </RequireBranch>
    );
}
