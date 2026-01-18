'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Video, Plus, Calendar, Clock, BookOpen, Users, Activity, BarChart3, Settings as SettingsIcon, ExternalLink, Play, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { LiveClassesService, LiveClassSession, GoogleMeetConfig } from '@/services/liveClassesService';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function LiveClassesPage() {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<LiveClassSession[]>([]);
    const [config, setConfig] = useState<GoogleMeetConfig | null>(null);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
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
        subjectId: ''
    });

    const fetchInitialData = async () => {
        try {
            const [sessionsData, configData, classesData, subjectsData] = await Promise.all([
                LiveClassesService.getSessions(),
                user?.branchId ? LiveClassesService.getConfig(user.branchId) : Promise.resolve(null),
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setSessions(sessionsData);
            setConfig(configData);
            setClasses(classesData.data);
            setSubjects(subjectsData.data);
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [user?.branchId]);

    const handleCreateSession = async () => {
        if (!formData.title || !formData.classId || !formData.subjectId || !formData.scheduledStart) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await LiveClassesService.createSession({
                ...formData,
                branchId: user?.branchId
            });
            toast.success('Live class scheduled successfully');
            setIsDialogOpen(false);
            setSessions(await LiveClassesService.getSessions());
        } catch (error) {
            toast.error('Failed to schedule live class');
        }
    };

    const handleStartSession = async (id: string) => {
        try {
            const session = await LiveClassesService.startSession(id);
            window.open(session.hostUrl, '_blank');
            setSessions(await LiveClassesService.getSessions());
        } catch (error) {
            toast.error('Failed to start session');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-500/10 text-blue-600';
            case 'LIVE': return 'bg-emerald-500/10 text-emerald-600 animate-pulse';
            case 'ENDED': return 'bg-muted text-muted-foreground';
            case 'CANCELLED': return 'bg-destructive/10 text-destructive';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (loading) return <div className="p-8">Loading live class rooms...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Live Class Rooms</h1>
                    <p className="text-muted-foreground font-medium mt-1">Virtual learning spaces powered by Google Meet.</p>
                </div>

                <div className="flex gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsConfigOpen(true)}
                        className="h-14 px-6 rounded-2xl font-black gap-2 border-border/50 hover:bg-muted"
                    >
                        <SettingsIcon className="h-5 w-5" />
                        Infrastructure
                    </Button>
                    <Button
                        className="h-14 px-8 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <Plus className="h-6 w-6" />
                        Schedule Class
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Total Sessions</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{sessions.length}</span>
                        <Video className="h-8 w-8 text-primary/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Live Now</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{sessions.filter(s => s.status === 'LIVE').length}</span>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-blue-500/5 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Scheduled</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{sessions.filter(s => s.status === 'SCHEDULED' || s.status === 'UPCOMING').length}</span>
                        <Calendar className="h-8 w-8 text-blue-500/40" />
                    </CardContent>
                </Card>
                <Card className={`rounded-[2.5rem] border-border/50 shadow-xl border-l-4 ${config?.isEnabled ? 'bg-emerald-500/5 border-l-emerald-500' : 'bg-destructive/5 border-l-destructive'}`}>
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Platform Status</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-base font-black italic uppercase tracking-tighter">
                            {config?.isEnabled ? 'Connected' : 'Disconnected'}
                        </span>
                        {config?.isEnabled ? <ShieldCheck className="h-6 w-6 text-emerald-500/40" /> : <ShieldCheck className="h-6 w-6 text-destructive/40" />}
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <Play className="h-8 w-8 text-primary fill-primary" />
                        Active & Upcoming Sessions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black italic px-8 uppercase tracking-tighter text-muted-foreground">Session Title</TableHead>
                                <TableHead className="font-black italic px-8 uppercase tracking-tighter text-muted-foreground">Class & Subject</TableHead>
                                <TableHead className="font-black italic px-8 uppercase tracking-tighter text-muted-foreground">Time Schedule</TableHead>
                                <TableHead className="font-black italic px-8 uppercase tracking-tighter text-muted-foreground">Status</TableHead>
                                <TableHead className="font-black italic px-8 text-right uppercase tracking-tighter text-muted-foreground">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sessions.map((session) => (
                                <TableRow key={session.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8">
                                        <div className="space-y-1">
                                            <div className="font-black italic text-lg leading-tight uppercase">{session.title}</div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                <Users className="h-3 w-3" />
                                                By Prof. {session.host?.user?.firstName} {session.host?.user?.lastName}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-black w-fit uppercase tracking-tighter">{session.class?.name} - {session.section?.name}</div>
                                            <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-black w-fit uppercase tracking-tighter">{session.subject?.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1 font-bold italic text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(session.scheduledStart).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-4 w-4" />
                                                {new Date(session.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.scheduledEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest w-fit shadow-sm ${getStatusColor(session.status)}`}>
                                            {session.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-3">
                                            {session.status === 'LIVE' ? (
                                                <Button
                                                    className="h-12 px-8 rounded-2xl font-black gap-2 bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all"
                                                    onClick={() => window.open(user?.role === 'STUDENT' ? session.participantUrl : session.hostUrl, '_blank')}
                                                >
                                                    <ExternalLink className="h-5 w-5" />
                                                    {user?.role === 'STUDENT' ? 'Join Now' : 'Enter Room'}
                                                </Button>
                                            ) : (
                                                <>
                                                    {user?.role !== 'STUDENT' && (
                                                        <Button
                                                            variant="outline"
                                                            className="h-12 px-6 rounded-2xl font-black border-border/50 text-emerald-600 hover:bg-emerald-500/5 hover:border-emerald-500/20 gap-2"
                                                            disabled={session.status === 'ENDED'}
                                                            onClick={() => handleStartSession(session.id)}
                                                        >
                                                            <Play className="h-4 w-4 fill-emerald-600" />
                                                            Launch
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/5">
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {sessions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                            <Video className="h-24 w-24 stroke-[1]" />
                                            <p className="font-black italic text-2xl uppercase tracking-tighter">No live sessions found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Schedule Exam Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Configure Virtual Classroom</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="col-span-2 space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Session Topic</Label>
                            <Input
                                placeholder="e.g. Introduction to Quantum Physics"
                                className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Target Class</Label>
                            <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none text-muted-foreground">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Session Subject</Label>
                            <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                                <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none text-muted-foreground">
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl">
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Start Time</Label>
                            <Input
                                type="datetime-local"
                                className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                value={formData.scheduledStart}
                                onChange={(e) => setFormData({ ...formData, scheduledStart: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Estimated End Time</Label>
                            <Input
                                type="datetime-local"
                                className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                value={formData.scheduledEnd}
                                onChange={(e) => setFormData({ ...formData, scheduledEnd: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2 space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest ml-1">Additional Instructions (Optional)</Label>
                            <textarea
                                className="w-full min-h-[100px] rounded-2xl p-4 bg-muted/50 border-none font-bold text-sm focus:ring-2 ring-primary/20 outline-none"
                                placeholder="Materials to bring, pre-reading, etc..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" className="rounded-2xl h-12 font-bold px-8" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button className="rounded-2xl h-12 font-black px-12" onClick={handleCreateSession}>Provision Session</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Infrastructure Config Dialog */}
            <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic">Infrastructure Hub</DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-8">
                        <div className="p-6 rounded-3xl bg-muted/20 border border-border/50 space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="font-black italic uppercase tracking-tighter text-lg">Google Meet Engine</p>
                                    <p className="text-xs font-bold text-muted-foreground">External infrastructure connector</p>
                                </div>
                                <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config?.isEnabled ? 'bg-emerald-500/10 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}>
                                    {config?.isEnabled ? 'Active' : 'Offline'}
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full h-12 rounded-xl font-bold border-border/50 gap-2"
                                onClick={async () => {
                                    if (user?.branchId) {
                                        const res = await LiveClassesService.testConnection(user.branchId);
                                        if (res.success) toast.success('Connection handshake successful');
                                        else toast.error('Connection failed');
                                    }
                                }}
                            >
                                <Activity className="h-4 w-4" />
                                Test Handshake
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center px-2">
                                <Label className="font-black italic uppercase tracking-tighter text-muted-foreground">Auto-Provisioning</Label>
                                <div className="h-6 w-11 rounded-full bg-emerald-500 shadow-inner flex items-center px-1">
                                    <div className="h-4 w-4 rounded-full bg-white translate-x-5" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center px-2">
                                <Label className="font-black italic uppercase tracking-tighter text-muted-foreground">Session Recording</Label>
                                <div className="h-6 w-11 rounded-full bg-muted shadow-inner flex items-center px-1">
                                    <div className="h-4 w-4 rounded-full bg-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
