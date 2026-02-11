"use client";

import { useState, useEffect } from "react";
import { AttendanceService } from "@/services/attendanceService";
import { ClassService, Class, Section } from "@/services/classService";
import { StudentService, Student } from "@/services/studentService";
import {
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    Search,
    ChevronRight,
    ClipboardCheck,
    Save,
    CheckSquare
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AttendancePage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [students, setStudents] = useState<Student[]>([]);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");

    const [loading, setLoading] = useState(true);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [attendanceData, setAttendanceData] = useState<Record<string, { status: string, remarks: string }>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const data = await ClassService.getAll();
            setClasses(data);
        } catch (error) {
            console.error("Failed to fetch classes:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleClassChange = (classId: string) => {
        const selectedClass = classes.find(c => c.id === classId);
        setSelectedClassId(classId);
        setSelectedSectionId("");
        setSections(selectedClass?.sections || []);
        setStudents([]);
    };

    const handleLoadStudents = async () => {
        if (!selectedSectionId) return;
        setLoadingStudents(true);
        try {
            // Fetch students for the selected section only
            const sectionStudents = await StudentService.getAll({ sectionId: selectedSectionId });
            setStudents(sectionStudents);

            // Fetch existing attendance for this date/section
            const existing = await AttendanceService.getBySection(selectedSectionId, selectedDate);
            const initialData: Record<string, any> = {};

            sectionStudents.forEach(s => {
                const record = existing.find(r => r.studentId === s.id);
                initialData[s.id] = {
                    status: record?.status || "PRESENT",
                    remarks: record?.remarks || ""
                };
            });
            setAttendanceData(initialData);
        } catch (error) {
            console.error("Failed to load students:", error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const updateStatus = (studentId: string, status: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
    };

    const updateRemarks = (studentId: string, remarks: string) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], remarks }
        }));
    };

    const markAllPresent = () => {
        const newData = { ...attendanceData };
        students.forEach(s => {
            newData[s.id] = { ...newData[s.id], status: "PRESENT" };
        });
        setAttendanceData(newData);
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            const records = Object.entries(attendanceData).map(([studentId, data]) => ({
                studentId,
                date: selectedDate,
                status: data.status,
                remarks: data.remarks,
                sectionId: selectedSectionId
            }));

            await AttendanceService.markBulk(records);
            toast.success("Attendance saved successfully!");
        } catch (error) {
            console.error("Failed to save attendance:", error);
            toast.error("Failed to save attendance.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic">
                        <ClipboardCheck className="text-primary w-10 h-10" />
                        Daily Register
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Record and track daily pupil attendance across the branch.</p>
                </div>
            </div>

            {/* Selection Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-card border border-border p-8 rounded-[2.5rem] shadow-sm items-end">
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Calendar size={14} className="text-primary" /> Date
                    </label>
                    <input
                        type="date"
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none transition-all font-bold"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Class
                    </label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none appearance-none font-bold cursor-pointer"
                        value={selectedClassId}
                        onChange={(e) => handleClassChange(e.target.value)}
                    >
                        <option value="">Select Class...</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Users size={14} className="text-primary" /> Section
                    </label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none appearance-none font-bold cursor-pointer"
                        value={selectedSectionId}
                        disabled={!selectedClassId}
                        onChange={(e) => setSelectedSectionId(e.target.value)}
                    >
                        <option value="">Select Section...</option>
                        {sections.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={handleLoadStudents}
                    disabled={!selectedSectionId || loadingStudents}
                    className="h-[60px] flex items-center justify-center gap-2 px-8 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                >
                    {loadingStudents ? <Loader2 size={24} className="animate-spin" /> : <Search size={22} />}
                    Load Class Register
                </button>
            </div>

            {/* Attendance Table */}
            {students.length > 0 && (
                <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary animate-in zoom-in-95 duration-500">
                    <div className="p-8 border-b border-border flex items-center justify-between bg-muted/10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black italic tracking-tight">Class Register: {classes.find(c => c.id === selectedClassId)?.name} • {sections.find(s => s.id === selectedSectionId)?.name}</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl font-bold italic h-10 px-4 flex items-center gap-2"
                                onClick={markAllPresent}
                            >
                                <CheckSquare size={16} /> Mark All Present
                            </Button>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-3.5 bg-green-500 text-white rounded-2xl font-black shadow-xl shadow-green-500/20 hover:bg-green-600 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {submitting ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                            Save Attendance
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-left border-b border-border">
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground w-[30%]">Student Name</th>
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-center w-[40%]">Status Selection</th>
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground w-[30%]">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {students.map((student, idx) => (
                                    <tr key={student.id} className="hover:bg-muted/5 transition-colors">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-black text-sm">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <p className="font-black text-lg italic tracking-tight">{student.firstName} {student.lastName}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-center gap-3">
                                                {[
                                                    { id: "PRESENT", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-500/10", active: "bg-green-500 text-white" },
                                                    { id: "ABSENT", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", active: "bg-red-500 text-white" },
                                                    { id: "LATE", icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", active: "bg-amber-500 text-white" },
                                                    { id: "EXCUSED", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10", active: "bg-blue-500 text-white" }
                                                ].map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => updateStatus(student.id, opt.id)}
                                                        className={clsx(
                                                            "group flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all min-w-[80px]",
                                                            attendanceData[student.id]?.status === opt.id
                                                                ? `${opt.active} border-transparent shadow-lg scale-105`
                                                                : `bg-card border-border hover:border-primary/30 ${opt.color}`
                                                        )}
                                                    >
                                                        <opt.icon size={20} />
                                                        <span className="text-[9px] font-black uppercase tracking-widest">{opt.id}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <Input
                                                placeholder="Add remarks..."
                                                className="bg-muted/30 border-none rounded-xl font-bold italic text-sm"
                                                value={attendanceData[student.id]?.remarks || ''}
                                                onChange={(e) => updateRemarks(student.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {students.length === 0 && !loadingStudents && (
                <div className="py-40 text-center bg-card border border-border rounded-[4rem] animate-in zoom-in-95 duration-500">
                    <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                        <ClipboardCheck size={48} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-3xl font-black italic tracking-tight italic">Load Class List</h3>
                    <p className="text-muted-foreground font-medium italic mt-2">Select a class and section above to begin marking the daily register.</p>
                </div>
            )}
        </div>
    );
}
