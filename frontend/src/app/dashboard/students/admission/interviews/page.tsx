"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { AdmissionInterviewService, AdmissionInterview } from "@/services/admissionInterviewService";
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
} from "lucide-react";
import { toast } from "sonner";

export default function AdmissionInterviewsPage() {
    const { resolvedBranchId } = useAuth();
    const [interviews, setInterviews] = useState<AdmissionInterview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<AdmissionInterview | null>(null);
    const [scheduling, setScheduling] = useState(false);
    const [filterStatus, setFilterStatus] = useState("ALL");
    const [formData, setFormData] = useState({
        admissionId: "",
        interviewDate: "",
        venue: "",
        interviewerName: "",
        notes: "",
    });

    useEffect(() => {
        if (resolvedBranchId) {
            fetchInterviews();
        }
    }, [resolvedBranchId]);

    const fetchInterviews = async () => {
        try {
            const data = await AdmissionInterviewService.getAll();
            setInterviews(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch:", error);
            toast.error("Failed to load interviews");
        } finally {
            setLoading(false);
        }
    };

    const handleSchedule = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolvedBranchId) return;
        setScheduling(true);
        try {
            await AdmissionInterviewService.create({
                ...formData,
                branchId: resolvedBranchId,
            });
            toast.success("Interview scheduled successfully");
            setShowScheduleForm(false);
            setFormData({ admissionId: "", interviewDate: "", venue: "", interviewerName: "", notes: "" });
            fetchInterviews();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule interview");
        } finally {
            setScheduling(false);
        }
    };

    const handleComplete = async (id: string, outcome: string) => {
        try {
            await AdmissionInterviewService.complete(id, { outcome });
            toast.success(`Interview marked as ${outcome.toLowerCase()}`);
            fetchInterviews();
        } catch (error: any) {
            toast.error("Failed to update interview");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Cancel this interview?")) return;
        try {
            await AdmissionInterviewService.delete(id);
            toast.success("Interview cancelled");
            fetchInterviews();
        } catch (error: any) {
            toast.error("Failed to cancel interview");
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

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Interviews</h1>
                    <p className="text-muted-foreground font-medium mt-1">Schedule and manage admission interviews.</p>
                </div>
                <button
                    onClick={() => setShowScheduleForm(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90"
                >
                    <Plus size={18} /> Schedule Interview
                </button>
            </div>

            {showScheduleForm && (
                <div className="bg-card rounded-2xl border border-border p-8 space-y-6">
                    <h3 className="font-bold text-lg">Schedule Interview</h3>
                    <form onSubmit={handleSchedule} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-semibold uppercase text-muted-foreground">Applicant ID *</label>
                                <input
                                    required
                                    className="w-full p-3 border border-border rounded-xl outline-none focus:border-primary"
                                    value={formData.admissionId}
                                    onChange={e => setFormData({ ...formData, admissionId: e.target.value })}
                                    placeholder="Enter admission UUID"
                                />
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
                                            <button onClick={() => handleComplete(interview.id, "PASS")} className="p-2 bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500/20" title="Pass">
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
        </div>
    );
}
