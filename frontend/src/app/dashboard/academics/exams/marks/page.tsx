"use client";

import { useState, useEffect } from "react";
import { ExamService } from "@/services/examService";
import { StudentService } from "@/services/studentService";
import { ClassService } from "@/services/classService";
import { SubjectService } from "@/services/subjectService";
import {
    Calculator,
    Save,
    Loader2,
    Search,
    Users,
    BookOpen,
    Filter,
    CheckCircle2,
    AlertCircle,
    Download
} from "lucide-react";
import { clsx } from "clsx";
import { Term, ExamTerm } from "@/types/enums";

export default function ScoreEntryPage() {
    // Selection state
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState<Term>(Term.FIRST);
    const [selectedExamTerm, setSelectedExamTerm] = useState<ExamTerm>(ExamTerm.FIRST_TERM);

    // Data state
    const [students, setStudents] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<string, any>>({});

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        try {
            const [classesData, subjectsData, sessionsData] = await Promise.all([
                ClassService.getAll(),
                SubjectService.getAll(),
                ExamService.getSessions()
            ]);
            setClasses(classesData);
            setSubjects(subjectsData);
            setSessions(sessionsData);
            if (sessionsData.length > 0) {
                setSelectedSessionId(sessionsData[0].id);
            }
        } catch (error) {
            console.error("Failed to load setup data:", error);
        }
    };

    useEffect(() => {
        if (selectedClassId) {
            const cls = classes.find(c => c.id === selectedClassId);
            setSections(cls?.sections || []);
        }
    }, [selectedClassId, classes]);

    const handleFetchStudents = async () => {
        if (!selectedSectionId) return;
        setLoading(true);
        try {
            const data = await StudentService.getAll({ sectionId: selectedSectionId });
            setStudents(data);

            // Initialize scores map if they have previous records (ideally backend should return records merge)
            const initialScores: Record<string, any> = {};
            data.forEach((s: any) => {
                const record = s.assessmentRecords?.find((r: any) =>
                    r.subjectId === selectedSubjectId &&
                    r.sessionId === selectedSessionId &&
                    r.term === selectedTerm
                );
                initialScores[s.id] = {
                    asgn1: record?.asgn1 || 0,
                    asgn2: record?.asgn2 || 0,
                    test1: record?.test1 || 0,
                    test2: record?.test2 || 0,
                    examScore: record?.examScore || 0,
                    isEligible: record?.isEligible ?? true
                };
            });
            setScores(initialScores);
        } catch (error) {
            console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleEligibility = async (studentId: string, isEligible: boolean) => {
        try {
            await ExamService.toggleEligibility(studentId, {
                subjectId: selectedSubjectId,
                sessionId: selectedSessionId,
                term: selectedTerm,
                isEligible
            });
            setScores(prev => ({
                ...prev,
                [studentId]: {
                    ...prev[studentId],
                    isEligible
                }
            }));
        } catch (error) {
            console.error("Eligibility toggle failed:", error);
        }
    };

    const handlePublish = async (isLocked: boolean) => {
        if (!confirm(`Are you sure you want to ${isLocked ? 'publish and lock' : 'unpublish'} these results?`)) return;
        setSaving(true);
        try {
            await ExamService.publishResults({
                sectionId: selectedSectionId,
                sessionId: selectedSessionId,
                term: selectedTerm,
                isLocked
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Publish failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleScoreChange = (studentId: string, field: string, value: string) => {
        const num = parseFloat(value) || 0;
        setScores(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [field]: num
            }
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess(false);
        try {
            const payload = {
                subjectId: selectedSubjectId,
                sectionId: selectedSectionId,
                sessionId: selectedSessionId,
                term: selectedTerm,
                examTerm: selectedExamTerm,
                scores: Object.entries(scores).map(([studentId, vals]) => ({
                    studentId,
                    ...vals
                }))
            };
            await ExamService.submitScores(payload);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            // Basic CSV parsing logic placeholder
            console.log("CSV Content:", text);
            // In a real scenario, we'd parse this and update `scores` state
            alert("CSV Data received! Parsing and merging logic would go here.");
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3">
                        <Calculator className="text-primary w-10 h-10" />
                        Marks Entry Grid
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Record and process academic performance scores.</p>
                </div>

                <div className="flex gap-4">
                    <label className="flex items-center gap-2 px-6 py-3 bg-muted/50 border border-border rounded-2xl font-semibold text-sm hover:bg-muted transition-all cursor-pointer">
                        <Download size={18} /> Import CSV
                        <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
                    </label>
                    <button
                        onClick={() => handlePublish(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-2xl font-semibold text-sm hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                    >
                        <CheckCircle2 size={18} /> Publish Results
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || students.length === 0}
                        className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-[1.5rem] font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-8 bg-card border border-border rounded-[2.5rem] shadow-sm flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Class</label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Section</label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedSectionId}
                        onChange={e => setSelectedSectionId(e.target.value)}
                    >
                        <option value="">Select Section</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Subject</label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedSubjectId}
                        onChange={e => setSelectedSubjectId(e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Session</label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                        value={selectedSessionId}
                        onChange={e => setSelectedSessionId(e.target.value)}
                    >
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Term</label>
                    <select
                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
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
                    disabled={!selectedSectionId || !selectedSubjectId}
                    className="p-5 bg-background border border-border rounded-2xl hover:bg-muted transition-all"
                >
                    <Search className="text-primary" />
                </button>
            </div>

            {success && (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center gap-4 text-green-600 font-semibold animate-in zoom-in-95">
                    <CheckCircle2 />
                    Scores saved and rankings updated successfully!
                </div>
            )}

            {/* Score Grid */}
            <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-left border-b border-border">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground min-w-[250px]">Pupil Name</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-primary text-center">Eligible?</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-primary text-center">Assgn 1 (10)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-primary text-center">Assgn 2 (10)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-blue-600 text-center">Test 1 (20)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-blue-600 text-center">Test 2 (20)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-amber-600 text-center">Exam (40)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center bg-muted/20">Total (100)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {students.map((student) => {
                                    const s = scores[student.id] || {};
                                    const total = (s.asgn1 || 0) + (s.asgn2 || 0) + (s.test1 || 0) + (s.test2 || 0) + (s.examScore || 0);

                                    return (
                                        <tr key={student.id} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    className="w-6 h-6 rounded-lg accent-primary cursor-pointer hover:scale-110 transition-transform"
                                                    checked={s.isEligible ?? true}
                                                    onChange={e => handleToggleEligibility(student.id, e.target.checked)}
                                                />
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                                        {student.id.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-lg tracking-tight">
                                                            {student.user?.firstName} {student.user?.lastName}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-medium">{student.user?.email.split('@')[0].toUpperCase()}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto p-3 bg-muted/20 border-none rounded-xl text-center font-semibold outline-none focus:ring-2 ring-primary/30"
                                                    value={s.asgn1 ?? ""}
                                                    onChange={e => handleScoreChange(student.id, "asgn1", e.target.value)}
                                                    max={10}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto p-3 bg-muted/20 border-none rounded-xl text-center font-semibold outline-none focus:ring-2 ring-primary/30"
                                                    value={s.asgn2 ?? ""}
                                                    onChange={e => handleScoreChange(student.id, "asgn2", e.target.value)}
                                                    max={10}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto p-3 bg-blue-500/5 text-blue-600 border-none rounded-xl text-center font-semibold outline-none focus:ring-2 ring-blue-500/30"
                                                    value={s.test1 ?? ""}
                                                    onChange={e => handleScoreChange(student.id, "test1", e.target.value)}
                                                    max={20}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto p-3 bg-blue-500/5 text-blue-600 border-none rounded-xl text-center font-semibold outline-none focus:ring-2 ring-blue-500/30"
                                                    value={s.test2 ?? ""}
                                                    onChange={e => handleScoreChange(student.id, "test2", e.target.value)}
                                                    max={20}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    className="w-20 mx-auto p-3 bg-amber-500/5 text-amber-600 border-none rounded-xl text-center font-semibold outline-none focus:ring-2 ring-amber-500/30"
                                                    value={s.examScore ?? ""}
                                                    onChange={e => handleScoreChange(student.id, "examScore", e.target.value)}
                                                    max={40}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center bg-muted/20">
                                                <span className={clsx(
                                                    "inline-flex items-center justify-center w-14 h-14 rounded-2xl font-semibold text-h3",
                                                    total >= 50 ? "text-primary" : "text-destructive"
                                                )}>
                                                    {total}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-32 text-center space-y-4">
                        <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                            <Filter size={48} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-h3 font-semibold">No records to display</h3>
                        <p className="text-muted-foreground font-medium">Select class and subject to begin recording marks.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
