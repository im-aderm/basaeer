"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { Construction, ArrowLeft, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ExamAttendancePlaceholder() {
    const router = useRouter();
    return (
        <RequireBranch requireSpecificBranch>
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-500">
                <BranchContextBanner />
                <div className="bg-primary/10 p-8 rounded-[3rem] shadow-inner text-primary">
                <Brain className="w-16 h-16 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
                <h1 className="text-h1 font-bold tracking-tight text-primary">Exam Attendance</h1>
                <p className="text-muted-foreground font-medium text-lg max-w-md">
                    Implementation for examination hall attendance tracking is in progress.
                </p>
            </div>
            <Button
                onClick={() => router.back()}
                variant="outline"
                className="rounded-2xl h-14 px-8 font-semibold gap-2 transition-all hover:scale-105"
            >
                <ArrowLeft size={20} /> Go Back
            </Button>
        </div>
    </RequireBranch>
    );
}
