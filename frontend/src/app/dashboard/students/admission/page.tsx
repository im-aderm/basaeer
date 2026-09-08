"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from "@/context/AuthContext";
import { FileSpreadsheet, Link, ArrowRight, AlertCircle, UserPlus, FileDown, Loader2, ChevronDown } from "lucide-react";
import NextLink from "next/link";
import SharableLink from "@/components/admission/SharableLink";
import { BulkExportService } from "@/services/bulkExportService";
import { useNotification } from '@/context/NotificationContext';
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdmissionPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [exporting, setExporting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_ADMIN';

    const handleDownload = async (format: "EXCEL" | "CSV") => {
        setMenuOpen(false);
        if (!resolvedBranchId) {
            showError("Select a branch to download admissions.");
            return;
        }
        setExporting(true);
        setProgress(0);
        try {
            const type = format === "EXCEL" ? "ADMISSION_LIST_EXCEL" : "ADMISSION_LIST_CSV";
            await BulkExportService.runAndDownload(type, {}, setProgress);
            showSuccess(`Admissions downloaded as ${format}.`);
        } catch (e: any) {
            showError(e?.message || "Bulk download failed. Please try again.");
        } finally {
            setExporting(false);
            setProgress(0);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-300 pb-8 px-4">
            <BranchContextBanner />
            <div className="space-y-1.5">
                <h1 className="text-[20px] md:text-[22px] font-bold tracking-tight text-primary">Student Admission</h1>
                <p className="text-muted-foreground text-[13px] font-normal">Choose how to onboard students — quick enroll, bulk import, or share the online form.</p>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                    <h3 className="font-semibold text-[13px] text-amber-700">Administrative Policy</h3>
                    <p className="text-[12px] text-amber-600/80 leading-relaxed">All admissions should be processed through Quick Enroll, bulk CSV import, or the online form link. This ensures data consistency and proper document handling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quick Enroll Card — new primary */}
                <NextLink href="/dashboard/students/admission/enroll" className="group">
                    <Card className="p-6 h-full hover:border-emerald-500/30 hover:shadow-md transition-all border-emerald-500/20 bg-emerald-50/40">
                        <CardContent className="p-0 space-y-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <UserPlus size={22} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-[14px] font-semibold tracking-tight text-primary">Quick Enroll</h2>
                                <p className="text-[12px] text-muted-foreground leading-relaxed font-normal">Enroll a student directly in-app — full form with instant portal account.</p>
                            </div>
                            <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[12px] group-hover:gap-3 transition-all">
                                Enroll Now <ArrowRight size={14} />
                            </div>
                        </CardContent>
                    </Card>
                </NextLink>

                {/* Bulk Import Card */}
                {isAdmin && (
                    <NextLink href="/dashboard/students/import" className="group">
                        <Card className="p-6 h-full hover:border-primary/30 hover:shadow-md transition-all">
                            <CardContent className="p-0 space-y-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <FileSpreadsheet size={22} />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-[14px] font-semibold tracking-tight text-primary">Bulk CSV Import</h2>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed font-normal">Import multiple admissions at once with documents via ZIP file.</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-primary font-semibold text-[12px] group-hover:gap-3 transition-all">
                                    Go to Import <ArrowRight size={14} />
                                </div>
                            </CardContent>
                        </Card>
                    </NextLink>
                )}

                {/* Online Form Card */}
                <Card className="p-6 h-full">
                    <CardContent className="p-0 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Link size={22} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-[14px] font-semibold tracking-tight text-primary">Online Admission Form</h2>
                            <p className="text-[12px] text-muted-foreground leading-relaxed font-normal">Share this link with parents to submit applications online.</p>
                        </div>
                        {resolvedBranchId ? (
                            <SharableLink branchId={resolvedBranchId} />
                        ) : (
                            <p className="text-[12px] text-muted-foreground">Select a branch to generate the link.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Download Card */}
            {isAdmin && resolvedBranchId && (
                <Card className="p-6">
                    <CardContent className="p-0 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <FileDown size={20} />
                        </div>
                        <h2 className="text-[14px] font-semibold tracking-tight text-primary">Download Admissions</h2>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed font-normal">
                        Export all applications for the current branch as a spreadsheet for offline review or reporting.
                    </p>
                    <div className="relative inline-block">
                        <Button
                            onClick={() => setMenuOpen(o => !o)}
                            disabled={exporting}
                            size="sm"
                            className="rounded-xl text-[12px]"
                        >
                            {exporting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    {progress > 0 ? `${progress}%` : "Preparing…"}
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet size={14} /> Download List
                                    <ChevronDown size={14} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
                                </>
                            )}
                        </Button>
                        {menuOpen && (
                            <>
                                <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
                                <div className="absolute left-0 top-full mt-2 z-40 bg-white border border-border rounded-xl shadow-lg overflow-hidden w-44">
                                    <button
                                        onClick={() => handleDownload("EXCEL")}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium hover:bg-muted transition-colors"
                                    >
                                        <FileSpreadsheet size={14} className="text-emerald-600" /> Excel (.xlsx)
                                    </button>
                                    <button
                                        onClick={() => handleDownload("CSV")}
                                        className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[12px] font-medium hover:bg-muted transition-colors border-t border-border"
                                    >
                                        <FileSpreadsheet size={14} className="text-blue-600" /> CSV (.csv)
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    </CardContent>
                </Card>
            )}

            <Card className="p-6 bg-muted/10">
                <CardContent className="p-0 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <UserPlus size={18} />
                    </div>
                    <h2 className="text-[14px] font-semibold tracking-tight text-primary">Quick Guide</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">1</div>
                        <h4 className="font-semibold text-[12px]">Prepare ZIP File</h4>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">Download the sample CSV, fill in student details, and organize documents in a <code className="bg-muted px-1 rounded text-[11px]">documents/</code> folder.</p>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">2</div>
                        <h4 className="font-semibold text-[12px]">Upload & Process</h4>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">Upload the ZIP file to the bulk import page. The system will process everything in the background.</p>
                    </div>
                    <div className="space-y-1.5">
                        <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px]">3</div>
                        <h4 className="font-semibold text-[12px]">Review & Approve</h4>
                        <p className="text-[12px] text-muted-foreground leading-relaxed">Check imported applications in Admission Management. Verify documents and approve to enroll students.</p>
                    </div>
                </div>
                </CardContent>
            </Card>
            </div>
        </RequireBranch>
    );
}
