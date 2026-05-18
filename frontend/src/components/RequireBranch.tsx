"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { Building2, Plus, Check, ArrowRight, Globe, Info } from "lucide-react";
import Link from "next/link";

interface RequireBranchProps {
    children: React.ReactNode;
    requireForWrite?: boolean;
    requireSpecificBranch?: boolean;
}

export default function RequireBranch({ children, requireForWrite = true, requireSpecificBranch }: RequireBranchProps) {
    const { user, activeBranchId, availableBranches, switchBranch } = useAuth();

    // Non-SuperAdmin always has a branch assigned
    if (user?.role !== "SUPER_ADMIN") {
        return <>{children}</>;
    }

    // Super Admin without branch selected
    const noBranch = !activeBranchId || isAllCampuses(activeBranchId);

    // If requireSpecificBranch is set, block "All Campuses" mode for all operations
    if (requireSpecificBranch && noBranch) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="text-center max-w-lg p-8">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Select a Specific Branch</h2>
                    <p className="text-muted-foreground text-sm mb-8">
                        This feature requires you to work with a specific branch. &quot;All Campuses&quot; mode is not supported.
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
                                <div className="flex-1">
                                    <p className="font-bold text-foreground">{branch.name}</p>
                                    <p className="text-xs text-muted-foreground font-mono uppercase">{branch.code}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!noBranch) {
        return <>{children}</>;
    }

    // If only reading is required, allow "All Campuses" mode
    if (!requireForWrite) {
        return <>{children}</>;
    }

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="text-center max-w-lg p-8">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">Select a Branch</h2>
                <p className="text-muted-foreground text-sm mb-2">
                    You need to select a branch before managing records.
                </p>
                <p className="text-muted-foreground text-sm mb-8">
                    Choose a campus to work with, or create a new one.
                </p>

                {/* Info Banner */}
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-8 text-left">
                    <div className="flex gap-3">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-semibold text-blue-600 mb-1">Why select a branch?</p>
                            <p className="text-xs text-muted-foreground">
                                All academic records (students, classes, exams, finances) belong to a specific branch. Selecting a branch ensures your changes are applied to the right campus.
                            </p>
                        </div>
                    </div>
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
                            <div className="flex-1">
                                <p className="font-bold text-foreground">{branch.name}</p>
                                <p className="text-xs text-muted-foreground font-mono uppercase">{branch.code}</p>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        </button>
                    ))}

                    {availableBranches.length === 0 && (
                        <Link
                            href="/dashboard/branches/new"
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-white hover:bg-primary/90 transition-all font-semibold"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Create Your First Branch</span>
                        </Link>
                    )}

                    {availableBranches.length > 0 && (
                        <Link
                            href="/dashboard/branches"
                            className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-border/50 hover:bg-muted transition-all font-medium text-foreground"
                        >
                            <Globe className="w-4 h-4" />
                            <span>Manage Branches</span>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
