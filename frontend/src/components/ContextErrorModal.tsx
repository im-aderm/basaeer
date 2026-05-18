"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useContextErrorModal } from "@/context/ContextErrorModalContext";
import { useAuth, isAllCampuses } from "@/context/AuthContext";
import api, { setContextErrorCallback } from "@/lib/api";
import {
    Building2,
    Calendar,
    Plus,
    Check,
    AlertTriangle,
    X,
    ArrowRight,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "UPCOMING" | "CURRENT" | "COMPLETED";
}

export default function ContextErrorModal() {
    const { error, isOpen, dismissError, showError } = useContextErrorModal();
    const {
        user,
        activeBranchId,
        activeSessionId,
        availableBranches,
        availableSessions,
        switchBranch,
        switchSession,
        refreshSessions,
    } = useAuth();
    const router = useRouter();
    const [localSessions, setLocalSessions] = useState<AcademicSession[]>([]);
    const [retrying, setRetrying] = useState(false);

    // Register callback with API interceptor
    useEffect(() => {
        setContextErrorCallback(showError);
    }, [showError]);

    useEffect(() => {
        if (isOpen && error?.code === "SESSION_CONTEXT_REQUIRED") {
            fetchSessions();
        }
    }, [isOpen, error?.code, activeBranchId]);

    const fetchSessions = async () => {
        if (!activeBranchId || isAllCampuses(activeBranchId)) return;
        try {
            const res = await api.get(`/academic-sessions?branchId=${activeBranchId}`);
            setLocalSessions(res.data || []);
        } catch {
            setLocalSessions([]);
        }
    };

    const handleRetry = async () => {
        if (!error?.failedRequest) return;
        setRetrying(true);
        try {
            const { url, method, data } = error.failedRequest;
            if (method === "POST") {
                await api.post(url, data);
            } else if (method === "PUT") {
                await api.put(url, data);
            } else if (method === "PATCH") {
                await api.patch(url, data);
            } else if (method === "DELETE") {
                await api.delete(url);
            }
            toast.success("Operation completed successfully!");
            dismissError();
            window.location.reload();
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Retry failed");
        } finally {
            setRetrying(false);
        }
    };

    if (!isOpen || !error) return null;

    const isBranchError = error.code === "BRANCH_CONTEXT_REQUIRED";
    const isSessionError = error.code === "SESSION_CONTEXT_REQUIRED";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-border/50">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-foreground">
                                    {isBranchError ? "Select a Branch" : "Select a Session"}
                                </h2>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {error.message}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={dismissError}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {isBranchError && (
                        <div className="space-y-3">
                            {availableBranches.length === 0 && (
                                <div className="text-center py-6">
                                    <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground mb-4">No branches available</p>
                                    <Link
                                        href="/dashboard/branches/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                        onClick={dismissError}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Branch</span>
                                    </Link>
                                </div>
                            )}

                            {availableBranches.map((branch) => {
                                const isActive = activeBranchId === branch.id;
                                return (
                                    <button
                                        key={branch.id}
                                        onClick={async () => {
                                            await switchBranch(branch.id);
                                            dismissError();
                                        }}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                            isActive
                                                ? "border-primary bg-primary/5"
                                                : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{branch.name}</p>
                                            <p className="text-xs text-muted-foreground font-mono uppercase">{branch.code}</p>
                                        </div>
                                        {isActive && <Check className="w-5 h-5 text-primary" />}
                                        {!isActive && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                    </button>
                                );
                            })}

                            {user?.role === "SUPER_ADMIN" && (
                                <button
                                    onClick={async () => {
                                        await switchBranch(null);
                                        dismissError();
                                    }}
                                    className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-left text-primary"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <span className="font-medium">View All Campuses</span>
                                </button>
                            )}
                        </div>
                    )}

                    {isSessionError && (
                        <div className="space-y-3">
                            {localSessions.length === 0 && (
                                <div className="text-center py-6">
                                    <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                                    <p className="text-sm text-muted-foreground mb-4">No sessions available for this branch</p>
                                    <Link
                                        href="/dashboard/sessions/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                        onClick={dismissError}
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Create Session</span>
                                    </Link>
                                </div>
                            )}

                            {localSessions.map((session) => {
                                const isActive = activeSessionId === session.id;
                                const statusColors = {
                                    CURRENT: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                                    UPCOMING: "text-amber-600 bg-amber-500/10 border-amber-500/20",
                                    COMPLETED: "text-muted-foreground bg-muted/30 border-border/30",
                                };
                                return (
                                    <button
                                        key={session.id}
                                        onClick={async () => {
                                            await switchSession(session.id);
                                            dismissError();
                                        }}
                                        className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left ${
                                            isActive
                                                ? "border-primary bg-primary/5"
                                                : "border-border/50 hover:border-primary/30 hover:bg-muted/50"
                                        }`}
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-foreground">{session.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[session.status]}`}>
                                            {session.status}
                                        </span>
                                        {isActive && <Check className="w-5 h-5 text-primary" />}
                                        {!isActive && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                    </button>
                                );
                            })}

                            <Link
                                href="/dashboard/sessions/new"
                                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all text-primary font-medium"
                                onClick={dismissError}
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create New Session</span>
                            </Link>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {error.failedRequest && (
                    <div className="p-4 bg-muted/30 border-t border-border/50 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                            Select a {isBranchError ? "branch" : "session"}, then retry the operation
                        </p>
                        <button
                            onClick={handleRetry}
                            disabled={retrying}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${retrying ? "animate-spin" : ""}`} />
                            <span>{retrying ? "Retrying..." : "Retry"}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
