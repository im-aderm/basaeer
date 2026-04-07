"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Search, Filter, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import api from "@/lib/api";
import { AttendanceService } from "@/services/attendanceService";
import { format } from "date-fns";

export default function StudentAttendancePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // Filters
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    // Data
    const [students, setStudents] = useState<any[]>([]);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, remarks: string }>>({});

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClass) {
            fetchSections(selectedClass);
        } else {
            setSections([]);
            setSelectedSection("");
        }
    }, [selectedClass]);

    useEffect(() => {
        if (selectedSection && date) {
            fetchStudentsAndAttendance();
        }
    }, [selectedSection, date]);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (error) {
            console.error("Failed to fetch classes", error);
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const res = await api.get(`/sections/class/${classId}`);
            setSections(res.data);
        } catch (error) {
            console.error("Failed to fetch sections", error);
        }
    };

    const fetchStudentsAndAttendance = async () => {
        setFetching(true);
        try {
            // 1. Fetch Students for the section
            const studentsRes = await api.get(`/students`, {
                params: { sectionId: selectedSection }
            });
            const studentList = studentsRes.data;

            // 2. Fetch existing attendance for this date/section
            const attendanceRes = await AttendanceService.getBySection(selectedSection, date);

            // 3. Map existing attendance to state
            const initialData: Record<string, any> = {};

            studentList.forEach((student: any) => {
                const existingRecord = attendanceRes.find((r: any) => r.studentId === student.id);
                initialData[student.id] = {
                    status: existingRecord ? existingRecord.status : 'PRESENT', // Default to Present
                    remarks: existingRecord ? existingRecord.remarks || '' : ''
                };
            });

            setStudents(studentList);
            setAttendanceData(initialData);
        } catch (error) {
            console.error("Failed to fetch data", error);
            toast.error("Failed to load students");
        } finally {
            setFetching(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const handleRemarksChange = (studentId: string, remarks: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const records = students.map(student => ({
                studentId: student.id,
                date: date,
                sectionId: selectedSection,
                status: attendanceData[student.id].status,
                remarks: attendanceData[student.id].remarks
            }));

            await AttendanceService.markBulk(records);
            toast.success("Attendance saved successfully");
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
                    <h1 className="text-h1 font-semibold tracking-tight">Student Attendance</h1>
                    <p className="text-muted-foreground">Mark daily attendance for your class.</p>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-[2rem] shadow-sm border-border/50">
                <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Class</label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent hover:bg-muted/50 transition-colors">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-muted-foreground ml-1">Section</label>
                            <Select value={selectedSection} onValueChange={setSelectedSection} disabled={!selectedClass}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-transparent hover:bg-muted/50 transition-colors">
                                    <SelectValue placeholder="Select Section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map(s => (
                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
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
                        <div className="flex items-end">
                            <Button
                                onClick={handleSubmit}
                                disabled={loading || students.length === 0}
                                className="h-12 w-full rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                Save Attendance
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Student List */}
            {selectedSection ? (
                fetching ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-10 h-10 animate-spin text-muted-foreground" />
                    </div>
                ) : students.length > 0 ? (
                    <div className="bg-white rounded-[2rem] border border-border/50 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-muted/30 text-left">
                                    <tr>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider">Student Name</th>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                        <th className="p-6 font-bold text-sm text-muted-foreground uppercase tracking-wider">Remarks</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {students.map((student) => (
                                        <tr key={student.id} className="hover:bg-muted/10 transition-colors group">
                                            <td className="p-6">
                                                <div className="font-bold text-slate-800 text-lg">{student.firstName} {student.lastName}</div>
                                                <div className="text-xs text-muted-foreground font-mono">{student.userId}</div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <div className="inline-flex bg-muted/20 p-1 rounded-xl">
                                                    {['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'].map((status) => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusChange(student.id, status)}
                                                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${attendanceData[student.id]?.status === status
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
                                                    placeholder="Optional remarks..."
                                                    className="rounded-xl border-dashed border-border hover:border-solid transition-all bg-transparent focus:bg-white"
                                                    value={attendanceData[student.id]?.remarks || ''}
                                                    onChange={e => handleRemarksChange(student.id, e.target.value)}
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
                        <p className="italic">No students found in this section.</p>
                    </div>
                )
            ) : (
                <div className="text-center py-20 text-muted-foreground bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
                    <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Please select a Class and Section to view students.</p>
                </div>
            )}
        </div>
    );
}
