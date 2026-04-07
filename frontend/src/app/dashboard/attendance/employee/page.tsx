"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, Calendar, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { AttendanceService } from "@/services/attendanceService";

export default function StaffAttendancePage() {
    const router = useRouter();
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
            console.error("Failed to fetch data", error);
            toast.error("Failed to load staff list");
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
            toast.success("Staff attendance saved successfully");
        } catch (error) {
            console.error("Failed to save", error);
            toast.error("Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                    <ArrowLeft size={22} />
                </Button>
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Staff Attendance</h1>
                    <p className="text-muted-foreground">Track daily attendance for employees.</p>
                </div>
            </div>

            {/* Controls */}
            <Card className="rounded-[2rem] shadow-sm border-border/50">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row gap-6 sticky top-0">
                        <div className="space-y-2 max-w-xs w-full">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    className="h-12 rounded-xl pl-10 bg-muted/30 border-transparent hover:bg-muted/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex items-end flex-1 justify-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || staff.length === 0}
                                className="h-12 px-8 rounded-xl font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/20"
                            >
                                <Save className="w-5 h-5 mr-2" />
                                Save Records
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Staff List */}
            {fetching ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-[2.5rem]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
                        <p className="text-muted-foreground font-medium animate-pulse">Loading staff records...</p>
                    </div>
                </div>
            ) : staff.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-purple-50/50 text-left">
                                <tr>
                                    <th className="p-6 font-bold text-sm text-purple-900/60 uppercase tracking-wider">Employee</th>
                                    <th className="p-6 font-bold text-sm text-purple-900/60 uppercase tracking-wider text-center">Status</th>
                                    <th className="p-6 font-bold text-sm text-purple-900/60 uppercase tracking-wider">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {staff.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-purple-50/20 transition-colors group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                                    {emp.user.firstName[0]}{emp.user.lastName[0]}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800 text-lg">{emp.user.firstName} {emp.user.lastName}</div>
                                                    <div className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                                        <Briefcase size={10} /> {emp.department?.name || 'No Dept'} • {emp.designationRef?.title || 'No Designation'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="inline-flex bg-muted/20 p-1 rounded-xl">
                                                {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => handleStatusChange(emp.id, status)}
                                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${attendanceData[emp.id]?.status === status
                                                                ? status === 'PRESENT' ? 'bg-green-100 text-green-700 shadow-sm'
                                                                    : status === 'ABSENT' ? 'bg-red-100 text-red-700 shadow-sm'
                                                                        : status === 'LATE' ? 'bg-yellow-100 text-yellow-700 shadow-sm'
                                                                            : 'bg-blue-100 text-blue-700 shadow-sm'
                                                                : 'text-muted-foreground hover:bg-white/50'
                                                            }`}
                                                    >
                                                        {status.charAt(0) + status.slice(1).toLowerCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Input
                                                placeholder="Remarks..."
                                                className="rounded-xl border-dashed border-border hover:border-solid transition-all bg-transparent focus:bg-white"
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
                <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
                    <p className="italic">No staff records found for this branch.</p>
                </div>
            )}
        </div>
    );
}
