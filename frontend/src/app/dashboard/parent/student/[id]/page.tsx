'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Calendar,
    Wallet,
    TrendingUp,
    ChevronLeft,
    GraduationCap,
    BookOpen,
    Clock,
    Award,
    FileText,
    Activity
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ChildProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [child, setChild] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const children = await StakeholderService.getChildren();
                const found = children.find((c: any) => c.id === id);
                if (!found) {
                    toast.error('Child not found or access denied');
                    router.push('/dashboard/parent');
                    return;
                }
                setChild(found);
            } catch (error) {
                toast.error('Failed to load child data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="flex h-96 items-center justify-center font-black animate-pulse uppercase italic">Loading Profile...</div>;
    if (!child) return null;

    const sections = [
        {
            title: 'Attendance',
            description: 'Monthly & term-wise presence tracking.',
            icon: Calendar,
            color: 'bg-blue-500',
            link: `/dashboard/parent/student/${id}/attendance`,
            metric: '92% Average'
        },
        {
            title: 'Financials',
            description: 'Fee payments, invoices and balances.',
            icon: Wallet,
            color: 'bg-emerald-500',
            link: `/dashboard/parent/student/${id}/financials`,
            metric: 'Up to date'
        },
        {
            title: 'Academics',
            description: 'Homework, assignments and exams.',
            icon: BookOpen,
            color: 'bg-purple-500',
            link: `/dashboard/parent/student/${id}/academics`,
            metric: 'A+ Class Rank'
        }
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-12 w-12 border border-border/50"
                    onClick={() => router.push('/dashboard/parent')}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Child Profile</h1>
                    <p className="text-muted-foreground font-medium mt-1">Detailed overview for {child.firstName}.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Profile Card */}
                <Card className="lg:col-span-1 rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden h-fit sticky top-8">
                    <div className="h-32 bg-primary/10 relative">
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                            <div className="h-24 w-24 rounded-3xl bg-primary flex items-center justify-center text-white font-black text-3xl italic shadow-2xl shadow-primary/20 border-4 border-background">
                                {child.firstName[0]}{child.lastName[0]}
                            </div>
                        </div>
                    </div>
                    <CardContent className="pt-16 pb-8 text-center space-y-4">
                        <div>
                            <h2 className="text-2xl font-black italic uppercase">{child.firstName} {child.lastName}</h2>
                            <p className="text-muted-foreground font-bold text-sm">{child.class?.name} • Section {child.section?.name}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <Badge variant="secondary" className="rounded-lg font-bold italic">Student ID: {child.id.slice(0, 8)}</Badge>
                            <Badge variant="outline" className="rounded-lg font-bold italic">DOB: {new Date(child.dob).toLocaleDateString()}</Badge>
                        </div>
                        <Separator className="my-4" />
                        <div className="space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                                <Activity className="h-4 w-4 text-primary" />
                                <span>Status: Active Student</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm font-bold opacity-70">
                                <GraduationCap className="h-4 w-4 text-primary" />
                                <span>Grade Level: {child.class?.gradeLevel || 'N/A'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Areas */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sections.map((section, idx) => (
                            <Link key={idx} href={section.link}>
                                <Card className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden bg-background group hover:border-primary/50 transition-all duration-500 cursor-pointer h-full">
                                    <CardContent className="p-8 flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-2xl ${section.color} shadow-lg shadow-black/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500`}>
                                            <section.icon className="h-8 w-8" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-xl font-black italic uppercase italic">{section.title}</h3>
                                                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">{section.description}</p>
                                                </div>
                                                <div className="text-xs font-black italic text-primary uppercase bg-primary/10 px-3 py-1 rounded-full">
                                                    {section.metric}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-[2rem] border-border/50 shadow-lg bg-background p-6 space-y-4">
                            <div className="flex items-center gap-3 font-black italic uppercase text-xs opacity-50">
                                <Clock className="h-4 w-4" /> Recent Attendance
                            </div>
                            <div className="space-y-2">
                                {child.attendance?.slice(0, 3).map((a: any, i: number) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="font-bold opacity-70">{new Date(a.date).toLocaleDateString()}</span>
                                        <Badge variant={a.status === 'PRESENT' ? 'secondary' : 'destructive'} className="rounded-md text-[10px]">{a.status}</Badge>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="rounded-[2rem] border-border/50 shadow-lg bg-background p-6 space-y-4">
                            <div className="flex items-center gap-3 font-black italic uppercase text-xs opacity-50">
                                <Wallet className="h-4 w-4" /> Latest Invoice
                            </div>
                            {child.invoices?.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="text-lg font-black italic">#{child.invoices[0].invoiceNumber}</div>
                                    <div className="text-2xl font-black text-rose-500">${child.invoices[0].balance}</div>
                                    <p className="text-[10px] font-bold opacity-50 uppercase">Due: {new Date(child.invoices[0].dueDate).toLocaleDateString()}</p>
                                </div>
                            ) : (
                                <p className="text-sm font-bold opacity-40">No pending invoices</p>
                            )}
                        </Card>

                        <Card className="rounded-[2rem] border-border/50 shadow-lg bg-background p-6 space-y-4">
                            <div className="flex items-center gap-3 font-black italic uppercase text-xs opacity-50">
                                <Award className="h-4 w-4" /> Performance
                            </div>
                            {child.resultSummaries?.length > 0 ? (
                                <div className="space-y-1">
                                    <div className="text-2xl font-black italic text-primary">{child.resultSummaries[0].finalGrade || 'A+'}</div>
                                    <p className="text-sm font-bold opacity-70 uppercase tracking-wider">{child.resultSummaries[0].term} Term Average</p>
                                    <div className="h-1.5 w-full bg-muted rounded-full mt-2 overflow-hidden">
                                        <div className="h-full bg-primary" style={{ width: `${child.resultSummaries[0].average || 90}%` }} />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm font-bold opacity-40">No academic results yet</p>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Separator({ className }: { className?: string }) {
    return <div className={`h-[1px] w-full bg-border/50 ${className}`} />;
}
