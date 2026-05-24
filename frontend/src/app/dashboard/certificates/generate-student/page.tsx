"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import {
    Award,
    CheckSquare,
    Square,
    Loader2,
    Download,
    FileCheck,
    Users,
    AlertCircle,
    CheckCircle2,
    XCircle
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { StudentService, Student } from "@/services/studentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, STAT_CARD, STAT_LABEL, STAT_VALUE } from "@/lib/table-styles";
import { useNotification } from '@/context/NotificationContext';

export default function GenerateStudentCertificatePage() {
    const { showSuccess, showError } = useNotification();
    const { user, resolvedBranchId } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [templates, setTemplates] = useState<any[]>([]);
    const [selectedTemplate, setSelectedTemplate] = useState("");
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [results, setResults] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

    const fetchData = async () => {
        try {
            const [studentsData, templatesData] = await Promise.all([
                StudentService.getAll({ branchId: resolvedBranchId }),
                api.get("/certificates/templates")
            ]);
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setTemplates(Array.isArray(templatesData.data) ? templatesData.data : []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            showError("Failed to load students or templates");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const toggleStudent = (id: string) => {
        const next = new Set(selectedStudentIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedStudentIds(next);
    };

    const toggleAll = () => {
        if (filteredStudents.length === selectedStudentIds.size) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(filteredStudents.map(s => s.id)));
        }
    };

    const handleGenerate = async () => {
        if (!selectedTemplate) {
            showError("Please select a template");
            return;
        }
        if (selectedStudentIds.size === 0) {
            showError("Please select at least one student");
            return;
        }

        setGenerating(true);
        setResults(null);

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const studentId of selectedStudentIds) {
            try {
                await api.post("/certificates", {
                    studentId,
                    templateId: selectedTemplate,
                    type: templates.find(t => t.id === selectedTemplate)?.type || "ACHIEVEMENT",
                    issueDate: new Date().toISOString(),
                    branchId: resolvedBranchId,
                    description: "",
                });
                success++;
            } catch (error: any) {
                failed++;
                const student = students.find(s => s.id === studentId);
                const name = student ? `${student.firstName} ${student.lastName}` : studentId;
                errors.push(`${name}: ${error?.response?.data?.message || error.message || "Unknown error"}`);
            }
        }

        setResults({ success, failed, errors });
        if (success > 0) showSuccess(`Successfully generated ${success} certificate(s)`);
        if (failed > 0) showError(`Failed to generate ${failed} certificate(s)`);
        setGenerating(false);
    };

    const filteredStudents = (students ?? []).filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin mx-auto h-6 w-6 text-primary" /></div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6 pb-20">
            <BranchContextBanner />
            <div className="bg-white/75 border border-primary/20 p-4 rounded-2xl shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Award className="w-6 h-6" />
                        Bulk Certificate Generation
                    </h1>
                    <p className="text-foreground/60 mt-1 text-[12px] font-medium">Select students and a template to generate certificates in bulk.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="p-4 border-b border-primary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                Select Students
                                <Badge className="ml-2 rounded-full bg-primary/10 text-primary border-none font-bold text-[12px]">{selectedStudentIds.size} selected</Badge>
                            </CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Input
                                    placeholder="Search students..."
                                    className="pl-3 h-9 rounded-xl bg-muted/50 border-none font-bold text-[12px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead className={TABLE_HEADER}>
                                    <tr>
                                        <th className={TABLE_HEADER_CELL_NO_SORT + " w-12"}>
                                            <button onClick={toggleAll} className="flex items-center justify-center w-full">
                                                {filteredStudents.length === selectedStudentIds.size && filteredStudents.length > 0
                                                    ? <CheckSquare className="w-4 h-4 text-primary" />
                                                    : <Square className="w-4 h-4 text-foreground/60" />
                                                }
                                            </button>
                                        </th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Student</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Class</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className={`hover:bg-primary/[0.03] transition-all cursor-pointer ${selectedStudentIds.has(student.id) ? 'bg-amber-500/5' : ''}`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <td className={TABLE_CELL}>
                                                {selectedStudentIds.has(student.id)
                                                    ? <CheckSquare className="w-4 h-4 text-primary" />
                                                    : <Square className="w-4 h-4 text-foreground/60" />
                                                }
                                            </td>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                {student.firstName} {student.lastName}
                                            </td>
                                            <td className={TABLE_CELL}>
                                                {student.class?.name || 'N/A'}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-8 text-center">
                                                <Users className="w-8 h-8 text-foreground/30 mx-auto mb-2" />
                                                <p className="font-semibold text-foreground/60 text-[12px]">No students found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card className="rounded-2xl border-primary/20 shadow-xl overflow-hidden border-t-4 border-t-primary">
                        <CardHeader className="p-4 border-b border-primary/20">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                                <FileCheck className="h-4 w-4 text-primary" />
                                Template & Generate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            <div className="space-y-1">
                                <label className="text-[12px] font-semibold text-foreground/60 ml-1">Certificate Template</label>
                                <select
                                    className="w-full h-10 rounded-2xl bg-white border border-primary/90 font-bold text-[12px] px-3 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    <option value="">Choose a template...</option>
                                    {templates.map((tpl) => (
                                        <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.type})</option>
                                    ))}
                                </select>
                                {templates.length === 0 && (
                                    <p className="text-[12px] font-medium text-foreground/60 mt-1">No templates found. Create one first.</p>
                                )}
                            </div>

                            <div className="bg-muted/30 rounded-2xl p-3 space-y-1">
                                <div className="flex justify-between text-[12px] font-medium">
                                    <span className="text-foreground/60">Selected Students</span>
                                    <span className="font-bold">{selectedStudentIds.size}</span>
                                </div>
                                <div className="flex justify-between text-[12px] font-medium">
                                    <span className="text-foreground/60">Template</span>
                                    <span className="font-bold">{selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || 'Selected' : 'None'}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-10 rounded-2xl font-semibold text-[12px] shadow-xl shadow-primary/20 gap-2"
                                disabled={generating || selectedStudentIds.size === 0 || !selectedTemplate}
                                onClick={handleGenerate}
                            >
                                {generating ? (
                                    <><Loader2 className="animate-spin" /> Generating...</>
                                ) : (
                                    <><Download className="w-4 h-4" /> Generate Certificates</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {results && (
                        <Card className="rounded-2xl border-primary/20 shadow-lg overflow-hidden">
                            <CardContent className="p-4 space-y-3">
                                <h4 className="font-semibold text-[12px] uppercase tracking-wider">Generation Results</h4>
                                <div className="flex gap-3">
                                    <div className="flex items-center gap-2 text-[12px]">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <span className="font-bold">{results.success}</span> succeeded
                                    </div>
                                    {results.failed > 0 && (
                                        <div className="flex items-center gap-2 text-[12px]">
                                            <XCircle className="w-3 h-3 text-red-500" />
                                            <span className="font-bold">{results.failed}</span> failed
                                        </div>
                                    )}
                                </div>
                                {results.errors.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto space-y-1 bg-red-500/5 rounded-xl p-3">
                                        {results.errors.map((err, i) => (
                                            <p key={i} className="text-[12px] text-red-600 flex items-start gap-1">
                                                <AlertCircle className="w-3 h-3 mt-0.5 shrink-0" /> {err}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}
