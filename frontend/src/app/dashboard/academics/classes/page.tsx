"use client";

import { useState, useEffect } from "react";
import { ClassService, Class, Section } from "@/services/classService";
import { StaffService, Teacher } from "@/services/staffService";
import {
    Plus,
    Users,
    BookOpen,
    UserPlus,
    MoreVertical,
    Loader2,
    LayoutGrid,
    List,
    ChevronRight,
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

    useEffect(() => {
        fetchData();
    }, []);

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
            console.error("Failed to fetch data:", error);
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
            console.error("Failed to create class:", error);
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
            console.error("Failed to add section:", error);
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
            console.error("Failed to assign teacher:", error);
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
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <School className="text-primary w-10 h-10" />
                        Classes & Sections
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">Define your school's academic structure and assign class teachers.</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 font-bold active:scale-95"
                >
                    <Plus size={20} />
                    New Class
                </button>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {classes.map((cls) => (
                    <div key={cls.id} className="group bg-card border border-border rounded-[2rem] overflow-hidden hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col h-full border-t-4 border-t-primary/20 hover:border-t-primary">
                        <div className="p-8 pb-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black">{cls.name}</h3>
                                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                        <Users size={16} />
                                        <span>{cls.sections.length} Sections</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-muted rounded-2xl text-muted-foreground group-hover:text-primary transition-colors">
                                    <LayoutGrid size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-6 space-y-6 flex-1">
                            {/* Class Teacher Info */}
                            <div className="p-4 bg-muted/30 rounded-2xl border border-border/50 group-hover:bg-primary/[0.02] transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Class Teacher</span>
                                    <button
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setIsAssignModalOpen(true);
                                        }}
                                        className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-colors"
                                    >
                                        <UserPlus size={16} />
                                    </button>
                                </div>
                                {cls.classTeacherId ? (
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                            {teachers.find(t => t.id === cls.classTeacherId)?.user.firstName[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">
                                                {teachers.find(t => t.id === cls.classTeacherId)?.user.firstName} {teachers.find(t => t.id === cls.classTeacherId)?.user.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground">{teachers.find(t => t.id === cls.classTeacherId)?.designation || "Teacher"}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic font-medium px-2 py-1">No teacher assigned yet</p>
                                )}
                            </div>

                            {/* Sections List */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <span className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Available Sections</span>
                                    <button
                                        onClick={() => {
                                            setSelectedClass(cls);
                                            setIsSectionModalOpen(true);
                                        }}
                                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                    >
                                        <Plus size={12} /> Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cls.sections.map(section => (
                                        <span key={section.id} className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold shadow-sm hover:border-primary/30 transition-colors cursor-default">
                                            {section.name}
                                        </span>
                                    ))}
                                    {cls.sections.length === 0 && (
                                        <span className="text-xs text-muted-foreground font-medium italic">No sections created</span>
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
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        <form onSubmit={handleCreateClass}>
                            <div className="p-10 border-b border-border bg-muted/20">
                                <h3 className="text-3xl font-black">New Academic Class</h3>
                                <p className="text-muted-foreground mt-2 font-medium">Define a new grade level for current branch.</p>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Class Name</label>
                                    <input
                                        required
                                        placeholder="e.g. Primary One, JS 1"
                                        className="w-full p-4 bg-background border-2 border-border rounded-2xl focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all font-bold text-lg"
                                        value={newClassName}
                                        onChange={(e) => setNewClassName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-10 border-t border-border bg-muted/20 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl font-bold bg-muted hover:bg-muted/80 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-2 px-10 py-4 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {submitting && <Loader2 size={18} className="animate-spin" />}
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
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        <form onSubmit={handleAddSection}>
                            <div className="p-10 border-b border-border bg-muted/20">
                                <h3 className="text-2xl font-black">Add Section to {selectedClass?.name}</h3>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Section Name</label>
                                    <input
                                        required
                                        placeholder="e.g. A, Blue, Diamond"
                                        className="w-full p-4 bg-background border-2 border-border rounded-2xl focus:border-primary outline-none transition-all font-bold"
                                        value={newSectionName}
                                        onChange={(e) => setNewSectionName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="p-10 border-t border-border bg-muted/20 flex gap-4">
                                <button type="button" onClick={() => setIsSectionModalOpen(false)} className="flex-1 py-4 font-bold rounded-2xl bg-muted">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold">Add Section</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        <form onSubmit={handleAssignTeacher}>
                            <div className="p-10 border-b border-border bg-muted/20">
                                <h3 className="text-2xl font-black">Assign Class Teacher</h3>
                                <p className="text-muted-foreground font-medium">{selectedClass?.name}</p>
                            </div>
                            <div className="p-10 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Select Teacher</label>
                                    <select
                                        required
                                        className="w-full p-4 bg-background border-2 border-border rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none"
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
                            <div className="p-10 border-t border-border bg-muted/20 flex gap-4">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-4 font-bold rounded-2xl bg-muted">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold">Assign</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
