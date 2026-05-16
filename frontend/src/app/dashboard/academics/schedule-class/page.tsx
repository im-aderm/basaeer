"use client";

import { useState, useEffect } from "react";
import { Calendar, Plus, Clock, Users, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AcademicService } from "@/services/academicService";
import { StaffService } from "@/services/staffService";
import { SubjectService } from "@/services/subjectService";
import { ClassService } from "@/services/classService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const TIME_SLOTS = [
    "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"
];

export default function ClassSchedulePage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [schedules, setSchedules] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        dayOfWeek: 0,
        startTime: "",
        endTime: "",
        subjectId: "",
        teacherId: "",
        room: "",
    });

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
            toast.error("Failed to load data");
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
            toast.error("Failed to load schedules");
        }
    };

    const handleAddSchedule = async () => {
        try {
            await AcademicService.createSchedule({
                ...formData,
                classId: selectedClass,
                sectionId: selectedSection,
            });
            toast.success("Schedule added successfully!");
            setIsDialogOpen(false);
            setFormData({
                dayOfWeek: 0,
                startTime: "",
                endTime: "",
                subjectId: "",
                teacherId: "",
                room: "",
            });
            fetchSchedules();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to add schedule");
        }
    };

    const handleDeleteSchedule = async (id: string) => {
        if (!confirm("Are you sure you want to delete this schedule?")) return;

        try {
            await AcademicService.deleteSchedule(id);
            toast.success("Schedule deleted");
            fetchSchedules();
        } catch (error) {
            toast.error("Failed to delete schedule");
        }
    };

    const getScheduleForSlot = (day: number, time: string) => {
        return schedules.find((s) => s.dayOfWeek === day && s.startTime === time);
    };

    const selectedClassData = classes.find((c) => c.id === selectedClass);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">
                            Class Timetable
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Create and manage class schedules and timetables
                        </p>
                    </div>
                    {selectedClass && selectedSection && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
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
                                            <Select
                                                value={formData.startTime}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, startTime: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_SLOTS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>End Time</Label>
                                            <Select
                                                value={formData.endTime}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, endTime: value })
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select time" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_SLOTS.map((time) => (
                                                        <SelectItem key={time} value={time}>
                                                            {time}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

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
                                        <Button onClick={handleAddSchedule}>Add Period</Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Class Selection */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                <h2 className="text-lg font-semibold mb-4">Select Class</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Class</Label>
                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    {selectedClassData?.sections && (
                        <div>
                            <Label>Section</Label>
                            <Select value={selectedSection} onValueChange={setSelectedSection}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select section" />
                                </SelectTrigger>
                                <SelectContent>
                                    {selectedClassData.sections.map((section: any) => (
                                        <SelectItem key={section.id} value={section.id}>
                                            {section.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Timetable Grid */}
            {selectedClass && selectedSection && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 overflow-x-auto">
                    <h2 className="text-xl font-semibold mb-4">Weekly Timetable</h2>
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                <th className="border border-slate-200 p-3 bg-slate-50">
                                    Time
                                </th>
                                {DAYS.map((day, index) => (
                                    <th
                                        key={index}
                                        className="border border-slate-200 p-3 bg-slate-50"
                                    >
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {TIME_SLOTS.map((time) => (
                                <tr key={time}>
                                    <td className="border border-slate-200 p-3 font-medium bg-slate-50">
                                        {time}
                                    </td>
                                    {DAYS.map((_, dayIndex) => {
                                        const schedule = getScheduleForSlot(dayIndex, time);
                                        return (
                                            <td
                                                key={dayIndex}
                                                className="border border-slate-200 p-2"
                                            >
                                                {schedule ? (
                                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3 relative group">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-sm mb-1">
                                                                    {schedule.subject?.name}
                                                                </p>
                                                                <p className="text-xs text-slate-600">
                                                                    {schedule.teacher?.user?.firstName}{" "}
                                                                    {schedule.teacher?.user?.lastName}
                                                                </p>
                                                                {schedule.room && (
                                                                    <p className="text-xs text-slate-500 mt-1">
                                                                        {schedule.room}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                                                onClick={() => handleDeleteSchedule(schedule.id)}
                                                            >
                                                                <Trash2 className="w-3 h-3 text-red-600" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-20"></div>
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
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        Select a class to view timetable
                    </h3>
                    <p className="text-slate-500">
                        Choose a class and section from the dropdown above
                    </p>
                </div>
            )}
        </div>
    );
}
