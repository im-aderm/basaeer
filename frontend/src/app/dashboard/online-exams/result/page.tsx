'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Award, BarChart3, Search, ChevronRight, CheckCircle2, AlertCircle, FileText, UserCheck, TrendingUp, Trophy, Users, Activity } from 'lucide-react';
import { OnlineExamService, OnlineExam } from '@/services/onlineExamService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function OnlineExamResultsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [exams, setExams] = useState<OnlineExam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [attempts, setAttempts] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [filters, setFilters] = useState({ classId: '', sectionId: '' });
    const [loading, setLoading] = useState(true);
    const [gradingLoading, setGradingLoading] = useState<string | null>(null);
    const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
    const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);

    const fetchInitialData = async () => {
        try {
            const [examsData, classesData] = await Promise.all([
                OnlineExamService.getExams(),
                api.get('/classes')
            ]);
            setExams(examsData);
            setClasses(classesData.data);
            if (examsData.length > 0) {
                setSelectedExamId(examsData[0].id);
                fetchAttempts(examsData[0].id);
            }
        } catch (error) {
            showError('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const res = await api.get(`/sections?classId=${classId}`);
            setSections(res.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch sections');
        }
    };

    const fetchAttempts = async (examId: string) => {
        try {
            const data = await OnlineExamService.getAttempts(examId);
            setAttempts(data);
        } catch (error) {
            showError('Failed to load attempts');
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleExamSelect = (id: string) => {
        setSelectedExamId(id);
        fetchAttempts(id);
    };

    const handleGradeSubmit = async (attemptId: string, questionId: string, marks: number) => {
        const key = `${attemptId}-${questionId}`;
        setGradingLoading(key);
        try {
            await OnlineExamService.gradeAnswer(attemptId, questionId, marks);
            showSuccess('Grade updated');
            fetchAttempts(selectedExamId);
        } catch (error) {
            showError('Failed to update grade');
        } finally {
            setGradingLoading(null);
        }
    };

    const generatePositions = async () => {
        if (!selectedExamId) return;

        try {
            await OnlineExamService.generatePositions(selectedExamId);
            showSuccess('Positions generated and saved successfully');
            fetchAttempts(selectedExamId); // Re-fetch to get saved ranks
        } catch (error) {
            showError('Failed to generate positions');
        }
    };

    if (loading) return <div className="p-4">Loading assessment results...</div>;

    const activeExam = exams.find(e => e.id === selectedExamId);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Assessment Analytics</h1>
                    <p className="text-foreground/60 font-medium mt-1">Grade descriptive answers and generate class rankings.</p>
                </div>

                <div className="flex gap-4">
                    <Select value={selectedExamId} onValueChange={handleExamSelect}>
                        <SelectTrigger className="h-14 w-64 rounded-2xl font-bold text-lg">
                            <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.classId} onValueChange={(v) => { setFilters({ ...filters, classId: v }); fetchSections(v); }}>
                        <SelectTrigger className="h-14 w-40 rounded-2xl font-bold">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.sectionId} onValueChange={(v) => setFilters({ ...filters, sectionId: v })}>
                        <SelectTrigger className="h-14 w-40 rounded-2xl font-bold">
                            <SelectValue placeholder="All Sections" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all">All Sections</SelectItem>
                            {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Button
                        variant="secondary"
                        onClick={generatePositions}
                        className="h-14 px-6 rounded-2xl font-semibold gap-2 bg-primary/10 text-primary hover:bg-primary/20 shadow-none border-none"
                    >
                        <Trophy className="h-6 w-6" />
                        Rankings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Appeared</p>
                        <h3 className={STAT_VALUE}>{attempts.length}</h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Avg Score</p>
                        <h3 className={STAT_VALUE}>
                            {attempts.length > 0 ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1) : 0}
                        </h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Pass Rate</p>
                        <h3 className={STAT_VALUE}>
                            {attempts.length > 0 ? Math.round((attempts.filter(a => (a.score || 0) >= (activeExam?.passPercentage || 40)).length / attempts.length) * 100) : 0}%
                        </h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-muted/30 border-l-4 border-l-foreground/30 ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Highest Score</p>
                        <h3 className={STAT_VALUE}>
                            {attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0}
                        </h3>
                    </div>
                </Card>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-4 border-b border-primary/20">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Performance Result Sheet
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Adm. No</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Student Name</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Score / 100</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Position</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Outcome</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Grading</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {(attempts ?? [])
                                    .filter(a => (filters.classId === '' || filters.classId === 'all' || a.student?.classId === filters.classId))
                                    .filter(a => (filters.sectionId === '' || filters.sectionId === 'all' || a.student?.sectionId === filters.sectionId))
                                    .map((attempt) => (
                                        <tr key={attempt.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL + " opacity-50"}>{attempt.student?.admissionNumber || 'N/A'}</td>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                {attempt.student?.user?.firstName} {attempt.student?.user?.lastName}
                                            </td>
                                            <td className={TABLE_CELL + " text-center text-primary font-semibold"}>
                                                {attempt.score || 0}
                                            </td>
                                            <td className={TABLE_CELL + " text-center"}>
                                                {attempt.position ? (
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-white font-semibold text-[12px] shadow-lg shadow-primary/20">
                                                        <Trophy className="h-3 w-3" />
                                                        #{attempt.position}
                                                    </div>
                                                ) : '-'}
                                            </td>
                                            <td className={TABLE_CELL + " text-center"}>
                                                {(attempt.score || 0) >= (activeExam?.passPercentage || 40) ? (
                                                    <div className="inline-flex items-center gap-2 text-emerald-600 font-semibold uppercase text-[12px]">
                                                        <CheckCircle2 className="h-4 w-4" /> Passed
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 text-destructive font-semibold uppercase text-[12px]">
                                                        <AlertCircle className="h-4 w-4" /> Failed
                                                    </div>
                                                )}
                                            </td>
                                            <td className={TABLE_CELL_ACTIONS}>
                                                <Button
                                                    variant="outline"
                                                    className="h-9 px-4 rounded-xl font-bold gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary text-[12px]"
                                                    onClick={() => { setSelectedAttempt(attempt); setIsGradeDialogOpen(true); }}
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Grade Review
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Grading Dialog */}
            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-4xl max-h-[85vh] overflow-y-auto sidebar-scroll">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Detailed Grade Review</DialogTitle>
                        <DialogDescription className="font-bold -mt-1">
                            Reviewing answers for {selectedAttempt?.student?.user?.firstName} {selectedAttempt?.student?.user?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        {selectedAttempt?.answers?.map((ans: any, idx: number) => (
                            <Card key={ans.id} className="rounded-3xl border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary/30">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="font-semibold text-lg leading-tight w-2/3">
                                            Q{idx + 1}: {ans.question?.content}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-label px-3 py-1 bg-muted rounded-full">
                                                {ans.question?.type}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Label className="font-semibold text-xs uppercase opacity-50">Awarded Marks:</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 w-24 text-center font-semibold text-lg rounded-xl"
                                                    defaultValue={ans.marksAwarded || 0}
                                                    onBlur={(e) => handleGradeSubmit(selectedAttempt.id, ans.questionId, parseFloat(e.target.value))}
                                                    disabled={ans.question?.type !== 'DESCRIPTIVE' || gradingLoading === `${selectedAttempt.id}-${ans.questionId}`}
                                                />
                                                {gradingLoading === `${selectedAttempt.id}-${ans.questionId}` && (
                                                    <Activity className="h-4 w-4 animate-pulse text-primary" />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-label text-primary">Student Answer:</Label>
                                        <div className="p-6 rounded-2xl bg-muted/30 font-bold leading-relaxed border-border/20 border min-h-[60px]">
                                            {ans.question?.type === 'DESCRIPTIVE' ? (
                                                ans.textAnswer || <span className="opacity-30">No answer provided</span>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-semibold ${ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}`}>
                                                        {ans.isCorrect ? '✓' : '✗'}
                                                    </div>
                                                    <span>Selected: {ans.question?.options?.find((o: any) => o.id === ans.selectedOptionId)?.content}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
