"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdmissionExamService, AdmissionExam, RankedScore } from "@/services/admissionExamService";
import { OnlineAdmissionService } from "@/services/onlineAdmissionService";
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
    UserPlus,
    X,
    Save,
} from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

function calculateGrade(score: number, maxScore: number): string {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    return 'F';
}

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

    // Inline score editing state
    const [scoreEdits, setScoreEdits] = useState<Record<string, { score: string; notes: string }>>({});
    const [savingScores, setSavingScores] = useState(false);
    const [assigning, setAssigning] = useState(false);

    // Bulk upload state
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [bulkMode, setBulkMode] = useState<"paste" | "form">("paste");
    const [bulkCsvText, setBulkCsvText] = useState("");
    const [bulkFormRows, setBulkFormRows] = useState<Array<{ admissionId: string; score: string; notes: string }>>([]);
    const [eligibleApplicants, setEligibleApplicants] = useState<any[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [uploadingScores, setUploadingScores] = useState(false);

    // Assign applicants state
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [assignSelectedIds, setAssignSelectedIds] = useState<Set<string>>(new Set());
    const [assignApplicants, setAssignApplicants] = useState<any[]>([]);
    const [loadingAssignApplicants, setLoadingAssignApplicants] = useState(false);

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
        setScoreEdits({});
        try {
            const detail = await AdmissionExamService.getById(exam.id);
            setExamDetail(detail);
            // Initialize score edits from existing scores
            const edits: Record<string, { score: string; notes: string }> = {};
            detail.scores?.forEach((s: any) => {
                edits[s.admissionId] = { score: String(s.score ?? ''), notes: s.notes || '' };
            });
            setScoreEdits(edits);
        } catch (error: any) {
            showError("Failed to load exam detail");
        }
    };

    const loadEligibleApplicants = useCallback(async () => {
        if (!resolvedBranchId) return;
        setLoadingApplicants(true);
        try {
            // Get applicants not yet assigned to this exam
            const all = await OnlineAdmissionService.getAll(resolvedBranchId);
            const assignedIds = new Set(examDetail?.scores?.map((s: any) => s.admissionId) || []);
            const eligible = all.filter((a: any) => !assignedIds.has(a.id));
            setEligibleApplicants(eligible);
            setBulkFormRows(eligible.map((a: any) => ({ admissionId: a.id, score: '', notes: '' })));
        } catch (error) {
            showError("Failed to load applicants");
        } finally {
            setLoadingApplicants(false);
        }
    }, [resolvedBranchId, examDetail]);

    const loadAssignApplicants = useCallback(async () => {
        if (!resolvedBranchId) return;
        setLoadingAssignApplicants(true);
        try {
            const all = await OnlineAdmissionService.getAll(resolvedBranchId);
            const assignedIds = new Set(examDetail?.scores?.map((s: any) => s.admissionId) || []);
            setAssignApplicants(all.filter((a: any) => !assignedIds.has(a.id)));
        } catch (error) {
            showError("Failed to load applicants");
        } finally {
            setLoadingAssignApplicants(false);
        }
    }, [resolvedBranchId, examDetail]);

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

    // Inline score handlers
    const handleScoreChange = (admissionId: string, field: 'score' | 'notes', value: string) => {
        setScoreEdits(prev => ({
            ...prev,
            [admissionId]: { ...prev[admissionId], [field]: value }
        }));
    };

    const handleSaveAllScores = async () => {
        if (!selectedExam) return;
        setSavingScores(true);
        try {
            const scoresToSubmit = Object.entries(scoreEdits)
                .filter(([_, v]) => v.score !== '' && !isNaN(Number(v.score)))
                .map(([admissionId, v]) => ({
                    admissionId,
                    score: Number(v.score),
                    notes: v.notes || undefined,
                }));

            if (scoresToSubmit.length === 0) {
                showError("No valid scores to save");
                return;
            }

            await AdmissionExamService.bulkAddScores(selectedExam.id, scoresToSubmit);
            showSuccess(`${scoresToSubmit.length} score(s) saved`);
            handleViewDetail(selectedExam);
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to save scores");
        } finally {
            setSavingScores(false);
        }
    };

    // Bulk upload handlers
    const handleOpenBulkUpload = async () => {
        setShowBulkUpload(true);
        setBulkCsvText('');
        await loadEligibleApplicants();
    };

    const handleBulkUploadSubmit = async () => {
        if (!selectedExam) return;
        setUploadingScores(true);
        try {
            let scoresToSubmit: Array<{ admissionId: string; score: number; notes?: string }> = [];

            if (bulkMode === 'paste') {
                // Parse CSV: admissionId or email,score,notes
                const lines = bulkCsvText.trim().split('\n');
                for (const line of lines) {
                    const parts = line.split(',').map(p => p.trim());
                    if (parts.length < 2) continue;
                    const identifier = parts[0];
                    const score = Number(parts[1]);
                    if (isNaN(score)) continue;

                    // Find admission by ID or email
                    const applicant = eligibleApplicants.find((a: any) =>
                        a.id === identifier || a.guardianEmail?.toLowerCase() === identifier.toLowerCase()
                    );
                    if (applicant) {
                        scoresToSubmit.push({
                            admissionId: applicant.id,
                            score,
                            notes: parts[2] || undefined,
                        });
                    }
                }
            } else {
                scoresToSubmit = bulkFormRows
                    .filter(r => r.score !== '' && !isNaN(Number(r.score)))
                    .map(r => ({
                        admissionId: r.admissionId,
                        score: Number(r.score),
                        notes: r.notes || undefined,
                    }));
            }

            if (scoresToSubmit.length === 0) {
                showError("No valid scores found");
                return;
            }

            const result = await AdmissionExamService.bulkAddScores(selectedExam.id, scoresToSubmit);
            showSuccess(`${result.success} score(s) uploaded successfully`);
            setShowBulkUpload(false);
            handleViewDetail(selectedExam);
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to upload scores");
        } finally {
            setUploadingScores(false);
        }
    };

    // Assign applicants handlers
    const handleOpenAssignModal = async () => {
        setShowAssignModal(true);
        setAssignSelectedIds(new Set());
        await loadAssignApplicants();
    };

    const handleAssignApplicants = async () => {
        if (!selectedExam || assignSelectedIds.size === 0) return;
        setAssigning(true);
        try {
            await AdmissionExamService.assignAdmissions(selectedExam.id, Array.from(assignSelectedIds));
            showSuccess(`${assignSelectedIds.size} applicant(s) assigned to exam`);
            setShowAssignModal(false);
            handleViewDetail(selectedExam);
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to assign applicants");
        } finally {
            setAssigning(false);
        }
    };

    const toggleAssignSelect = (id: string) => {
        setAssignSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAssignAll = () => {
        if (assignSelectedIds.size === assignApplicants.length) {
            setAssignSelectedIds(new Set());
        } else {
            setAssignSelectedIds(new Set(assignApplicants.map((a: any) => a.id)));
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
        const maxScore = examDetail.maxScore || 100;
        const scores = examDetail.scores || [];

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
                    <div className="flex gap-3">
                        <button onClick={handleOpenAssignModal} className="px-5 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 flex items-center gap-2">
                            <UserPlus size={16} /> Assign Applicants
                        </button>
                        <button onClick={handleOpenBulkUpload} className="px-5 py-3 bg-primary/10 text-primary rounded-xl font-bold hover:bg-primary/20 flex items-center gap-2">
                            <Upload size={16} /> Bulk Upload
                        </button>
                        <button onClick={() => handleViewRankings(selectedExam)} className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90">
                            View Rankings
                        </button>
                    </div>
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
                        <p className="text-xs font-semibold uppercase text-muted-foreground">Scored</p>
                        <p className="text-lg font-bold mt-1">{scores.length} / {maxScore}</p>
                    </div>
                </div>

                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="p-6 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-lg">Score Entry</h3>
                        <button
                            onClick={handleSaveAllScores}
                            disabled={savingScores}
                            className="px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 text-sm"
                        >
                            {savingScores ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            Save All Changes
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-border/50">
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Applicant</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Class</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Score</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">%</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Grade</th>
                                    <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {scores.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            No applicants assigned yet. Click "Assign Applicants" to add candidates.
                                        </td>
                                    </tr>
                                ) : (
                                    scores.map((score: any) => {
                                        const edit = scoreEdits[score.admissionId] || { score: '', notes: '' };
                                        const scoreNum = Number(edit.score);
                                        const pct = !isNaN(scoreNum) && scoreNum > 0 ? ((scoreNum / maxScore) * 100).toFixed(1) : '-';
                                        const grade = !isNaN(scoreNum) && scoreNum > 0 ? calculateGrade(scoreNum, maxScore) : '-';

                                        return (
                                            <tr key={score.id} className="hover:bg-muted/10">
                                                <td className="px-6 py-4 font-semibold">{score.admission?.firstName} {score.admission?.lastName}</td>
                                                <td className="px-6 py-4">{score.admission?.desiredClass?.name || "N/A"}</td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={maxScore}
                                                        className="w-24 px-3 py-1.5 border border-border rounded-lg text-sm font-bold outline-none focus:border-primary"
                                                        value={edit.score}
                                                        onChange={e => handleScoreChange(score.admissionId, 'score', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                    <span className="text-xs text-muted-foreground ml-1">/ {maxScore}</span>
                                                </td>
                                                <td className="px-6 py-4 font-bold text-primary">{pct}{pct !== '-' ? '%' : ''}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${grade !== '-' ? 'bg-primary/10 text-primary' : 'bg-muted/30 text-muted-foreground'}`}>
                                                        {grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="text"
                                                        className="w-48 px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary"
                                                        value={edit.notes}
                                                        onChange={e => handleScoreChange(score.admissionId, 'notes', e.target.value)}
                                                        placeholder="Optional notes..."
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bulk Upload Modal */}
                {showBulkUpload && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-primary/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-primary">Bulk Upload Scores</h3>
                                <button onClick={() => setShowBulkUpload(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-6 bg-white/80">
                                {/* Mode toggle */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBulkMode('paste')}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold ${bulkMode === 'paste' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                                    >
                                        Paste CSV
                                    </button>
                                    <button
                                        onClick={() => setBulkMode('form')}
                                        className={`px-4 py-2 rounded-xl text-sm font-bold ${bulkMode === 'form' ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                                    >
                                        Multi-Row Form
                                    </button>
                                </div>

                                {bulkMode === 'paste' ? (
                                    <div className="space-y-3">
                                        <p className="text-sm text-muted-foreground">
                                            Paste CSV data: <code className="bg-muted px-1 rounded">admissionId or email, score, notes</code> (one per line)
                                        </p>
                                        <textarea
                                            className="w-full p-4 border border-border rounded-xl font-mono text-sm outline-none focus:border-primary min-h-[200px]"
                                            value={bulkCsvText}
                                            onChange={e => setBulkCsvText(e.target.value)}
                                            placeholder={"abc123, 85, Excellent\njohn@email.com, 72, Good\nxyz789, 90"}
                                        />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {loadingApplicants ? (
                                            <div className="flex items-center justify-center py-8">
                                                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                                {bulkFormRows.map((row, idx) => {
                                                    const applicant = eligibleApplicants.find((a: any) => a.id === row.admissionId);
                                                    return (
                                                        <div key={row.admissionId} className="flex items-center gap-3 p-3 bg-white/80 border border-primary/10 rounded-xl">
                                                            <span className="text-sm font-semibold w-48 truncate">{applicant?.firstName} {applicant?.lastName}</span>
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={maxScore}
                                                                className="w-24 px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary"
                                                                value={row.score}
                                                                onChange={e => {
                                                                    const copy = [...bulkFormRows];
                                                                    copy[idx].score = e.target.value;
                                                                    setBulkFormRows(copy);
                                                                }}
                                                                placeholder="Score"
                                                            />
                                                            <input
                                                                type="text"
                                                                className="flex-1 px-3 py-1.5 border border-border rounded-lg text-sm outline-none focus:border-primary"
                                                                value={row.notes}
                                                                onChange={e => {
                                                                    const copy = [...bulkFormRows];
                                                                    copy[idx].notes = e.target.value;
                                                                    setBulkFormRows(copy);
                                                                }}
                                                                placeholder="Notes (optional)"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-primary/10 bg-primary/5 flex gap-3 justify-end">
                                <button onClick={() => setShowBulkUpload(false)} className="px-6 py-2.5 bg-white/80 border border-primary/20 rounded-xl font-bold hover:bg-white transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleBulkUploadSubmit}
                                    disabled={uploadingScores}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {uploadingScores ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                    Upload Scores
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Assign Applicants Modal */}
                {showAssignModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-primary/20 w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl">
                            <div className="p-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                                <h3 className="font-bold text-lg text-primary">Assign Applicants to Exam</h3>
                                <button onClick={() => setShowAssignModal(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4 bg-white/80">
                                {loadingAssignApplicants ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                ) : assignApplicants.length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">All applicants are already assigned to this exam.</p>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-muted-foreground">{assignSelectedIds.size} of {assignApplicants.length} selected</p>
                                            <button onClick={toggleAssignAll} className="text-sm text-primary font-bold hover:underline">
                                                {assignSelectedIds.size === assignApplicants.length ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                                            {assignApplicants.map((a: any) => (
                                                <label
                                                    key={a.id}
                                                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${assignSelectedIds.has(a.id) ? 'bg-primary/15 border-primary/40 shadow-sm' : 'bg-white/80 border-primary/10 hover:bg-primary/5'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={assignSelectedIds.has(a.id)}
                                                        onChange={() => toggleAssignSelect(a.id)}
                                                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-semibold text-sm truncate">{a.firstName} {a.lastName}</p>
                                                        <p className="text-xs text-muted-foreground">{a.desiredClass?.name || 'N/A'} · {a.guardianEmail || 'No email'}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="p-6 border-t border-primary/10 bg-primary/5 flex gap-3 justify-end">
                                <button onClick={() => setShowAssignModal(false)} className="px-6 py-2.5 bg-white/80 border border-primary/20 rounded-xl font-bold hover:bg-white transition-colors">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignApplicants}
                                    disabled={assigning || assignSelectedIds.size === 0}
                                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {assigning ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                    Assign {assignSelectedIds.size} Applicant(s)
                                </button>
                            </div>
                        </div>
                    </div>
                )}
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
                                            <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${r.rank <= 3 ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
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
