'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { GraduationCap, Plus, Calendar, Clock, BookOpen, Users, Activity, BarChart3, MoreVertical, Send, Eye } from 'lucide-react';
import { OnlineExamService, OnlineExam, QuestionGroup, ExamStatus } from '@/services/onlineExamService';
import { toast } from 'sonner';
import api from '@/lib/api';

export default function OnlineExamsPage() {
    const { user } = useAuth();
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
            toast.error('Failed to load initial data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    const handleCreateExam = async () => {
        if (!formData.title || !formData.classId || !formData.subjectId || !formData.groupId) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await OnlineExamService.createExam({
                ...formData,
                durationMinutes: parseInt(formData.durationMinutes),
                passPercentage: parseFloat(formData.passPercentage),
                branchId: user?.branchId
            });
            toast.success('Exam scheduled successfully');
            setIsDialogOpen(false);
            setExams(await OnlineExamService.getExams());
        } catch (error) {
            toast.error('Failed to schedule exam');
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

    if (loading) return <div className="p-8">Loading examinations...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Online Examinations</h1>
                    <p className="text-muted-foreground font-medium mt-1">Schedule and monitor digital assessments for students.</p>
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
                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none">
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
                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none">
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
                                    <SelectTrigger className="h-12 rounded-2xl bg-muted/50 font-bold border-none">
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
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Total Exams</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-h1 font-semibold">{exams.length}</span>
                        <BookOpen className="h-8 w-8 text-primary/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Active Now</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-h1 font-semibold">{(exams ?? []).filter(e => e.status === ExamStatus.LIVE).length}</span>
                        <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-amber-500/5 border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Upcoming</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-h1 font-semibold">{(exams ?? []).filter(e => e.status === ExamStatus.PUBLISHED || e.status === ExamStatus.UPCOMING).length}</span>
                        <Calendar className="h-8 w-8 text-amber-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-muted/30 border-l-4 border-l-muted-foreground">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Completed</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-h1 font-semibold">{(exams ?? []).filter(e => e.status === ExamStatus.ENDED).length}</span>
                        <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                        <Users className="h-8 w-8 text-primary" />
                        Examination Roster
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground">Exam Details</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground">Class & Subject</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground">Schedule</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold px-8 text-right uppercase tracking-tighter text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {(exams ?? []).map((exam) => (
                                <TableRow key={exam.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8">
                                        <div className="space-y-1">
                                            <div className="font-semibold text-lg leading-tight uppercase">{exam.title}</div>
                                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                                <Activity className="h-3 w-3" />
                                                {exam.group?.name} ({exam.group?._count?.questions || 0} Questions)
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <div className="px-3 py-1 rounded-full bg-primary/5 text-primary text-[10px] font-semibold w-fit uppercase">{exam.class?.name}</div>
                                            <div className="px-3 py-1 rounded-full bg-muted text-[10px] font-semibold w-fit uppercase">{exam.subject?.name}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1 font-bold text-sm">
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Calendar className="h-4 w-4" />
                                                {new Date(exam.scheduledDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {new Date(exam.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({exam.durationMinutes}m)
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className={`px-4 py-1.5 rounded-full font-semibold text-[10px] uppercase tracking-widest w-fit shadow-sm ${getStatusColor(exam.status)}`}>
                                            {exam.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-3">
                                            {user?.role === 'STUDENT' ? (
                                                <Button
                                                    className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                                    disabled={exam.status !== ExamStatus.LIVE}
                                                    onClick={() => router.push(`/dashboard/online-exams/take/${exam.id}`)}
                                                >
                                                    <Send className="h-5 w-5" />
                                                    Start Exam
                                                </Button>
                                            ) : (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-2xl border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className={`h-12 w-12 rounded-2xl border-border/50 ${exam.status === ExamStatus.LIVE ? 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20' : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'}`}
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {exams.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                            <GraduationCap className="h-24 w-24 stroke-[1]" />
                                            <p className="font-semibold text-h3 uppercase tracking-tighter">No Examinations Scheduled</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
