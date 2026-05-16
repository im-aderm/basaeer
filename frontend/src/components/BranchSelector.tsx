"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth, AuthBranch, isAllCampuses } from "@/context/AuthContext";
import { Building2, ChevronDown, Check, Globe } from "lucide-react";

export default function BranchSelector() {
    const { user, activeBranchId, availableBranches, switchBranch } = useAuth();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Non-SA users: show static badge
    if (user?.role !== "SUPER_ADMIN") {
        const branch = availableBranches.find((b) => b.id === user?.branchId);
        if (!branch) return null;
        return (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-xs font-semibold text-primary">
                <Building2 size={14} />
                <span className="hidden md:inline">{branch.name}</span>
            </div>
        );
    }

    const isAll = isAllCampuses(activeBranchId);
    const activeName = activeBranchId && !isAll
        ? availableBranches.find((b) => b.id === activeBranchId)?.name || "Selected Branch"
        : "All Campuses";

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/75 border border-border/50 hover:border-primary/30 transition-all text-xs font-semibold text-foreground"
            >
                {isAll ? <Globe size={14} className="text-primary" /> : <Building2 size={14} className="text-primary" />}
                <span className="hidden md:inline">{activeName}</span>
                <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white/75 border border-primary/20 backdrop-blur-xl rounded-xl shadow-xl z-50 p-1.5">
                    {/* All Campuses */}
                    <button
                        onClick={() => { switchBranch(null); setOpen(false); }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${isAll ? "bg-primary/5 text-primary font-bold" : "hover:bg-primary/5 text-foreground"}`}
                    >
                        <Globe size={16} className={isAll ? "text-primary" : "text-muted-foreground"} />
                        <span className="flex-1">All Campuses</span>
                        {isAll && <Check size={14} className="text-primary" />}
                    </button>
                    <hr className="my-1 border-border/50" />
                    {/* Individual branches */}
                    {availableBranches.map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => { switchBranch(branch.id); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left ${activeBranchId === branch.id ? "bg-primary/5 text-primary font-bold" : "hover:bg-primary/5 text-foreground"}`}
                        >
                            <Building2 size={16} className={activeBranchId === branch.id ? "text-primary" : "text-muted-foreground"} />
                            <div className="flex-1 min-w-0">
                                <p className="truncate">{branch.name}</p>
                                <p className="text-[10px] text-muted-foreground font-mono uppercase">{branch.code}</p>
                            </div>
                            {activeBranchId === branch.id && <Check size={14} className="text-primary shrink-0" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
