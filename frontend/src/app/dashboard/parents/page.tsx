'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Users,
    Search,
    Plus,
    Filter,
    MoreVertical,
    Mail,
    Phone,
    UserCheck,
    ArrowUpDown,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { UserService } from '@/services/userService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ParentsListPage() {
    const [parents, setParents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchParents = async () => {
        try {
            setLoading(true);
            const data = await StakeholderService.getAllParentsAdmin();
            setParents(data);
        } catch (error) {
            toast.error('Failed to fetch parents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchParents();
    }, []);

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await UserService.toggleStatus(id, !currentStatus);
            toast.success('Parent status updated');
            fetchParents();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const filteredParents = parents.filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase flex items-center gap-4">
                        <UserCheck className="text-primary w-10 h-10" />
                        Parent Management
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Oversee family accounts and student links.</p>
                </div>
                <Link href="/dashboard/parents/add">
                    <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <Plus size={24} /> New Parent
                    </Button>
                </Link>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden border-t-8 border-t-primary">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-12 h-14 rounded-2xl border-border/50 shadow-sm font-bold text-lg focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-14 px-6 rounded-2xl font-semibold gap-2 border-border/50 hover:bg-primary/5">
                            <Filter className="w-5 h-5" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-96 items-center justify-center font-semibold animate-pulse uppercase gap-3">
                            <Loader2 className="animate-spin h-6 w-6" />
                            Synchronizing Parent Data...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-border/50 bg-muted/10">
                                        <th className="p-6 font-semibold uppercase text-xs opacity-50">Parent Info</th>
                                        <th className="p-6 font-semibold uppercase text-xs opacity-50">Linked Students</th>
                                        <th className="p-6 font-semibold uppercase text-xs opacity-50">Contact</th>
                                        <th className="p-6 font-semibold uppercase text-xs opacity-50">Status</th>
                                        <th className="p-6 font-semibold uppercase text-xs opacity-50 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredParents.length > 0 ? filteredParents.map((parent) => (
                                        <tr key={parent.id} className="border-b border-border/50 hover:bg-primary/5 transition-all group">
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg shadow-sm">
                                                        {parent.firstName[0]}{parent.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold uppercase text-base">{parent.firstName} {parent.lastName}</div>
                                                        <div className="text-[10px] font-bold opacity-50 uppercase tracking-widest leading-none">Registered: {new Date(parent.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-wrap gap-1">
                                                    {parent.parentOf && parent.parentOf.length > 0 ? parent.parentOf.map((student: any) => (
                                                        <Badge key={student.id} variant="secondary" className="rounded-lg font-bold text-[10px]">
                                                            {student.firstName} {student.lastName[0]}.
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-xs font-bold opacity-30">No students linked</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-6 space-y-1">
                                                <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                                                    <Mail className="h-3 w-3 text-primary" /> {parent.email}
                                                </div>
                                                {parent.phone && (
                                                    <div className="flex items-center gap-2 text-xs font-bold opacity-70">
                                                        <Phone className="h-3 w-3 text-primary" /> {parent.phone}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="p-6">
                                                <Badge
                                                    className={`rounded-xl px-4 py-1.5 font-semibold uppercase text-[10px] cursor-pointer ${parent.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                        }`}
                                                    onClick={() => toggleStatus(parent.id, parent.isActive)}
                                                >
                                                    {parent.isActive ? 'Active' : 'Deactivated'}
                                                </Badge>
                                            </td>
                                            <td className="p-6 text-right">
                                                <Link href={`/dashboard/parents/${parent.id}`}>
                                                    <Button variant="ghost" className="rounded-xl h-10 px-4 font-semibold uppercase text-xs gap-2 hover:bg-primary hover:text-white transition-all">
                                                        Manage
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="p-20 text-center font-semibold uppercase opacity-20 text-h2">
                                                No parents found
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
