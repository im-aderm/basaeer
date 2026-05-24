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
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function ChildAttendancePage() {
    const { id } = useParams();
    const router = useRouter();
    const { showError } = useNotification();
    const [attendance, setAttendance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StakeholderService.getChildAttendance(id as string);
                setAttendance(data);
            } catch (error) {
                showError('Failed to load attendance records');
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

    if (loading) return <div className="flex h-96 items-center justify-center font-semibold animate-pulse">Loading Attendance...</div>;

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
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Attendance History</h1>
                    <p className="text-foreground/60 font-medium mt-1">Daily presence logs and patterns.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-background p-4 space-y-2 ${STAT_CARD}`}>
                    <p className={STAT_LABEL}>Attendance Rate</p>
                    <div className={STAT_VALUE + " text-primary"}>{attendanceRate}%</div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-background p-4 space-y-2 ${STAT_CARD}`}>
                    <p className={STAT_LABEL}>Present Days</p>
                    <div className={STAT_VALUE + " text-emerald-500"}>{stats.present}</div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-background p-4 space-y-2 ${STAT_CARD}`}>
                    <p className={STAT_LABEL}>Absent Days</p>
                    <div className={STAT_VALUE + " text-rose-500"}>{stats.absent}</div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-background p-4 space-y-2 ${STAT_CARD}`}>
                    <p className={STAT_LABEL}>Late Arrivals</p>
                    <div className={STAT_VALUE + " text-amber-500"}>{stats.late}</div>
                </Card>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl bg-background overflow-hidden">
                <CardHeader className="p-4 border-b border-primary/20 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-[14px] font-semibold uppercase flex items-center gap-3">
                            <CalendarIcon className="h-5 w-5 text-primary" />
                            Daily Logs
                        </CardTitle>
                        <CardDescription className="font-bold text-[12px]">Comprehensive list of all recorded sessions.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Date</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {attendance.length > 0 ? attendance.map((record, idx) => (
                                    <tr key={record.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            {new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <Badge
                                                className={`rounded-xl px-4 py-1.5 font-semibold uppercase text-[10px] ${record.status === 'PRESENT' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        record.status === 'ABSENT' ? 'bg-rose-500/10 text-rose-500' :
                                                            'bg-amber-500/10 text-amber-500'
                                                    }`}
                                            >
                                                {record.status}
                                            </Badge>
                                        </td>
                                        <td className={TABLE_CELL + " text-foreground/60"}>
                                            {record.remarks || 'No remarks provided'}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center font-semibold uppercase text-foreground/60 text-[12px]">
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
