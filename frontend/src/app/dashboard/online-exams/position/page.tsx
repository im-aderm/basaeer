'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Award, Trophy, Users, CheckCircle, AlertCircle, Loader2, Play } from 'lucide-react';
import { OnlineExamService, OnlineExam } from '@/services/onlineExamService';
import { toast } from 'sonner';

export default function OnlineExamPositionPage() {
    const [exams, setExams] = useState<OnlineExam[]>([]);
    const [selectedExamId, setSelectedExamId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const data = await OnlineExamService.getExams();
            setExams(data);
        } catch (error) {
            toast.error('Failed to load examinations');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!selectedExamId) {
            toast.error('Please select an examination first');
            return;
        }

        setProcessing(true);
        try {
            await OnlineExamService.generatePositions(selectedExamId);
            toast.success('Positions generated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to generate positions');
        } finally {
            setProcessing(false);
        }
    };

    const selectedExam = exams.find(e => e.id === selectedExamId);

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /> Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Position Generation</h1>
                    <p className="text-muted-foreground font-medium mt-1">Calculate and rank student performance for online assessments.</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Trophy className="h-8 w-8" />
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 bg-muted/30 border-b border-border/50">
                    <CardTitle className="text-h3 font-semibold">Rank Assessment Engine</CardTitle>
                    <CardDescription className="font-bold">Select a completed examination to finalize student rankings.</CardDescription>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    <div className="space-y-4">
                        <label className="text-xs font-semibold uppercase tracking-widest ml-1 text-muted-foreground">Select Examination</label>
                        <Select value={selectedExamId} onValueChange={setSelectedExamId}>
                            <SelectTrigger className="h-16 rounded-2xl font-bold text-lg">
                                <SelectValue placeholder="Choose an exam to rank..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl">
                                {exams.map(exam => (
                                    <SelectItem key={exam.id} value={exam.id} className="font-bold py-3">
                                        {exam.title} ({exam.class?.name} - {exam.subject?.name})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedExam && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Users className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest opacity-50">Class</p>
                                    <p className="text-lg font-semibold">{selectedExam.class?.name}</p>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/10 flex items-center gap-4">
                                <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                    <Award className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-widest opacity-50">Subject</p>
                                    <p className="text-lg font-semibold">{selectedExam.subject?.name}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 rounded-[2rem] bg-muted/20 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-4">
                        <div className="h-16 w-16 rounded-full bg-background flex items-center justify-center shadow-lg">
                            <Play className="h-8 w-8 text-primary fill-primary" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-semibold text-lg">Ready to Process?</h3>
                            <p className="text-sm text-muted-foreground font-medium max-w-sm">
                                This will analyze all submitted scores and assign a numerical rank to each student based on their performance.
                            </p>
                        </div>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={!selectedExamId || processing}
                        className="w-full h-16 rounded-2xl font-semibold text-h3 gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                    >
                        {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <CheckCircle className="h-6 w-6" />}
                        {processing ? 'Processing Ranks...' : 'Generate Student Positions'}
                    </Button>
                </CardContent>
            </Card>

            <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl flex gap-4">
                <AlertCircle className="h-6 w-6 text-amber-600 shrink-0" />
                <div className="space-y-1">
                    <p className="font-semibold text-amber-900 uppercase text-xs">Processing Note</p>
                    <p className="text-sm text-amber-800 font-medium">
                        Position generation should only be performed after all descriptive answers (if any) have been manually graded by the respective subject teacher.
                    </p>
                </div>
            </div>
        </div>
    );
}
