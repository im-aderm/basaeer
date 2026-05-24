"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdmissionInterviewService, AdmissionInterview } from "@/services/admissionInterviewService";
import { OnlineAdmissionService, OnlineAdmission } from "@/services/onlineAdmissionService";
import {
    Calendar,
    Plus,
    Clock,
    MapPin,
    User,
    Loader2,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Eye,
    Users,
    X,
    UserPlus,
} from "lucide-react";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function AdmissionInterviewsPage() {
    const { resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [interviews, setInterviews] = useState<AdmissionInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<AdmissionInterview | null>(null);
    const [scheduling, setScheduling] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [applicants, setApplicants] = useState<OnlineAdmission[]>([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        admissionId: "",
        interviewDate: "",
        venue: "",
        interviewerName: "",
        notes: "",
    });

    // Bulk scheduling state
    const [showBulkSchedule, setShowBulkSchedule] = useState(false);
    const [bulkSelectedIds, setBulkSelectedIds] = useState<Set<string>>(new Set());
    const [bulkApplicants, setBulkApplicants] = useState<OnlineAdmission[]>([]);
    const [loadingBulkApplicants, setLoadingBulkApplicants] = useState(false);
    const [bulkFormData, setBulkFormData] = useState({
        interviewDate: "",
        venue: "",
        interviewerName: "",
    });
    const [bulkScheduling, setBulkScheduling] = useState(false);

    useEffect(() => {
        if (resolvedBranchId) {
            fetchInterviews();
        }
    }, [resolvedBranchId]);

    const fetchInterviews = async () => {
        try {
            setError(null);
            const data = await AdmissionInterviewService.getAll();
            setInterviews(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch:", error);
            setError("Failed to load interview data. Please try again.");
            showError("Failed to load interviews");
        } finally {
            setLoading(false);
        }
    };

    const fetchApplicants = async () => {
        if (!resolvedBranchId || applicants.length > 0) return;
        setLoadingApplicants(true);
        try {
            const eligibleStatuses = ["APPLICATION_RECEIVED", "DOCUMENT_REVIEW", "INTERVIEW_SCHEDULED"];
            const allApplicants = await OnlineAdmissionService.getAll(resolvedBranchId);
            setApplicants(allApplicants.filter(a => eligibleStatuses.includes(a.status)));
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch applicants:", error);
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolvedBranchId) return;
        if (!formData.admissionId) {
            showError("Please select an applicant");
            return;
        }
        const interviewDate = new Date(formData.interviewDate);
        if (interviewDate <= new Date()) {
            showError("Interview date must be in the future");
            return;
        }
        setScheduling(true);
        try {
            await AdmissionInterviewService.create({
                ...formData,
                branchId: resolvedBranchId,
            });
            showSuccess("Interview scheduled successfully");
            setShowScheduleForm(false);
            setFormData({ admissionId: "", interviewDate: "", venue: "", interviewerName: "", notes: "" });
            fetchInterviews();
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to schedule interview");
        } finally {
            setScheduling(false);
        }
    };

    const handleComplete = async (id: string, outcome: string) => {
        try {
            await AdmissionInterviewService.complete(id, { outcome });
            showSuccess(`Interview marked as ${outcome.toLowerCase()}`);
            fetchInterviews();
        } catch (error: any) {
            showError("Failed to update interview");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await AdmissionInterviewService.delete(confirmDeleteId);
            showSuccess("Interview cancelled");
            fetchInterviews();
        } catch (error: any) {
            showError("Failed to cancel interview");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    // Bulk scheduling handlers
    const handleOpenBulkSchedule = async () => {
        setShowBulkSchedule(true);
        setBulkSelectedIds(new Set());
        setBulkFormData({ interviewDate: "", venue: "", interviewerName: "" });
        await loadBulkApplicants();
    };

    const loadBulkApplicants = async () => {
        if (!resolvedBranchId) return;
        setLoadingBulkApplicants(true);
        try {
            const eligibleStatuses = ["APPLICATION_RECEIVED", "DOCUMENT_REVIEW"];
            const allApplicants = await OnlineAdmissionService.getAll(resolvedBranchId);
            // Filter out applicants who already have an interview
            const existingInterviewAdmissionIds = new Set(interviews.map(i => i.admissionId));
            setBulkApplicants(allApplicants.filter(a => eligibleStatuses.includes(a.status) && !existingInterviewAdmissionIds.has(a.id)));
        } catch (error) {
            showError("Failed to load applicants");
        } finally {
            setLoadingBulkApplicants(false);
        }
    };

    const handleBulkSchedule = async () => {
        if (bulkSelectedIds.size === 0) {
            showError("Please select at least one applicant");
            return;
        }
        if (!bulkFormData.interviewDate) {
            showError("Please select a date and time");
            return;
        }
        const interviewDate = new Date(bulkFormData.interviewDate);
        if (interviewDate <= new Date()) {
            showError("Interview date must be in the future");
            return;
        }
        setBulkScheduling(true);
        try {
            const result = await AdmissionInterviewService.bulkSchedule({
                admissionIds: Array.from(bulkSelectedIds),
                interviewDate: bulkFormData.interviewDate,
                venue: bulkFormData.venue || undefined,
                interviewerName: bulkFormData.interviewerName || undefined,
            });
            showSuccess(`${result.success} interview(s) scheduled successfully`);
            if (result.failed > 0) {
                showError(`${result.failed} failed. Check details for more info.`);
            }
            setShowBulkSchedule(false);
            fetchInterviews();
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to schedule interviews");
        } finally {
            setBulkScheduling(false);
        }
    };

    const toggleBulkSelect = (id: string) => {
        setBulkSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleBulkSelectAll = () => {
        if (bulkSelectedIds.size === bulkApplicants.length) {
            setBulkSelectedIds(new Set());
        } else {
            setBulkSelectedIds(new Set(bulkApplicants.map(a => a.id)));
        }
    };

    const filteredInterviews = filterStatus === "ALL"
        ? interviews
        : interviews.filter(i => i.status === filterStatus);

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            SCHEDULED: "bg-blue-500/10 text-blue-600",
            COMPLETED: "bg-green-500/10 text-green-600",
            NO_SHOW: "bg-amber-500/10 text-amber-600",
            RESCHEDULED: "bg-purple-500/10 text-purple-600",
            CANCELLED: "bg-red-500/10 text-red-600",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || "bg-gray-500/10 text-gray-600"}`}>
                {status.replace(/_/g, " ")}
            </span>
        );
    };

    const getOutcomeBadge = (outcome?: string) => {
        if (!outcome) return null;
        const colors: Record<string, string> = {
            PASS: "bg-green-500/10 text-green-600",
            FAIL: "bg-red-500/10 text-red-600",
            PENDING_REVIEW: "bg-amber-500/10 text-amber-600",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[outcome]}`}>
                {outcome.replace(/_/g, " ")}
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
                <button onClick={fetchInterviews} className="px-6 py-2 bg-primary text-white rounded-xl hover:opacity-90">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Interviews</h1>
                    <p className="text-muted-foreground font-medium mt-1">Schedule and manage admission interviews.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleOpenBulkSchedule}
                        className="px-5 py-3 bg-primary/10 text-primary rounded-xl font-bold flex items-center gap-2 hover:bg-primary/20"
                    >
                        <Users size={18} /> Bulk Schedule
                    </button>
                    <button
                        onClick={() => setShowScheduleForm(true)}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
                    >
                        <Plus size={18} /> Schedule Interview
                    </button>
                </div>
            </div>

            {showScheduleForm && (
                <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                    <h3 className="font-bold text-lg">Schedule Interview</h3>
                    <form onSubmit={handleSchedule} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Applicant *</label>
                                <select
                                    required
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary bg-background"
                                    value={formData.admissionId}
                                    onChange={e => setFormData({ ...formData, admissionId: e.target.value })}
                                    onFocus={fetchApplicants}
                                >
                                    <option value="">Select an applicant</option>
                                    {loadingApplicants ? (
                                        <option disabled>Loading applicants...</option>
                                    ) : (
                                        applicants.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.firstName} {a.lastName} ({a.email || a.guardianEmail || "No email"})
                                            </option>
                                        ))
                                    )}
                                </select>
                                {applicants.length === 0 && !loadingApplicants && (
                                    <p className="text-xs text-muted-foreground mt-1">No pending applicants found</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Interview Date & Time *</label>
                                <input
                                    required
                                    type="datetime-local"
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.interviewDate}
                                    onChange={e => setFormData({ ...formData, interviewDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Venue</label>
                                <input
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.venue}
                                    onChange={e => setFormData({ ...formData, venue: e.target.value })}
                                    placeholder="e.g., Admin Office"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Interviewer</label>
                                <input
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.interviewerName}
                                    onChange={e => setFormData({ ...formData, interviewerName: e.target.value })}
                                    placeholder="Interviewer name"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Notes</label>
                            <textarea
                                className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary min-h-[80px]"
                                value={formData.notes}
                                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Additional notes..."
                            />
                        </div>
                        <div className="flex gap-4">
                            <button type="submit" disabled={scheduling} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                                {scheduling ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
                                Schedule
                            </button>
                            <button type="button" onClick={() => setShowScheduleForm(false)} className="px-8 py-3 bg-muted rounded-xl font-bold hover:bg-muted/80">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="flex gap-2">
                {["ALL", "SCHEDULED", "COMPLETED", "NO_SHOW", "CANCELLED"].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(status)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterStatus === status ? "bg-primary text-white" : "bg-muted hover:bg-muted/80"}`}
                    >
                        {status === "ALL" ? "All" : status.replace(/_/g, " ")}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredInterviews.length === 0 ? (
                    <div className="py-20 text-center">
                        <Calendar size={48} className="mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground font-semibold">No interviews found.</p>
                    </div>
                ) : (
                    filteredInterviews.map(interview => (
                        <div key={interview.id} className="bg-card rounded-2xl border border-border p-6 space-y-4 hover:border-primary/60 transition-colors">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h3 className="font-bold text-lg">
                                        {interview.admission?.firstName} {interview.admission?.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(interview.status)}
                                        {getOutcomeBadge(interview.outcome)}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {interview.status === "SCHEDULED" && (
                                        <>
                                            <button onClick={() => handleComplete(interview.id, "PASS")} className="p-2 bg-primary/10 text-primary rounded-xl hover:bg-primary/20" title="Pass">
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button onClick={() => handleComplete(interview.id, "FAIL")} className="p-2 bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500/20" title="Fail">
                                                <XCircle size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(interview.id)} className="p-2 bg-muted rounded-xl hover:bg-muted/80" title="Cancel">
                                                <XCircle size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar size={14} />
                                    <span>{new Date(interview.interviewDate).toLocaleString()}</span>
                                </div>
                                {interview.venue && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <MapPin size={14} />
                                        <span>{interview.venue}</span>
                                    </div>
                                )}
                                {interview.interviewerName && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <User size={14} />
                                        <span>{interview.interviewerName}</span>
                                    </div>
                                )}
                            </div>
                            {interview.notes && (
                                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-xl">{interview.notes}</p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Bulk Schedule Modal */}
            {showBulkSchedule && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-primary/20 w-full max-w-3xl max-h-[85vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-primary">Bulk Schedule Interviews</h3>
                                <p className="text-sm text-muted-foreground mt-1">Select applicants and assign them to the same interview slot.</p>
                            </div>
                            <button onClick={() => setShowBulkSchedule(false)} className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 bg-white/80">
                            {/* Applicant selection */}
                            {loadingBulkApplicants ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                </div>
                            ) : bulkApplicants.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No eligible applicants available for interview scheduling.</p>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold">{bulkSelectedIds.size} of {bulkApplicants.length} selected</p>
                                        <button onClick={toggleBulkSelectAll} className="text-sm text-primary font-bold hover:underline">
                                            {bulkSelectedIds.size === bulkApplicants.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                                        {bulkApplicants.map(a => (
                                            <label
                                                key={a.id}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${bulkSelectedIds.has(a.id) ? 'bg-primary/15 border-primary/40 shadow-sm' : 'bg-white/80 border-primary/10 hover:bg-primary/5'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={bulkSelectedIds.has(a.id)}
                                                    onChange={() => toggleBulkSelect(a.id)}
                                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{a.firstName} {a.lastName}</p>
                                                    <p className="text-xs text-muted-foreground">{a.desiredClass?.name || 'N/A'} · {a.guardianEmail || 'No email'} · {a.guardianPhone || 'No phone'}</p>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* Bulk form fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-primary/10 bg-white/60 p-4 rounded-xl">
                                <div>
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Interview Date & Time *</label>
                                    <input
                                        required
                                        type="datetime-local"
                                        className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                        value={bulkFormData.interviewDate}
                                        onChange={e => setBulkFormData({ ...bulkFormData, interviewDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Venue</label>
                                    <input
                                        className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                        value={bulkFormData.venue}
                                        onChange={e => setBulkFormData({ ...bulkFormData, venue: e.target.value })}
                                        placeholder="e.g., Admin Office"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs font-semibold uppercase text-muted-foreground">Interviewer</label>
                                    <input
                                        className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                        value={bulkFormData.interviewerName}
                                        onChange={e => setBulkFormData({ ...bulkFormData, interviewerName: e.target.value })}
                                        placeholder="Interviewer name"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-primary/10 bg-primary/5 flex gap-3 justify-end">
                            <button onClick={() => setShowBulkSchedule(false)} className="px-6 py-2.5 bg-white/80 border border-primary/20 rounded-xl font-bold hover:bg-white transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={handleBulkSchedule}
                                disabled={bulkScheduling || bulkSelectedIds.size === 0}
                                className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                {bulkScheduling ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                                Schedule {bulkSelectedIds.size} Interview(s)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Cancel Interview"
                message="Are you sure you want to cancel this interview? This action cannot be undone."
                confirmLabel="Cancel"
                loading={deleting}
            />
            </div>
        </RequireBranch>
    );
}
