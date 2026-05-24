"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from "@/context/AuthContext";
import { FileSpreadsheet, Link, ArrowRight, AlertCircle, UserPlus } from "lucide-react";
import NextLink from "next/link";
import SharableLink from "@/components/admission/SharableLink";

export default function AdmissionPage() {
    const { user, resolvedBranchId } = useAuth();
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_ADMIN';

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-4 md:px-0">
            <BranchContextBanner />
            <div className="space-y-4">
                <h1 className="text-h1 font-bold tracking-tight text-primary">Student Admission</h1>
                <p className="text-muted-foreground text-xl font-medium">Direct admission creation is disabled. Use one of the methods below.</p>
            </div>

            <div className="p-8 bg-amber-500/5 border-2 border-amber-500/20 rounded-[2rem] flex items-start gap-4">
                <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-1" />
                <div className="space-y-2">
                    <h3 className="font-bold text-amber-600">Administrative Policy</h3>
                    <p className="text-sm text-amber-600/80 font-medium">All admissions must be processed through bulk CSV import or the online admission form link. This ensures data consistency and proper document handling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bulk Import Card */}
                {isAdmin && (
                    <NextLink href="/dashboard/students/import" className="group">
                        <div className="p-10 bg-white/75 border-2 border-border rounded-[3rem] shadow-sm hover:border-primary/60 hover:shadow-xl transition-all space-y-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileSpreadsheet size={32} />
                            </div>
                            <div className="space-y-3">
                                <h2 className="text-h2 font-bold tracking-tight text-primary">Bulk CSV Import</h2>
                                <p className="text-muted-foreground font-medium">Import multiple admissions at once with documents via ZIP file. Requires admin privileges.</p>
                            </div>
                            <div className="flex items-center gap-2 text-primary font-bold text-sm group-hover:gap-4 transition-all">
                                Go to Import <ArrowRight size={16} />
                            </div>
                        </div>
                    </NextLink>
                )}

                {/* Online Form Card */}
                <div className="p-10 bg-white/75 border-2 border-border rounded-[3rem] shadow-sm space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <Link size={32} />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-h2 font-bold tracking-tight text-primary">Online Admission Form</h2>
                        <p className="text-muted-foreground font-medium">Share this link with parents to submit applications online.</p>
                    </div>
                    {resolvedBranchId ? (
                        <SharableLink branchId={resolvedBranchId} />
                    ) : (
                        <p className="text-sm text-muted-foreground">Select a branch to generate the link.</p>
                    )}
                </div>
            </div>

            <div className="p-10 bg-muted/20 border border-border rounded-[3rem] space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserPlus size={24} />
                    </div>
                    <h2 className="text-h2 font-bold tracking-tight text-primary">Quick Guide</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">1</div>
                        <h4 className="font-semibold text-sm">Prepare ZIP File</h4>
                        <p className="text-xs text-muted-foreground">Download the sample CSV, fill in student details, and organize documents in a <code className="bg-muted px-1 rounded">documents/</code> folder.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">2</div>
                        <h4 className="font-semibold text-sm">Upload & Process</h4>
                        <p className="text-xs text-muted-foreground">Upload the ZIP file to the bulk import page. The system will process everything in the background.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">3</div>
                        <h4 className="font-semibold text-sm">Review & Approve</h4>
                        <p className="text-xs text-muted-foreground">Check imported applications in Admission Management. Verify documents and approve to enroll students.</p>
                    </div>
                </div>
            </div>
            </div>
        </RequireBranch>
    );
}
