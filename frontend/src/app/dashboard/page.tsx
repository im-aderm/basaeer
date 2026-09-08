"use client";

import { useAuth } from "@/context/AuthContext";
import ExecutiveDashboard from "@/components/dashboard/executive/ExecutiveDashboard";
import BranchDashboard from "@/components/dashboard/branch/BranchDashboard";
import { RoleDashboard } from "@/components/dashboard/RoleDashboard";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { reportingService } from "@/services/reportingService";
import type { DashboardData } from "@/types/dashboard";

export default function DashboardPage() {
    const { user, isAllCampusesMode, resolvedBranchId, loading, hasRole } = useAuth();
    const [data, setData] = useState<DashboardData | null>(null);
    const [dataLoading, setDataLoading] = useState(false);

    const role = user?.role;

    // Roles that get a dedicated RoleDashboard instead of BranchDashboard
    const isTeacherLike = role && ["TEACHER", "HOD", "PRINCIPAL", "EXAM_OFFICER", "ACADEMIC_OFFICER"].includes(role);
    const isStudent = role === "STUDENT";
    const isParent = role === "PARENT";
    const isFinanceOnly = role === "ACCOUNTANT";
    const isHR = role === "HR";

    // For teacher-like, finance, HR we still try to load reporting data if permitted,
    // but RoleDashboard gracefully handles null data (shows skeletons / quick links)
    useEffect(() => {
        if (loading || !user) return;
        if (isTeacherLike || isFinanceOnly || isHR || role === "SUPER_ADMIN" || role === "BRANCH_ADMIN") {
            // Only SA/BA can actually fetch reporting/dashboard (others will 403, handled)
            if (role === "SUPER_ADMIN" || role === "BRANCH_ADMIN" || isTeacherLike || isFinanceOnly || isHR) {
                setDataLoading(true);
                reportingService.getDashboard().then(setData).catch(() => setData(null)).finally(() => setDataLoading(false));
            }
        }
    }, [loading, user, role, isTeacherLike, isFinanceOnly, isHR]);

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

    // Role-specific dashboards (before generic branch fallback)
    if (isStudent || isParent || isTeacherLike || isFinanceOnly || isHR) {
        return <RoleDashboard data={data} loading={dataLoading} />;
    }

    if (resolvedBranchId) {
        return <BranchDashboard branchId={resolvedBranchId} />;
    }

    return null;
}
