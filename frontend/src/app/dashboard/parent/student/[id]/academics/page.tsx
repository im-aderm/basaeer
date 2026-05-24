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
    AlertCircle
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function ChildAcademicsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showError } = useNotification();
    const [homework, setHomework] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [homeworkData, examsData] = await Promise.all([
                    StakeholderService.getChildHomework(id as string),
                    StakeholderService.getChildExams(id as string)
                ]);
                setHomework(homeworkData);
                setExams(examsData);
            } catch (error) {
                showError('Failed to load academic records');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

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
                    <Card className="rounded-2xl border-primary/20 shadow-2xl bg-background overflow-hidden">
                        <CardHeader className="p-4 border-b border-primary/20">
                            <CardTitle className="text-[14px] font-semibold uppercase flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Assessment Record
                            </CardTitle>
                            <CardDescription className="font-bold text-[12px]">Summary of performance across all terms.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className={TABLE_ROOT}>
                                    <thead className={TABLE_HEADER}>
                                        <tr>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Subject</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Term</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Test 1</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Test 2</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Exam</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Total</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {exams.length > 0 ? exams.map((record) => (
                                            <tr key={record.id} className={TABLE_ROW}>
                                                <td className={TABLE_CELL_PRIMARY}>{record.subject?.name}</td>
                                                <td className={TABLE_CELL + " text-foreground/60"}>{record.term} {record.session?.name}</td>
                                                <td className={TABLE_CELL}>{(record.test1 || 0) + (record.asgn1 || 0)}</td>
                                                <td className={TABLE_CELL}>{(record.test2 || 0) + (record.asgn2 || 0)}</td>
                                                <td className={TABLE_CELL}>{record.examScore || 0}</td>
                                                <td className={TABLE_CELL + " text-primary font-semibold"}>{record.total || 0}</td>
                                                <td className={TABLE_CELL}>
                                                    <Badge className="rounded-lg font-semibold px-3 py-1 bg-primary text-white text-[12px]">
                                                        {record.grade || 'N/A'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center font-semibold uppercase text-foreground/60 text-[12px]">
                                                    No exam records available
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
