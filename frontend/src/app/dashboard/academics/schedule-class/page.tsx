"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect, useRef } from "react";
import { Calendar, Plus, Clock, Users, BookOpen, Trash2, Printer, Coffee, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { AcademicService } from "@/services/academicService";
import { StaffService } from "@/services/staffService";
import { SubjectService } from "@/services/subjectService";
import { ClassService } from "@/services/classService";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from '@/lib/table-styles';
import { clsx } from "clsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 8; h <= 16; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function getSlotIndex(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 2 + (m >= 30 ? 1 : 0);
}

export default function ClassSchedulePage() {
    const { showSuccess, showError } = useNotification();
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [formData, setFormData] = useState({
        dayOfWeek: 0,
        startTime: "",
        endTime: "",
        subjectId: "",
        teacherId: "",
        room: "",
    });

    const printRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSection) {
            fetchSchedules();
        }
    }, [selectedClass, selectedSection]);

    const fetchData = async () => {
        try {
            const [classesData, subjectsData, teachersData] = await Promise.all([
                ClassService.getAll(),
                SubjectService.getAll(),
                StaffService.getAllTeachers(),
            ]);
            setClasses(classesData);
            setSubjects(subjectsData);
            setTeachers(teachersData);
        } catch (error) {
            showError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        try {
            const data = await AcademicService.getSchedules({
                classId: selectedClass,
                sectionId: selectedSection
            });
            setSchedules(data);
        } catch (error) {
            showError("Failed to load schedules");
        }
    };

    const handleAddSchedule = async () => {
        try {
            const payload: any = {
                ...formData,
                classId: selectedClass,
                sectionId: selectedSection,
            };
            if (isBreak) {
                payload.isBreak = true;
                delete payload.subjectId;
                delete payload.teacherId;
            }
            await AcademicService.createSchedule(payload);
            showSuccess(isBreak ? "Break added successfully!" : "Schedule added successfully!");
            setIsDialogOpen(false);
            setIsBreak(false);
            setFormData({
                dayOfWeek: 0,
                startTime: "",
                endTime: "",
                subjectId: "",
                teacherId: "",
                room: "",
            });
            await fetchSchedules();
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to add schedule");
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await AcademicService.deleteSchedule(confirmDeleteId);
            showSuccess("Schedule deleted");
            fetchSchedules();
        } catch (error) {
            showError("Failed to delete schedule");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const getScheduleForSlot = (day: number, slotTime: string) => {
        const [slotH, slotM] = slotTime.split(":").map(Number);
        const slotStart = slotH * 60 + slotM;
        const slotEnd = slotStart + 60;
        return schedules.find((s) => {
            if (s.dayOfWeek !== day) return false;
            const [sH, sM] = (s.startTime || "").split(":").map(Number);
            const sMin = sH * 60 + sM;
            return sMin >= slotStart && sMin < slotEnd;
        });
    };

    const selectedClassData = classes.find((c) => c.id === selectedClass);

    const openTimetableWindow = () => {
        if (!printRef.current) return null;
        const timetableHtml = printRef.current.outerHTML;
        const styles = Array.from(document.styleSheets)
            .map((sheet) => {
                try {
                    return Array.from(sheet.cssRules || []).map((r) => r.cssText).join("");
                } catch { return ""; }
            })
            .join("");

        const win = window.open("", "_blank");
        if (!win) return null;

        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Timetable</title>
                <style>
                    ${styles}
                    body { background: white; color: black; padding: 20px; font-family: system-ui, sans-serif; }
                    .no-print { display: none !important; }
                    @media print {
                        body { padding: 0; }
                    }
                </style>
            </head>
            <body>${timetableHtml}</body>
            </html>
        `);
        win.document.close();
        return win;
    };

    const handlePrint = () => {
        const win = openTimetableWindow();
        if (win) {
            win.onload = () => {
                win.focus();
                win.print();
            };
        }
    };

    const handleDownloadPdf = () => {
        const win = openTimetableWindow();
        if (win) {
            win.onload = () => {
                win.focus();
                win.print();
            };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-primary/5 p-4 no-print">
                <BranchContextBanner />
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">
                            Class Timetable
                        </h1>
                        <p className="text-foreground/60 mt-1 text-[12px]">
                            Create and manage class schedules and timetables
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedClass && selectedSection && (
                            <Button variant="outline" onClick={handlePrint} className="gap-2">
                                <Printer className="w-4 h-4" />
                                Print
                            </Button>
                        )}
                        {selectedClass && selectedSection && (
                            <Button variant="outline" onClick={handleDownloadPdf} className="gap-2">
                                <Download className="w-4 h-4" />
                                PDF
                            </Button>
                        )}
                        {selectedClass && selectedSection && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Period
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Class Period</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <div>
                                            <Label>Day of Week</Label>
                                            <Select
                                                value={formData.dayOfWeek.toString()}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, dayOfWeek: parseInt(value) })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {DAYS.map((day, index) => (
                                                        <SelectItem key={index} value={index.toString()}>
                                                            {day}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Start Time</Label>
                                                <Input
                                                    type="time"
                                                    value={formData.startTime}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, startTime: e.target.value })
                                                    }
                                                    className="h-10 rounded-lg"
                                                />
                                            </div>
                                            <div>
                                                <Label>End Time</Label>
                                                <Input
                                                    type="time"
                                                    value={formData.endTime}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, endTime: e.target.value })
                                                    }
                                                    className="h-10 rounded-lg"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                                            <Checkbox
                                                id="isBreak"
                                                checked={isBreak}
                                                onCheckedChange={(v) => setIsBreak(v === true)}
                                            />
                                            <Label htmlFor="isBreak" className="flex items-center gap-2 cursor-pointer">
                                                <Coffee size={16} /> This is a break period
                                            </Label>
                                        </div>

                                        {!isBreak && (
                                            <>
                                                <div>
                                                    <Label>Subject</Label>
                                                    <Select
                                                        value={formData.subjectId}
                                                        onValueChange={(value) =>
                                                            setFormData({ ...formData, subjectId: value })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select subject" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {subjects.map((subject) => (
                                                                <SelectItem key={subject.id} value={subject.id}>
                                                                    {subject.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div>
                                                    <Label>Teacher</Label>
                                                    <Select
                                                        value={formData.teacherId}
                                                        onValueChange={(value) =>
                                                            setFormData({ ...formData, teacherId: value })
                                                        }
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select teacher" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {teachers.map((teacher) => (
                                                                <SelectItem key={teacher.id} value={teacher.id}>
                                                                    {teacher.user?.firstName} {teacher.user?.lastName}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </>
                                        )}

                                        <div>
                                            <Label>Room (Optional)</Label>
                                            <Input
                                                value={formData.room}
                                                onChange={(e) =>
                                                    setFormData({ ...formData, room: e.target.value })
                                                }
                                                placeholder="e.g., Room 101"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                                Cancel
                                            </Button>
                                            <Button onClick={handleAddSchedule}>
                                                {isBreak ? "Add Break" : "Add Period"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-primary/20 mb-4 no-print">
                <h2 className="text-[14px] font-semibold mb-3">Select Class</h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label className="text-[10px]">Class</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger className="h-10 rounded-lg text-[12px]">
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id} className="text-[12px]">
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedClassData?.sections && (
                        <div>
                            <Label className="text-[10px]">Section</Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger className="h-10 rounded-lg text-[12px]">
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {selectedClassData.sections.map((section: any) => (
                                        <SelectItem key={section.id} value={section.id} className="text-[12px]">
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {selectedClass && selectedSection && (
                <div ref={printRef} className="bg-white/80 backdrop-blur-xl rounded-xl p-4 border border-primary/20 overflow-x-auto print-card">
                    <h2 className="text-[14px] font-semibold mb-3">Weekly Timetable</h2>
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>
                                    Time
                                </th>
                                {DAYS.map((day, index) => (
                                    <th
                                        key={index}
                                        className={TABLE_HEADER_CELL_NO_SORT}
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {TIME_SLOTS.map((time) => (
                                <tr key={time} className={TABLE_ROW}>
                                    <td className={clsx(TABLE_CELL, "font-medium bg-muted/30")}>
                                        {time}
                                    </td>
                                    {DAYS.map((_, dayIndex) => {
                                        const schedule = getScheduleForSlot(dayIndex, time);
                                        return (
                                            <td
                                                key={dayIndex}
                                                className={TABLE_CELL}
                                            >
                                                {schedule ? (
                                                    <div className={clsx(
                                                        "rounded-lg p-2 relative group",
                                                        schedule.isBreak
                                                            ? "bg-amber-50 border border-amber-200"
                                                            : "bg-gradient-to-br from-primary/10 to-primary/5"
                                                    )}>
                                                        {schedule.isBreak ? (
                                                            <div className="flex items-center justify-center gap-1.5 py-2">
                                                                <Coffee size={14} className="text-amber-600" />
                                                                <span className="font-bold text-[11px] text-amber-700 uppercase tracking-wide">
                                                                    Break
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <p className="font-semibold text-[11px] mb-0.5">
                                                                        {schedule.subject?.name}
                                                                    </p>
                                                                    <p className="text-[10px] text-foreground/60 mb-0.5">
                                                                        {schedule.startTime}–{schedule.endTime}
                                                                    </p>
                                                                    <p className="text-[10px] text-foreground/60">
                                                                        {schedule.teacher?.user?.firstName}{" "}
                                                                        {schedule.teacher?.user?.lastName}
                                                                    </p>
                                                                    {schedule.room && (
                                                                        <p className="text-[10px] text-foreground/50 mt-0.5">
                                                                            {schedule.room}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 p-0 no-print"
                                                                    onClick={() => handleDeleteSchedule(schedule.id)}
                                                                >
                                                                    <Trash2 className="w-3 h-3 text-red-600" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="h-16"></div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!selectedClass && (
                <div className="bg-white/80 backdrop-blur-xl rounded-xl p-8 border border-primary/20 text-center">
                    <Calendar className="w-12 h-12 mx-auto text-foreground/30 mb-3" />
                    <h3 className="text-[14px] font-semibold text-foreground/60 mb-1">
                        Select a class to view timetable
                    </h3>
                    <p className="text-foreground/50 text-[12px]">
                        Choose a class and section from the dropdown above
                    </p>
                </div>
            )}
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Schedule"
                message="Are you sure you want to delete this schedule? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
        </RequireBranch>
    );
}
