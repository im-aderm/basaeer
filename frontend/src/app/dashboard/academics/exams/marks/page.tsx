"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { AcademicService } from "@/services/academicService";
import { StudentService } from "@/services/studentService";
import { ClassService } from "@/services/classService";
import { SubjectService } from "@/services/subjectService";
import { ExamService } from "@/services/examService";
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
    Download,
    Printer,
    FileText
} from "lucide-react";
import { clsx } from "clsx";
import { Term } from "@/types/enums";
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function ScoreEntryPage() {
    const { showSuccess, showError } = useNotification();
    // Selection state
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [components, setComponents] = useState<any[]>([]);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    const [selectedSubjectId, setSelectedSubjectId] = useState("");
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [selectedTerm, setSelectedTerm] = useState<Term>(Term.FIRST);

    // Data state
    const [students, setStudents] = useState<any[]>([]);
    const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); // [studentId][componentId] = score

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
        if (!selectedSectionId || !selectedSubjectId) return;
        setLoading(true);
        try {
            // Fetch components for this class/subject
            const componentsData = await AcademicService.listAssessmentComponents({
                classId: selectedClassId,
                subjectId: selectedSubjectId
            });
            setComponents(componentsData);

            const studentsData = await StudentService.getAll({ sectionId: selectedSectionId });
            setStudents(studentsData);

            // Initialize scores map
            const initialScores: Record<string, any> = {};
            studentsData.forEach((student: any) => {
                initialScores[student.id] = {};
                // If student has existing records, map them
                const record = student.assessmentRecords?.find((r: any) =>
                    r.subjectId === selectedSubjectId &&
                    r.sessionId === selectedSessionId &&
                    r.term === selectedTerm
                );
                
                if (record?.scores) {
                    record.scores.forEach((s: any) => {
                        initialScores[student.id][s.componentId] = s.score;
                    });
                }
            });
            setScores(initialScores);
        } catch (error) {
            console.error("Failed to fetch students:", error);
            showError("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (studentId: string, componentId: string, value: string) => {
        const num = parseFloat(value) || 0;
        const component = components.find(c => c.id === componentId);
        if (component && num > component.maxScore) {
            showError(`Score cannot exceed max score (${component.maxScore})`);
            return;
        }

        setScores(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [componentId]: num
            }
        }));
    };

    const handleSave = async () => {
        if (components.length === 0) return;
        setSaving(true);
        setSuccess(false);
        try {
            // We save component by component as per the new API structure
            // In a real production app, we might bundle these, but for now we follow the DTO
            await Promise.all(components.map(async (comp) => {
                const componentMarks = Object.entries(scores).map(([studentId, studentScores]) => ({
                    studentId,
                    score: studentScores[comp.id] || 0
                }));

                if (componentMarks.length > 0) {
                    await AcademicService.recordBulkMarks({
                        componentId: comp.id,
                        sessionId: selectedSessionId,
                        term: selectedTerm,
                        marks: componentMarks
                    });
                }
            }));

            setSuccess(true);
            showSuccess("Marks saved successfully!");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Save failed:", error);
            showError("Failed to save marks");
        } finally {
            setSaving(false);
        }
    };

    const handlePrintOpenDay = (student: any) => {
        window.open(`/dashboard/academics/exams/open-day/${student.id}?sessionId=${selectedSessionId}&term=${selectedTerm}`, '_blank');
    };

    const calculateStudentTotal = (studentId: string) => {
        const studentScores = scores[studentId] || {};
        return components.reduce((sum, comp) => {
            const score = studentScores[comp.id] || 0;
            const weighted = (score / comp.maxScore) * comp.weight;
            return sum + weighted;
        }, 0).toFixed(2);
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Calculator className="text-primary w-10 h-10" />
                        Dynamic Marks Entry
                    </h1>
                    <p className="text-foreground/60 mt-2 text-[12px]">Record and process academic performance with dynamic grading components.</p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving || students.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl font-semibold shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 text-[12px]"
                    >
                        {saving ? <Loader2 size={24} className="animate-spin" /> : <Save size={24} />}
                        Save Changes
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="p-4 bg-white/75 border border-primary/20 rounded-2xl shadow-sm flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[160px] space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Class</label>
                    <select
                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                        value={selectedClassId}
                        onChange={e => setSelectedClassId(e.target.value)}
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[160px] space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Section</label>
                    <select
                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                        value={selectedSectionId}
                        onChange={e => setSelectedSectionId(e.target.value)}
                    >
                        <option value="">Select Section</option>
                        {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[160px] space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Subject</label>
                    <select
                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                        value={selectedSubjectId}
                        onChange={e => setSelectedSubjectId(e.target.value)}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[130px] space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Session</label>
                    <select
                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                        value={selectedSessionId}
                        onChange={e => setSelectedSessionId(e.target.value)}
                    >
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[130px] space-y-1.5">
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Term</label>
                    <select
                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
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
                    className="p-2.5 bg-background border border-primary/20 rounded-lg hover:bg-muted transition-all active:scale-90"
                >
                    <Search className="text-primary" size={16} />
                </button>
            </div>

            {success && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3 text-primary font-semibold text-[12px] animate-in zoom-in-95">
                    <CheckCircle2 size={16} />
                    Scores saved successfully!
                </div>
            )}

            {/* Score Grid */}
            <div className="bg-white/75 border border-primary/20 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-primary">
                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "min-w-[200px]")}>Pupil Name</th>
                                    {components.map(comp => (
                                        <th key={comp.id} className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-center")}>
                                            {comp.name} ({comp.maxScore})
                                            <div className="text-[8px] text-foreground/60 font-medium mt-0.5">Weight: {comp.weight}%</div>
                                        </th>
                                    ))}
                                    <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-center bg-muted/20")}>Total (100)</th>
                                    <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-center")}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {students.map((student) => {
                                    const total = calculateStudentTotal(student.id);

                                    return (
                                        <tr key={student.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px]">
                                                        {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold tracking-tight">
                                                            {student.user?.firstName} {student.user?.lastName}
                                                        </p>
                                                        <p className="text-[9px] text-foreground/60 font-medium">{student.studentId || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {components.map(comp => (
                                                <td key={comp.id} className={clsx(TABLE_CELL, "text-center")}>
                                                    <input
                                                        type="number"
                                                        className={clsx(
                                                            "w-16 mx-auto p-2 border-none rounded-md text-center font-semibold outline-none focus:ring-2 transition-all text-[12px]",
                                                            comp.isExam ? "bg-primary/5 text-primary ring-primary/30" : "bg-muted/20 text-foreground ring-primary/30"
                                                        )}
                                                        value={scores[student.id]?.[comp.id] ?? ""}
                                                        onChange={e => handleScoreChange(student.id, comp.id, e.target.value)}
                                                        max={comp.maxScore}
                                                    />
                                                </td>
                                            ))}
                                            <td className={clsx(TABLE_CELL, "text-center bg-muted/20")}>
                                                <span className={clsx(
                                                    "inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold text-[12px]",
                                                    Number(total) >= 50 ? "text-primary" : "text-destructive"
                                                )}>
                                                    {total}
                                                </span>
                                            </td>
                                            <td className={clsx(TABLE_CELL, "text-center")}>
                                                <button
                                                    onClick={() => handlePrintOpenDay(student)}
                                                    className="p-1.5 text-foreground/60 hover:text-primary transition-colors hover:bg-primary/10 rounded-md group"
                                                    title="Print Open Day Report"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-16 text-center space-y-3">
                        <div className="w-16 h-16 bg-muted/50 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                            <Filter size={32} className="text-foreground/30" />
                        </div>
                        <h3 className="text-[14px] font-semibold">Ready to record marks</h3>
                        <p className="text-foreground/60 font-medium max-w-xs mx-auto text-[12px]">Select class and subject filters to load the dynamic entry grid.</p>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <FileText size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary text-[12px]">Open Day Ready</h4>
                        <p className="text-[11px] text-primary/70 mt-0.5">
                            Use the printer icon to generate CA-only reports for Open Day. These exclude summative exams and show preliminary progress.
                        </p>
                    </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Calculator size={18} />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary-900 text-[12px]">Dynamic Weights</h4>
                        <p className="text-[11px] text-primary-800/70 mt-0.5">
                            The grid automatically adjusts columns based on the subject's assessment settings. Totals are calculated using weighted logic.
                        </p>
                    </div>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}
