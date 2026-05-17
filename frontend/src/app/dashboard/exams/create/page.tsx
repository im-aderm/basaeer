import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { AcademicOperationsPage } from '@/components/academic/AcademicOperationsPage';

export default function CreateExamPage() {
    return (
        <RequireBranch requireSpecificBranch>
            <div>
                <BranchContextBanner />
                <AcademicOperationsPage mode="exams" />
            </div>
        </RequireBranch>
    );
}
