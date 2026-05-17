import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { AcademicOperationsPage } from '@/components/academic/AcademicOperationsPage';

export default function VerifyTranscriptPage() {
    return (
        <RequireBranch requireSpecificBranch>
            <div>
                <BranchContextBanner />
                <AcademicOperationsPage mode="transcripts" />
            </div>
        </RequireBranch>
    );
}
