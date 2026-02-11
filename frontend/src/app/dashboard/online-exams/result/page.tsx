'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Award, BarChart3, Search, ChevronRight, CheckCircle2, AlertCircle, FileText, UserCheck, TrendingUp, Trophy, Users, Activity } from 'lucide-react';
import { OnlineExamService, OnlineExam } from '@/services/onlineExamService';
import { toast } from 'sonner';

export default function OnlineExamResultsPage() {
    const { user } = useAuth();
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
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const fetchSections = async (classId: string) => {
        try {
            const res = await api.get(`/sections?classId=${classId}`);
            setSections(res.data);
        } catch (error) {
            console.error('Failed to fetch sections');
        }
    };

    const fetchAttempts = async (examId: string) => {
        try {
            const data = await OnlineExamService.getAttempts(examId);
            setAttempts(data);
        } catch (error) {
            toast.error('Failed to load attempts');
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
            toast.success('Grade updated');
            fetchAttempts(selectedExamId);
        } catch (error) {
            toast.error('Failed to update grade');
        } finally {
            setGradingLoading(null);
        }
    };

    const generatePositions = async () => {
        if (!selectedExamId) return;

        try {
            await OnlineExamService.generatePositions(selectedExamId);
            toast.success('Positions generated and saved successfully');
            fetchAttempts(selectedExamId); // Re-fetch to get saved ranks
        } catch (error) {
            toast.error('Failed to generate positions');
        }
    };

    if (loading) return <div className="p-8">Loading assessment results...</div>;

    const activeExam = exams.find(e => e.id === selectedExamId);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Assessment Analytics</h1>
                    <p className="text-muted-foreground font-medium mt-1">Grade descriptive answers and generate class rankings.</p>
                </div>

                <div className="flex gap-4">
                    <Select value={selectedExamId} onValueChange={handleExamSelect}>
                        <SelectTrigger className="h-14 w-64 rounded-2xl bg-muted/50 border-none font-bold text-lg">
                            <SelectValue placeholder="Select Exam" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            {exams.map(e => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.classId} onValueChange={(v) => { setFilters({ ...filters, classId: v }); fetchSections(v); }}>
                        <SelectTrigger className="h-14 w-40 rounded-2xl bg-muted/50 border-none font-bold">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl">
                            <SelectItem value="all">All Classes</SelectItem>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    <Select value={filters.sectionId} onValueChange={(v) => setFilters({ ...filters, sectionId: v })}>
                        <SelectTrigger className="h-14 w-40 rounded-2xl bg-muted/50 border-none font-bold">
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
                        className="h-14 px-6 rounded-2xl font-black gap-2 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 shadow-none border-none"
                    >
                        <Trophy className="h-6 w-6" />
                        Rankings
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Appeared</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{attempts.length}</span>
                        <Users className="h-8 w-8 text-primary/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Avg Score</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">
                            {attempts.length > 0 ? (attempts.reduce((sum, a) => sum + (a.score || 0), 0) / attempts.length).toFixed(1) : 0}
                        </span>
                        <TrendingUp className="h-8 w-8 text-emerald-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-amber-500/5 border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Pass Rate</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">
                            {attempts.length > 0 ? Math.round((attempts.filter(a => (a.score || 0) >= (activeExam?.passPercentage || 40)).length / attempts.length) * 100) : 0}%
                        </span>
                        <Award className="h-8 w-8 text-amber-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-muted/30 border-l-4 border-l-muted-foreground">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Highest Score</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">
                            {attempts.length > 0 ? Math.max(...attempts.map(a => a.score || 0)) : 0}
                        </span>
                        <Trophy className="h-8 w-8 text-muted-foreground/40" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <BarChart3 className="h-8 w-8 text-primary" />
                        Performance Result Sheet
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Adm. No</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Student Name</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Score / 100</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Position</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Outcome</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Grading</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {attempts
                                .filter(a => (filters.classId === '' || filters.classId === 'all' || a.student?.classId === filters.classId))
                                .filter(a => (filters.sectionId === '' || filters.sectionId === 'all' || a.student?.sectionId === filters.sectionId))
                                .map((attempt) => (
                                    <TableRow key={attempt.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                        <TableCell className="px-8 font-black uppercase text-xs opacity-50">{attempt.student?.admissionNumber || 'N/A'}</TableCell>
                                        <TableCell className="px-8 font-black italic uppercase leading-tight">
                                            {attempt.student?.user?.firstName} {attempt.student?.user?.lastName}
                                        </TableCell>
                                        <TableCell className="px-8 text-center font-black text-2xl italic text-primary">
                                            {attempt.score || 0}
                                        </TableCell>
                                        <TableCell className="px-8 text-center">
                                            {attempt.position ? (
                                                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500 text-white font-black text-xs shadow-lg shadow-amber-500/20">
                                                    <Trophy className="h-3 w-3" />
                                                    #{attempt.position}
                                                </div>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell className="px-8 text-center">
                                            {(attempt.score || 0) >= (activeExam?.passPercentage || 40) ? (
                                                <div className="inline-flex items-center gap-2 text-emerald-600 font-black italic uppercase text-xs">
                                                    <CheckCircle2 className="h-4 w-4" /> Passed
                                                </div>
                                            ) : (
                                                <div className="inline-flex items-center gap-2 text-destructive font-black italic uppercase text-xs">
                                                    <AlertCircle className="h-4 w-4" /> Failed
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <Button
                                                variant="outline"
                                                className="h-10 px-6 rounded-xl font-bold gap-2 border-border/50 hover:bg-primary/5 hover:text-primary transition-all"
                                                onClick={() => { setSelectedAttempt(attempt); setIsGradeDialogOpen(true); }}
                                            >
                                                <FileText className="h-4 w-4" />
                                                Grade Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Grading Dialog */}
            <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-4xl max-h-[85vh] overflow-y-auto sidebar-scroll">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Detailed Grade Review</DialogTitle>
                        <DialogDescription className="font-bold -mt-1">
                            Reviewing answers for {selectedAttempt?.student?.user?.firstName} {selectedAttempt?.student?.user?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-6">
                        {selectedAttempt?.answers?.map((ans: any, idx: number) => (
                            <Card key={ans.id} className="rounded-3xl border-border/50 shadow-sm overflow-hidden border-l-4 border-l-primary/30">
                                <CardContent className="p-8 space-y-6">
                                    <div className="flex justify-between items-start">
                                        <div className="font-black italic text-lg leading-tight w-2/3">
                                            Q{idx + 1}: {ans.question?.content}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-muted rounded-full">
                                                {ans.question?.type}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <Label className="font-black italic text-xs uppercase opacity-50">Awarded Marks:</Label>
                                                <Input
                                                    type="number"
                                                    className="h-10 w-24 text-center font-black text-lg bg-muted/50 border-none rounded-xl"
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
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-primary italic">Student Answer:</Label>
                                        <div className="p-6 rounded-2xl bg-muted/30 font-bold italic leading-relaxed border-border/20 border min-h-[60px]">
                                            {ans.question?.type === 'DESCRIPTIVE' ? (
                                                ans.textAnswer || <span className="opacity-30 italic">No answer provided</span>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black ${ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-destructive text-white'}`}>
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
