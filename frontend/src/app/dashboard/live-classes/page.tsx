'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Video, Plus, Calendar, Clock, BookOpen, Users, Activity, BarChart3,
    Settings as SettingsIcon, ExternalLink, Play, Trash2, ShieldCheck,
    CheckCircle2, AlertCircle, RefreshCcw, MoreVertical, Link
} from 'lucide-react';
import { LiveClassesService, LiveClassSession, GoogleMeetConfig } from '@/services/liveClassesService';
import { toast } from 'sonner';
import api from '@/lib/api';
import { format } from 'date-fns';
import { Suspense } from 'react';

interface SimpleClass {
    id: string;
    name: string;
}

interface SimpleSubject {
    id: string;
    name: string;
}

function LiveClassesContent() {
    const { user } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [sessions, setSessions] = useState<LiveClassSession[]>([]);
    const [config, setConfig] = useState<GoogleMeetConfig | null>(null);
    const [classes, setClasses] = useState<SimpleClass[]>([]);
    const [subjects, setSubjects] = useState<SimpleSubject[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledStart: '',
        scheduledEnd: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isRecurring: false,
        recurrenceRule: ''
    });

    // Auth redirect handling
    useEffect(() => {
        const authStatus = searchParams.get('auth');
        if (authStatus === 'success') {
            toast.success('Successfully authorized Google Meet');
            router.replace('/dashboard/live-classes');
            fetchInitialData();
        } else if (authStatus === 'error') {
            toast.error(searchParams.get('message') || 'Failed to authorize Google Meet');
            router.replace('/dashboard/live-classes');
        }
    }, [searchParams]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [sessionsData, configData, classesData, subjectsData] = await Promise.all([
                LiveClassesService.getSessions(),
                LiveClassesService.getConfig(user?.branchId!),
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setSessions(sessionsData);
            setConfig(configData);
            setClasses(classesData.data || []);
            setSubjects(subjectsData.data || []);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.branchId) {
            fetchInitialData();
        }
    }, [user?.branchId]);

    const handleCreateSession = async () => {
        if (!formData.title || !formData.classId || !formData.subjectId || !formData.scheduledStart) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            if (!user?.branchId) throw new Error('No branch context');
            await LiveClassesService.createSession({
                ...formData,
                branchId: user.branchId
            });
            toast.success('Live class scheduled successfully');
            setIsDialogOpen(false);
            fetchInitialData();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Failed to schedule live class';
            toast.error(message);
        }
    };

    const handleAuthorize = async () => {
        try {
            const { url } = await LiveClassesService.getAuthUrl(user?.branchId!);
            window.location.href = url;
        } catch (error) {
            toast.error('Failed to initiate authorization');
        }
    };

    const handleStartSession = async (id: string) => {
        try {
            const session = await LiveClassesService.startSession(id);
            window.open(session.hostUrl, '_blank');
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const handleDeleteSession = async (id: string) => {
        if (!confirm('Are you sure you want to cancel this session?')) return;
        try {
            await LiveClassesService.cancelSession(id);
            toast.success('Session cancelled');
            fetchInitialData();
        } catch (error) {
            toast.error('Failed to cancel session');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">Scheduled</Badge>;
            case 'LIVE': return <Badge className="bg-emerald-500 text-white animate-pulse">Live Now</Badge>;
            case 'ENDED': return <Badge variant="secondary">Ended</Badge>;
            case 'CANCELLED': return <Badge variant="destructive">Cancelled</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    const upcomingSessions = sessions.filter(s => s.status === 'SCHEDULED');
    const liveSessions = sessions.filter(s => s.status === 'LIVE');
    const pastSessions = sessions.filter(s => s.status === 'ENDED' || s.status === 'CANCELLED');

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Synchronizing live classrooms...</p>
        </div>
    );

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight">Live Classrooms</h1>
                    <p className="text-muted-foreground mt-1">Institutional Google Meet integration for seamless teaching.</p>
                </div>
                {(user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN') && (
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setIsConfigOpen(true)}>
                            <SettingsIcon className="mr-2 h-4 w-4" />
                            Infrastructure
                        </Button>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                                    <Plus className="mr-2 h-5 w-5" />
                                    Schedule Class
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Schedule Live Class</DialogTitle>
                                    <DialogDescription>Create a new Google Meet session for your students.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Class Title *</Label>
                                        <Input
                                            id="title"
                                            placeholder="e.g. Advanced Mathematics - Calculus II"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Class *</Label>
                                            <Select onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                                                <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Subject *</Label>
                                            <Select onValueChange={(val) => setFormData({ ...formData, subjectId: val })}>
                                                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Start Time *</Label>
                                            <Input type="datetime-local" value={formData.scheduledStart} onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>End Time (Optional)</Label>
                                            <Input type="datetime-local" value={formData.scheduledEnd} onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                                        <div className="space-y-0.5">
                                            <Label className="text-base">Recurring Class</Label>
                                            <p className="text-xs text-muted-foreground">Schedule this class for multiple dates.</p>
                                        </div>
                                        <Switch checked={formData.isRecurring} onCheckedChange={(val) => setFormData({ ...formData, isRecurring: val })} />
                                    </div>
                                    {formData.isRecurring && (
                                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                                            <Label>Recurrence Rule</Label>
                                            <Select onValueChange={(val) => setFormData({ ...formData, recurrenceRule: val })}>
                                                <SelectTrigger><SelectValue placeholder="Frequency" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR">Every Weekday</SelectItem>
                                                    <SelectItem value="FREQ=WEEKLY">Weekly</SelectItem>
                                                    <SelectItem value="FREQ=DAILY">Daily</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                </div>
                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                    <Button onClick={handleCreateSession}>Schedule Session</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <div className="p-4">
                        <p className="text-sm font-medium text-blue-600">Upcoming Sessions</p>
                        <h3 className="text-2xl font-bold mt-1">{upcomingSessions.length}</h3>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <div className="p-4">
                        <p className="text-sm font-medium text-emerald-600">Active Classes</p>
                        <h3 className="text-2xl font-bold mt-1">{liveSessions.length}</h3>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-purple-500 shadow-sm">
                    <div className="p-4">
                        <p className="text-sm font-medium text-purple-600">Attendance Rate</p>
                        <h3 className="text-2xl font-bold mt-1">92%</h3>
                    </div>
                </Card>
                <Card className={`border-l-4 shadow-sm ${config?.isAuthorized ? 'border-l-emerald-500' : 'border-l-amber-500'}`}>
                    <div className="p-4">
                        <p className={`text-sm font-medium ${config?.isAuthorized ? 'text-emerald-600' : 'text-amber-600'}`}>Google Auth</p>
                        <h3 className="text-2xl font-bold mt-1">{config?.isAuthorized ? 'Healthy' : 'Required'}</h3>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="live">Live Now</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {upcomingSessions.length > 0 ? (
                            upcomingSessions.map((session) => (
                                <Card key={session.id} className="overflow-hidden group hover:shadow-lg transition-all">
                                    <div className="bg-muted px-4 py-2 flex justify-between items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>{session.timezone}</span>
                                        {session.isRecurring && <RefreshCcw className="h-3 w-3" />}
                                    </div>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">{session.title}</CardTitle>
                                        <CardDescription className="flex items-center gap-1.5">
                                            <BookOpen className="h-3.5 w-3.5" />
                                            {session.subject?.name} • Class {session.class?.name}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="pb-4 space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(new Date(session.scheduledStart), 'MMM dd')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 font-bold text-primary">
                                                <Clock className="h-4 w-4" />
                                                <span>{format(new Date(session.scheduledStart), 'HH:mm')}</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-0 flex gap-2">
                                        <Button className="flex-1" size="sm" onClick={() => handleStartSession(session.id)}>
                                            {user?.role === 'STUDENT' ? 'View Details' : 'Launch Room'}
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/live-classes/${session.id}`)}>
                                            <Activity className="h-4 w-4" />
                                        </Button>
                                        {(user?.role === 'STAFF' || user?.role === 'SUPER_ADMIN') && (
                                            <Button variant="ghost" size="sm" className="text-destructive h-9 w-9 p-0 hover:bg-destructive/10" onClick={() => handleDeleteSession(session.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center border-2 border-dashed rounded-2xl bg-muted/10">
                                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                <h3 className="text-xl font-bold tracking-tight">No sessions scheduled</h3>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="live" className="pt-4 space-y-4">
                    {liveSessions.length > 0 ? (
                        liveSessions.map(session => (
                            <Card key={session.id} className="border-l-4 border-l-emerald-500">
                                <CardContent className="p-6 flex flex-col md:flex-row items-center gap-6">
                                    <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <Video className="h-8 w-8" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-h3 font-semibold">{session.title}</h3>
                                            <Badge className="bg-emerald-500 animate-pulse">ACTIVE</Badge>
                                        </div>
                                        <p className="text-muted-foreground text-sm uppercase font-bold tracking-tighter">
                                            {session.subject?.name} • Class {session.class?.name} • Host: {session.host?.user?.firstName}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700" size="lg" onClick={() => window.open(session.hostUrl, '_blank')}>
                                            <ExternalLink className="mr-2 h-4 w-4" /> Join Room
                                        </Button>
                                        <Button variant="outline" size="lg" onClick={() => router.push(`/dashboard/live-classes/${session.id}`)}>
                                            <Activity className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <div className="py-20 text-center bg-muted/5 border-2 border-dashed rounded-3xl">
                            <Activity className="mx-auto h-16 w-16 text-muted-foreground/20 animate-pulse" />
                            <p className="mt-4 text-muted-foreground font-semibold uppercase tracking-widest">No active sessions right now</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="pt-4">
                    <Card className="rounded-2xl overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>Session</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Recording</TableHead>
                                    <TableHead className="text-right">Analytics</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pastSessions.length > 0 ? (
                                    pastSessions.map((session) => (
                                        <TableRow key={session.id}>
                                            <TableCell className="font-bold">{session.title}</TableCell>
                                            <TableCell className="text-sm">
                                                {format(new Date(session.scheduledStart), 'MMM dd, yyyy')}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(session.status)}</TableCell>
                                            <TableCell>
                                                {session.recordingUrl ? (
                                                    <Button variant="outline" size="sm" className="h-8 gap-2" onClick={() => window.open(session.recordingUrl, '_blank')}>
                                                        <Play className="h-3 w-3 fill-primary text-primary" /> Cloud Play
                                                    </Button>
                                                ) : <span className="text-xs text-muted-foreground">None</span>}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" onClick={() => router.push(`/dashboard/live-classes/${session.id}`)}>
                                                    <BarChart3 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">No past history found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Infrastructure */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Google Meet Connection</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 pt-4">
                        <div className={`p-4 rounded-2xl border flex items-center justify-between ${config?.isAuthorized ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                            <div className="flex items-center gap-3">
                                {config?.isAuthorized ? <CheckCircle2 className="h-6 w-6 text-emerald-600" /> : <AlertCircle className="h-6 w-6 text-amber-600" />}
                                <div>
                                    <p className="font-bold text-sm">Status: {config?.isAuthorized ? 'Authorized' : 'Action Required'}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-semibold">Institutional OAuth2 Flow</p>
                                </div>
                            </div>
                            <Button size="sm" variant={config?.isAuthorized ? 'outline' : 'default'} onClick={handleAuthorize}>
                                {config?.isAuthorized ? 'Modify' : 'Connect'}
                            </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1 p-3 border rounded-xl">
                                <Label className="text-[10px] uppercase font-semibold text-muted-foreground">Default Duration</Label>
                                <p className="font-bold underline">{config?.defaultDuration || 60} min</p>
                            </div>
                            <div className="space-y-1 p-3 border rounded-xl">
                                <Label className="text-[10px] uppercase font-semibold text-muted-foreground">Cloud Recording</Label>
                                <p className="font-bold underline text-emerald-600">{config?.allowRecording ? 'Enabled' : 'Disabled'}</p>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function LiveClassesPage() {
    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <RefreshCcw className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground font-medium">Synchronizing live classrooms...</p>
            </div>
        }>
            <LiveClassesContent />
        </Suspense>
    );
}
