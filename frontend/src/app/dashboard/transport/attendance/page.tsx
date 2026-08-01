"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, Loader2, Search, CheckCircle2, XCircle, Bus, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { transportService, TransportAttendanceRecord } from "@/services/transportService";
import { StudentService, Student } from "@/services/studentService";
import { useNotification } from "@/context/NotificationContext";
import { format } from "date-fns";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL } from '@/lib/table-styles';

export default function TransportAttendancePage() {
    const { showSuccess, showError } = useNotification();
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [type, setType] = useState<'PICKUP' | 'DROPOFF'>('PICKUP');
    const [records, setRecords] = useState<TransportAttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        try {
            const data = await StudentService.getAll();
            setStudents((data ?? []).filter(s => s.transportAssignment));
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            showError("Failed to load assigned students");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRecord = async (status: 'PRESENT' | 'ABSENT') => {
        const student = students.find(s => s.id === selectedStudentId);
        const assignmentId = student?.transportAssignment?.id;
        if (!assignmentId) {
            showError("Select a student with an active transport assignment");
            return;
        }
        setSubmitting(true);
        try {
            const record = await transportService.recordAttendance({
                studentId: selectedStudentId,
                assignmentId,
                type,
                status,
                date: new Date().toISOString(),
            });
            setRecords(prev => [{ ...record, assignment: { vehicle: student.transportAssignment?.vehicle as any, route: student.transportAssignment?.route as any } }, ...prev]);
            showSuccess(`Marked ${status.toLowerCase()} for ${type.toLowerCase()}`);
            setSelectedStudentId("");
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            showError("Failed to record attendance");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <RequireBranch requireSpecificBranch>
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        </RequireBranch>
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                <BranchContextBanner />
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <ClipboardCheck className="text-primary w-9 h-9" />
                        Pickup &amp; Dropoff Attendance
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Mark students present or absent as they board or leave the vehicle.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="rounded-[2rem] border-border/50 shadow-xl lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">Select Student</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                <input
                                    placeholder="Search assigned students..."
                                    className="w-full pl-12 pr-4 py-3 bg-muted/30 border-none rounded-xl font-semibold text-sm"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                {filteredStudents.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => setSelectedStudentId(s.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${selectedStudentId === s.id ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/40'}`}
                                    >
                                        <p className="font-semibold text-sm">{s.firstName} {s.lastName}</p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                            <Bus size={12} /> {s.transportAssignment?.vehicle?.registrationNumber || 'N/A'}
                                            <Route size={12} className="ml-2" /> {s.transportAssignment?.route?.name || 'N/A'}
                                        </p>
                                    </button>
                                ))}
                                {filteredStudents.length === 0 && (
                                    <p className="col-span-full text-center py-8 text-muted-foreground text-sm">No transport-assigned students found.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2rem] border-border/50 shadow-xl border-t-8 border-t-primary/20 h-fit">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-semibold">Record</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Button
                                    variant={type === 'PICKUP' ? 'default' : 'outline'}
                                    className="flex-1 rounded-xl font-semibold"
                                    onClick={() => setType('PICKUP')}
                                >
                                    Pickup
                                </Button>
                                <Button
                                    variant={type === 'DROPOFF' ? 'default' : 'outline'}
                                    className="flex-1 rounded-xl font-semibold"
                                    onClick={() => setType('DROPOFF')}
                                >
                                    Dropoff
                                </Button>
                            </div>
                            <Button
                                disabled={!selectedStudentId || submitting}
                                onClick={() => handleRecord('PRESENT')}
                                className="w-full h-12 rounded-xl font-semibold gap-2 bg-primary"
                            >
                                <CheckCircle2 size={18} /> Mark Present
                            </Button>
                            <Button
                                disabled={!selectedStudentId || submitting}
                                onClick={() => handleRecord('ABSENT')}
                                variant="outline"
                                className="w-full h-12 rounded-xl font-semibold gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                            >
                                <XCircle size={18} /> Mark Absent
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-[2rem] border-border/50 shadow-xl overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Today's Log</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead>
                                    <tr className={TABLE_HEADER}>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Time</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Type</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Vehicle</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Route</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    {records.map(r => (
                                        <tr key={r.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL_PRIMARY}>{format(new Date(r.date), 'HH:mm')}</td>
                                            <td className={TABLE_CELL}>{r.type}</td>
                                            <td className={TABLE_CELL}>
                                                <Badge className={r.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                                    {r.status}
                                                </Badge>
                                            </td>
                                            <td className={TABLE_CELL}>{r.assignment?.vehicle?.registrationNumber || 'N/A'}</td>
                                            <td className={TABLE_CELL}>{r.assignment?.route?.name || 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {records.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-3 py-12 text-center text-muted-foreground text-sm">
                                                No attendance recorded yet this session.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </RequireBranch>
    );
}
