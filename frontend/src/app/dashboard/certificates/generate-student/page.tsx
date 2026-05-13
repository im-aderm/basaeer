"use client";

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
import { toast } from "sonner";

export default function GenerateStudentCertificatePage() {
    const { user } = useAuth();
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
                StudentService.getAll({ branchId: user?.branchId }),
                api.get("/certificates/templates")
            ]);
            setStudents(Array.isArray(studentsData) ? studentsData : []);
            setTemplates(Array.isArray(templatesData.data) ? templatesData.data : []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            toast.error("Failed to load students or templates");
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
            toast.error("Please select a template");
            return;
        }
        if (selectedStudentIds.size === 0) {
            toast.error("Please select at least one student");
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
                    branchId: user?.branchId,
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
        if (success > 0) toast.success(`Successfully generated ${success} certificate(s)`);
        if (failed > 0) toast.error(`Failed to generate ${failed} certificate(s)`);
        setGenerating(false);
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 pb-20">
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3 text-amber-600">
                        <Award className="w-10 h-10" />
                        Bulk Certificate Generation
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Select students and a template to generate certificates in bulk.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <Card className="rounded-[3rem] border-border/50 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden border-t-8 border-t-amber-500">
                        <CardHeader className="p-8 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                                <Users className="h-6 w-6 text-amber-500" />
                                Select Students
                                <Badge className="ml-2 rounded-full bg-amber-500/10 text-amber-600 border-none font-bold">{selectedStudentIds.size} selected</Badge>
                            </CardTitle>
                            <div className="relative w-full sm:w-64">
                                <Input
                                    placeholder="Search students..."
                                    className="pl-4 h-11 rounded-xl bg-muted/50 border-none font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 text-left border-b border-border">
                                        <th className="px-8 py-5 w-16">
                                            <button onClick={toggleAll} className="flex items-center justify-center w-full">
                                                {filteredStudents.length === selectedStudentIds.size && filteredStudents.length > 0
                                                    ? <CheckSquare className="w-5 h-5 text-primary" />
                                                    : <Square className="w-5 h-5 text-muted-foreground" />
                                                }
                                            </button>
                                        </th>
                                        <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Student</th>
                                        <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Class</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                                        <tr
                                            key={student.id}
                                            className={`hover:bg-muted/5 transition-all cursor-pointer ${selectedStudentIds.has(student.id) ? 'bg-amber-500/5' : ''}`}
                                            onClick={() => toggleStudent(student.id)}
                                        >
                                            <td className="px-8 py-5">
                                                {selectedStudentIds.has(student.id)
                                                    ? <CheckSquare className="w-5 h-5 text-primary" />
                                                    : <Square className="w-5 h-5 text-muted-foreground" />
                                                }
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-semibold">{student.firstName} {student.lastName}</span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="text-sm font-medium text-muted-foreground">{student.class?.name || 'N/A'}</span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-16 text-center">
                                                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                                                <p className="font-semibold text-muted-foreground">No students found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[3rem] border-border/50 shadow-xl bg-card/50 backdrop-blur-sm overflow-hidden border-t-8 border-t-primary">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                                <FileCheck className="h-6 w-6 text-primary" />
                                Template & Generate
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Certificate Template</label>
                                <select
                                    className="w-full h-12 rounded-2xl bg-muted/30 border-none font-bold text-base px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    value={selectedTemplate}
                                    onChange={(e) => setSelectedTemplate(e.target.value)}
                                >
                                    <option value="">Choose a template...</option>
                                    {templates.map((tpl) => (
                                        <option key={tpl.id} value={tpl.id}>{tpl.name} ({tpl.type})</option>
                                    ))}
                                </select>
                                {templates.length === 0 && (
                                    <p className="text-xs font-medium text-muted-foreground mt-1">No templates found. Create one first.</p>
                                )}
                            </div>

                            <div className="bg-muted/30 rounded-2xl p-5 space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Selected Students</span>
                                    <span className="font-bold">{selectedStudentIds.size}</span>
                                </div>
                                <div className="flex justify-between text-sm font-medium">
                                    <span className="text-muted-foreground">Template</span>
                                    <span className="font-bold">{selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.name || 'Selected' : 'None'}</span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-14 rounded-2xl font-semibold text-lg shadow-xl shadow-primary/20 gap-3"
                                disabled={generating || selectedStudentIds.size === 0 || !selectedTemplate}
                                onClick={handleGenerate}
                            >
                                {generating ? (
                                    <><Loader2 className="animate-spin" /> Generating...</>
                                ) : (
                                    <><Download className="w-5 h-5" /> Generate Certificates</>
                                )}
                            </Button>
                        </CardContent>
                    </Card>

                    {results && (
                        <Card className="rounded-[2rem] border-border/50 shadow-lg overflow-hidden">
                            <CardContent className="p-6 space-y-4">
                                <h4 className="font-semibold text-sm uppercase tracking-wider">Generation Results</h4>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="font-bold">{results.success}</span> succeeded
                                    </div>
                                    {results.failed > 0 && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <XCircle className="w-4 h-4 text-red-500" />
                                            <span className="font-bold">{results.failed}</span> failed
                                        </div>
                                    )}
                                </div>
                                {results.errors.length > 0 && (
                                    <div className="max-h-32 overflow-y-auto space-y-1 bg-red-500/5 rounded-xl p-3">
                                        {results.errors.map((err, i) => (
                                            <p key={i} className="text-xs text-red-600 flex items-start gap-1">
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
    );
}
