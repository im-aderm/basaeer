"use client";

import { useState, useEffect } from "react";
import { Plus, Clock, Users, BookOpen, Lock, Unlock, Play, ChevronRight, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export default function AttendanceSessionsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);

    // Create Session Form
    const [newSession, setNewSession] = useState({
        name: "",
        classId: "",
        sectionId: "",
        subjectId: "",
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchSessions();
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setClasses(classesRes.data);
            setSubjects(subjectsRes.data);
        } catch (error) {
            toast.error("Failed to load initial data");
        }
    };

    const handleClassChange = async (classId: string) => {
        setNewSession({ ...newSession, classId, sectionId: "" });
        try {
            const res = await api.get(`/sections/class/${classId}`);
            setSections(res.data);
        } catch (error) {
            toast.error("Failed to load sections");
        }
    };

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/attendance/sessions/active');
            setSessions(res.data);
        } catch (error) {
            toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        if (!newSession.classId || !newSession.sectionId) {
            toast.error("Please select class and section");
            return;
        }

        try {
            const res = await api.post('/attendance/sessions', newSession);
            toast.success("Session started successfully");
            fetchSessions();
            setNewSession({
                name: "",
                classId: "",
                sectionId: "",
                subjectId: "",
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            toast.error("Failed to start session");
        }
    };

    const handleCloseSession = async (id: string) => {
        try {
            await api.patch(`/attendance/sessions/${id}/close`);
            toast.success("Session closed");
            fetchSessions();
        } catch (error) {
            toast.error("Failed to close session");
        }
    };

    const handleLockSession = async (id: string) => {
        if (!confirm("Are you sure? Locking will prevent any further attendance changes for this session.")) return;
        try {
            await api.post(`/attendance/sessions/${id}/lock`);
            toast.success("Session locked permanently");
            fetchSessions();
        } catch (error) {
            toast.error("Failed to lock session");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            <div>
                <h1 className="text-h1 font-bold tracking-tight text-primary">Attendance Sessions</h1>
                <p className="text-muted-foreground font-medium">Start and manage classroom attendance windows.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* New Session Form */}
                <Card className="rounded-[2.5rem] shadow-sm border-border/50 h-fit">
                    <CardHeader className="p-8">
                        <CardTitle className="flex items-center gap-2">
                            <Plus className="w-6 h-6 text-primary" />
                            Start New Session
                        </CardTitle>
                        <CardDescription>Initiate a scan window for students.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Session Name (Optional)</label>
                                <Input 
                                    placeholder="e.g. Morning Check-in" 
                                    className="h-12 rounded-xl bg-muted/30"
                                    value={newSession.name}
                                    onChange={e => setNewSession({...newSession, name: e.target.value})}
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Class</label>
                                <Select value={newSession.classId} onValueChange={handleClassChange}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Section</label>
                                <Select value={newSession.sectionId} onValueChange={v => setNewSession({...newSession, sectionId: v})} disabled={!newSession.classId}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="Select Section" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground ml-1">Subject (Optional)</label>
                                <Select value={newSession.subjectId} onValueChange={v => setNewSession({...newSession, subjectId: v})}>
                                    <SelectTrigger className="h-12 rounded-xl">
                                        <SelectValue placeholder="General Attendance" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button 
                            className="w-full h-14 rounded-2xl font-bold uppercase tracking-wider gap-2 shadow-lg shadow-primary/20"
                            onClick={handleCreateSession}
                        >
                            <Play className="w-5 h-5 fill-current" />
                            Start Session
                        </Button>
                    </CardContent>
                </Card>

                {/* Active Sessions List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-h3 font-semibold uppercase tracking-tight text-muted-foreground">Active Windows</h3>
                        <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-600 border-emerald-100 px-3 py-1">
                            {sessions.length} Live
                        </Badge>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : sessions.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {sessions.map((session) => (
                                <Card key={session.id} className="rounded-[2.5rem] border-border/50 hover:border-primary/20 transition-all group">
                                    <CardContent className="p-8 space-y-6">
                                        <div className="flex justify-between items-start">
                                            <div className="p-4 rounded-3xl bg-primary/10 text-primary">
                                                <Clock className="w-8 h-8" />
                                            </div>
                                            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full px-4 py-1">ACTIVE</Badge>
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-2xl font-bold text-slate-800">{session.name || "Untitled Session"}</h4>
                                            <div className="flex items-center gap-2 mt-1 text-muted-foreground font-medium">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(session.date), 'PPP')}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3 text-sm font-semibold">
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-slate-600">{session.class?.name} - {session.section?.name}</span>
                                            </div>
                                            {session.subject && (
                                                <div className="flex items-center gap-3 text-sm font-semibold">
                                                    <BookOpen className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-slate-600">{session.subject?.name}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 pt-4">
                                            <Button 
                                                variant="outline" 
                                                className="rounded-2xl h-12 font-bold border-border/50 hover:bg-muted group-hover:border-primary/20"
                                                onClick={() => router.push(`/dashboard/qr-attendance?sessionId=${session.id}`)}
                                            >
                                                Scan QR
                                            </Button>
                                            <div className="flex gap-2">
                                                <Button 
                                                    className="flex-1 rounded-2xl h-12 font-bold bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                    onClick={() => handleCloseSession(session.id)}
                                                    title="Close Session (Still Editable)"
                                                >
                                                    End
                                                </Button>
                                                <Button 
                                                    className="flex-1 rounded-2xl h-12 font-bold bg-slate-900 text-white hover:bg-red-500 transition-colors gap-2"
                                                    onClick={() => handleLockSession(session.id)}
                                                    title="Lock Session (Permanent)"
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-muted/10 rounded-[3rem] border-2 border-dashed border-border p-20 text-center space-y-4">
                            <Clock className="w-16 h-16 mx-auto text-muted-foreground/20" />
                            <div>
                                <h4 className="text-xl font-bold text-slate-400">No Active Sessions</h4>
                                <p className="text-muted-foreground max-w-xs mx-auto">Start a session to begin marking attendance via QR or Manual Roster.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
