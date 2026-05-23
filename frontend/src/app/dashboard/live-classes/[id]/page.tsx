'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Video, Users, Clock, Calendar, BookOpen, ChevronLeft,
    ExternalLink, Play, CheckCircle2, AlertCircle, BarChart3,
    MessageSquare, Settings, Download, Share2
} from 'lucide-react';
import { LiveClassesService, LiveClassSession, ReportItem } from '@/services/liveClassesService';
import { useNotification } from '@/context/NotificationContext';
import { format } from 'date-fns';

// No local Participant interface needed

export default function ClassDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, resolvedBranchId } = useAuth();

    const { showError } = useNotification();

    const [session, setSession] = useState<LiveClassSession | null>(null);
    const [attendance, setAttendance] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [sessionData, attendanceData] = await Promise.all([
                LiveClassesService.getSessionById(id as string),
                LiveClassesService.getAttendanceReport(id as string)
            ]);
            setSession(sessionData);
            setAttendance(attendanceData || []);
        } catch (error) {
            showError('Failed to load session details');
            router.push('/dashboard/live-classes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchData();
    }, [id]);

    const handleStart = async () => {
        try {
            const updated = await LiveClassesService.startSession(id as string);
            window.open(updated.hostUrl, '_blank');
            fetchData();
        } catch (error) {
            showError('Failed to start session');
        }
    };

    if (loading) return <div className="p-20 text-center uppercase font-semibold opacity-20 animate-pulse">Initializing Virtual Space...</div>;
    if (!session) return null;

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Nav */}
            <Button variant="ghost" onClick={() => router.back()} className="mb-2">
                <ChevronLeft className="mr-2 h-4 w-4" /> Back to Dashboard
            </Button>

            {/* Header Hero */}
            <Card className="overflow-hidden border-none bg-gradient-to-r from-primary/10 via-background to-background shadow-xl">
                <div className="p-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Video className="h-12 w-12" />
                    </div>
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                            <h1 className="text-h1 font-bold tracking-tight text-primary">{session.title}</h1>
                            <Badge variant={session.status === 'LIVE' ? 'default' : 'outline'} className={session.status === 'LIVE' ? 'bg-emerald-500 animate-pulse' : ''}>
                                {session.status}
                            </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm font-bold text-muted-foreground uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {session.subject?.name}</span>
                            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> Class {session.class?.name}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {format(new Date(session.scheduledStart), 'HH:mm')} - {format(new Date(session.scheduledEnd), 'HH:mm')}</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        {session.status === 'SCHEDULED' && (
                            <Button size="lg" className="px-8 shadow-xl shadow-primary/20" onClick={handleStart}>
                                <Play className="mr-2 h-5 w-5 fill-white" /> Start Room
                            </Button>
                        )}
                        {session.status === 'LIVE' && (
                            <Button size="lg" className="bg-primary hover:bg-primary/90 px-8 shadow-xl shadow-primary/20" onClick={() => window.open(session.hostUrl || '', '_blank')}>
                                <ExternalLink className="mr-2 h-5 w-5" /> Join Meeting
                            </Button>
                        )}
                        <Button variant="outline" size="lg" className="px-4">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Participation & Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[2rem] overflow-hidden">
                        <CardHeader className="border-b bg-muted/30">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Real-time Participation
                                </CardTitle>
                                <Badge variant="outline">{attendance.length} Connected</Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="px-6">Student</TableHead>
                                        <TableHead>Joined At</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead className="text-right px-6">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attendance.length > 0 ? (
                                        attendance.map((p: ReportItem, idx: number) => (
                                            <TableRow key={idx}>
                                                <TableCell className="px-6 font-bold">{p.name}</TableCell>
                                                <TableCell className="text-sm font-medium">{format(new Date(p.joinedAt), 'HH:mm:ss')}</TableCell>
                                                <TableCell className="text-xs font-mono">{p.duration || '0'} min</TableCell>
                                                <TableCell className="text-right px-6">
                                                    <Badge className="bg-primary/10 text-primary border-primary/20" variant="outline">Active</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-40 text-center text-muted-foreground">
                                                No participants detected yet.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Recording Player / Placeholder */}
                    <Card className="rounded-[2rem] overflow-hidden border-2 border-dashed border-primary/20 bg-primary/5">
                        <div className="p-20 text-center space-y-4">
                            <Video className="mx-auto h-16 w-16 text-primary/40" />
                            <div className="space-y-1">
                                <h3 className="text-h3 font-semibold tracking-tighter">Class Recording</h3>
                                <p className="text-muted-foreground font-bold text-sm">
                                    {session.recordingStatus === 'READY' ? 'Recording is available for playback.' : 'Recording will be available 5-10 minutes after session ends.'}
                                </p>
                            </div>
                            {session.recordingUrl && (
                                <Button className="mt-4 shadow-lg shadow-primary/20" size="lg" onClick={() => window.open(session.recordingUrl || '', '_blank')}>
                                    <Play className="mr-2 h-5 w-5 fill-white" /> Play Cloud Recording
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Right: Metrics & Actions */}
                <div className="space-y-6">
                    <Card className="rounded-[2rem] shadow-lg border-l-4 border-l-primary">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" /> Analytics Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Average Engagement</span>
                                    <span>84%</span>
                                </div>
                                <Progress value={84} className="h-2 bg-primary/10" />
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                    <span>Question Response Rate</span>
                                    <span>62%</span>
                                </div>
                                <Progress value={62} className="h-2 bg-emerald-500/10" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div className="text-center">
                                    <p className="text-h3 font-semibold tracking-tighter">18</p>
                                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Messages</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-h3 font-semibold tracking-tighter">04</p>
                                    <p className="text-[10px] font-semibold uppercase text-muted-foreground">Polls</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] bg-gradient-to-br from-primary to-primary-foreground border-none shadow-xl shadow-primary/20">
                        <CardHeader>
                            <CardTitle className="text-white font-semibold uppercase tracking-tighter">Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none" variant="outline">
                                <Download className="mr-2 h-4 w-4" /> Export Attendance
                            </Button>
                            <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none" variant="outline">
                                <Share2 className="mr-2 h-4 w-4" /> Invite Co-Teacher
                            </Button>
                            <Button className="w-full justify-start bg-white/10 hover:bg-white/20 text-white border-none" variant="outline">
                                <MessageSquare className="mr-2 h-4 w-4" /> Batch Announcement
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem]">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Session Lifecycle</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-2 w-2 rounded-full bg-emerald-500" />
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-tight">Meeting Created</p>
                                    <p className="text-[10px] text-muted-foreground">{format(new Date(session.createdAt), 'MMM d, HH:mm')}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 flex h-2 w-2 rounded-full ${session.actualStart ? 'bg-emerald-500' : 'bg-muted'}`} />
                                <div>
                                    <p className={`text-sm font-bold uppercase tracking-tight ${!session.actualStart && 'text-muted-foreground'}`}>Teacher Joined</p>
                                    {session.actualStart && <p className="text-[10px] text-muted-foreground">{format(new Date(session.actualStart), 'HH:mm')}</p>}
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className={`mt-1 flex h-2 w-2 rounded-full ${session.status === 'ENDED' ? 'bg-emerald-500' : 'bg-muted'}`} />
                                <div>
                                    <p className={`text-sm font-bold uppercase tracking-tight ${session.status !== 'ENDED' && 'text-muted-foreground'}`}>Session Closed</p>
                                    {session.actualEnd && <p className="text-[10px] text-muted-foreground">{format(new Date(session.actualEnd), 'HH:mm')}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
