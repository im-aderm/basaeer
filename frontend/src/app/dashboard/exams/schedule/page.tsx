"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { Calendar, Plus, Clock, AlertTriangle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from "@/lib/api";

export default function ExamSchedulePage() {
    const { showSuccess, showError } = useNotification();
    const [exams, setExams] = useState<any[]>([]);
    const [examTypes, setExamTypes] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        examTypeId: "",
        classId: "",
        sectionId: "",
        subjectId: "",
        examDate: "",
        startTime: "",
        duration: 60,
        totalMarks: 100,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [examsData, typesData, classesData, subjectsData] = await Promise.all([
                api.get("/exams"),
                api.get("/exams/types"),
                api.get("/classes"),
                api.get("/subjects"),
            ]);
            setExams(examsData.data);
            setExamTypes(typesData.data);
            setClasses(classesData.data);
            setSubjects(subjectsData.data);
        } catch (error) {
            showError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/exams", {
                ...formData,
                examDate: new Date(formData.examDate).toISOString(),
            });
            showSuccess("Exam scheduled successfully!");
            setIsDialogOpen(false);
            setFormData({
                examTypeId: "",
                classId: "",
                sectionId: "",
                subjectId: "",
                examDate: "",
                startTime: "",
                duration: 60,
                totalMarks: 100,
            });
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to schedule exam");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/exams/${confirmDelete}`);
            showSuccess("Exam deleted successfully!");
            fetchData();
        } catch (error) {
            showError("Failed to delete exam");
        }
        setConfirmDelete(null);
    };

    const detectConflicts = () => {
        const conflicts: any[] = [];
        const grouped = exams.reduce((acc: any, exam) => {
            const key = `${exam.examDate}-${exam.classId}-${exam.sectionId}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(exam);
            return acc;
        }, {});

        Object.entries(grouped).forEach(([key, items]: [string, any]) => {
            if (items.length > 1) {
                // Check for time overlaps
                for (let i = 0; i < items.length; i++) {
                    for (let j = i + 1; j < items.length; j++) {
                        const exam1 = items[i];
                        const exam2 = items[j];

                        const start1 = new Date(`2000-01-01 ${exam1.startTime}`);
                        const end1 = new Date(start1.getTime() + exam1.duration * 60000);
                        const start2 = new Date(`2000-01-01 ${exam2.startTime}`);
                        const end2 = new Date(start2.getTime() + exam2.duration * 60000);

                        if (start1 < end2 && start2 < end1) {
                            conflicts.push({
                                date: new Date(exam1.examDate).toLocaleDateString(),
                                class: `${exam1.class?.name} - ${exam1.section?.name}`,
                                exams: [exam1.subject?.name, exam2.subject?.name],
                            });
                        }
                    }
                }
            }
        });

        return conflicts;
    };

    const groupExamsByDate = () => {
        const grouped: any = {};
        exams.forEach((exam) => {
            const date = new Date(exam.examDate).toLocaleDateString();
            if (!grouped[date]) grouped[date] = [];
            grouped[date].push(exam);
        });
        return grouped;
    };

    const selectedClassData = classes.find((c) => c.id === formData.classId);
    const conflicts = detectConflicts();
    const groupedExams = groupExamsByDate();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-primary/5 p-6">
                <BranchContextBanner />
                {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">
                            Exam Schedule
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Schedule and manage examinations
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                <Plus className="w-4 h-4 mr-2" />
                                Schedule Exam
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Schedule New Exam</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Exam Type</Label>
                                        <Select
                                            value={formData.examTypeId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, examTypeId: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {examTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Class</Label>
                                        <Select
                                            value={formData.classId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, classId: value })
                                            }
                                        >
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
                                            <Select
                                                value={formData.sectionId}
                                                onValueChange={(value) =>
                                                    setFormData({ ...formData, sectionId: value })
                                                }
                                            >
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

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Exam Date</Label>
                                        <Input
                                            type="date"
                                            value={formData.examDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, examDate: e.target.value })
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Start Time</Label>
                                        <Input
                                            type="time"
                                            value={formData.startTime}
                                            onChange={(e) =>
                                                setFormData({ ...formData, startTime: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Duration (minutes)</Label>
                                        <Input
                                            type="number"
                                            min="15"
                                            value={formData.duration}
                                            onChange={(e) =>
                                                setFormData({ ...formData, duration: parseInt(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Total Marks</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={formData.totalMarks}
                                            onChange={(e) =>
                                                setFormData({ ...formData, totalMarks: parseInt(e.target.value) })
                                            }
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit">Schedule Exam</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

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
                                        {conflict.date} - {conflict.class}: {conflict.exams.join(" & ")} overlap
                                    </p>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Exam Calendar */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <h2 className="text-xl font-semibold mb-6">Exam Calendar</h2>
                {Object.keys(groupedExams).length === 0 ? (
                    <div className="text-center py-12">
                        <Calendar className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No exams scheduled
                        </h3>
                        <p className="text-slate-500">
                            Schedule your first exam to get started
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Object.entries(groupedExams)
                            .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                            .map(([date, dateExams]: [string, any]) => (
                                <div key={date}>
                                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        {date}
                                        <span className="text-sm font-normal text-slate-500">
                                            ({dateExams.length} exams)
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {dateExams
                                            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime))
                                            .map((exam: any) => (
                                                <div
                                                    key={exam.id}
                                                    className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 relative group"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-sm mb-1">
                                                                {exam.subject?.name}
                                                            </p>
                                                            <p className="text-xs text-slate-600">
                                                                {exam.examType?.name}
                                                            </p>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                                                            onClick={() => handleDelete(exam.id)}
                                                        >
                                                            <Trash2 className="w-3 h-3 text-red-600" />
                                                        </Button>
                                                    </div>
                                                    <div className="space-y-1 text-xs">
                                                        <p className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {exam.startTime} ({exam.duration} min)
                                                        </p>
                                                        <p className="text-slate-600">
                                                            {exam.class?.name} - {exam.section?.name}
                                                        </p>
                                                        <p className="font-medium">
                                                            Total Marks: {exam.totalMarks}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Exam"
                message="Are you sure you want to delete this exam? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
        </RequireBranch>
    );
}
