"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useNotification } from '@/context/NotificationContext';
import api from "@/lib/api";
import { AttendanceService } from "@/services/attendanceService";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from "@/lib/table-styles";

export default function StaffAttendancePage() {
    const router = useRouter();
    const { showSuccess, showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [staff, setStaff] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, remarks: string }>>({});

    useEffect(() => {
        fetchStaffAndAttendance();
    }, [date]);

    const fetchStaffAndAttendance = async () => {
        setFetching(true);
        try {
            // 1. Fetch All Employees
            const staffRes = await api.get('/employees');
            const staffList = staffRes.data;

            // 2. Fetch existing attendance for this date
            const attendanceRes = await AttendanceService.getStaffByBranch(date);

            // 3. Map existing attendance to state
            const initialData: Record<string, any> = {};

            staffList.forEach((emp: any) => {
                const existingRecord = attendanceRes.find((r: any) => r.staffId === emp.id);
                initialData[emp.id] = {
                    status: existingRecord ? existingRecord.status : 'PRESENT', // Default to Present
                    remarks: existingRecord ? existingRecord.remarks || '' : ''
                };
            });

            setStaff(staffList);
            setAttendanceData(initialData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data", error);
            showError("Failed to load staff list");
        } finally {
            setFetching(false);
        }
    };

    const handleStatusChange = (staffId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffId]: { ...prev[staffId], status }
        }));
    };

    const handleRemarksChange = (staffId: string, remarks: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffId]: { ...prev[staffId], remarks }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const records = staff.map(emp => ({
                staffId: emp.id,
                date: date,
                status: attendanceData[emp.id].status,
                remarks: attendanceData[emp.id].remarks
            }));

            await AttendanceService.markStaffBulk(records);
            showSuccess("Staff attendance saved successfully");
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save", error);
            showError("Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in duration-700 pb-20">
                <BranchContextBanner />
                {/* Header */}
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Staff Attendance</h1>
                    <p className="text-foreground/60 text-[12px]">Track daily attendance for employees.</p>
                </div>
            </div>

            {/* Controls */}
            <Card className="rounded-2xl shadow-sm border-primary/20">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4 sticky top-0">
                        <div className="space-y-1 max-w-xs w-full">
                            <label className="text-[12px] font-bold text-foreground/60 ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-4 h-4" />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="h-10 rounded-xl pl-9 bg-muted/30 border-transparent hover:bg-muted/50 transition-colors text-[12px]"
                                />
                            </div>
                        </div>
                        <div className="flex items-end flex-1 justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || staff.length === 0}
                                className="h-10 px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 text-[12px]"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Save Records
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Staff List */}
            {fetching ? (
                <div className="flex items-center justify-center py-12 bg-white rounded-2xl">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <p className="text-foreground/60 font-medium animate-pulse text-[12px]">Loading staff records...</p>
                    </div>
                </div>
            ) : staff.length > 0 ? (
                <div className="bg-white rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Employee</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Status</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Remarks</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {staff.map((emp) => (
                                    <tr key={emp.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[12px]">
                                                    {emp.user.firstName[0]}{emp.user.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-[12px]">{emp.user.firstName} {emp.user.lastName}</div>
                                                    <div className="text-[10px] text-foreground/60 font-mono flex items-center gap-1">
                                                        <Briefcase size={10} /> {emp.department?.name || 'No Dept'} • {emp.designationRef?.title || 'No Designation'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            <div className="inline-flex bg-muted/20 p-0.5 rounded-xl">
                                                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(emp.id, status)}
                                                        className={`px-3 py-1 rounded-lg text-[12px] font-bold transition-all ${attendanceData[emp.id]?.status === status
                                                                ? status === 'PRESENT' ? 'bg-green-100 text-green-700 shadow-sm'
                                                                    : status === 'ABSENT' ? 'bg-red-100 text-red-700 shadow-sm'
                                                                        : status === 'LATE' ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                                                                            : 'bg-blue-100 text-blue-700 shadow-sm'
                                                                : 'text-foreground/60 hover:bg-white/50'
                                                            }`}
                                                    >
                                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <Input
                                                placeholder="Remarks..."
                                                className="rounded-xl border-dashed border-border hover:border-solid transition-all bg-transparent focus:bg-white text-[12px]"
                                                value={attendanceData[emp.id]?.remarks || ''}
                                                onChange={e => handleRemarksChange(emp.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 text-foreground/60 bg-muted/20 rounded-2xl border border-dashed border-border">
                    <p className="italic text-[12px]">No staff records found for this branch.</p>
                </div>
            )}
        </div>
    </RequireBranch>
    );
}
