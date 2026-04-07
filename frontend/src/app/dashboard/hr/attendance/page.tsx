'use client';

import { useState, useEffect } from 'react';
import {
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Search,
    Loader2,
    Save,
    AlertCircle,
    UserCircle,
    Building2,
    Filter
} from 'lucide-react';
import { HRService } from '@/services/hrService';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { DataTable } from '@/components/DataTable';
import { cn } from '@/lib/utils';

export default function StaffAttendancePage() {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [staffList, setStaffList] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, any>>({});

    useEffect(() => {
        fetchData();
    }, [date]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [staffRes, attendanceRes] = await Promise.all([
                api.get('/employees'),
                HRService.getBranchStaffAttendance(date)
            ]);

            setStaffList(staffRes.data);

            // Map attendance data to a lookup object
            const attendanceMap: Record<string, any> = {};
            attendanceRes.forEach((record: any) => {
                attendanceMap[record.staffId] = record;
            });
            setAttendanceData(attendanceMap);
        } catch (error) {
            console.error('Failed to fetch attendance data', error);
            toast.error('Failed to load records');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (staffId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffId]: { ...prev[staffId], status }
        }));
    };

    const handleSaveSingle = async (staffId: string) => {
        const record = attendanceData[staffId];
        if (!record?.status) {
            toast.error('Please select a status');
            return;
        }

        try {
            await HRService.recordStaffAttendance({
                staffId,
                date,
                status: record.status,
                remarks: record.remarks
            });
            toast.success('Attendance updated');
        } catch (error) {
            toast.error('Failed to save attendance');
        }
    };

    const handleMarkAll = async (status: string) => {
        const staffIds = staffList.map(s => s.id);
        setSaving(true);
        try {
            await HRService.recordBulkStaffAttendance({
                staffIds,
                date,
                status
            });
            toast.success(`All staff marked as ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update bulk attendance');
        } finally {
            setSaving(false);
        }
    };

    const filteredStaff = staffList.filter(s =>
        (s.user.firstName + ' ' + s.user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Staff Member',
            accessor: (staff: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {staff.user.firstName[0]}{staff.user.lastName[0]}
                    </div>
                    <div>
                        <div className="font-semibold">{staff.user.firstName} {staff.user.lastName}</div>
                        <div className="text-[10px] text-muted-foreground font-bold uppercase">{staff.designationRef?.name || 'Staff'}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Department',
            accessor: (staff: any) => (
                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Building2 size={12} />
                    {staff.department?.name || 'Unassigned'}
                </div>
            )
        },
        {
            header: 'Attendance Status',
            accessor: (staff: any) => (
                <div className="flex items-center gap-2">
                    <Select
                        value={attendanceData[staff.id]?.status || ''}
                        onValueChange={(val) => handleStatusChange(staff.id, val)}
                    >
                        <SelectTrigger className={cn(
                            "w-32 h-10 rounded-xl font-bold text-xs border-2 shadow-sm",
                            attendanceData[staff.id]?.status === 'PRESENT' && "border-green-500/50 text-green-700 bg-green-50",
                            attendanceData[staff.id]?.status === 'ABSENT' && "border-red-500/50 text-red-700 bg-red-50",
                            attendanceData[staff.id]?.status === 'LATE' && "border-amber-500/50 text-amber-700 bg-amber-50"
                        )}>
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-2 font-bold">
                            <SelectItem value="PRESENT">Present</SelectItem>
                            <SelectItem value="LATE">Late</SelectItem>
                            <SelectItem value="ABSENT">Absent</SelectItem>
                            <SelectItem value="EXCUSED">Excused</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        size="sm"
                        variant="ghost"
                        className="rounded-lg h-10 w-10 p-0 text-primary hover:bg-primary/10"
                        onClick={() => handleSaveSingle(staff.id)}
                    >
                        <Save size={18} />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-emerald-950 p-12 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-emerald-400 font-semibold text-[10px] uppercase tracking-widest backdrop-blur-md">
                            <Clock size={12} /> Workforce pulse
                        </div>
                        <h1 className="text-h1 font-semibold tracking-tight">Staff Attendance</h1>
                        <p className="text-emerald-200/60 text-lg font-medium max-w-xl">
                            Monitor and manage staff punctuality. Real-time logging for precise payroll calculations.
                        </p>
                    </div>

                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 p-8 rounded-[2.5rem] min-w-[320px] shadow-2xl">
                        <div className="space-y-4 text-center md:text-left">
                            <label className="text-emerald-400 font-bold uppercase tracking-widest text-[10px]">Select Log Date</label>
                            <div className="flex gap-4">
                                <Calendar className="text-emerald-400 mt-3" size={24} />
                                <Input
                                    type="date"
                                    className="h-14 rounded-2xl bg-black/20 border-white/10 font-semibold text-h3 text-white appearance-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
                {/* Decorative gradients */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col md:flex-row gap-6">
                <Card className="flex-1 rounded-[2.5rem] p-8 border-border/50 shadow-xl bg-gradient-to-br from-background to-muted/20">
                    <div className="flex items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">Bulk Operations</h3>
                            <p className="text-xs text-muted-foreground font-medium">Apply status to all staff for {new Date(date).toLocaleDateString()}.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleMarkAll('PRESENT')}
                                disabled={saving || loading}
                                className="rounded-2xl h-14 px-8 font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                            >
                                Mark All Present
                            </Button>
                            <Button
                                onClick={() => handleMarkAll('ABSENT')}
                                disabled={saving || loading}
                                variant="outline"
                                className="rounded-2xl h-14 px-8 font-semibold border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                                Mark All Absent
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Attendance List */}
            <Card className="rounded-[3.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-emerald-500/20">
                <CardHeader className="p-10 border-b border-border/50 flex flex-col md:flex-row items-center justify-between bg-muted/5 gap-6">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                        <Clock className="text-emerald-600" /> Attendance Ledger
                    </CardTitle>
                    <div className="flex items-center gap-4 w-full md:w-96">
                        <div className="relative w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Search by name or department..."
                                className="h-14 pl-12 rounded-2xl bg-muted/40 border-none font-bold text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-14 w-14 rounded-2xl border-2 p-0 shrink-0">
                            <Filter size={20} />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-10">
                    {loading ? (
                        <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto h-12 w-12 text-primary" /></div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={filteredStaff}
                            actions={(staff) => (
                                <div className="p-2 bg-muted/30 rounded-xl">
                                    <Input
                                        placeholder="Add remarks..."
                                        className="bg-transparent border-none text-[10px] font-bold h-8 focus-visible:ring-0"
                                        value={attendanceData[staff.id]?.remarks || ''}
                                        onChange={(e) => {
                                            setAttendanceData(prev => ({
                                                ...prev,
                                                [staff.id]: { ...prev[staff.id], remarks: e.target.value }
                                            }));
                                        }}
                                    />
                                </div>
                            )}
                        />
                    )}

                    {!loading && filteredStaff.length === 0 && (
                        <div className="py-20 text-center space-y-4 opacity-30">
                            <UserCircle size={64} className="mx-auto" />
                            <p className="text-h3 font-semibold">No staff members found matching your criteria.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Persistence Note */}
            <div className="flex items-center gap-3 px-10 py-6 rounded-[2rem] bg-amber-500/5 border-2 border-amber-500/10 text-amber-700/80">
                <AlertCircle size={20} className="shrink-0" />
                <p className="text-xs font-bold">
                    <span className="font-semibold uppercase tracking-widest text-[10px] block mb-1">Warning</span>
                    Records are automatically committed when using bulk actions. Individual adjustments require hitting the save icon next to the status selector.
                </p>
            </div>
        </div>
    );
}

