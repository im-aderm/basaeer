"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Calendar, Plus, ListFilter } from "lucide-react";
import Link from "next/link";

export default function SessionGuardProvider({ children }: { children: React.ReactNode }) {
    const { user, loading, activeBranchId, activeSessionId, availableSessions, switchSession } = useAuth();

    if (
        !loading &&
        activeBranchId &&
        !isAllCampuses(activeBranchId) &&
        activeSessionId === null &&
        availableSessions.length > 0
    ) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center max-w-lg p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/5 flex items-center justify-center">
                        <Calendar className="w-10 h-10 text-primary/40" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Select an Academic Session</h2>
                    <p className="text-muted-foreground text-sm mb-8">
                        Please select a session to continue. You can change this anytime from the header.
                    </p>
                    <div className="flex flex-col gap-3">
                        {availableSessions.map((session) => {
                            const statusColors = {
                                CURRENT: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20",
                                UPCOMING: "text-amber-600 bg-amber-500/10 border-amber-500/20",
                                COMPLETED: "text-muted-foreground bg-muted/30 border-border/30",
                            };
                            return (
                                <button
                                    key={session.id}
                                    onClick={() => switchSession(session.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-white/50 hover:bg-white hover:border-primary/30 transition-all text-left card-hover"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-foreground">{session.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${statusColors[session.status]}`}>
                                        {session.status}
                                    </span>
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

    return <>{children}</>;
}
