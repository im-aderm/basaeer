'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Plus,
    BookOpen,
    LayoutDashboard,
    ArrowRight,
    CalendarDays,
    Settings2,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { ExamService } from '@/services/examService';
import { toast } from 'sonner';

export default function ExamMasterDashboard() {
    const router = useRouter();
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form state for new session
    const [formData, setFormData] = useState({
        name: '',
        startDate: '',
        endDate: '',
        isActive: true
    });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const data = await ExamService.getSessions();
            setSessions(data);
            setError(null);
        } catch (error) {
            setError("Could not load academic sessions");
            toast.error('Failed to load academic sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        if (!formData.name || !formData.startDate || !formData.endDate) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            await ExamService.createSession(formData);
            toast.success('Academic session created successfully');
            setIsDialogOpen(false);
            fetchSessions();
        } catch (error) {
            toast.error('Failed to create session');
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-lg font-semibold text-destructive">{error}</p>
        </div>
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-12 pb-20">
                <BranchContextBanner />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-h1 font-bold tracking-tighter text-primary flex items-center gap-4">
                        <LayoutDashboard className="h-12 w-12 text-primary" />
                        Exam Master
                    </h1>
                    <p className="text-xl text-muted-foreground font-medium">Manage academic sessions, schedules, and result processing.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-16 px-10 rounded-[2rem] font-semibold text-h3 gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Plus className="h-7 w-7" />
                            New Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] max-w-2xl p-10">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold">Initialize Academic Session</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-8 py-6">
                            <div className="space-y-3">
                                <Label className="text-sm font-semibold uppercase tracking-widest ml-1">Session Name</Label>
                                <Input
                                    placeholder="e.g. 2025/2026 Academic Session"
                                    className="h-14 rounded-2xl border-none bg-muted font-bold text-lg"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase tracking-widest ml-1">Start Date</Label>
                                    <Input
                                        type="date"
                                        className="h-14 rounded-2xl border-none bg-muted font-bold text-lg"
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase tracking-widest ml-1">End Date</Label>
                                    <Input
                                        type="date"
                                        className="h-14 rounded-2xl border-none bg-muted font-bold text-lg"
                                        value={formData.endDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="pt-6">
                            <Button variant="ghost" className="rounded-2xl h-14 font-bold text-lg px-8" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button className="rounded-2xl h-14 font-semibold text-lg px-12" onClick={handleCreateSession}>Create Session</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Exam Schedule', desc: 'Manage dates and conflict-aware scheduling.', icon: Calendar, color: 'primary', href: '/dashboard/exams/schedule' },
                    { title: 'Exam Types', desc: 'Define weighted assessment categories.', icon: BookOpen, color: 'amber-500', href: '/dashboard/exams/types' },
                    { title: 'Grading Scales', desc: 'Dynamic score-to-grade mapping logic.', icon: Settings2, color: 'emerald-500', href: '/dashboard/academics/exams/marks' },
                ].map((action, i) => (
                    <Card
                        key={i}
                        onClick={() => router.push(action.href)}
                        className={`group relative overflow-hidden rounded-[3rem] border-none shadow-xl cursor-pointer hover:shadow-2xl transition-all duration-500 bg-white`}
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${action.color}/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-all duration-700`} />
                        <CardHeader className="p-8 space-y-4">
                            <div className={`h-16 w-16 rounded-[1.5rem] bg-${action.color}/10 flex items-center justify-center text-${action.color}`}>
                                <action.icon className="h-8 w-8" />
                            </div>
                            <div>
                                <CardTitle className="text-h3 font-semibold">{action.title}</CardTitle>
                                <CardDescription className="font-bold text-base mt-1">{action.desc}</CardDescription>
                            </div>
                        </CardHeader>
                        <div className="p-8 pt-0 flex justify-end">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                                <ArrowRight className="h-5 w-5" />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <CalendarDays className="h-8 w-8 text-primary" />
                    <h2 className="text-h1 font-semibold uppercase tracking-tighter">Academic Sessions</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {sessions.map((session) => (
                        <Card key={session.id} className="rounded-[3rem] border-border/50 shadow-lg overflow-hidden group hover:border-primary/60 transition-all">
                            <CardHeader className="p-10 pb-6 flex flex-row items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-h1 font-semibold">{session.name}</h3>
                                    <div className="flex items-center gap-3 text-muted-foreground font-bold">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(session.startDate).toLocaleDateString()} - {new Date(session.endDate).toLocaleDateString()}
                                    </div>
                                </div>
                                {session.isActive ? (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-widest gap-2">
                                        <CheckCircle2 className="h-3 w-3" /> Active
                                    </Badge>
                                ) : (
                                    <Badge className="bg-muted text-muted-foreground border-none px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-widest gap-2">
                                        <XCircle className="h-3 w-3" /> Inactive
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent className="p-10 pt-0">
                                <div className="flex gap-4">
                                    <Button variant="outline" className="flex-1 h-14 rounded-2xl font-semibold border-2 border-border/50 hover:bg-primary/5 hover:border-primary/20">
                                        Configuration
                                    </Button>
                                    <Button className="flex-1 h-14 rounded-2xl font-semibold shadow-lg shadow-primary/10">
                                        View Analytics
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {sessions.length === 0 && (
                        <div className="col-span-2 h-80 rounded-[3rem] border-4 border-dashed border-muted flex flex-col items-center justify-center space-y-4 opacity-30 grayscale saturate-0">
                            <Calendar className="h-20 w-20 stroke-[1]" />
                            <p className="text-h3 font-semibold">No Sessions Configured</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </RequireBranch>
    );
}
