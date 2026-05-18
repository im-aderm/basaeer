"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Calendar, Plus, Edit2, Trash2, CheckCircle, Clock, Archive, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "UPCOMING" | "CURRENT" | "COMPLETED";
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

export default function SessionsPage() {
    const { user, activeBranchId, switchSession } = useAuth();
    const router = useRouter();
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingSession, setEditingSession] = useState<AcademicSession | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
    });

    const fetchSessions = async () => {
        if (!activeBranchId) return;
        try {
            const res = await api.get(`/academic-sessions?branchId=${activeBranchId}`);
            setSessions(res.data || []);
        } catch (error) {
            toast.error("Failed to fetch sessions");
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount
    useEffect(() => {
        fetchSessions();
    }, []);

    // Re-fetch when branch changes
    useEffect(() => {
        if (activeBranchId) fetchSessions();
    }, [activeBranchId]);

    // Re-fetch when window gains focus (e.g., after navigating back from create page)
    useEffect(() => {
        const onFocus = () => fetchSessions();
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [activeBranchId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeBranchId) {
            toast.error("Please select a branch first");
            return;
        }

        try {
            if (editingSession) {
                await api.put(`/academic-sessions/${editingSession.id}`, {
                    ...formData,
                    branchId: activeBranchId,
                });
                toast.success("Session updated successfully");
                setEditingSession(null);
                setFormData({ name: "", startDate: "", endDate: "" });
                fetchSessions();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save session");
        }
    };

    const handleEdit = (session: AcademicSession) => {
        setEditingSession(session);
        setFormData({
            name: session.name,
            startDate: new Date(session.startDate).toISOString().split("T")[0],
            endDate: new Date(session.endDate).toISOString().split("T")[0],
        });
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this session? All associated data will be lost.")) {
            return;
        }
        try {
            await api.delete(`/academic-sessions/${id}`);
            toast.success("Session deleted successfully");
            fetchSessions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to delete session");
        }
    };

    const handleTransitionStatus = async (session: AcademicSession) => {
        try {
            let newStatus: string;
            if (session.status === "UPCOMING") {
                newStatus = "CURRENT";
            } else if (session.status === "CURRENT") {
                newStatus = "COMPLETED";
            } else {
                toast.error("Completed sessions cannot be transitioned");
                return;
            }
            await api.patch(`/academic-sessions/${session.id}`, { status: newStatus });
            toast.success(`Session marked as ${newStatus.toLowerCase()}`);
            fetchSessions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to update session status");
        }
    };

    const statusConfig = {
        CURRENT: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        UPCOMING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        COMPLETED: { icon: Archive, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/30" },
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Academic Sessions</h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Manage academic years and terms for your campus
                    </p>
                </div>
                <button
                    onClick={() => router.push("/dashboard/sessions/new")}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Session</span>
                </button>
            </div>

            {editingSession && (
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">
                        Edit Session: {editingSession.name}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Session Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., 2026/2027"
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                Update Session
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingSession(null);
                                }}
                                className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {sessions.map((session) => {
                    const config = statusConfig[session.status];
                    const Icon = config.icon;
                    return (
                        <div
                            key={session.id}
                            className="p-4 bg-card border border-border rounded-xl flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-lg ${config.bg} flex items-center justify-center`}>
                                    <Calendar className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">{session.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium flex items-center gap-1`}>
                                    <Icon className="w-3 h-3" />
                                    {session.status}
                                </span>
                                {session.status !== "COMPLETED" && (
                                    <button
                                        onClick={() => handleTransitionStatus(session)}
                                        className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        title={session.status === "UPCOMING" ? "Mark as Current" : "Mark as Completed"}
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => handleEdit(session)}
                                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(session.id)}
                                    className="p-2 text-muted-foreground hover:text-red-600 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
                {sessions.length === 0 && (
                    <div className="text-center py-16 px-6 bg-card border border-border rounded-xl">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No Academic Sessions Yet</h3>
                        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
                            Create your first academic session to start managing students, classes, exams, and grades.
                            All records are organized under sessions.
                        </p>
                        <button
                            onClick={() => router.push("/dashboard/sessions/new")}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span>Create Your First Session</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
