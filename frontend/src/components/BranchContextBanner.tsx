"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { AlertCircle, Building2, Globe } from "lucide-react";

export default function BranchContextBanner() {
    const { user, activeBranchId, isAllCampusesMode, availableBranches } = useAuth();

    if (user?.role !== "SUPER_ADMIN") return null;

    if (isAllCampusesMode) {
        return (
            <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-6">
                <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-700 font-medium">
                    <strong>View-only mode</strong> — you&apos;re seeing data from all campuses. Select a specific campus to manage records.
                </p>
            </div>
        );
    }

    if (!activeBranchId || activeBranchId === "__all__") return null;

    const currentBranch = availableBranches.find(b => b.id === activeBranchId);
    if (!currentBranch) return null;

    return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-6">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <Building2 className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-700 font-medium">
                You are currently managing records for <strong>{currentBranch.name}</strong> ({currentBranch.code}).
            </p>
        </div>
    );
}
