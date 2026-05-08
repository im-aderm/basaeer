'use client';

import { useEffect, useMemo, useState } from 'react';
import { AcademicService } from '@/services/academicService';
import { academicExportService } from '@/services/academicExportService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BarChart3, CheckCircle2, FileText, GraduationCap, Loader2, ShieldCheck, Table2 } from 'lucide-react';
import { toast } from 'sonner';

type Mode = 'exams' | 'components' | 'approvals' | 'publication' | 'transcripts' | 'tahfeez' | 'analytics' | 'portal' | 'reportCards' | 'broadsheets';

const icons: Record<Mode, any> = {
    exams: GraduationCap,
    components: Table2,
    approvals: ShieldCheck,
    publication: CheckCircle2,
    transcripts: FileText,
    tahfeez: GraduationCap,
    analytics: BarChart3,
    portal: FileText,
    reportCards: FileText,
    broadsheets: Table2,
};

const titles: Record<Mode, string> = {
    exams: 'Exam Management',
    components: 'Assessment Components',
    approvals: 'Result Approvals',
    publication: 'Result Publication',
    transcripts: 'Transcripts',
    tahfeez: 'Tahfeez Assessment',
    analytics: 'Academic Analytics',
    portal: 'Academic Portal',
    reportCards: 'Report Cards',
    broadsheets: 'Broadsheets',
};

export function AcademicOperationsPage({ mode }: { mode: Mode }) {
    const Icon = icons[mode];
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState(false);
    const [items, setItems] = useState<any[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [form, setForm] = useState<any>({ term: 'FIRST' });
    const [computeJobId, setComputeJobId] = useState<string | null>(null);
    const [computeStatus, setComputeStatus] = useState<any>(null);

    useEffect(() => {
        let interval: any;
        if (computeJobId) {
            interval = setInterval(async () => {
                try {
                    const status = await AcademicService.getComputeStatus(computeJobId);
                    setComputeStatus(status);
                    if (status.status === 'completed' || status.status === 'failed') {
                        setComputeJobId(null);
                        if (status.status === 'completed') {
                            toast.success('Computation completed successfully');
                            load();
                        } else {
                            toast.error(`Computation failed: ${status.failedReason || 'Unknown error'}`);
                        }
                    }
                } catch (error) {
                    console.error('Failed to poll compute status:', error);
                }
            }, 3000);
        }
        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [computeJobId]);

    const startCompute = async () => {
        setBusy(true);
        try {
            const { jobId } = await AcademicService.computeSection(form);
            setComputeJobId(jobId);
            toast.info('Result computation started in background');
        } catch {
            toast.error('Failed to start computation');
        } finally {
            setBusy(false);
        }
    };

    const fields = useMemo(() => {
        if (mode === 'exams') return ['title', 'sessionId', 'term', 'classId', 'sectionId', 'startsAt'];
        if (mode === 'components') return ['name', 'component', 'weight', 'maxScore', 'classId', 'subjectId', 'curriculum'];
        if (mode === 'approvals') return ['sessionId', 'term', 'classId', 'sectionId', 'subjectId'];
        if (mode === 'publication') return ['sessionId', 'term', 'classId', 'sectionId'];
        if (mode === 'transcripts') return ['studentId'];
        if (mode === 'tahfeez') return ['studentId', 'sessionId', 'term', 'surah', 'juz', 'memorizationScore', 'tajweedScore', 'fluencyScore', 'revisionScore'];
        if (mode === 'analytics') return ['sessionId', 'term'];
        if (mode === 'portal') return ['studentId', 'sessionId', 'term'];
        if (mode === 'reportCards') return ['studentId', 'sessionId', 'term'];
        return ['sectionId', 'sessionId', 'term'];
    }, [mode]);

    const startExport = async (type: string) => {
        setBusy(true);
        try {
            await academicExportService.startExport(type, form);
            toast.success(`Export ${type} queued successfully`);
        } catch {
            toast.error('Failed to queue export job');
        } finally {
            setBusy(false);
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            if (mode === 'exams') setItems(await AcademicService.listExams());
            else if (mode === 'components') setItems(await AcademicService.listComponents());
            else if (mode === 'approvals') setItems(await AcademicService.approvals());
            else if (mode === 'transcripts') setItems(await AcademicService.transcripts());
            else if (mode === 'analytics' && form.sessionId) setAnalytics(await AcademicService.analytics({ sessionId: form.sessionId, term: form.term }));
            else setItems([]);
        } catch {
            toast.error('Unable to load academic data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode]);

    const submit = async () => {
        setBusy(true);
        try {
            if (mode === 'exams') await AcademicService.createExam(form);
            else if (mode === 'components') await AcademicService.createComponent({ ...form, weight: Number(form.weight), maxScore: Number(form.maxScore || 100) });
            else if (mode === 'approvals') await AcademicService.submitApproval(form);
            else if (mode === 'publication') await AcademicService.publish(form);
            else if (mode === 'transcripts') await AcademicService.generateTranscript(form.studentId);
            else if (mode === 'tahfeez') await AcademicService.assessTahfeez(form);
            else if (mode === 'analytics') setAnalytics(await AcademicService.analytics({ sessionId: form.sessionId, term: form.term }));
            else if (mode === 'portal') setAnalytics(await AcademicService.portalResult(form.studentId, form.sessionId, form.term));
            toast.success('Academic operation completed');
            await load();
        } catch {
            toast.error('Academic operation failed');
        } finally {
            setBusy(false);
        }
    };

    return (
        <main className="mx-auto max-w-7xl space-y-6 p-4 pb-16 md:p-8">
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Icon className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">{titles[mode]}</h1>
                        <p className="text-sm text-muted-foreground">Live academic records, workflows, exports, and analytics.</p>
                    </div>
                </div>
                <Button onClick={load} variant="outline" className="h-10">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Refresh
                </Button>
            </header>

            <Card className="rounded-lg">
                <CardHeader>
                    <CardTitle className="text-lg">Operation</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                    {fields.map((field) => (
                        <div key={field} className="space-y-2">
                            <Label htmlFor={field} className="capitalize">{field.replace(/Id$/, ' ID')}</Label>
                            <Input
                                id={field}
                                type={field.endsWith('At') ? 'datetime-local' : 'text'}
                                value={form[field] || ''}
                                onChange={(event) => setForm((current: any) => ({ ...current, [field]: event.target.value }))}
                            />
                        </div>
                    ))}
                    <div className="flex items-end gap-2">
                        <Button onClick={submit} disabled={busy} className="h-10 flex-1">
                            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Run
                        </Button>
                        {mode === 'reportCards' || mode === 'broadsheets' || mode === 'transcripts' ? (
                            <Button 
                                onClick={() => startExport(mode === 'reportCards' ? 'REPORT_CARD' : mode === 'broadsheets' ? 'BROADSHEET' : 'TRANSCRIPT')} 
                                disabled={busy} 
                                variant="outline" 
                                className="h-10"
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        ) : null}
                        {mode === 'approvals' || mode === 'publication' ? (
                            <Button 
                                onClick={startCompute} 
                                disabled={busy || !!computeJobId} 
                                variant="secondary" 
                                className="h-10"
                            >
                                {computeJobId ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Settings className="mr-2 h-4 w-4" />}
                                {computeJobId ? `Computing ${computeStatus?.progress || 0}%` : 'Compute Results'}
                            </Button>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {analytics ? (
                <Card className="rounded-lg">
                    <CardHeader><CardTitle className="text-lg">Result</CardTitle></CardHeader>
                    <CardContent>
                        <pre className="max-h-[420px] overflow-auto rounded-lg bg-muted p-4 text-xs">{JSON.stringify(analytics, null, 2)}</pre>
                    </CardContent>
                </Card>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => (
                    <Card key={item.id || item.transcriptNo || JSON.stringify(item).slice(0, 24)} className="rounded-lg">
                        <CardHeader className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <CardTitle className="text-base">{item.title || item.name || item.transcriptNo || item.status || 'Academic Record'}</CardTitle>
                                {item.status ? <Badge variant="secondary">{item.status}</Badge> : null}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <pre className="max-h-56 overflow-auto rounded-md bg-muted p-3 text-xs">{JSON.stringify(item, null, 2)}</pre>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </main>
    );
}
