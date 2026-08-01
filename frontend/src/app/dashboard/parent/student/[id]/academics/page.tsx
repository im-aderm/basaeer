'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    BookOpen,
    ChevronLeft,
    GraduationCap,
    Clock,
    CheckCircle2,
    FileText,
    TrendingUp,
    AlertCircle,
    Download,
    Loader2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { ExamService } from '@/services/examService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

interface PublishedResultRow {
    sessionId: string;
    sessionName: string;
    term: string;
    average: number | null;
    finalGrade: string | null;
    classPosition: number | null;
}

export default function ChildAcademicsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showError } = useNotification();
    const [homework, setHomework] = useState<any[]>([]);
    const [results, setResults] = useState<PublishedResultRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [detail, setDetail] = useState<any>(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [downloadingKey, setDownloadingKey] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Published, publish-gate-checked results — this used to call
                // StakeholderService.getChildExams, which returned raw
                // AssessmentRecord rows with no ResultPublication check, so a
                // parent could see a child's unpublished/still-being-graded
                // scores. Now it's the exact same publish-gated data the
                // student portal and public checker show.
                const [homeworkData, resultsData] = await Promise.all([
                    StakeholderService.getChildHomework(id as string),
                    ExamService.getMyPublishedResults(id as string),
                ]);
                setHomework(homeworkData);
                setResults(resultsData);
            } catch (error) {
                showError('Failed to load academic records');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const rowKey = (row: PublishedResultRow) => `${row.sessionId}::${row.term}`;

    const toggleExpand = async (row: PublishedResultRow) => {
        const key = rowKey(row);
        if (expanded === key) {
            setExpanded(null);
            return;
        }
        setExpanded(key);
        setDetail(null);
        setDetailLoading(true);
        try {
            const data = await ExamService.getPublishedResult(id as string, row.sessionId, row.term as any);
            setDetail(data);
        } catch {
            showError('Failed to load result detail');
        } finally {
            setDetailLoading(false);
        }
    };

    const handleDownload = async (row: PublishedResultRow) => {
        const key = rowKey(row);
        setDownloadingKey(key);
        try {
            const blob = await ExamService.downloadReportCard(id as string, row.sessionId, row.term as any);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `ReportCard_${row.sessionName}_${row.term}.pdf`.replace(/\s+/g, '_');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch {
            showError('Failed to download report card');
        } finally {
            setDownloadingKey(null);
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center font-semibold animate-pulse">Loading Academics...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-12 w-12 border border-border/50"
                    onClick={() => router.push(`/dashboard/parent/student/${id}`)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Academic Records</h1>
                    <p className="text-foreground/60 font-medium mt-1">Homework tracking and examination performance.</p>
                </div>
            </div>

            <Tabs defaultValue="homework" className="space-y-8">
                <TabsList className="h-16 p-2 rounded-2xl bg-muted/50 border border-border/50">
                    <TabsTrigger value="homework" className="rounded-xl px-12 font-semibold uppercase h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                        <BookOpen className="h-4 w-4 mr-2" />
                        Homework
                    </TabsTrigger>
                    <TabsTrigger value="exams" className="rounded-xl px-12 font-semibold uppercase h-full data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Exam Results
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="homework" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {homework.length > 0 ? homework.map((item) => {
                            const submission = item.submissions?.[0];
                            const isSubmitted = !!submission;

                            return (
                                <Card key={item.id} className="rounded-[2.5rem] border-border/50 shadow-xl bg-background overflow-hidden group hover:border-primary/50 transition-all duration-500">
                                    <CardContent className="p-8 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="outline" className="rounded-lg font-semibold uppercase text-[10px] text-primary">{item.subject?.name}</Badge>
                                            <Badge variant={isSubmitted ? 'secondary' : 'outline'} className={`rounded-xl font-semibold uppercase text-[10px] ${!isSubmitted ? 'text-rose-500 border-rose-500' : ''}`}>
                                                {isSubmitted ? 'Submitted' : 'Pending'}
                                            </Badge>
                                        </div>
                                        <h3 className="text-h3 font-semibold uppercase leading-tight">{item.title}</h3>
                                        <p className="text-xs font-medium text-muted-foreground line-clamp-2">{item.description}</p>
                                        <div className="flex items-center gap-3 font-bold text-[10px] opacity-60">
                                            <Clock className="h-4 w-4" />
                                            Due: {new Date(item.dueDate).toLocaleDateString()}
                                        </div>
                                        <div className="pt-4 flex gap-2">
                                            <Button variant="secondary" className="flex-1 rounded-xl font-bold text-xs">View Brief</Button>
                                            {isSubmitted && <Button variant="outline" className="rounded-xl font-bold text-xs">View Marks</Button>}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        }) : (
                            <div className="col-span-full py-20 text-center space-y-4 opacity-30">
                                <BookOpen className="h-16 w-16 mx-auto" />
                                <h3 className="text-h3 font-semibold">No homework assigned yet</h3>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="exams" className="space-y-6">
                    {results.length === 0 ? (
                        <Card className="rounded-2xl border-primary/20 shadow-2xl bg-background">
                            <CardContent className="py-16 text-center text-foreground/60 font-semibold uppercase text-[12px]">
                                No published results yet
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {results.map((row) => {
                                const key = rowKey(row);
                                const isOpen = expanded === key;
                                return (
                                    <Card key={key} className="rounded-2xl border-primary/20 shadow-2xl bg-background overflow-hidden">
                                        <CardHeader
                                            className="p-4 border-b border-primary/20 cursor-pointer"
                                            onClick={() => toggleExpand(row)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <CardTitle className="text-[14px] font-semibold uppercase flex items-center gap-3">
                                                        <TrendingUp className="h-5 w-5 text-primary" />
                                                        {row.sessionName} — {row.term} Term
                                                    </CardTitle>
                                                    <CardDescription className="font-bold text-[12px]">
                                                        Average: {row.average != null ? Number(row.average).toFixed(1) : '—'} · Grade: {row.finalGrade ?? '—'} · Position: {row.classPosition ?? '—'}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="rounded-xl font-bold text-xs"
                                                        disabled={downloadingKey === key}
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(row); }}
                                                    >
                                                        {downloadingKey === key ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                                                        PDF
                                                    </Button>
                                                    {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        {isOpen && (
                                            <CardContent className="p-0">
                                                {detailLoading ? (
                                                    <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
                                                ) : (
                                                    <div className="overflow-x-auto">
                                                        <table className={TABLE_ROOT}>
                                                            <thead className={TABLE_HEADER}>
                                                                <tr>
                                                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Subject</th>
                                                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Total</th>
                                                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Grade</th>
                                                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Position</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className={TABLE_BODY}>
                                                                {detail?.records?.length > 0 ? detail.records.map((record: any) => (
                                                                    <tr key={record.id} className={TABLE_ROW}>
                                                                        <td className={TABLE_CELL_PRIMARY}>{record.subject?.name}</td>
                                                                        <td className={TABLE_CELL + " text-primary font-semibold"}>{Number(record.total || 0).toFixed(1)}</td>
                                                                        <td className={TABLE_CELL}>
                                                                            <Badge className="rounded-lg font-semibold px-3 py-1 bg-primary text-white text-[12px]">
                                                                                {record.grade || 'N/A'}
                                                                            </Badge>
                                                                        </td>
                                                                        <td className={TABLE_CELL}>{record.position || '-'}</td>
                                                                    </tr>
                                                                )) : (
                                                                    <tr>
                                                                        <td colSpan={4} className="py-12 text-center font-semibold uppercase text-foreground/60 text-[12px]">
                                                                            No subject breakdown available
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </CardContent>
                                        )}
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
