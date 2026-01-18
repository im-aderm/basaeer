'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
    Users,
    Calendar,
    Wallet,
    GraduationCap,
    ChevronRight,
    MessageCircle,
    Bell,
    TrendingUp,
    AlertCircle
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { toast } from 'sonner';

export default function ParentDashboardPage() {
    const { user } = useAuth();
    const [children, setChildren] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StakeholderService.getChildren();
                setChildren(data);
            } catch (error) {
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="flex h-96 items-center justify-center font-black animate-pulse uppercase italic">Loading Family Data...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Family Portal</h1>
                    <p className="text-muted-foreground font-medium mt-1">Unified vision of your children's academic journey.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-black gap-2 border-primary/20 hover:bg-primary/5">
                        <MessageCircle className="h-5 w-5" />
                        Quick Chat
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map((child) => (
                    <Card key={child.id} className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background group hover:border-primary/50 transition-all duration-500">
                        <CardHeader className="p-8 border-b border-border/50 bg-primary/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 origin-top-right group-hover:scale-110 transition-transform">
                                <GraduationCap className="h-16 w-16 text-primary/10" />
                            </div>
                            <div className="flex items-center gap-4 relative">
                                <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-2xl italic shadow-xl shadow-primary/20">
                                    {child.firstName[0]}{child.lastName[0]}
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black italic uppercase italic">{child.firstName} {child.lastName}</CardTitle>
                                    <CardDescription className="font-bold flex items-center gap-2">
                                        <Badge variant="secondary" className="rounded-lg">{child.class?.name || 'Class N/A'}</Badge>
                                        <Badge variant="outline" className="rounded-lg opacity-70">Sec: {child.section?.name || 'N/A'}</Badge>
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <div className="flex items-center gap-2 font-black italic uppercase text-xs opacity-50">
                                        <Calendar className="h-3 w-3" /> Attendance
                                    </div>
                                    <span className="text-xl font-black italic">92%</span>
                                </div>
                                <Progress value={92} className="h-2 rounded-full" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 font-black italic uppercase text-[10px] opacity-50">
                                        <Wallet className="h-3 w-3" /> Fee Status
                                    </div>
                                    <div className="text-lg font-black italic text-emerald-500">PAID</div>
                                </div>
                                <div className="bg-muted/30 p-4 rounded-2xl space-y-1">
                                    <div className="flex items-center gap-2 font-black italic uppercase text-[10px] opacity-50">
                                        <TrendingUp className="h-3 w-3" /> Lates Performance
                                    </div>
                                    <div className="text-lg font-black italic text-primary">A+ / 88%</div>
                                </div>
                            </div>

                            <Button className="w-full h-12 rounded-xl font-black uppercase italic tracking-wider gap-2 group/btn">
                                View Profile
                                <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                    <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-3">
                                <Calendar className="h-8 w-8 text-primary" />
                                Upcoming Events
                            </CardTitle>
                            <CardDescription className="font-bold">Next 30 days of school activities.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {[
                            { title: 'Parent-Teacher Meeting', date: 'Oct 24, 2026', type: 'Academic' },
                            { title: 'Annual Sports Day', date: 'Nov 12, 2026', type: 'Ex-Curricular' },
                            { title: 'Mid-Term Examinations', date: 'Nov 20, 2026', type: 'Assessment' }
                        ].map((event, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-xl bg-background flex flex-col items-center justify-center border border-border/50 shadow-sm">
                                        <span className="text-[10px] font-black uppercase opacity-50 leading-none">{event.date.split(' ')[0]}</span>
                                        <span className="text-lg font-black italic leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                                    </div>
                                    <div>
                                        <div className="font-black italic uppercase text-sm">{event.title}</div>
                                        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest">{event.type}</div>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="rounded-xl"><ChevronRight className="h-5 w-5" /></Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden text-white" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #000000 100%)' }}>
                    <CardHeader className="p-8 border-b border-white/10 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-3 text-white">
                                <AlertCircle className="h-8 w-8 text-primary" />
                                Notifications
                            </CardTitle>
                            <CardDescription className="font-bold text-white/50">Recent updates from the school.</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-4">
                        {[
                            { title: 'Fees Invoice Generated', text: 'Invoice #INV-2026-004 has been generated for November.', time: '2h ago' },
                            { title: 'Exam Results Published', text: 'Mid-term results for Grade 10A are now available.', time: '1d ago' }
                        ].map((notif, idx) => (
                            <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                                <div className="flex justify-between items-center">
                                    <div className="font-black italic uppercase text-xs text-primary">{notif.title}</div>
                                    <span className="text-[10px] font-bold opacity-30">{notif.time}</span>
                                </div>
                                <div className="text-sm font-medium text-white/70">{notif.text}</div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
