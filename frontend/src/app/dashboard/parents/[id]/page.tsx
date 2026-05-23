'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Mail,
    Phone,
    UserCheck,
    ChevronLeft,
    Plus,
    X,
    ExternalLink,
    GraduationCap,
    Clock,
    DollarSign,
    Loader2,
    Trash2
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { StudentService } from '@/services/studentService';
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ParentDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { showSuccess, showError } = useNotification();

    const [parent, setParent] = useState<any>(null);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [linking, setLinking] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [parentData, studentsData] = await Promise.all([
                StakeholderService.getParentDetailsAdmin(id),
                StudentService.getAll()
            ]);
            setParent(parentData);
            // Filter out students already linked to this parent (optimization)
            const linkedIds = new Set(parentData.parentOf.map((s: any) => s.id));
            setAllStudents(studentsData.filter((s: any) => !linkedIds.has(s.id)));
        } catch (error) {
            showError('Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleLinkStudent = async () => {
        if (!selectedStudent) return;
        try {
            setLinking(true);
            await StakeholderService.linkStudent(id, selectedStudent);
            showSuccess('Student linked successfully');
            setSelectedStudent('');
            fetchData();
        } catch (error) {
            showError('Failed to link student');
        } finally {
            setLinking(false);
        }
    };

    const handleUnlinkStudent = async (studentId: string) => {
        try {
            await StakeholderService.unlinkStudent(studentId);
            showSuccess('Student unlinked');
            fetchData();
        } catch (error) {
            showError('Failed to unlink student');
        }
    };

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center font-semibold animate-pulse uppercase gap-3 text-2xl">
                <Loader2 className="animate-spin h-8 w-8" />
                Retrieving Family Profile...
            </div>
        );
    }

    if (!parent) return <div>Parent not found</div>;

    const totalBalance = parent.parentOf.reduce((acc: number, student: any) => {
        return acc + student.invoices.reduce((sAcc: number, inv: any) => sAcc + inv.balance, 0);
    }, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 gap-2 font-semibold uppercase text-xs p-0 hover:bg-transparent hover:text-primary"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back to List
                    </Button>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-h3 shadow-sm">
                            {parent.firstName[0]}{parent.lastName[0]}
                        </div>
                        {parent.firstName} {parent.lastName}
                    </h1>
                </div>
                <div className="flex gap-4">
                    <Badge className={`rounded-2xl px-6 py-2 font-semibold uppercase text-xs ${parent.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                        {parent.isActive ? 'Active Member' : 'Deactivated'}
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Contact Info & Summary */}
                <div className="space-y-8">
                    <Card className="rounded-[2.5rem] shadow-2xl border-t-8 border-t-primary">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-h3 font-semibold uppercase tracking-tight">Parent Credentials</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="text-[10px] font-semibold uppercase opacity-50 mb-1">Email Address</div>
                                    <div className="font-bold flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-primary" />
                                        {parent.email}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="text-[10px] font-semibold uppercase opacity-50 mb-1">Phone Number</div>
                                    <div className="font-bold flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-primary" />
                                        {parent.phone || 'Not provided'}
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                    <div className="text-[10px] font-semibold uppercase opacity-50 mb-1">Member Since</div>
                                    <div className="font-bold flex items-center gap-2 ">
                                        <Clock className="h-4 w-4" />
                                        {new Date(parent.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[2.5rem] shadow-2xl overflow-hidden">
                        <div className="p-8 bg-primary/10">
                            <div className="flex justify-between items-center mb-4">
                                <DollarSign className="text-primary h-8 w-8" />
                                <Badge className="bg-primary text-white font-semibold uppercase text-[10px]">Financial Summary</Badge>
                            </div>
                            <div className="text-h1 font-semibold">₦{totalBalance.toLocaleString()}</div>
                            <div className="text-xs font-bold opacity-50 uppercase tracking-widest mt-1">Outstanding Family Balance</div>
                        </div>
                    </Card>
                </div>

                {/* Right: Linked Students & Linking Action */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[2.5rem] shadow-2xl">
                        <CardHeader className="p-10 pb-4 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-h3 font-semibold uppercase tracking-tight">Linked Students</CardTitle>
                                <CardDescription className="font-bold mt-2">Managing the relationship for {parent.parentOf.length} student(s)</CardDescription>
                            </div>
                            <Users className="text-primary h-10 w-10 opacity-20" />
                        </CardHeader>
                        <CardContent className="p-10 pt-6 space-y-8">
                            <div className="space-y-4">
                                {parent.parentOf.length > 0 ? parent.parentOf.map((student: any) => (
                                    <div key={student.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-muted/20 border hover:bg-muted/40 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-primary font-semibold shadow-sm group-hover:scale-110 transition-transform">
                                                <GraduationCap className="h-7 w-7" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-h3">{student.firstName} {student.lastName}</div>
                                                <div className="flex gap-2 mt-1">
                                                    <Badge variant="outline" className="text-[10px] font-semibold uppercase border-primary/20 text-primary">
                                                        {student.class?.name || 'No Class'} - {student.section?.name || 'N/A'}
                                                    </Badge>
                                                    <Badge className="text-[10px] font-semibold uppercase bg-rose-500/10 text-rose-500">
                                                        Bal: ₦{student.invoices.reduce((acc: number, inv: any) => acc + inv.balance, 0)}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Link href={`/dashboard/students/${student.id}`}>
                                                <Button variant="outline" size="icon" className="rounded-xl hover:bg-primary hover:text-white transition-all">
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                                onClick={() => handleUnlinkStudent(student.id)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center p-12 border-2 border-dashed rounded-[2.5rem] bg-muted/5">
                                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="font-semibold uppercase text-muted-foreground text-sm">No students currently linked to this account</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-4">
                                <h4 className="font-semibold text-primary text-lg uppercase flex items-center gap-2">
                                    <Plus className="h-5 w-5" /> Link New Student
                                </h4>
                                <div className="flex gap-4">
                                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                        <SelectTrigger className="h-14 rounded-2xl font-bold text-lg">
                                            <SelectValue placeholder="Select student to link..." />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {allStudents.map((s) => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold text-lg p-3">
                                                    {s.firstName} {s.lastName} ({s.class?.name || 'Unassigned'})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Button
                                        onClick={handleLinkStudent}
                                        disabled={!selectedStudent || linking}
                                        className="h-14 px-8 rounded-2xl font-semibold uppercase gap-2 shadow-lg shadow-primary/20"
                                    >
                                        {linking ? <Loader2 className="animate-spin" /> : <Plus />}
                                        Link
                                    </Button>
                                </div>
                                <p className="text-[10px] font-bold text-muted-foreground px-2">Linking a student allows this parent to access their attendance, grades, and financials.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
