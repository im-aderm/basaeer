"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Building2, Globe } from "lucide-react";

interface RequireBranchProps {
    children: React.ReactNode;
    message?: string;
}

/**
 * Wraps branch-specific pages.
 * - Branch selected → renders children (scoped to that branch)
 * - SA in "All Campuses" mode → renders children (read-only, data comes unfiltered)
 * - No branch and not SA → shows "Select a Branch" prompt
 */
export default function RequireBranch({ children, message }: RequireBranchProps) {
    const { user, activeBranchId, resolvedBranchId, switchBranch, availableBranches } = useAuth();

    const canView = resolvedBranchId || (user?.role === "SUPER_ADMIN" && activeBranchId && isAllCampuses(activeBranchId));

    if (canView) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center max-w-md p-8">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-primary/40" />
                </div>
                <h2 className="text-h2 font-bold tracking-tight text-primary mb-2">Select a Campus</h2>
                <p className="text-muted-foreground text-sm mb-8">
                    {message || "Please select a campus to view and manage data."}
                </p>
                <div className="flex flex-col gap-3">
                    {availableBranches.map((branch) => (
                        <button
                            key={branch.id}
                            onClick={() => switchBranch(branch.id)}
                            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/50 bg-white/50 hover:bg-white hover:border-primary/30 transition-all text-left card-hover"
                        >
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground">{branch.name}</p>
                                <p className="text-xs text-muted-foreground font-mono uppercase">{branch.code}</p>
                            </div>
                        </button>
                    ))}
                    <button
                        onClick={() => switchBranch(null)}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-border/50 hover:border-primary/30 transition-all text-left group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                            <Globe className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-foreground">All Campuses</p>
                            <p className="text-xs text-muted-foreground/60">View system-wide overview</p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
