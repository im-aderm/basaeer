"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdmissionExamService, AdmissionExam, RankedScore } from "@/services/admissionExamService";
import { ClassService } from "@/services/classService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import {
    FileText,
    Plus,
    Calendar,
    MapPin,
    Users,
    Eye,
    Edit3,
    Trash2,
    Loader2,
    Upload,
    Download,
    ChevronDown,
    ChevronUp,
    CheckCircle2,
    XCircle,
    AlertCircle,
} from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function AdmissionExamsPage() {
    const { resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [exams, setExams] = useState<AdmissionExam[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedExam, setSelectedExam] = useState<AdmissionExam | null>(null);
    const [examDetail, setExamDetail] = useState<any>(null);
    const [rankings, setRankings] = useState<RankedScore[]>([]);
    const [view, setView] = useState<"list" | "detail" | "rankings">("list");
    const [creating, setCreating] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        examDate: "",
        startTime: "",
        endTime: "",
        venue: "",
        description: "",
        maxScore: 100,
        academicSessionId: "",
    });

    useEffect(() => {
        if (resolvedBranchId) {
            fetchData();
        }
    }, [resolvedBranchId]);

    const fetchData = async () => {
        try {
            setError(null);
            const [examsData, sessionsData] = await Promise.all([
                AdmissionExamService.getAll(),
                SessionService.getAll(),
            ]);
            setExams(examsData);
            setSessions(sessionsData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch:", error);
            setError("Failed to load exam data. Please try again.");
            showError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolvedBranchId) return;
        setCreating(true);
        try {
            await AdmissionExamService.create({
                ...formData,
                branchId: resolvedBranchId,
            });
            showSuccess("Exam created successfully");
            setShowCreateForm(false);
            setFormData({ name: "", examDate: "", startTime: "", endTime: "", venue: "", description: "", maxScore: 100, academicSessionId: "" });
            fetchData();
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to create exam");
        } finally {
            setCreating(false);
        }
    };

    const handleViewDetail = async (exam: AdmissionExam) => {
        setSelectedExam(exam);
        setView("detail");
        try {
            const detail = await AdmissionExamService.getById(exam.id);
            setExamDetail(detail);
        } catch (error: any) {
            showError("Failed to load exam detail");
        }
    };

    const handleViewRankings = async (exam: AdmissionExam) => {
        setSelectedExam(exam);
        setView("rankings");
        try {
            const data = await AdmissionExamService.getRankings(exam.id);
            setRankings(data);
        } catch (error: any) {
            showError("Failed to load rankings");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await AdmissionExamService.delete(confirmDeleteId);
            showSuccess("Exam deleted");
            fetchData();
        } catch (error: any) {
            showError("Failed to delete exam");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            DRAFT: "bg-gray-500/10 text-gray-600",
            SCHEDULED: "bg-blue-500/10 text-blue-600",
            IN_PROGRESS: "bg-amber-500/10 text-amber-600",
            COMPLETED: "bg-green-500/10 text-green-600",
            CANCELLED: "bg-red-500/10 text-red-600",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-500/10 text-gray-600"}`}>
                {status.replace(/_/g, " ")}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-[20px] font-semibold text-foreground/60">{error}</p>
                <button onClick={fetchData} className="px-6 py-2 bg-primary text-white rounded-xl hover:opacity-90">
                    Retry
                </button>
            </div>
        );
    }

    if (view === "detail" && selectedExam && examDetail) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => setView("list")} className="text-sm text-foreground/60 hover:text-primary mb-2 flex items-center gap-1">
                            ← Back to Exams
                        </button>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">{examDetail.name}</h1>
                        <p className="text-foreground/60 font-medium mt-1">{examDetail.description || "Entrance Examination"}</p>
                    </div>
                    <button onClick={() => handleViewRankings(selectedExam)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">
                        View Rankings
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className={STAT_CARD}>
                        <p className={STAT_LABEL}>Date</p>
                        <p className={STAT_VALUE}>{new Date(examDetail.examDate).toLocaleDateString()}</p>
                    </div>
                    <div className={STAT_CARD}>
                        <p className={STAT_LABEL}>Time</p>
                        <p className={STAT_VALUE}>{new Date(examDetail.startTime).toLocaleTimeString()} - {new Date(examDetail.endTime).toLocaleTimeString()}</p>
                    </div>
                    <div className={STAT_CARD}>
                        <p className={STAT_LABEL}>Venue</p>
                        <p className={STAT_VALUE}>{examDetail.venue || "TBD"}</p>
                    </div>
                    <div className={STAT_CARD}>
                        <p className={STAT_LABEL}>Applicants</p>
                        <p className={STAT_VALUE}>{examDetail.scores?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-primary/20 overflow-hidden">
                    <div className="p-4 border-b border-primary/20">
                        <h3 className="font-bold text-[14px]">Score Entry</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Applicant</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Class</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Score</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Grade</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Notes</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {examDetail.scores?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-3 py-12 text-center text-foreground/60">
                                            No scores entered yet. Use bulk upload or add scores individually.
                                        </td>
                                    </tr>
                                ) : (
                                    examDetail.scores?.map((score: any) => (
                                        <tr key={score.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL_PRIMARY}>{score.admission?.firstName} {score.admission?.lastName}</td>
                                            <td className={TABLE_CELL}>{score.admission?.desiredClass?.name || "N/A"}</td>
                                            <td className={TABLE_CELL}>
                                                <span className="font-bold">{score.score}/{score.maxScore}</span>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[12px] font-bold">{score.grade}</span>
                                            </td>
                                            <td className={TABLE_CELL}>{score.notes || "-"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    if (view === "rankings" && selectedExam) {
        return (
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => setView("detail")} className="text-sm text-foreground/60 hover:text-primary mb-2 flex items-center gap-1">
                            ← Back to Exam Detail
                        </button>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">Rankings: {selectedExam.name}</h1>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-primary/20 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Rank</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Applicant</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Gender</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Desired Class</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Score</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>%</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Grade</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {rankings.map((r) => (
                                    <tr key={r.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL}>
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[12px] ${r.rank <= 3 ? "bg-primary/20 text-primary" : "bg-muted text-foreground/60"}`}>
                                                {r.rank}
                                            </span>
                                        </td>
                                        <td className={TABLE_CELL_PRIMARY}>{r.admission?.firstName} {r.admission?.lastName}</td>
                                        <td className={TABLE_CELL}>{r.admission?.gender}</td>
                                        <td className={TABLE_CELL}>{r.admission?.desiredClass?.name || "N/A"}</td>
                                        <td className={TABLE_CELL}>
                                            <span className="font-bold">{r.score}/{r.maxScore}</span>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <span className="font-bold text-primary">{r.percentage}%</span>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[12px] font-bold">{r.grade}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Entrance Exams</h1>
                    <p className="text-foreground/60 font-medium mt-1">Create and manage admission entrance examinations.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
                >
                    <Plus size={18} /> New Exam
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-card rounded-2xl border border-primary/20 p-6 space-y-4">
                    <h3 className="font-bold text-[14px]">Create New Exam</h3>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Exam Name *</label>
                                <input
                                    required
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., 2024/2025 Grade 1 Entrance Exam"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Academic Session</label>
                                <select
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.academicSessionId}
                                    onChange={e => setFormData({ ...formData, academicSessionId: e.target.value })}
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Exam Date *</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.examDate}
                                    onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Venue</label>
                                <input
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.venue}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="e.g., Main Hall"
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Start Time *</label>
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">End Time *</label>
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold uppercase text-foreground/60">Max Score</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary text-[12px]"
                                    value={formData.maxScore}
                                    onChange={e => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-[12px] font-semibold uppercase text-foreground/60">Description</label>
                            <textarea
                                className="w-full p-3 border border-primary/20 rounded-xl outline-none focus:border-primary min-h-[80px] text-[12px]"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Exam description..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={creating} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                                {creating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                                Create Exam
                            </button>
                            <button type="button" onClick={() => setShowCreateForm(false)} className="px-8 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <FileText size={48} className="mx-auto text-foreground/30 mb-4" />
                        <p className="text-foreground/60 font-semibold">No exams created yet.</p>
                        <button onClick={() => setShowCreateForm(true)} className="mt-4 text-primary font-bold hover:underline">Create your first exam</button>
                    </div>
                ) : (
                    exams.map(exam => (
                        <div key={exam.id} className="bg-card rounded-2xl border border-primary/20 p-4 space-y-3 hover:border-primary/60 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-[14px]">{exam.name}</h3>
                                    {getStatusBadge(exam.status)}
                                </div>
                            </div>
                            <div className="space-y-2 text-[12px]">
                                <div className="flex items-center gap-2 text-foreground/60">
                                    <Calendar size={14} />
                                    <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                                </div>
                                {exam.venue && (
                                    <div className="flex items-center gap-2 text-foreground/60">
                                        <MapPin size={14} />
                                        <span>{exam.venue}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-foreground/60">
                                    <Users size={14} />
                                    <span>{exam._count?.scores || 0} applicants</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => handleViewDetail(exam)} className="flex-1 py-2 bg-muted rounded-xl text-sm font-bold hover:bg-muted/80 flex items-center justify-center gap-1">
                                    <Eye size={14} /> View
                                </button>
                                <button onClick={() => handleViewRankings(exam)} className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-sm font-bold hover:bg-primary/20 flex items-center justify-center gap-1">
                                    <ChevronUp size={14} /> Rankings
                                </button>
                                <button onClick={() => handleDelete(exam.id)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Exam"
                message="Are you sure you want to delete this exam? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
            </div>
        </RequireBranch>
    );
}
