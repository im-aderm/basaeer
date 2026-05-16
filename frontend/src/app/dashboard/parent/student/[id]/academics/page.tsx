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
import { toast } from 'sonner';

export default function ChildAcademicsPage() {
    const { id } = useParams();
    const router = useRouter();
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
                toast.error('Failed to load academic records');
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
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Academic Records</h1>
                    <p className="text-muted-foreground font-medium mt-1">Homework tracking and examination performance.</p>
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
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-h3 font-semibold uppercase flex items-center gap-3">
                                <TrendingUp className="h-8 w-8 text-primary" />
                                Assessment Record
                            </CardTitle>
                            <CardDescription className="font-bold">Summary of performance across all terms.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border/50 bg-muted/30">
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Subject</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Term</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Test 1</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Test 2</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Exam</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Total</th>
                                            <th className="p-6 font-semibold uppercase text-xs opacity-50">Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {exams.length > 0 ? exams.map((record) => (
                                            <tr key={record.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                                                <td className="p-6 font-semibold uppercase text-sm">{record.subject?.name}</td>
                                                <td className="p-6 font-bold text-sm opacity-60">{record.term} {record.session?.name}</td>
                                                <td className="p-6 font-bold text-sm">{(record.test1 || 0) + (record.asgn1 || 0)}</td>
                                                <td className="p-6 font-bold text-sm">{(record.test2 || 0) + (record.asgn2 || 0)}</td>
                                                <td className="p-6 font-bold text-sm">{record.examScore || 0}</td>
                                                <td className="p-6 font-semibold text-primary text-sm">{record.total || 0}</td>
                                                <td className="p-6">
                                                    <Badge className="rounded-lg font-semibold px-3 py-1 bg-primary text-white">
                                                        {record.grade || 'N/A'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={7} className="p-20 text-center font-semibold uppercase opacity-20 text-h2">
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
