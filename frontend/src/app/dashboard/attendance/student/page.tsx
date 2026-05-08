"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, Filter, Loader2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { AttendanceService } from "@/services/attendanceService";
import { useRealtimeEvent } from "@/hooks/useRealtime";

const STATUS_OPTIONS = [
    { value: 'PRESENT', label: 'Present', color: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
    { value: 'ABSENT', label: 'Absent', color: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
    { value: 'LATE', label: 'Late', color: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
    { value: 'EXCUSED', label: 'Excused', color: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
];

export default function StudentAttendancePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const urlSessionId = searchParams.get('sessionId');

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Filters
    const [activeSessions, setActiveSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState(urlSessionId || "");
    const [selectedSessionData, setSelectedSessionData] = useState<any>(null);

    // Data
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, remarks: string, updatedAt?: string }>>({});

    useEffect(() => {
        fetchActiveSessions();
    }, []);

    useEffect(() => {
        if (selectedSessionId) {
            fetchSessionRoster();
        }
    }, [selectedSessionId]);

    const fetchActiveSessions = async () => {
        try {
            const res = await api.get('/attendance/sessions/active');
            setActiveSessions(res.data);
            if (!selectedSessionId && res.data.length > 0) {
                // Auto-select first active session if none in URL
                // setSelectedSessionId(res.data[0].id);
            }
        } catch (error) {
            console.error("Failed to fetch sessions", error);
        }
    };

    const fetchSessionRoster = async () => {
        setFetching(true);
        try {
            const sessionRes = await api.get(`/attendance/sessions/${selectedSessionId}`);
            const session = sessionRes.data;
            setSelectedSessionData(session);

            // Fetch students for this class/section
            const studentsRes = await api.get(`/students`, {
                params: { sectionId: session.sectionId }
            });
            const studentList = studentsRes.data;

            // Map existing attendance from session.records
            const initialData: Record<string, any> = {};
            studentList.forEach((student: any) => {
                const existingRecord = session.records.find((r: any) => r.studentId === student.id);
                initialData[student.id] = {
                    status: existingRecord ? existingRecord.status : 'ABSENT', // Default to Absent for manual marking?
                    remarks: existingRecord ? existingRecord.remarks || '' : '',
                    updatedAt: existingRecord?.updatedAt
                };
            });

            setStudents(studentList);
            setAttendanceData(initialData);
        } catch (error) {
            toast.error("Failed to load roster");
        } finally {
            setFetching(false);
        }
    };

    // Real-time updates
    useRealtimeEvent('attendance_update', (data: any) => {
        if (data.sessionId === selectedSessionId) {
            setAttendanceData(prev => ({
                ...prev,
                [data.studentId]: { 
                    ...prev[data.studentId], 
                    status: data.status,
                    updatedAt: new Date().toISOString()
                }
            }));
            // Optional: toast if it was a QR scan from another device
            if (data.type === 'QR') {
                // toast.success(`QR Scan detected`);
            }
        }
    });

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const records = students.map(student => ({
                studentId: student.id,
                date: selectedSessionData.date,
                sessionId: selectedSessionId,
                sectionId: selectedSessionData.sectionId,
                status: attendanceData[student.id].status,
                remarks: attendanceData[student.id].remarks
            }));

            await api.post('/attendance/bulk', { records });
            toast.success("Attendance updated");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setLoading(false);
        }
    };

    const markAll = (status: string) => {
        const newData = { ...attendanceData };
        students.forEach(s => {
            newData[s.id] = { ...newData[s.id], status };
        });
        setAttendanceData(newData);
        toast.info(`All students marked as ${status}`);
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-700 pb-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft size={22} />
                    </Button>
                    <div>
                        <h1 className="text-h1 font-semibold tracking-tight leading-none">Manual Roster</h1>
                        <p className="text-muted-foreground mt-1">Mark attendance manually for a session.</p>
                    </div>
                </div>

                <div className="w-full md:w-64">
                    <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
                        <SelectTrigger className="h-14 rounded-2xl bg-white shadow-sm border-border/50">
                            <SelectValue placeholder="Select Active Session" />
                        </SelectTrigger>
                        <SelectContent>
                            {activeSessions.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.name || `${s.class?.name}-${s.section?.name}`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {selectedSessionId ? (
                fetching ? (
                    <div className="flex flex-col items-center justify-center py-40 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-bold text-slate-400 uppercase tracking-widest">Loading Roster...</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Session Stats & Bulk Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <Card className="rounded-3xl border-border/50 shadow-sm bg-emerald-50/30">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                                        <CheckCircle2 size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-emerald-600 leading-none">
                                            {Object.values(attendanceData).filter(a => a.status === 'PRESENT').length}
                                        </div>
                                        <div className="text-xs font-bold text-emerald-600/60 uppercase">Present</div>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="rounded-3xl border-border/50 shadow-sm bg-rose-50/30">
                                <CardContent className="p-6 flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-200">
                                        <XCircle size={24} />
                                    </div>
                                    <div>
                                        <div className="text-2xl font-black text-rose-600 leading-none">
                                            {Object.values(attendanceData).filter(a => a.status === 'ABSENT').length}
                                        </div>
                                        <div className="text-xs font-bold text-rose-600/60 uppercase">Absent</div>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="md:col-span-2 flex gap-2">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-full rounded-3xl border-dashed border-emerald-200 text-emerald-600 hover:bg-emerald-50 font-bold uppercase tracking-tight"
                                    onClick={() => markAll('PRESENT')}
                                >
                                    Mark All Present
                                </Button>
                                <Button 
                                    variant="outline" 
                                    className="flex-1 h-full rounded-3xl border-dashed border-rose-200 text-rose-600 hover:bg-rose-50 font-bold uppercase tracking-tight"
                                    onClick={() => markAll('ABSENT')}
                                >
                                    Mark All Absent
                                </Button>
                            </div>
                        </div>

                        {/* Student Roster */}
                        <div className="space-y-4">
                            {students.map((student) => {
                                const currentStatus = attendanceData[student.id]?.status;
                                const option = STATUS_OPTIONS.find(o => o.value === currentStatus);
                                
                                return (
                                    <Card key={student.id} className="rounded-[2rem] border-border/50 shadow-sm overflow-hidden group hover:border-primary/20 transition-all">
                                        <CardContent className="p-6">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center text-xl font-bold text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {student.firstName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="text-xl font-bold text-slate-800 leading-tight">
                                                            {student.firstName} {student.lastName}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase border-border/50 text-muted-foreground">
                                                                {student.userId}
                                                            </Badge>
                                                            {attendanceData[student.id]?.updatedAt && (
                                                                <span className="text-[10px] font-bold text-muted-foreground flex items-center gap-1">
                                                                    <Clock size={10} />
                                                                    {new Date(attendanceData[student.id].updatedAt!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <button
                                                            key={opt.value}
                                                            onClick={() => handleStatusChange(student.id, opt.value)}
                                                            className={`h-12 px-5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                                                                currentStatus === opt.value
                                                                    ? `${opt.color} text-white shadow-lg shadow-${opt.value === 'PRESENT' ? 'emerald' : opt.value === 'ABSENT' ? 'rose' : 'amber'}-200`
                                                                    : 'bg-muted/50 text-slate-400 hover:bg-muted'
                                                            }`}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )
            ) : (
                <div className="flex flex-col items-center justify-center py-40 space-y-6 text-center">
                    <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center border-2 border-dashed border-border animate-pulse">
                        <Filter className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-slate-400">No Session Selected</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">Please select an active attendance session from the dropdown above to view the roster.</p>
                    </div>
                    <Button 
                        variant="outline" 
                        className="rounded-2xl h-12 px-8 font-bold border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => router.push('/dashboard/attendance/sessions')}
                    >
                        View All Sessions
                    </Button>
                </div>
            )}

            {/* Bottom Save Bar */}
            {selectedSessionId && students.length > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-md px-6 z-50">
                    <Card className="rounded-[2.5rem] bg-slate-900 border-none shadow-2xl text-white overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                            <div className="pl-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Draft Mode</div>
                                <div className="text-sm font-bold text-white mt-1">Changes not saved</div>
                            </div>
                            <Button 
                                className="h-14 px-10 rounded-[2rem] bg-primary text-white hover:bg-primary/90 font-black uppercase tracking-widest gap-2 shadow-xl"
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
                                Sync Changes
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
