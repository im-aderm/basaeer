'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Users, Activity, BarChart3, Download, Search, ChevronRight, FileText, Timer, UserCheck, Calendar } from 'lucide-react';
import { LiveClassesService, LiveClassSession, ReportItem } from '@/services/liveClassesService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

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

    if (loading) return <div className="p-4">Loading attendance analytics...</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-20">
            {/* Session History Sidebar */}
            <div className="lg:col-span-1 space-y-3">
                <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden bg-background">
                    <CardHeader className="pb-3 p-4">
                        <CardTitle className="text-[14px] font-semibold">Ended Sessions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 p-2 h-[600px] overflow-y-auto sidebar-scroll">
                        {sessions.map(session => (
                            <button
                                key={session.id}
                                onClick={() => handleSessionSelect(session.id)}
                                className={`w-full text-left p-3 rounded-2xl transition-all border-2 ${selectedSessionId === session.id
                                    ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5'
                                    : 'hover:bg-muted border-transparent'
                                    }`}
                            >
                                <div className="font-semibold text-[12px] leading-tight uppercase mb-1 line-clamp-2">
                                    {session.title}
                                </div>
                                <div className="flex flex-col gap-1 text-[10px] font-bold text-foreground/60 uppercase tracking-widest">
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
                                <h1 className="text-[20px] font-bold tracking-tight text-primary">{activeSession.title}</h1>
                                <p className="text-foreground/60 font-medium mt-1">Detailed participation and duration analysis.</p>
                            </div>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Download className="h-5 w-5" />
                                Export Analytics
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="rounded-2xl border-primary/20 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-[12px] font-semibold uppercase tracking-widest text-foreground/60">Attendance Rate</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <span className="text-[20px] font-semibold">84%</span>
                                    <UserCheck className="h-8 w-8 text-primary/40" />
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border-primary/20 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-[12px] font-semibold uppercase tracking-widest text-foreground/60">Average Duration</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <span className="text-[20px] font-semibold">42m</span>
                                    <Timer className="h-8 w-8 text-blue-500/40" />
                                </CardContent>
                            </Card>
                            <Card className="rounded-2xl border-primary/20 shadow-xl bg-muted/20">
                                <CardHeader className="pb-2 p-4"><CardTitle className="text-[12px] font-semibold uppercase tracking-widest text-foreground/60">Total Participants</CardTitle></CardHeader>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <span className="text-[20px] font-semibold">{reports.length}</span>
                                    <Users className="h-8 w-8 text-primary/40" />
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                            <CardHeader className="p-4 border-b border-primary/20 flex flex-row items-center justify-between">
                                <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                                    <BarChart3 className="h-5 w-5 text-primary" />
                                    Participant Logs
                                </CardTitle>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                                    <Input
                                        placeholder="Filter names..."
                                        className="pl-9 h-9 rounded-xl bg-muted/50 border-none font-medium text-[12px]"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className={TABLE_ROOT}>
                                        <thead className={TABLE_HEADER}>
                                            <tr>
                                                <th className={TABLE_HEADER_CELL_NO_SORT}>Student Name</th>
                                                <th className={TABLE_HEADER_CELL_NO_SORT}>Joined At</th>
                                                <th className={TABLE_HEADER_CELL_NO_SORT}>Left At</th>
                                                <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Duration</th>
                                                <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className={TABLE_BODY}>
                                            {reports.map((p, idx) => (
                                                <tr key={idx} className={TABLE_ROW}>
                                                    <td className={TABLE_CELL_PRIMARY}>
                                                        {p.name}
                                                    </td>
                                                    <td className={TABLE_CELL + " text-foreground/60"}>
                                                        {new Date(p.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className={TABLE_CELL + " text-foreground/60"}>
                                                        {p.leftAt ? new Date(p.leftAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                    </td>
                                                    <td className={TABLE_CELL + " text-center text-primary font-semibold"}>
                                                        {p.duration || 0}m
                                                    </td>
                                                    <td className={TABLE_CELL + " text-right"}>
                                                        <div className="px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-[10px] uppercase w-fit ml-auto">
                                                            Present
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {reports.length === 0 && (
                                                <tr>
                                                    <td colSpan={5} className="py-12 text-center">
                                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                                            <FileText className="h-16 w-16 stroke-[1]" />
                                                            <p className="font-semibold text-[12px] uppercase tracking-tighter">No participant logs found for this session</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-6 opacity-30 grayscale saturate-0">
                        <Activity className="h-32 w-32 stroke-[1]" />
                        <div className="text-center">
                            <h2 className="text-[20px] font-semibold tracking-tighter">Select a Session</h2>
                            <p className="font-medium text-[12px]">Choose a past class to view its participation analytics.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
