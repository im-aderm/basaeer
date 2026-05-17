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
import { toast } from "sonner";

export default function AdmissionExamsPage() {
    const { resolvedBranchId } = useAuth();
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
            toast.error("Failed to load data");
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
            toast.success("Exam created successfully");
            setShowCreateForm(false);
            setFormData({ name: "", examDate: "", startTime: "", endTime: "", venue: "", description: "", maxScore: 100, academicSessionId: "" });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create exam");
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
            toast.error("Failed to load exam detail");
        }
    };

    const handleViewRankings = async (exam: AdmissionExam) => {
        setSelectedExam(exam);
        setView("rankings");
        try {
            const data = await AdmissionExamService.getRankings(exam.id);
            setRankings(data);
        } catch (error: any) {
            toast.error("Failed to load rankings");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this exam?")) return;
        try {
            await AdmissionExamService.delete(id);
            toast.success("Exam deleted");
            fetchData();
        } catch (error: any) {
            toast.error("Failed to delete exam");
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
                <p className="text-lg font-semibold text-muted-foreground">{error}</p>
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
                        <button onClick={() => setView("list")} className="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1">
                            ← Back to Exams
                        </button>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">{examDetail.name}</h1>
                        <p className="text-muted-foreground font-medium mt-1">{examDetail.description || "Entrance Examination"}</p>
                    </div>
                    <button onClick={() => handleViewRankings(selectedExam)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">
                        View Rankings
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-6 bg-card rounded-2xl border border-border">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Date</p>
                        <p className="text-lg font-bold mt-1">{new Date(examDetail.examDate).toLocaleDateString()}</p>
                    </div>
                    <div className="p-6 bg-card rounded-2xl border border-border">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Time</p>
                        <p className="text-lg font-bold mt-1">{new Date(examDetail.startTime).toLocaleTimeString()} - {new Date(examDetail.endTime).toLocaleTimeString()}</p>
                    </div>
                    <div className="p-6 bg-card rounded-2xl border border-border">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Venue</p>
                        <p className="text-lg font-bold mt-1">{examDetail.venue || "TBD"}</p>
                    </div>
                    <div className="p-6 bg-card rounded-2xl border border-border">
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Applicants</p>
                        <p className="text-lg font-bold mt-1">{examDetail.scores?.length || 0}</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                        <h3 className="font-bold text-lg">Score Entry</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Applicant</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Class</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Score</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Grade</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {examDetail.scores?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            No scores entered yet. Use bulk upload or add scores individually.
                                        </td>
                                    </tr>
                                ) : (
                                    examDetail.scores?.map((score: any) => (
                                        <tr key={score.id} className="hover:bg-muted/10">
                                            <td className="px-6 py-4 font-semibold">{score.admission?.firstName} {score.admission?.lastName}</td>
                                            <td className="px-6 py-4">{score.admission?.desiredClass?.name || "N/A"}</td>
                                            <td className="px-6 py-4 font-bold">{score.score}/{score.maxScore}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">{score.grade}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{score.notes || "-"}</td>
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
                        <button onClick={() => setView("detail")} className="text-sm text-muted-foreground hover:text-primary mb-2 flex items-center gap-1">
                            ← Back to Exam Detail
                        </button>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">Rankings: {selectedExam.name}</h1>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Rank</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Applicant</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Gender</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Desired Class</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Score</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">%</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {rankings.map((r) => (
                                    <tr key={r.id} className="hover:bg-muted/10">
                                        <td className="px-6 py-4">
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${r.rank <= 3 ? "bg-amber-500/20 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                                                {r.rank}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold">{r.admission?.firstName} {r.admission?.lastName}</td>
                                        <td className="px-6 py-4">{r.admission?.gender}</td>
                                        <td className="px-6 py-4">{r.admission?.desiredClass?.name || "N/A"}</td>
                                        <td className="px-6 py-4 font-bold">{r.score}/{r.maxScore}</td>
                                        <td className="px-6 py-4 font-bold text-primary">{r.percentage}%</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold">{r.grade}</span>
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
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Entrance Exams</h1>
                    <p className="text-muted-foreground font-medium mt-1">Create and manage admission entrance examinations.</p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
                >
                    <Plus size={18} /> New Exam
                </button>
            </div>

            {showCreateForm && (
                <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                    <h3 className="font-bold text-lg">Create New Exam</h3>
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Exam Name *</label>
                                <input
                                    required
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., 2024/2025 Grade 1 Entrance Exam"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Academic Session</label>
                                <select
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.academicSessionId}
                                    onChange={e => setFormData({ ...formData, academicSessionId: e.target.value })}
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Exam Date *</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.examDate}
                                    onChange={e => setFormData({ ...formData, examDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Venue</label>
                                <input
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.venue}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="e.g., Main Hall"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Start Time *</label>
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.startTime}
                                    onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">End Time *</label>
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.endTime}
                                    onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Max Score</label>
                                <input
                                    type="number"
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.maxScore}
                                    onChange={e => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 100 })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Description</label>
                            <textarea
                                className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary min-h-[80px]"
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
                        <FileText size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-semibold">No exams created yet.</p>
                        <button onClick={() => setShowCreateForm(true)} className="mt-4 text-primary font-bold hover:underline">Create your first exam</button>
                    </div>
                ) : (
                    exams.map(exam => (
                        <div key={exam.id} className="bg-card rounded-2xl border border-border p-6 space-y-4 hover:border-primary/60 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">{exam.name}</h3>
                                    {getStatusBadge(exam.status)}
                                </div>
                            </div>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>{new Date(exam.examDate).toLocaleDateString()}</span>
                                </div>
                                {exam.venue && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin size={14} />
                                        <span>{exam.venue}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-muted-foreground">
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
            </div>
        </RequireBranch>
    );
}
