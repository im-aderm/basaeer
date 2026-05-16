"use client";

import { useState, useEffect } from "react";
import { ExamService } from "@/services/examService";
import { ClassService } from "@/services/classService";
import {
    Table,
    FileSpreadsheet,
    Download,
    Loader2,
    Search,
    BookOpen,
    CheckCircle2,
    FileText
} from "lucide-react";
import { Term } from "@/types/enums";
import { clsx } from "clsx";

export default function BroadsheetPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState<Term>(Term.FIRST);

    const [loading, setLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

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

    const handleDownloadBroadsheet = async () => {
        if (!selectedSectionId) return;
        setExporting(true);
        try {
            const blob = await ExamService.getBroadsheet(selectedSectionId, selectedSessionId, selectedTerm);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Broadsheet_${selectedSectionId}_${selectedTerm}.xlsx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Export failed:", error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <FileSpreadsheet className="text-primary w-10 h-10" />
                        Class Broadsheet
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Generate class-wide result summaries for administrative review.</p>
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

                <div className="flex-1 min-w-[150px] space-y-3">
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

                <div className="flex-none">
                    <button
                        onClick={handleDownloadBroadsheet}
                        disabled={!selectedSectionId || exporting}
                        className="flex items-center gap-3 px-8 py-5 bg-primary text-white rounded-[1.5rem] font-semibold shadow-xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {exporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />}
                        Export Excel Broadsheet
                    </button>
                </div>
            </div>

            {/* Empty State / Preview Note */}
            <div className="bg-white/75 border border-border rounded-[4rem] p-20 text-center space-y-8 border-t-8 border-t-primary shadow-sm bg-gradient-to-b from-card to-muted/10">
                <div className="w-32 h-32 bg-primary/5 rounded-[3rem] flex items-center justify-center mx-auto border border-primary/10">
                    <Table size={56} className="text-primary" />
                </div>
                <div className="space-y-4 max-w-2xl mx-auto">
                    <h2 className="text-h1 font-semibold tracking-tight">Ready for Generation</h2>
                    <p className="text-muted-foreground text-lg font-medium leading-relaxed">
                        The Broadsheet provides a comprehensive row-by-row analysis of all pupils in a section, showing scores across all subjects, totals, averages, and class positions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                    <div className="p-6 bg-background rounded-[2rem] border border-border space-y-2">
                        <BookOpen className="mx-auto text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Subject Headers</p>
                    </div>
                    <div className="p-6 bg-background rounded-[2rem] border border-border space-y-2">
                        <CheckCircle2 className="mx-auto text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Auto-Ranking</p>
                    </div>
                    <div className="p-6 bg-background rounded-[2rem] border border-border space-y-2">
                        <FileText className="mx-auto text-primary" />
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Detailed Scores</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
