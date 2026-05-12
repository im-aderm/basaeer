"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, BookOpen, Users, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AcademicOpsService } from "@/services/academicOpsService";
import { ClassService } from "@/services/classService";
import { SubjectService } from "@/services/subjectService";

export default function TeacherHomeworkHub() {
    const router = useRouter();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        dueDate: "",
        classId: "",
        sectionId: "",
        subjectId: "",
        attachmentUrl: "",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [assignmentsData, classesData, subjectsData] = await Promise.all([
                AcademicOpsService.getAssignments(),
                ClassService.getAll(),
                SubjectService.getAll(),
            ]);
            setAssignments(assignmentsData);
            setClasses(classesData);
            setSubjects(subjectsData);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AcademicOpsService.createAssignment(formData);
            toast.success("Assignment created successfully!");
            setIsDialogOpen(false);
            setFormData({
                title: "",
                description: "",
                dueDate: "",
                classId: "",
                sectionId: "",
                subjectId: "",
                attachmentUrl: "",
            });
            fetchData();
        } catch (error) {
            toast.error("Failed to create assignment");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const availableSections = classes.find(c => c.id === formData.classId)?.sections || [];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Homework Hub
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Create and manage assignments for your classes
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Assignment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Assignment</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="dueDate">Due Date</Label>
                                        <Input
                                            id="dueDate"
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="class">Class</Label>
                                        <Select
                                            value={formData.classId}
                                            onValueChange={(value) => setFormData({ ...formData, classId: value, sectionId: "" })}
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
                                    <div>
                                        <Label htmlFor="section">Section</Label>
                                        <Select
                                            value={formData.sectionId}
                                            onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
                                            disabled={!formData.classId}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSections.map((sec: any) => (
                                                    <SelectItem key={sec.id} value={sec.id}>
                                                        {sec.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="subject">Subject</Label>
                                        <Select
                                            value={formData.subjectId}
                                            onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
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
                                <div>
                                    <Label htmlFor="attachmentUrl">Attachment URL (Optional)</Label>
                                    <Input
                                        id="attachmentUrl"
                                        placeholder="Link to worksheet or resources"
                                        value={formData.attachmentUrl}
                                        onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end gap-2 text-indigo-100">
                                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">Create Assignment</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-12">
                        <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No assignments yet
                        </h3>
                        <p className="text-slate-500 mb-4">
                            Create your first assignment to get started
                        </p>
                    </div>
                ) : (
                    assignments.map((assignment) => (
                        <div
                            key={assignment.id}
                            className="group relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer"
                            onClick={() => router.push(`/dashboard/homework/${assignment.id}`)}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-slate-900 mb-1">
                                        {assignment.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                        {assignment.description}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(assignment.dueDate).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    {assignment._count?.submissions || 0} submissions
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                                    {assignment.subject?.name || "General"}
                                </span>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    View Details →
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
