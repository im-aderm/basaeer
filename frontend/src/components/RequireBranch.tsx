"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Building2, Globe, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface RequireBranchProps {
    children: React.ReactNode;
    message?: string;
    /**
     * When true, Super Admin in "All Campuses" mode is blocked
     * and must select a specific branch. Used for write-heavy pages
     * like Inventory to prevent accidental cross-branch modifications.
     */
    requireSpecificBranch?: boolean;
}

export default function RequireBranch({ children, message, requireSpecificBranch }: RequireBranchProps) {
    const { user, activeBranchId, resolvedBranchId, switchBranch, availableBranches } = useAuth();

    const isSuperAdminAllCampuses = user?.role === "SUPER_ADMIN" && activeBranchId && isAllCampuses(activeBranchId);
    const hasSpecificBranch = resolvedBranchId !== undefined;

    const canView = hasSpecificBranch || (!requireSpecificBranch && isSuperAdminAllCampuses);

    if (canView) {
        return <>{children}</>;
    }

    if (requireSpecificBranch && isSuperAdminAllCampuses) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center max-w-lg p-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-h2 font-bold tracking-tight text-primary mb-2">Campus Selection Required</h2>
                    <p className="text-muted-foreground text-sm mb-2">
                        You are currently viewing <strong>All Campuses</strong>. To manage inventory records, you must select a specific campus.
                    </p>
                    <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-8 text-left">
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Recommendation</p>
                        <p className="text-sm text-muted-foreground">
                            We recommend letting each campus&apos;s Branch Admin manage their own inventory records to avoid accidentally modifying records for the wrong campus.
                        </p>
                    </div>
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
                        <Link
                            href="/dashboard/inventory"
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-dashed border-border/50 hover:border-primary/30 transition-all text-left group"
                        >
                            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Back to Inventory Overview</span>
                        </Link>
                    </div>
                </div>
            </div>
        );
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
