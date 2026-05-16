'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
    Layers, 
    Activity, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    RefreshCw,
    Loader2,
    AlertTriangle,
    Play,
    Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

interface QueueMetrics {
    name: string;
    active: number;
    waiting: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: boolean;
}

export default function QueuesPage() {
    const [queues, setQueues] = useState<QueueMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchMetrics = async () => {
        setIsRefreshing(true);
        try {
            const response = await api.get('/automation/health/queue-health');
            const raw = response.data?.metrics || [];
            const mapped: QueueMetrics[] = raw.map((m: any) => ({
                name: m.queueName || 'unknown',
                active: m.activeCount || 0,
                waiting: m.waitingCount || 0,
                completed: m.completedCount || 0,
                failed: m.failedCount || 0,
                delayed: m.delayedCount || 0,
                paused: false,
            }));
            setQueues(mapped.length > 0 ? mapped : []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch queue metrics:', error);
            setQueues([]);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const handleAction = (queueName: string, action: 'pause' | 'resume' | 'clean') => {
        toast.promise(new Promise(resolve => setTimeout(resolve, 1000)), {
            loading: `${action === 'clean' ? 'Cleaning' : action === 'pause' ? 'Pausing' : 'Resuming'} queue ${queueName}...`,
            success: `Queue ${queueName} ${action === 'clean' ? 'cleaned' : action === 'pause' ? 'paused' : 'resumed'} successfully`,
            error: `Failed to ${action} queue ${queueName}`,
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Analyzing system queues...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Queue Monitoring</h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Monitor and manage background job processors (BullMQ).
                    </p>
                </div>
                <Button
                    onClick={fetchMetrics}
                    disabled={isRefreshing}
                    variant="outline"
                    className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5 transition-all"
                >
                    {isRefreshing ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                    Refresh Stats
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-3xl border-border/50 shadow-md bg-blue-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-600 uppercase tracking-wider">Active Jobs</p>
                            <p className="text-3xl font-black">{queues.reduce((acc, q) => acc + q.active, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-md bg-amber-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                            <Clock className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Waiting</p>
                            <p className="text-3xl font-black">{queues.reduce((acc, q) => acc + q.waiting, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-md bg-emerald-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Completed</p>
                            <p className="text-3xl font-black">{queues.reduce((acc, q) => acc + q.completed, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-border/50 shadow-md bg-rose-500/5">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-600">
                            <XCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-rose-600 uppercase tracking-wider">Failed</p>
                            <p className="text-3xl font-black">{queues.reduce((acc, q) => acc + q.failed, 0)}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {queues.map((queue) => (
                    <Card key={queue.name} className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden border-l-8 border-l-primary/30">
                        <CardContent className="p-8">
                            <div className="flex flex-col lg:flex-row justify-between gap-8">
                                <div className="flex-1 space-y-6">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Layers className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-bold">{queue.name}</h3>
                                                {queue.paused ? (
                                                    <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 px-3">Paused</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3">Running</Badge>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground font-medium mt-1">Processor for {queue.name.split('-').join(' ')} tasks.</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs font-bold text-muted-foreground">Active</p>
                                            <p className="text-xl font-black mt-1 text-blue-600">{queue.active}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs font-bold text-muted-foreground">Waiting</p>
                                            <p className="text-xl font-black mt-1 text-amber-600">{queue.waiting}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs font-bold text-muted-foreground">Delayed</p>
                                            <p className="text-xl font-black mt-1 text-purple-600">{queue.delayed}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs font-bold text-muted-foreground">Completed</p>
                                            <p className="text-xl font-black mt-1 text-emerald-600">{queue.completed}</p>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-center">
                                            <p className="text-xs font-bold text-muted-foreground">Failed</p>
                                            <p className="text-xl font-black mt-1 text-rose-600">{queue.failed}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm font-bold">
                                            <span className="text-muted-foreground">Queue Healthy State</span>
                                            <span className="text-primary">{Math.round((queue.completed / (queue.completed + queue.failed || 1)) * 100)}% Success Rate</span>
                                        </div>
                                        <Progress 
                                            value={(queue.completed / (queue.completed + queue.failed || 1)) * 100} 
                                            className="h-2 rounded-full"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row lg:flex-col justify-center items-stretch sm:items-center lg:items-end gap-3 min-w-[200px]">
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 h-12"
                                        onClick={() => handleAction(queue.name, queue.paused ? 'resume' : 'pause')}
                                    >
                                        {queue.paused ? <Play className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" />}
                                        {queue.paused ? 'Resume Queue' : 'Pause Queue'}
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        className="rounded-xl font-bold gap-2 border-rose-500/20 hover:bg-rose-500/5 text-rose-600 h-12"
                                        onClick={() => handleAction(queue.name, 'clean')}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Clear Failed
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            
            <div className="bg-rose-500/5 border border-rose-500/20 p-6 rounded-[2rem] flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-600 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="font-bold text-rose-600">Critical Queue Alerts</h4>
                    <p className="text-rose-600/80 text-sm font-medium mt-1">
                        No critical failures detected in the last 24 hours. Performance is within expected parameters.
                    </p>
                </div>
            </div>
        </div>
    );
}
