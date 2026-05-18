"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Calendar, ChevronDown, Check, Plus } from "lucide-react";
import Link from "next/link";

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "UPCOMING" | "CURRENT" | "COMPLETED";
}

export default function SessionSelector() {
    const { user, activeBranchId, activeSessionId, availableSessions, switchSession } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!activeBranchId || isAllCampuses(activeBranchId)) {
        return null;
    }

    const statusConfig = {
        CURRENT: { color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/20", label: "Current" },
        UPCOMING: { color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "Upcoming" },
        COMPLETED: { color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/30", label: "Completed" },
    };

    const activeSession = availableSessions.find((s) => s.id === activeSessionId);
    const activeConfig = activeSession ? statusConfig[activeSession.status] : statusConfig.UPCOMING;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-xs font-semibold ${
                    activeSession
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700"
                        : "bg-white/75 border-border/50 hover:border-primary/30 text-foreground"
                }`}
            >
                <Calendar size={14} className={activeSession ? "text-emerald-600" : "text-primary"} />
                <span className="hidden md:inline">{activeSession?.name || "Select Session"}</span>
                {activeSession && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeConfig.bg} ${activeConfig.color} font-medium`}>
                        {activeConfig.label}
                    </span>
                )}
                <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-72 bg-white/75 border border-primary/20 backdrop-blur-xl rounded-xl shadow-xl z-50 p-1.5">
                    <div className="px-3 py-2 border-b border-border/50 mb-1">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Academic Sessions</p>
                    </div>

                    {availableSessions.length === 0 && (
                        <div className="px-3 py-4 text-center">
                            <Calendar size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                            <p className="text-sm text-muted-foreground mb-3">No sessions yet</p>
                        </div>
                    )}

                    {availableSessions.map((session) => {
                        const config = statusConfig[session.status];
                        const isActive = activeSessionId === session.id;
                        return (
                            <button
                                key={session.id}
                                onClick={() => { switchSession(session.id); setOpen(false); }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${
                                    isActive ? "bg-primary/5 text-primary font-bold" : "hover:bg-primary/5 text-foreground"
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
                                    <Calendar size={14} className={config.color} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="truncate font-medium">{session.name}</p>
                                    <p className="text-[10px] text-muted-foreground">
                                        {new Date(session.startDate).toLocaleDateString()} — {new Date(session.endDate).toLocaleDateString()}
                                    </p>
                                </div>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                                    {config.label}
                                </span>
                                {isActive && <Check size={14} className="text-primary shrink-0" />}
                            </button>
                        );
                    })}

                    <hr className="my-1 border-border/50" />
                    <Link
                        href="/dashboard/sessions/new"
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left hover:bg-primary/5 text-primary"
                        onClick={() => setOpen(false)}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Plus size={14} className="text-primary" />
                        </div>
                        <span className="font-medium">Create New Session</span>
                    </Link>
                </div>
            )}
        </div>
    );
}
