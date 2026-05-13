"use client";

import { useState, useEffect } from "react";
import { ClassService, Class } from "@/services/classService";
import { StaffService, Teacher } from "@/services/staffService";
import {
    Plus,
    Users,
    UserPlus,
    Loader2,
    LayoutGrid,
    School,
    UserCheck
} from "lucide-react";
import { clsx } from "clsx";

export default function ClassesPage() {
    const [classes, setClasses] = useState<Class[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [newClassName, setNewClassName] = useState("");
    const [newSectionName, setNewSectionName] = useState("");
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [classesData, teachersData] = await Promise.all([
                ClassService.getAll(),
                StaffService.getAllTeachers()
            ]);
            setClasses(classesData);
            setTeachers(teachersData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClass = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await ClassService.create({ name: newClassName });
            setNewClassName("");
            setIsCreateModalOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to create class:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddSection = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;
        setSubmitting(true);
        try {
            await ClassService.addSection(selectedClass.id, newSectionName);
            setNewSectionName("");
            setIsSectionModalOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to add section:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAssignTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass || !selectedTeacherId) return;
        setSubmitting(true);
        try {
            await ClassService.assignTeacher(selectedClass.id, selectedTeacherId);
            setSelectedTeacherId("");
            setIsAssignModalOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to assign teacher:", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && classes.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 flex items-center gap-3">
                        <School className="text-primary w-7 h-7" />
                        Classes &amp; Sections
                    </h1>
                    <p className="text-body text-muted-foreground mt-1">Define your school's academic structure and assign class teachers.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 text-btn font-medium active:scale-95"
                >
                    <Plus size={18} />
                    New Class
                </button>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes.map((cls) => (
                    <div key={cls.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 flex flex-col h-full border-t-4 border-t-primary/20 hover:border-t-primary">
                        <div className="p-6 pb-3">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-h3">{cls.name}</h3>
                                    <div className="flex items-center gap-2 text-secondary">
                                        <Users size={14} />
                                        <span>{cls.sections.length} Sections</span>
                                    </div>
                                </div>
                                <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                                    <LayoutGrid size={20} />
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 space-y-4 flex-1">
                            {/* Class Teacher Info */}
                            <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-label">Class Teacher</span>
                                    <button
                                        onClick={() => { setSelectedClass(cls); setIsAssignModalOpen(true); }}
                                        className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
                                    >
                                        <UserPlus size={14} />
                                    </button>
                                </div>
                                {cls.classTeacherId ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                            {teachers.find(t => t.id === cls.classTeacherId)?.user.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="text-body font-medium">
                                                {teachers.find(t => t.id === cls.classTeacherId)?.user.firstName} {teachers.find(t => t.id === cls.classTeacherId)?.user.lastName}
                                            </p>
                                            <p className="text-secondary">{teachers.find(t => t.id === cls.classTeacherId)?.designation || "Teacher"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-secondary">No teacher assigned yet</p>
                                )}
                            </div>

                            {/* Sections List */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-label">Available Sections</span>
                                    <button
                                        onClick={() => { setSelectedClass(cls); setIsSectionModalOpen(true); }}
                                        className="flex items-center gap-1 text-btn font-medium text-primary hover:underline"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cls.sections.map(section => (
                                        <span key={section.id} className="px-3 py-1.5 bg-card border border-border rounded-lg text-body shadow-sm hover:border-primary/30 transition-colors cursor-default">
                                            {section.name}
                                        </span>
                                    ))}
                                    {cls.sections.length === 0 && (
                                        <span className="text-secondary">No sections created</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Class Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        <form onSubmit={handleCreateClass}>
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h3 className="text-h3">New Academic Class</h3>
                                <p className="text-secondary mt-1">Define a new grade level for current branch.</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-label">Class Name</label>
                                    <input
                                        required
                                        placeholder="e.g. Primary One, JS 1"
                                        className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all text-body"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-8 border-t border-border bg-muted/20 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-5 py-2.5 rounded-xl text-btn font-medium bg-muted hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/95 transition-all shadow-md shadow-primary/20 text-btn font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    Create Class
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Section Modal */}
            {isSectionModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
                        <form onSubmit={handleAddSection}>
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h3 className="text-h3">Add Section to {selectedClass?.name}</h3>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-label">Section Name</label>
                                    <input
                                        required
                                        placeholder="e.g. A, Blue, Diamond"
                                        className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary outline-none transition-all text-body"
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-8 border-t border-border bg-muted/20 flex gap-3">
                                <button type="button" onClick={() => setIsSectionModalOpen(false)} className="flex-1 py-2.5 text-btn font-medium rounded-xl bg-muted">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-btn font-medium">Add Section</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
                        <form onSubmit={handleAssignTeacher}>
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h3 className="text-h3">Assign Class Teacher</h3>
                                <p className="text-secondary mt-1">{selectedClass?.name}</p>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-label">Select Teacher</label>
                                    <select
                                        required
                                        className="w-full p-3 bg-background border border-border rounded-xl focus:border-primary outline-none transition-all text-body appearance-none"
                                        value={selectedTeacherId}
                                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    >
                                        <option value="">Choose a teacher...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName} ({t.designation || 'Teacher'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="p-8 border-t border-border bg-muted/20 flex gap-3">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2.5 text-btn font-medium rounded-xl bg-muted">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-btn font-medium">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
