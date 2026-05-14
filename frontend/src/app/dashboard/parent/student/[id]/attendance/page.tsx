'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Filter
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { toast } from 'sonner';

export default function ChildAttendancePage() {
    const { id } = useParams();
    const router = useRouter();
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StakeholderService.getChildAttendance(id as string);
                setAttendance(data);
            } catch (error) {
                toast.error('Failed to load attendance records');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const stats = {
        present: (attendance ?? []).filter(a => a.status === 'PRESENT').length,
        absent: (attendance ?? []).filter(a => a.status === 'ABSENT').length,
        late: (attendance ?? []).filter(a => a.status === 'LATE').length,
        total: attendance.length
    };

    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    if (loading) return <div className="flex h-96 items-center justify-center font-semibold animate-pulse uppercase">Loading Attendance...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-12 w-12 border border-border/50"
                    onClick={() => router.push(`/dashboard/parent/student/${id}`)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase">Attendance History</h1>
                    <p className="text-muted-foreground font-medium mt-1">Daily presence logs and patterns.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background p-6 space-y-2">
                    <p className="text-[10px] font-semibold uppercase opacity-50">Attendance Rate</p>
                    <div className="text-h1 font-semibold text-primary">{attendanceRate}%</div>
                </Card>
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background p-6 space-y-2">
                    <p className="text-[10px] font-semibold uppercase opacity-50">Present Days</p>
                    <div className="text-h1 font-semibold text-emerald-500">{stats.present}</div>
                </Card>
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background p-6 space-y-2">
                    <p className="text-[10px] font-semibold uppercase opacity-50">Absent Days</p>
                    <div className="text-h1 font-semibold text-rose-500">{stats.absent}</div>
                </Card>
                <Card className="rounded-[2rem] border-border/50 shadow-xl bg-background p-6 space-y-2">
                    <p className="text-[10px] font-semibold uppercase opacity-50">Late Arrivals</p>
                    <div className="text-h1 font-semibold text-amber-500">{stats.late}</div>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-3">
                            <CalendarIcon className="h-8 w-8 text-primary" />
                            Daily Logs
                        </CardTitle>
                        <CardDescription className="font-bold font-sm">Comprehensive list of all recorded sessions.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="p-6 font-semibold uppercase text-xs opacity-50">Date</th>
                                    <th className="p-6 font-semibold uppercase text-xs opacity-50">Status</th>
                                    <th className="p-6 font-semibold uppercase text-xs opacity-50">Remarks</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.length > 0 ? attendance.map((record, idx) => (
                                    <tr key={record.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                                        <td className="p-6 font-bold text-sm">
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className="p-6">
                                            <Badge
                                                className={`rounded-xl px-4 py-1.5 font-semibold uppercase text-[10px] ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        record.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-500' :
                                                            'bg-amber-500/10 text-amber-500'
                                                    }`}
                                            >
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 font-medium text-sm text-muted-foreground">
                                            {record.remarks || 'No remarks provided'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center font-semibold uppercase opacity-20 text-2xl">
                                            No attendance records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
