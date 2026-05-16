'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { AlertCircle, Clock, Send, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle2, BookOpen, Users, Activity } from 'lucide-react';
import { OnlineExamService, OnlineExam, Question, QuestionType } from '@/services/onlineExamService';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';

export default function StudentExamTakePage() {
    const params = useParams();
    const router = useRouter();
    const examId = params.id as string;

    const [exam, setExam] = useState<OnlineExam & { group: { questions: Question[] } } | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<string, any>>({});
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [warnings, setWarnings] = useState(0);

    const fetchExam = useCallback(async () => {
        try {
            const data = await OnlineExamService.startExam(examId);
            setExam(data);

            // Reconstruct answers from previous session
            const initialAnswers: Record<string, any> = {};
            data.attempt.answers.forEach((ans: any) => {
                initialAnswers[ans.questionId] = ans.selectedOptionId || ans.textAnswer;
            });
            setAnswers(initialAnswers);

            // Persistent Timer: (Start + Duration) - Current
            const startTime = new Date(data.attempt.startTime).getTime();
            const durationMs = data.durationMinutes * 60 * 1000;
            const now = new Date().getTime();
            const remaining = Math.max(0, Math.floor((startTime + durationMs - now) / 1000));

            setTimeLeft(remaining);
            if (remaining <= 0) handleSubmit(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to start exam');
            router.push('/dashboard/online-exams');
        } finally {
            setLoading(false);
        }
    }, [examId, router]);

    useEffect(() => {
        fetchExam();
    }, [fetchExam]);

    // Automatic Answer Syncing
    useEffect(() => {
        if (isFinished || Object.keys(answers).length === 0) return;

        const syncTimeout = setTimeout(async () => {
            try {
                const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
                    const question = exam?.group.questions.find(q => q.id === qId);
                    return {
                        questionId: qId,
                        selectedOptionId: (question?.type === QuestionType.MCQ || question?.type === QuestionType.TRUE_FALSE) ? val : undefined,
                        textAnswer: question?.type === QuestionType.DESCRIPTIVE ? val : undefined
                    };
                });
                await OnlineExamService.syncAnswers(examId, formattedAnswers);
            } catch (error) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to sync progress');
            }
        }, 3000); // Sync after 3 seconds of inactivity

        return () => clearTimeout(syncTimeout);
    }, [answers, examId, isFinished, exam]);

    // Timer Logic
    useEffect(() => {
        if (!timeLeft || isFinished) return;
        const interval = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLeft, isFinished]);

    // Anti-Cheat: Tab Focus Detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && !isFinished) {
                setWarnings(prev => {
                    const newCount = prev + 1;
                    toast.warning(`Warning ${newCount}: Please stay on the exam page!`, {
                        description: 'Your activity is being monitored. Multiple violations may lead to automatic submission.',
                        duration: 5000
                    });
                    if (newCount >= 3) {
                        toast.error('Maximum warnings exceeded. Submitting exam...');
                        handleSubmit(true);
                    }
                    return newCount;
                });
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [isFinished]);

    const handleAnswer = (questionId: string, value: any) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async (isAuto = false) => {
        if (isSubmitting || isFinished) return;

        if (!isAuto && !confirm('Are you sure you want to submit your exam?')) return;

        setIsSubmitting(true);
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => {
                const question = exam?.group.questions.find(q => q.id === qId);
                return {
                    questionId: qId,
                    selectedOptionId: (question?.type === QuestionType.MCQ || question?.type === QuestionType.TRUE_FALSE) ? val : undefined,
                    textAnswer: question?.type === QuestionType.DESCRIPTIVE ? val : undefined
                };
            });

            await OnlineExamService.submitAttempt(examId, formattedAnswers);
            setIsFinished(true);
            toast.success(isAuto ? 'Time expired. Exam submitted automatically.' : 'Exam submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit exam. Please contact your teacher.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (loading) return <div className="h-screen flex items-center justify-center font-semibold text-h3 animate-pulse">Initializing Secure Testing Environment...</div>;
    if (!exam) return null;

    if (isFinished) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-8 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="h-40 w-40 rounded-[3rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-2xl shadow-emerald-500/20">
                    <CheckCircle2 className="h-24 w-24" />
                </div>
                <div className="text-center space-y-2">
                    <h1 className="text-h1 font-bold tracking-tighter text-primary">Submission Confirmed</h1>
                    <p className="text-muted-foreground font-bold text-lg">Your answers have been securely transmitted and recorded.</p>
                </div>
                <Button
                    className="h-14 px-12 rounded-2xl font-semibold text-lg bg-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20"
                    onClick={() => router.push('/dashboard/online-exams')}
                >
                    Return to Dashboard
                </Button>
            </div>
        );
    }

    const currentQuestion = exam.group.questions[currentIdx];
    const progress = ((currentIdx + 1) / exam.group.questions.length) * 100;
    const answeredCount = Object.keys(answers).length;

    return (
        <div className="min-h-screen bg-muted/30 flex flex-col">
            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 p-6 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <div className="h-16 w-16 rounded-3xl bg-primary flex flex-col items-center justify-center text-white shadow-xl shadow-primary/20">
                            <span className="text-[10px] font-semibold uppercase leading-none opacity-60">Ques</span>
                            <span className="text-h3 font-semibold leading-tight">{currentIdx + 1}</span>
                        </div>
                        <div>
                            <h1 className="text-h3 font-semibold leading-tight uppercase tracking-tight">{exam.title}</h1>
                            <div className="flex gap-3 text-xs font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                                <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {exam.subject?.name}</span>
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Grade {exam.class?.name}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex flex-col items-center">
                            <span className="text-label text-muted-foreground mb-1">Time Remaining</span>
                            <div className={`flex items-center gap-3 px-8 py-3 rounded-2xl font-semibold text-h3 tracking-tighter shadow-inner ${timeLeft < 300 ? 'bg-destructive/10 text-destructive animate-pulse' : 'bg-muted/50 text-foreground'}`}>
                                <Clock className="h-6 w-6" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                        <Button
                            className="h-16 px-10 rounded-3xl font-semibold text-h3 gap-2 shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-all bg-primary"
                            onClick={() => handleSubmit()}
                            disabled={isSubmitting}
                        >
                            <Send className="h-6 w-6" />
                            Submit Exam
                        </Button>
                    </div>
                </div>
                <Progress value={progress} className="absolute bottom-0 left-0 right-0 h-1 rounded-none bg-transparent block" />
            </header>

            <main className="flex-1 max-w-5xl mx-auto w-full p-8 md:p-12 space-y-12">
                {/* Warnings Banner */}
                {warnings > 0 && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] flex items-center gap-6 animate-bounce">
                        <ShieldAlert className="h-12 w-12 text-amber-500" />
                        <div>
                            <p className="font-semibold text-h3 text-amber-600">Attention Required!</p>
                            <p className="text-amber-700/80 font-bold">You have {warnings} warning(s). Maintain focus on the exam window.</p>
                        </div>
                    </div>
                )}

                {/* Question Area */}
                <div className="space-y-10">
                    <div className="flex items-center gap-4">
                        <span className="px-5 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm uppercase tracking-widest">
                            {currentQuestion.type}
                        </span>
                        <span className="px-5 py-2 rounded-full bg-muted font-bold text-sm text-muted-foreground">
                            {currentQuestion.marks} Marks
                        </span>
                    </div>

                    <h2 className="text-h1 md:text-h1 font-semibold leading-[1.1] tracking-tighter">
                        {currentQuestion.content}
                    </h2>

                    <div className="space-y-4 pt-4">
                        {(currentQuestion.type === QuestionType.MCQ || currentQuestion.type === QuestionType.TRUE_FALSE) ? (
                            <RadioGroup
                                value={answers[currentQuestion.id] || ''}
                                onValueChange={(v: string) => handleAnswer(currentQuestion.id, v)}
                                className="grid gap-6"
                            >
                                {currentQuestion.options.map((opt, idx) => (
                                    <Label
                                        key={opt.id}
                                        className={`flex items-center gap-6 p-8 rounded-[2.5rem] border-2 transition-all cursor-pointer group shadow-sm ${answers[currentQuestion.id] === opt.id
                                            ? 'bg-primary/5 border-primary shadow-xl shadow-primary/10'
                                            : 'bg-background border-border/50 hover:border-primary/60 hover:bg-primary/[0.02]'
                                            }`}
                                    >
                                        <div className={`h-10 w-10 flex-shrink-0 rounded-2xl flex items-center justify-center font-semibold transition-all ${answers[currentQuestion.id] === opt.id ? 'bg-primary text-white scale-110 shadow-lg' : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                            }`}>
                                            <RadioGroupItem value={opt.id} className="sr-only" />
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <span className={`text-xl font-bold leading-tight ${answers[currentQuestion.id] === opt.id ? 'text-primary' : 'text-foreground/70'}`}>
                                            {opt.content}
                                        </span>
                                    </Label>
                                ))}
                            </RadioGroup>
                        ) : (
                            <textarea
                                className="w-full min-h-[300px] rounded-[3rem] p-12 bg-background border-2 border-border/50 font-bold text-2xl focus:ring-8 ring-primary/5 focus:border-primary/60 outline-none transition-all resize-none shadow-xl"
                                placeholder="Type your detailed answer here..."
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                            />
                        )}
                    </div>
                </div>

                {/* Navigation Footer */}
                <div className="flex justify-between items-center pt-12 border-t border-border/50">
                    <Button
                        variant="ghost"
                        size="lg"
                        className="h-16 rounded-3xl font-semibold text-lg gap-3 px-8 disabled:opacity-20"
                        onClick={() => setCurrentIdx(prev => prev - 1)}
                        disabled={currentIdx === 0}
                    >
                        <ChevronLeft className="h-6 w-6" /> Back
                    </Button>

                    <div className="flex items-center gap-3">
                        {exam.group.questions.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIdx(i)}
                                className={`h-4 rounded-full transition-all duration-300 ${i === currentIdx ? 'w-12 bg-primary' : answers[exam.group.questions[i].id] ? 'w-4 bg-emerald-500' : 'w-4 bg-muted'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        variant="secondary"
                        size="lg"
                        className="h-16 rounded-3xl font-semibold text-lg gap-3 px-8 bg-background border-2 border-border/50 hover:bg-muted"
                        onClick={() => {
                            if (currentIdx < exam.group.questions.length - 1) {
                                setCurrentIdx(prev => prev + 1);
                            } else {
                                handleSubmit();
                            }
                        }}
                    >
                        {currentIdx === exam.group.questions.length - 1 ? 'Finish' : 'Next'} <ChevronRight className="h-6 w-6" />
                    </Button>
                </div>
            </main>

            {/* Float Stats for Student */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-xl border border-border/50 px-12 py-4 rounded-full shadow-2xl flex items-center gap-8 font-semibold text-sm">
                <div className="flex items-center gap-4 border-r border-border/50 pr-8">
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>{answeredCount} / {exam.group.questions.length} Answered</span>
                </div>
                <div className="flex items-center gap-4 text-primary">
                    <Activity className="h-5 w-5" />
                    <span>Secure Session Active</span>
                </div>
            </div>
        </div>
    );
}
