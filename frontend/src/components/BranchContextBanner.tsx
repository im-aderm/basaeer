"use client";

import { useAuth } from "@/context/AuthContext";
import { AlertCircle, Building2 } from "lucide-react";

export default function BranchContextBanner() {
    const { user, activeBranchId, availableBranches } = useAuth();

    if (user?.role !== "SUPER_ADMIN") return null;
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
