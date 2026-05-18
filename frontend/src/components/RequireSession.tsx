"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Calendar, ShieldAlert, Plus, ListFilter, Info, ArrowRight, CheckCircle, Clock, Archive } from "lucide-react";
import Link from "next/link";

interface RequireSessionProps {
    children: React.ReactNode;
    message?: string;
    requireForRead?: boolean;
}

export default function RequireSession({ children, message, requireForRead }: RequireSessionProps) {
    const { activeBranchId, activeSessionId, isAllCampusesMode, availableSessions, switchSession } = useAuth();

    const hasSession = activeSessionId !== null;
    const noBranch = !activeBranchId || isAllCampuses(activeBranchId);

    if (hasSession || (noBranch && !requireForRead)) {
        return <>{children}</>;
    }

    if (noBranch) {
        return <>{children}</>;
    }

    const statusConfig = {
        CURRENT: { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
        UPCOMING: { icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        COMPLETED: { icon: Archive, color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/30" },
    };

    if (availableSessions.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center max-w-lg p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">No Academic Sessions Found</h2>
                    <p className="text-muted-foreground text-sm mb-2">
                        This campus doesn&apos;t have any academic sessions yet.
                    </p>
                    <p className="text-muted-foreground text-sm mb-8">
                        Academic sessions organize all records by year. You need to create one before managing students, classes, or finances.
                    </p>
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-8 text-left">
                        <div className="flex gap-3">
                            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-semibold text-blue-600 mb-1">What is an Academic Session?</p>
                                <p className="text-sm text-muted-foreground">
                                    An academic session represents a school year (e.g., 2026/2027). All students, classes, exams, and financial records belong to a specific session.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/dashboard/sessions/new"
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Your First Session</span>
                        </Link>
                        <Link
                            href="/dashboard/sessions"
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 hover:bg-muted transition-all font-medium text-foreground"
                        >
                            <ListFilter className="w-4 h-4" />
                            <span>View All Sessions</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center max-w-lg p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Calendar className="w-10 h-10 text-primary/40" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Select an Academic Session</h2>
                <p className="text-muted-foreground text-sm mb-2">
                    {message || "You need to select a session to view and manage records."}
                </p>
                <p className="text-muted-foreground text-sm mb-8">
                    Choose an active session below, or create a new one.
                </p>
                <div className="flex flex-col gap-3">
                    {availableSessions.map((session) => {
                        const config = statusConfig[session.status];
                        const Icon = config.icon;
                        return (
                            <button
                                key={session.id}
                                onClick={() => switchSession(session.id)}
                                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-white/50 hover:bg-white hover:border-primary/30 transition-all text-left card-hover"
                            >
                                <div className={`w-10 h-10 rounded-xl ${config.bg} flex items-center justify-center`}>
                                    <Icon className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-foreground">{session.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.color} font-medium`}>
                                    {session.status}
                                </span>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        );
                    })}
                    <Link
                        href="/dashboard/sessions/new"
                        className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all font-medium text-primary"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Create New Session</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
