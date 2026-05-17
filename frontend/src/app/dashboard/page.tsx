"use client";

import { useAuth } from "@/context/AuthContext";
import ExecutiveDashboard from "@/components/dashboard/executive/ExecutiveDashboard";
import BranchDashboard from "@/components/dashboard/branch/BranchDashboard";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
    const { user, isAllCampusesMode, resolvedBranchId, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    if (isAllCampusesMode) {
        return <ExecutiveDashboard />;
    }

    if (resolvedBranchId) {
        return <BranchDashboard branchId={resolvedBranchId} />;
    }

    return null;
}
