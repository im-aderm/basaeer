"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock, BookOpen, AlertTriangle, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AcademicService } from "@/services/academicService";
import { StaffService } from "@/services/staffService";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function TeacherSchedulePage() {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState("");
    const [schedule, setSchedule] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTeachers();
    }, []);

    useEffect(() => {
        if (selectedTeacher) {
            fetchSchedule();
        }
    }, [selectedTeacher]);

    const fetchTeachers = async () => {
        try {
            const data = await StaffService.getAllTeachers();
            setTeachers(data);
        } catch (error) {
            toast.error("Failed to load teachers");
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedule = async () => {
        try {
            const data = await AcademicService.getSchedules({ teacherId: selectedTeacher });
            setSchedule(data);
        } catch (error) {
            toast.error("Failed to load schedule");
        }
    };

    const calculateWorkload = () => {
        const periodsPerDay = DAYS.map((_, dayIndex) => {
            return schedule.filter((s) => s.dayOfWeek === dayIndex).length;
        });

        const totalPeriods = periodsPerDay.reduce((sum, count) => sum + count, 0);
        const avgPeriodsPerDay = totalPeriods / DAYS.length;
        const maxPeriodsPerDay = Math.max(...periodsPerDay);

        const uniqueClasses = new Set(schedule.map((s) => s.classId)).size;
        const uniqueSubjects = new Set(schedule.map((s) => s.subjectId)).size;

        return {
            totalPeriods,
            avgPeriodsPerDay: avgPeriodsPerDay.toFixed(1),
            maxPeriodsPerDay,
            uniqueClasses,
            uniqueSubjects,
            periodsPerDay,
        };
    };

    const getScheduleForDay = (dayIndex: number) => {
        return schedule
            .filter((s) => s.dayOfWeek === dayIndex)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    };

    const detectConflicts = () => {
        const conflicts: any[] = [];
        const grouped = schedule.reduce((acc: any, item) => {
            const key = `${item.dayOfWeek}-${item.startTime}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(item);
            return acc;
        }, {});

        Object.entries(grouped).forEach(([key, items]: [string, any]) => {
            if (items.length > 1) {
                conflicts.push({
                    day: DAYS[parseInt(key.split("-")[0])],
                    time: key.split("-")[1],
                    count: items.length,
                });
            }
        });

        return conflicts;
    };

    const workload = selectedTeacher ? calculateWorkload() : null;
    const conflicts = selectedTeacher ? detectConflicts() : [];

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
                <h1 className="text-h1 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Teacher Schedule
                </h1>
                <p className="text-slate-600 mt-2">
                    View teacher schedules and workload analysis
                </p>
            </div>

            {/* Teacher Selection */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                <Label>Select Teacher</Label>
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                    <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a teacher" />
                    </SelectTrigger>
                    <SelectContent>
                        {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={teacher.id}>
                                {teacher.user?.firstName} {teacher.user?.lastName} - {teacher.employeeId}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedTeacher && workload && (
                <>
                    {/* Conflicts Alert */}
                    {conflicts.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-red-900 mb-2">
                                        Schedule Conflicts Detected ({conflicts.length})
                                    </h3>
                                    <div className="space-y-1">
                                        {conflicts.map((conflict, index) => (
                                            <p key={index} className="text-sm text-red-700">
                                                {conflict.day} at {conflict.time} - {conflict.count} periods
                                                scheduled
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Workload Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <Clock className="w-8 h-8 text-indigo-600" />
                            </div>
                            <p className="text-sm text-slate-600">Total Periods</p>
                            <p className="text-h1 font-bold text-slate-900">
                                {workload.totalPeriods}
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <TrendingUp className="w-8 h-8 text-purple-600" />
                            </div>
                            <p className="text-sm text-slate-600">Avg/Day</p>
                            <p className="text-h1 font-bold text-slate-900">
                                {workload.avgPeriodsPerDay}
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <Calendar className="w-8 h-8 text-teal-600" />
                            </div>
                            <p className="text-sm text-slate-600">Max/Day</p>
                            <p className="text-h1 font-bold text-slate-900">
                                {workload.maxPeriodsPerDay}
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <BookOpen className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-sm text-slate-600">Classes</p>
                            <p className="text-h1 font-bold text-slate-900">
                                {workload.uniqueClasses}
                            </p>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                            <div className="flex items-center justify-between mb-2">
                                <BookOpen className="w-8 h-8 text-orange-600" />
                            </div>
                            <p className="text-sm text-slate-600">Subjects</p>
                            <p className="text-h1 font-bold text-slate-900">
                                {workload.uniqueSubjects}
                            </p>
                        </div>
                    </div>

                    {/* Weekly Schedule */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                        <h2 className="text-xl font-semibold mb-6">Weekly Schedule</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {DAYS.map((day, dayIndex) => {
                                const daySchedule = getScheduleForDay(dayIndex);
                                return (
                                    <div key={dayIndex} className="space-y-3">
                                        <h3 className="font-semibold text-lg flex items-center justify-between">
                                            {day}
                                            <span className="text-sm font-normal text-slate-500">
                                                {daySchedule.length} periods
                                            </span>
                                        </h3>
                                        {daySchedule.length === 0 ? (
                                            <p className="text-sm text-slate-500">No classes</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {daySchedule.map((period) => (
                                                    <div
                                                        key={period.id}
                                                        className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-3"
                                                    >
                                                        <div className="flex items-start justify-between mb-2">
                                                            <p className="font-semibold text-sm">
                                                                {period.subject?.name}
                                                            </p>
                                                            <span className="text-xs text-slate-600">
                                                                {period.startTime} - {period.endTime}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-600">
                                                            {period.class?.name} - {period.section?.name}
                                                        </p>
                                                        {period.room && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {period.room}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {!selectedTeacher && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 border border-slate-200/50 text-center">
                    <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 mb-2">
                        Select a teacher to view schedule
                    </h3>
                    <p className="text-slate-500">
                        Choose a teacher from the dropdown above
                    </p>
                </div>
            )}
        </div>
    );
}
