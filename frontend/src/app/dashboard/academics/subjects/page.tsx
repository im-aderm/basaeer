"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { SubjectService, Subject } from "@/services/subjectService";
import { StaffService, Teacher } from "@/services/staffService";
import {
    Plus,
    BookOpen,
    UserPlus,
    Loader2,
    Search,
    Edit2,
    Trash2,
    Tag,
    UserCheck,
    Hash
} from "lucide-react";
import { clsx } from "clsx";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function SubjectsPage() {
    const { showSuccess, showError } = useNotification();
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({ name: "", code: "" });
    const [selectedTeacherId, setSelectedTeacherId] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subjectsData, teachersData] = await Promise.all([
                SubjectService.getAll(),
                StaffService.getAllTeachers()
            ]);
            setSubjects(subjectsData);
            setTeachers(teachersData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (selectedSubject) {
                await SubjectService.update(selectedSubject.id, formData);
            } else {
                await SubjectService.create(formData);
            }
            setFormData({ name: "", code: "" });
            setIsModalOpen(false);
            setSelectedSubject(null);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save subject:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await SubjectService.delete(confirmDeleteId);
            showSuccess("Subject deleted successfully");
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to delete subject:", error);
            showError("Failed to delete subject");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const handleAssignTeacher = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject || !selectedTeacherId) return;
        setSubmitting(true);
        try {
            await SubjectService.assignTeacher(selectedSubject.id, selectedTeacherId);
            setSelectedTeacherId("");
            setIsAssignModalOpen(false);
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to assign teacher:", error);
        } finally {
            setSubmitting(false);
        }
    };

    const filteredSubjects = (subjects ?? []).filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading && subjects.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <BookOpen className="text-primary w-10 h-10" />
                        Subjects Registry
                    </h1>
                    <p className="text-foreground/60 mt-2 text-[12px]">Manage all subjects offered across different classes.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search subjects..."
                            className="pl-12 pr-6 py-3.5 border-2 border-primary/60 rounded-2xl focus:border-primary outline-none w-64 lg:w-80 shadow-sm transition-all text-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => {
                            setSelectedSubject(null);
                            setFormData({ name: "", code: "" });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-3 px-8 py-3.5 bg-primary text-white rounded-2xl hover:bg-primary/95 transition-all shadow-xl shadow-primary/20 font-bold active:scale-95"
                    >
                        <Plus size={20} />
                        New Subject
                    </button>
                </div>
            </div>

            {/* Subjects Table */}
            <div className="bg-white/75 border border-primary/20 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-primary/20">
                <div className="overflow-x-auto">
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Subject Details</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Code</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT}>Date Registered</th>
                                <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-right")}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {filteredSubjects.map(subject => (
                                <tr key={subject.id} className={TABLE_ROW}>
                                    <td className={TABLE_CELL_PRIMARY}>
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-xl text-primary">
                                                <BookOpen size={16} />
                                            </div>
                                            <div>
                                                <p className="font-semibold leading-tight">{subject.name}</p>
                                                <p className="text-[10px] text-foreground/60 font-semibold mt-0.5 flex items-center gap-1">
                                                    <Tag size={10} className="text-primary/50" />
                                                    Academic Curriculum
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        <span className="px-2 py-1 bg-muted/50 border border-primary/20 rounded-lg text-[10px] font-semibold font-mono uppercase tracking-widest text-foreground/60">
                                            {subject.code || "---"}
                                        </span>
                                    </td>
                                    <td className={TABLE_CELL}>
                                        {new Date(subject.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </td>
                                    <td className={TABLE_CELL_ACTIONS}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedSubject(subject);
                                                    setIsAssignModalOpen(true);
                                                }}
                                                className="p-1.5 bg-muted hover:bg-primary/10 text-foreground/60 hover:text-primary rounded-lg transition-all"
                                                title="Assign Teacher"
                                            >
                                                <UserCheck size={14} />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedSubject(subject);
                                                    setFormData({ name: subject.name, code: subject.code || "" });
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1.5 bg-muted hover:bg-primary/10 text-foreground/60 hover:text-primary rounded-lg transition-all"
                                                title="Edit Subject"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(subject.id)}
                                                className="p-1.5 bg-muted hover:bg-red-500/10 text-foreground/60 hover:text-red-600 rounded-lg transition-all"
                                                title="Delete Subject"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredSubjects.length === 0 && (
                    <div className="py-16 text-center animate-in fade-in zoom-in-95">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                            <Hash size={32} className="text-foreground/30" />
                        </div>
                        <h2 className="text-[14px] font-semibold">No subjects found</h2>
                        <p className="text-foreground/60 mt-1 max-w-xs mx-auto text-[12px]">Try adjusting your search or add a new subject to the registry.</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white/75 w-full max-w-lg rounded-2xl border border-primary/20 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        <form onSubmit={handleCreateOrUpdate}>
                            <div className="p-6 border-b border-primary/20 bg-muted/20">
                                <h3 className="text-[16px] font-semibold">{selectedSubject ? "Edit Subject" : "Create Subject"}</h3>
                                <p className="text-foreground/60 mt-1 text-[12px]">Registration details for school subjects.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">Subject Name</label>
                                    <input
                                        required
                                        placeholder="e.g. Mathematics, English Language"
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl focus:border-primary outline-none transition-all font-semibold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">Subject Code (Optional)</label>
                                    <input
                                        placeholder="e.g. MATH-101"
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl focus:border-primary outline-none transition-all font-semibold font-mono uppercase tracking-widest"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="p-4 border-t border-primary/20 bg-muted/20 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 font-semibold rounded-xl bg-muted hover:bg-muted/80 transition-colors text-[12px]">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-2 py-2.5 bg-primary text-white rounded-xl font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 text-[12px]">
                                    {submitting ? <Loader2 className="animate-spin mx-auto" size={16} /> : (selectedSubject ? "Update Subject" : "Register Subject")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Teacher Modal */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white/75 w-full max-w-lg rounded-2xl border border-primary/20 shadow-2xl overflow-hidden">
                        <form onSubmit={handleAssignTeacher}>
                            <div className="p-6 border-b border-primary/20 bg-muted/20">
                                <h3 className="text-[14px] font-semibold">Assign Subject Teacher</h3>
                                <p className="text-foreground/60 text-[12px] mt-1">Associate a specialist teacher with <span className="text-foreground font-semibold">{selectedSubject?.name}</span>.</p>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">Select Teacher</label>
                                    <select
                                        required
                                        className="w-full p-3 bg-white border border-primary/20 rounded-xl focus:border-primary outline-none transition-all font-semibold appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22none%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20d%3D%22M5%207L10%2012L15%207%22%20stroke%3D%22%236B7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22/%3E%3C/svg%3E')] bg-[length:24px] bg-[right_1.25rem_center] bg-no-repeat"
                                        value={selectedTeacherId}
                                        onChange={(e) => setSelectedTeacherId(e.target.value)}
                                    >
                                        <option value="">Choose a specialist...</option>
                                        {teachers.map(t => (
                                            <option key={t.id} value={t.id}>{t.user.firstName} {t.user.lastName} ({t.designation || 'Teacher'})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 border-t border-primary/20 bg-muted/20 flex gap-3">
                                <button type="button" onClick={() => setIsAssignModalOpen(false)} className="flex-1 py-2.5 font-semibold rounded-xl bg-muted hover:bg-muted/80 transition-colors text-[12px]">Cancel</button>
                                <button type="submit" disabled={submitting} className="flex-2 py-2.5 bg-primary text-white rounded-xl font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 text-[12px]">
                                    {submitting && <Loader2 size={16} className="animate-spin" />}
                                    Assign Specialist
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Subject"
                message="Are you sure you want to delete this subject? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
        </RequireBranch>
    );
}
