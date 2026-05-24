'use client';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GraduationCap, Plus, Calendar, Clock, BookOpen, Users, Activity, BarChart3, MoreVertical, Send, Eye } from 'lucide-react';
import { OnlineExamService, OnlineExam, QuestionGroup, ExamStatus } from '@/services/onlineExamService';
import { useNotification } from '@/context/NotificationContext';
import api from '@/lib/api';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function OnlineExamsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const router = useRouter();
    const [exams, setExams] = useState<OnlineExam[]>([]);
    const [groups, setGroups] = useState<QuestionGroup[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        scheduledDate: '',
        durationMinutes: '60',
        passPercentage: '40',
        classId: '',
        subjectId: '',
        groupId: ''
    });

    const fetchInitialData = async () => {
        try {
            const [examsData, groupsData, classesData, subjectsData] = await Promise.all([
                OnlineExamService.getExams(),
                OnlineExamService.getGroups(),
                api.get('/classes'),
                api.get('/subjects')
            ]);
            setExams(examsData);
            setGroups(groupsData);
            setClasses(classesData.data);
            setSubjects(subjectsData.data);
        } catch (error) {
            showError('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleCreateExam = async () => {
        if (!formData.title || !formData.classId || !formData.subjectId || !formData.groupId) {
            showError('Please fill all required fields');
            return;
        }

        try {
            await OnlineExamService.createExam({
                ...formData,
                durationMinutes: parseInt(formData.durationMinutes),
                passPercentage: parseFloat(formData.passPercentage),
                branchId: resolvedBranchId
            });
            showSuccess('Exam scheduled successfully');
            setIsDialogOpen(false);
            setExams(await OnlineExamService.getExams());
        } catch (error) {
            showError('Failed to schedule exam');
        }
    };

    const getStatusColor = (status: ExamStatus) => {
        switch (status) {
            case ExamStatus.PUBLISHED: return 'bg-blue-500/10 text-blue-600';
            case ExamStatus.UPCOMING: return 'bg-amber-500/10 text-amber-600';
            case ExamStatus.LIVE: return 'bg-emerald-500/10 text-emerald-600 animate-pulse';
            case ExamStatus.ENDED: return 'bg-muted text-muted-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (loading) return <div className="p-4">Loading examinations...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Online Examinations</h1>
                    <p className="text-foreground/60 font-medium mt-1">Schedule and monitor digital assessments for students.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Plus className="h-6 w-6" />
                            Schedule Exam
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">New Examination Setup</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-6 py-4">
                            <div className="col-span-2 space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Exam Title</Label>
                                <Input
                                    placeholder="e.g. Mid-Term Mathematics Assessment"
                                    className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Class</Label>
                                <Select value={formData.classId} onValueChange={(v) => setFormData({ ...formData, classId: v })}>
                                    <SelectTrigger className="h-12 rounded-2xl font-bold">
                                        <SelectValue placeholder="Select Class" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Subject</Label>
                                <Select value={formData.subjectId} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                                    <SelectTrigger className="h-12 rounded-2xl font-bold">
                                        <SelectValue placeholder="Select Subject" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Question Group</Label>
                                <Select value={formData.groupId} onValueChange={(v) => setFormData({ ...formData, groupId: v })}>
                                    <SelectTrigger className="h-12 rounded-2xl font-bold">
                                        <SelectValue placeholder="Link Question Bank" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl">
                                        {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name} ({g._count?.questions || 0} Qs)</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Scheduled Date & Time</Label>
                                <Input
                                    type="datetime-local"
                                    className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                    value={formData.scheduledDate}
                                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Duration (Min)</Label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                    value={formData.durationMinutes}
                                    onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Pass %</Label>
                                <Input
                                    type="number"
                                    className="h-12 rounded-2xl border-none bg-muted/50 font-bold"
                                    value={formData.passPercentage}
                                    onChange={(e) => setFormData({ ...formData, passPercentage: e.target.value })}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" className="rounded-2xl h-12 font-bold px-8" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button className="rounded-2xl h-12 font-semibold px-12" onClick={handleCreateExam}>Schedule Exam</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Total Exams</p>
                        <h3 className={STAT_VALUE}>{exams.length}</h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Active Now</p>
                        <h3 className={STAT_VALUE}>{(exams ?? []).filter(e => e.status === ExamStatus.LIVE).length}</h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-primary/5 border-l-4 border-l-primary ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Upcoming</p>
                        <h3 className={STAT_VALUE}>{(exams ?? []).filter(e => e.status === ExamStatus.PUBLISHED || e.status === ExamStatus.UPCOMING).length}</h3>
                    </div>
                </Card>
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-muted/30 border-l-4 border-l-foreground/30 ${STAT_CARD}`}>
                    <div className="p-4">
                        <p className={STAT_LABEL}>Completed</p>
                        <h3 className={STAT_VALUE}>{(exams ?? []).filter(e => e.status === ExamStatus.ENDED).length}</h3>
                    </div>
                </Card>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-4 pb-2 border-b border-primary/20">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Users className="h-5 w-5 text-primary" />
                        Examination Roster
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Exam Details</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Class & Subject</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Schedule</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {(exams ?? []).map((exam) => (
                                    <tr key={exam.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            <div className="space-y-1">
                                                <div className="font-semibold text-[12px] leading-tight">{exam.title}</div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/60">
                                                    <Activity className="h-3 w-3" />
                                                    {exam.group?.name} ({exam.group?._count?.questions || 0} Questions)
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex flex-col gap-1">
                                                <div className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-semibold w-fit">{exam.class?.name}</div>
                                                <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-semibold w-fit">{exam.subject?.name}</div>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex flex-col gap-1 font-bold text-[12px]">
                                                <div className="flex items-center gap-2 text-foreground/60">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(exam.scheduledDate).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-foreground/60">
                                                    <Clock className="h-4 w-4" />
                                                    {new Date(exam.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({exam.durationMinutes}m)
                                                </div>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className={`px-4 py-1.5 rounded-full font-semibold text-[10px] uppercase tracking-widest w-fit shadow-sm ${getStatusColor(exam.status)}`}>
                                                {exam.status}
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex justify-end gap-3">
                                                {user?.role === 'STUDENT' ? (
                                                    <Button
                                                        className="h-9 px-4 rounded-xl font-semibold gap-2 shadow-lg shadow-primary/20 text-[12px]"
                                                        disabled={exam.status !== ExamStatus.LIVE}
                                                        onClick={() => router.push(`/dashboard/online-exams/take/${exam.id}`)}
                                                    >
                                                        <Send className="h-4 w-4" />
                                                        Start Exam
                                                    </Button>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="h-9 w-9 rounded-xl border-primary/20 text-foreground/60 hover:text-primary hover:bg-primary/5"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className={`h-9 w-9 rounded-xl border-primary/20 ${exam.status === ExamStatus.LIVE ? 'text-primary hover:bg-primary/10' : 'text-foreground/60 hover:text-primary hover:bg-primary/10'}`}
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {exams.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                                <GraduationCap className="h-24 w-24 stroke-[1]" />
                                                <p className="font-semibold text-[12px] uppercase tracking-tighter">No Examinations Scheduled</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    </RequireBranch>
    );
}
