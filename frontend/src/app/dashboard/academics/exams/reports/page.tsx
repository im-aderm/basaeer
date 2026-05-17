"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { ExamService } from "@/services/examService";
import { StudentService } from "@/services/studentService";
import { ClassService } from "@/services/classService";
import { useAuth } from "@/context/AuthContext";
import {
    FileText,
    Download,
    Loader2,
    Search,
    Users,
    ChevronRight,
    SearchX,
    Printer,
    CheckCircle2
} from "lucide-react";
import { Term } from "@/types/enums";
import { clsx } from "clsx";

export default function ReportCardPage() {
    const { user, resolvedBranchId } = useAuth();
    const branding = user?.branding;

    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState<Term>(Term.FIRST);

    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [batchDownloading, setBatchDownloading] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [classesData, sessionsData] = await Promise.all([
                ClassService.getAll(),
                ExamService.getSessions()
            ]);
            setClasses(classesData);
            setSessions(sessionsData);
            if (sessionsData.length > 0) {
                setSelectedSessionId(sessionsData[0].id);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to load initial data:", error);
        }
    };

    useEffect(() => {
        if (selectedClassId) {
            const cls = classes.find(c => c.id === selectedClassId);
            setSections(cls?.sections || []);
        } else {
            setSections([]);
        }
    }, [selectedClassId, classes]);

    const handleFetchStudents = async () => {
        if (!selectedSectionId) return;
        setLoading(true);
        try {
            const data = await StudentService.getAll({ sectionId: selectedSectionId });
            setStudents(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (studentId: string, studentName: string) => {
        setDownloading(studentId);
        try {
            const blob = await ExamService.getReportCard(studentId, selectedSessionId, selectedTerm);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Report_${studentName.replace(/\s+/g, '_')}_${selectedTerm}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Download failed:", error);
        } finally {
            setDownloading(null);
        }
    };

    const handleDownloadAnnual = async (studentId: string, studentName: string) => {
        setDownloading(`${studentId}-annual`);
        try {
            const blob = await ExamService.getAnnualReport(studentId, selectedSessionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Annual_Report_${studentName.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Download failed:", error);
        } finally {
            setDownloading(null);
        }
    };

    const handleDownloadBatch = async () => {
        if (!selectedSectionId || !selectedSessionId) return;
        setBatchDownloading(true);
        try {
            const blob = await ExamService.getBatchReports(selectedSectionId, selectedSessionId, selectedTerm);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Reports_Batch_${selectedSectionId}_${selectedTerm}.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Batch download failed:", error);
        } finally {
            setBatchDownloading(false);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <button
                        onClick={handleDownloadBatch}
                        disabled={!selectedSectionId || batchDownloading || students.length === 0}
                        className="flex items-center gap-3 px-8 py-4 bg-muted border border-border rounded-2xl font-semibold text-sm hover:bg-muted/80 transition-all shadow-sm disabled:opacity-50"
                    >
                        {batchDownloading ? <Loader2 size={18} className="animate-spin text-primary" /> : <Download size={18} className="text-primary" />}
                        Download All (ZIP)
                    </button>
                    <div className="flex items-center gap-4">
                        {branding?.logoUrl && (
                            <img
                                src={branding.logoUrl}
                                alt="School Logo"
                                className="h-14 w-14 rounded-2xl object-cover border border-border"
                            />
                        )}
                        <div>
                            <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                                <FileText className="w-10 h-10" style={{ color: branding?.primaryColor || 'var(--primary)' }} />
                                <span style={{ color: branding?.primaryColor || undefined }}>
                                    Report Card Management
                                </span>
                            </h1>
                            <p className="text-muted-foreground mt-2 text-lg font-medium" style={{ color: branding?.primaryColor || undefined }}>
                                {branding?.name || 'School'} &mdash; Generate and distribute academic performance reports.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-white/75 border border-border rounded-[3rem] p-10 shadow-sm flex flex-wrap items-end gap-8">
                <div className="flex-1 min-w-[220px] space-y-3">
                    <label className="text-label text-muted-foreground ml-3">Select Class</label>
                    <select
                        className="w-full p-5 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[220px] space-y-3">
                    <label className="text-label text-muted-foreground ml-3">Select Section</label>
                    <select
                        className="w-full p-5 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedSectionId}
                        onChange={e => setSelectedSectionId(e.target.value)}
                        disabled={!selectedClassId}
                    >
                        <option value="">Select Section</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[180px] space-y-3">
                    <label className="text-label text-muted-foreground ml-3">Academic Session</label>
                    <select
                        className="w-full p-5 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedSessionId}
                        onChange={e => setSelectedSessionId(e.target.value)}
                    >
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px] space-y-3">
                    <label className="text-label text-muted-foreground ml-3">Academic Term</label>
                    <select
                        className="w-full p-5 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedTerm}
                        onChange={e => setSelectedTerm(e.target.value as Term)}
                    >
                        <option value={Term.FIRST}>First Term</option>
                        <option value={Term.SECOND}>Second Term</option>
                        <option value={Term.THIRD}>Third Term</option>
                    </select>
                </div>

                <button
                    onClick={handleFetchStudents}
                    disabled={!selectedSectionId}
                    className="p-6 bg-primary text-white rounded-[1.5rem] shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
                >
                    <Search size={28} />
                </button>
            </div>

            {/* Student Grid */}
            <div className="bg-white/75 border border-border rounded-[3.5rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                {loading ? (
                    <div className="py-32 flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-primary" />
                        <p className="font-semibold text-muted-foreground">Retrieving student records...</p>
                    </div>
                ) : students.length > 0 ? (
                    <div className="divide-y divide-border/50">
                        {students.map((student) => {
                            const fullName = `${student.user?.firstName} ${student.user?.lastName}`;
                            return (
                                <div key={student.id} className="p-8 hover:bg-muted/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                                    <div className="flex items-center gap-6">
                                        {student.passportPhoto ? (
                                            <img
                                                src={student.passportPhoto}
                                                alt={fullName}
                                                className="w-20 h-20 rounded-[2rem] object-cover border border-primary/10 shadow-inner"
                                            />
                                        ) : (
                                            <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 flex items-center justify-center text-primary font-semibold text-h3 shadow-inner">
                                                {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="text-h3 font-semibold tracking-tight">{fullName}</h3>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-label px-3 py-1 bg-muted rounded-full text-muted-foreground">
                                                    {student.user?.email.split('@')[0].toUpperCase()}
                                                </span>
                                                <span className="text-xs font-bold text-primary">
                                                    {student.class?.name} - {student.section?.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <button
                                            onClick={() => handleDownloadReport(student.id, fullName)}
                                            disabled={downloading === student.id}
                                            className="flex items-center gap-3 px-6 py-3 bg-muted rounded-2xl font-semibold text-sm hover:bg-primary hover:text-white transition-all group-hover:shadow-lg"
                                        >
                                            {downloading === student.id ? <Loader2 size={18} className="animate-spin" /> : <Printer size={18} />}
                                            {selectedTerm} Term Report
                                        </button>

                                        {selectedTerm === Term.THIRD && (
                                            <button
                                                onClick={() => handleDownloadAnnual(student.id, fullName)}
                                                disabled={downloading === `${student.id}-annual`}
                                                className="flex items-center gap-3 px-6 py-3 bg-primary/10 text-primary rounded-2xl font-semibold text-sm hover:bg-primary hover:text-white transition-all group-hover:shadow-lg"
                                            >
                                                {downloading === `${student.id}-annual` ? <Loader2 size={18} className="animate-spin" /> : <Award size={18} />}
                                                Annual Cumulative
                                            </button>
                                        )}

                                        <button className="p-3 bg-muted rounded-xl hover:bg-muted/80 transition-all">
                                            <ChevronRight size={20} className="text-muted-foreground" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-40 text-center space-y-6">
                        <div className="w-28 h-28 bg-muted/50 rounded-[3rem] flex items-center justify-center mx-auto mb-4 border border-border">
                            <SearchX size={48} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-h3 font-semibold">Search for Reports</h3>
                        <p className="max-w-md mx-auto text-muted-foreground font-medium">
                            Select a class and section above to view students and generate their performance report sheets.
                        </p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-10 bg-blue-500/5 border border-blue-500/10 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-3 text-blue-600 font-semibold">
                        <CheckCircle2 size={24} /> Automated Verification
                    </div>
                    <p className="text-sm text-blue-800/80 font-medium leading-relaxed">
                        All student positions, averages, and rankings are automatically computed as you save marks in the entry grid. Ensure all subject scores are recorded before generating final reports.
                    </p>
                </div>
                <div className="p-10 bg-amber-500/5 border border-amber-500/10 rounded-[3rem] space-y-4">
                    <div className="flex items-center gap-3 text-amber-600 font-semibold">
                        <Printer size={24} /> Print Configuration
                    </div>
                    <p className="text-sm text-amber-800/80 font-medium leading-relaxed">
                        Reports are generated in A4 PDF format. For best results, use "Save as PDF" with backgrounds enabled in your print settings.
                    </p>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}

// Added Award import for Cumulative button
function Award({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size || 24}
            height={size || 24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    );
}
