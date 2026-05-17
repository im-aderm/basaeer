import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { AcademicOperationsPage } from '@/components/academic/AcademicOperationsPage';

export default function ExamAssessmentsPage() {
    return (
        <RequireBranch requireSpecificBranch>
            <div>
                <BranchContextBanner />
                <AcademicOperationsPage mode="components" />
            </div>
        </RequireBranch>
    );
}
