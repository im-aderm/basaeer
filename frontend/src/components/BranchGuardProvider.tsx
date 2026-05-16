"use client";

import { useAuth, isAllCampuses } from "@/context/AuthContext";
import BranchSelectorModal from "./BranchSelectorModal";

/**
 * Shows the branch selector modal on first load for Super Admin
 * users who have not yet selected a branch context.
 * Branch-specific pages use <RequireBranch> for their own prompts.
 */
export default function BranchGuardProvider({ children }: { children: React.ReactNode }) {
    const { user, loading, activeBranchId, availableBranches } = useAuth();

    // Show selector for SA who hasn't selected any branch yet
    // activeBranchId === "__all__" means SA explicitly chose "All Campuses"
    if (
        !loading &&
        user?.role === "SUPER_ADMIN" &&
        activeBranchId === null &&
        availableBranches.length > 0
    ) {
        return <BranchSelectorModal />;
    }

    return <>{children}</>;
}
