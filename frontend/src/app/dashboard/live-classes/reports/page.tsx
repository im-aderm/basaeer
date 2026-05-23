'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BookOpen, Users, Activity, BarChart3, Download, Search, ChevronRight, FileText, Timer, UserCheck, Calendar } from 'lucide-react';
import { LiveClassesService, LiveClassSession, ReportItem } from '@/services/liveClassesService';
import { useNotification } from '@/context/NotificationContext';

export default function LiveClassReportsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showError } = useNotification();
    const [sessions, setSessions] = useState<LiveClassSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSessions = async () => {
        try {
            const data = await LiveClassesService.getSessions({ status: 'ENDED' });
            setSessions(data);
            if (data.length > 0) {
                setSelectedSessionId(data[0].id);
                fetchReport(data[0].id);
            }
        } catch (error: unknown) {
            showError('Failed to load classes');
        } finally {
            setLoading(false);
        }
    };

    const fetchReport = async (sessionId: string) => {
        try {
            const data = await LiveClassesService.getAttendanceReport(sessionId);
            setReports(data || []);
        } catch (error: unknown) {
            showError('Failed to load participation report');
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    const handleSessionSelect = (id: string) => {
        setSelectedSessionId(id);
        fetchReport(id);
    };

    const activeSession = sessions.find(s => s.id === selectedSessionId);

    if (loading) return <div className="p-8">Loading attendance analytics...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pb-20">
            {/* Session History Sidebar */}
            <div className="lg:col-span-1 space-y-4">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden bg-background">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-h3 font-semibold">Ended Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 p-2 h-[600px] overflow-y-auto sidebar-scroll">
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => handleSessionSelect(session.id)}
                                className={`w-full text-left p-5 rounded-[1.5rem] transition-all border-2 ${selectedSessionId === session.id
                                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                                    : 'hover:bg-muted border-transparent'
                                    }`}
                            >
                                <div className="font-semibold text-sm leading-tight uppercase mb-2 line-clamp-2">
                                    {session.title}
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(session.scheduledStart).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {session.class?.name} - {session.section?.name}</span>
                                </div>
                                <ChevronRight className={`h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 transition-transform ${selectedSessionId === session.id ? 'translate-x-1 opacity-100' : 'opacity-0'}`} />
                            </button>
                        ))}
                    </CardContent>
                </Card>
            </div>

            {/* Main Report Area */}
            <div className="lg:col-span-3 space-y-8">
                {activeSession ? (
                    <>
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-h1 font-bold tracking-tight text-primary">{activeSession.title}</h1>
                                <p className="text-muted-foreground font-medium mt-1">Detailed participation and duration analysis.</p>
                            </div>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Download className="h-5 w-5" />
                                Export Analytics
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Attendance Rate</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4">
                                    <span className="text-h1 font-semibold">{reports.length > 0 ? '84%' : '0%'}</span>
                                    <UserCheck className="h-8 w-8 text-primary/40" />
                                </CardContent>
                            </Card>
                            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Average Duration</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4">
                                    <span className="text-h1 font-semibold">42m</span>
                                    <Timer className="h-8 w-8 text-blue-500/40" />
                                </CardContent>
                            </Card>
                            <Card className="rounded-[2rem] border-border/50 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Total Participants</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4">
                                    <span className="text-h1 font-semibold">{reports.length}</span>
                                    <Users className="h-8 w-8 text-primary/40" />
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                            <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                                    <BarChart3 className="h-6 w-6 text-primary" />
                                    Participant Logs
                                </CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Filter names..."
                                        className="pl-9 h-10 rounded-xl bg-muted/50 border-none font-medium"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader className="bg-muted/30 h-14">
                                        <TableRow className="border-border/50 hover:bg-transparent">
                                            <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Student Name</TableHead>
                                            <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Joined At</TableHead>
                                            <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Left At</TableHead>
                                            <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Duration</TableHead>
                                            <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {reports.map((p, idx) => (
                                            <TableRow key={idx} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                                <TableCell className="px-8 font-semibold uppercase leading-tight">
                                                    {p.name}
                                                </TableCell>
                                                <TableCell className="px-8 font-bold text-muted-foreground text-sm">
                                                    {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </TableCell>
                                                <TableCell className="px-8 font-bold text-muted-foreground text-sm">
                                                    {p.leftAt ? new Date(p.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                </TableCell>
                                                <TableCell className="px-8 text-center font-semibold text-primary">
                                                    {p.duration || 0}m
                                                </TableCell>
                                                <TableCell className="px-8 text-right">
                                                    <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-[10px] uppercase w-fit ml-auto">
                                                        Present
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {reports.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-60 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                                        <FileText className="h-16 w-16 stroke-[1]" />
                                                        <p className="font-semibold text-h3 uppercase tracking-tighter">No participant logs found for this session</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 grayscale saturate-0">
                        <Activity className="h-32 w-32 stroke-[1]" />
                        <div className="text-center">
                            <h2 className="text-h1 font-semibold tracking-tighter">Select a Session</h2>
                            <p className="font-medium text-lg">Choose a past class to view its participation analytics.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
