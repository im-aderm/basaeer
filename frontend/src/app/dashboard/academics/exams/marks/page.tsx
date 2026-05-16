"use client";

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
import { toast } from "sonner";

export default function ScoreEntryPage() {
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
            toast.error("Failed to load student data");
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (studentId: string, componentId: string, value: string) => {
        const num = parseFloat(value) || 0;
        const component = components.find(c => c.id === componentId);
        if (component && num > component.maxScore) {
            toast.error(`Score cannot exceed max score (${component.maxScore})`);
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
            toast.success("Marks saved successfully!");
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error("Save failed:", error);
            toast.error("Failed to save marks");
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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Calculator className="text-primary w-10 h-10" />
                        Dynamic Marks Entry
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Record and process academic performance with dynamic grading components.</p>
                </div>

                <div className="flex gap-4">
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
            <div className="p-8 bg-white/75 border border-border rounded-[2.5rem] shadow-sm flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Class</label>
                    <select
                        className="w-full p-4 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold text-sm"
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
                        className="w-full p-4 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold text-sm"
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
                        className="w-full p-4 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold text-sm"
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
                        className="w-full p-4 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold text-sm"
                        value={selectedSessionId}
                        onChange={e => setSelectedSessionId(e.target.value)}
                    >
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>

                <div className="flex-1 min-w-[150px] space-y-2">
                    <label className="text-label text-muted-foreground ml-2">Term</label>
                    <select
                        className="w-full p-4 bg-white border border-primary/90 rounded-2xl focus:border-primary outline-none font-bold text-sm"
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
                    className="p-5 bg-background border border-border rounded-2xl hover:bg-muted transition-all active:scale-90"
                >
                    <Search className="text-primary" />
                </button>
            </div>

            {success && (
                <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2rem] flex items-center gap-4 text-green-600 font-semibold animate-in zoom-in-95">
                    <CheckCircle2 />
                    Scores saved successfully!
                </div>
            )}

            {/* Score Grid */}
            <div className="bg-white/75 border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                {students.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-left border-b border-border">
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground min-w-[250px]">Pupil Name</th>
                                    {components.map(comp => (
                                        <th key={comp.id} className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-primary text-center">
                                            {comp.name} ({comp.maxScore})
                                            <div className="text-[8px] text-muted-foreground font-medium mt-1">Weight: {comp.weight}%</div>
                                        </th>
                                    ))}
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground text-center bg-muted/20">Total (100)</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {students.map((student) => {
                                    const total = calculateStudentTotal(student.id);

                                    return (
                                        <tr key={student.id} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                        {student.user?.firstName?.[0]}{student.user?.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-md tracking-tight">
                                                            {student.user?.firstName} {student.user?.lastName}
                                                        </p>
                                                        <p className="text-[10px] text-muted-foreground font-medium">{student.studentId || "N/A"}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            {components.map(comp => (
                                                <td key={comp.id} className="px-6 py-4">
                                                    <input
                                                        type="number"
                                                        className={clsx(
                                                            "w-20 mx-auto p-3 border-none rounded-xl text-center font-bold outline-none focus:ring-2 transition-all",
                                                            comp.isExam ? "bg-amber-500/5 text-amber-600 ring-amber-500/30" : "bg-muted/20 text-foreground ring-primary/30"
                                                        )}
                                                        value={scores[student.id]?.[comp.id] ?? ""}
                                                        onChange={e => handleScoreChange(student.id, comp.id, e.target.value)}
                                                        max={comp.maxScore}
                                                    />
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 text-center bg-muted/20">
                                                <span className={clsx(
                                                    "inline-flex items-center justify-center w-12 h-12 rounded-xl font-bold text-lg",
                                                    Number(total) >= 50 ? "text-primary" : "text-destructive"
                                                )}>
                                                    {total}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handlePrintOpenDay(student)}
                                                    className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/10 rounded-lg group"
                                                    title="Print Open Day Report"
                                                >
                                                    <Printer size={20} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-32 text-center space-y-4">
                        <div className="w-24 h-24 bg-muted/50 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Filter size={48} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-h3 font-semibold">Ready to record marks</h3>
                        <p className="text-muted-foreground font-medium max-w-xs mx-auto">Select class and subject filters to load the dynamic entry grid.</p>
                    </div>
                )}
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex items-start gap-4">
                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600">
                        <FileText size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-amber-900">Open Day Ready</h4>
                        <p className="text-sm text-amber-800/70 mt-1">
                            Use the printer icon to generate CA-only reports for Open Day. These exclude summative exams and show preliminary progress.
                        </p>
                    </div>
                </div>
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Calculator size={24} />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary-900">Dynamic Weights</h4>
                        <p className="text-sm text-primary-800/70 mt-1">
                            The grid automatically adjusts columns based on the subject's assessment settings. Totals are calculated using weighted logic.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
