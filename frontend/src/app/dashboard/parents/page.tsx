'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
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
import { useNotification } from '@/context/NotificationContext';
import Link from 'next/link';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function ParentsListPage() {
    const { showSuccess, showError } = useNotification();
    const [parents, setParents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchParents = async () => {
        try {
            setLoading(true);
            const data = await StakeholderService.getAllParentsAdmin();
            setParents(data);
        } catch (error) {
            showError('Failed to fetch parents');
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
            showSuccess('Parent status updated');
            fetchParents();
        } catch (error) {
            showError('Failed to update status');
        }
    };

    const filteredParents = (parents ?? []).filter(p =>
        p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-4">
                        <UserCheck className="text-primary w-6 h-6" />
                        Parent Management
                    </h1>
                    <p className="text-foreground/60 mt-2 text-[12px] font-medium">Oversee family accounts and student links.</p>
                </div>
                <Link href="/dashboard/parents/add">
                    <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <Plus size={24} /> New Parent
                    </Button>
                </Link>
            </div>

            <Card className="rounded-2xl shadow-2xl overflow-hidden border-t-4 border-t-primary">
                <CardHeader className="p-4 border-b bg-muted/20">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 w-4 h-4" />
                            <Input
                                placeholder="Search by name or email..."
                                className="pl-9 h-10 rounded-xl shadow-sm font-bold text-[12px] focus-visible:ring-primary"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="h-10 px-4 rounded-xl font-semibold gap-2 hover:bg-primary/5 text-[12px]">
                            <Filter className="w-4 h-4" /> Filter
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex h-96 items-center justify-center font-semibold animate-pulse uppercase gap-3 text-[12px]">
                            <Loader2 className="animate-spin h-6 w-6" />
                            Synchronizing Parent Data...
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className={TABLE_ROOT}>
                                <thead className={TABLE_HEADER}>
                                    <tr>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Parent Info</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Linked Students</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Contact</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                        <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody className={TABLE_BODY}>
                                    {filteredParents.length > 0 ? filteredParents.map((parent) => (
                                        <tr key={parent.id} className={TABLE_ROW}>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-[12px] shadow-sm">
                                                        {parent.firstName[0]}{parent.lastName[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold uppercase text-[12px]">{parent.firstName} {parent.lastName}</div>
                                                        <div className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest leading-none">Registered: {new Date(parent.createdAt).toLocaleDateString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="flex flex-wrap gap-1">
                                                    {parent.parentOf && parent.parentOf.length > 0 ? parent.parentOf.map((student: any) => (
                                                        <Badge key={student.id} variant="secondary" className="rounded-lg font-bold text-[10px]">
                                                            {student.firstName} {student.lastName[0]}.
                                                        </Badge>
                                                    )) : (
                                                        <span className="text-[10px] font-bold text-foreground/60">No students linked</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2 text-[12px] font-bold text-foreground/60">
                                                        <Mail className="h-3 w-3 text-primary" /> {parent.email}
                                                    </div>
                                                    {parent.phone && (
                                                        <div className="flex items-center gap-2 text-[12px] font-bold text-foreground/60">
                                                            <Phone className="h-3 w-3 text-primary" /> {parent.phone}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <Badge
                                                    className={`rounded-xl px-4 py-1.5 font-semibold uppercase text-[10px] cursor-pointer ${parent.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                                                        }`}
                                                    onClick={() => toggleStatus(parent.id, parent.isActive)}
                                                >
                                                    {parent.isActive ? 'Active' : 'Deactivated'}
                                                </Badge>
                                            </td>
                                            <td className={TABLE_CELL_ACTIONS}>
                                                <Link href={`/dashboard/parents/${parent.id}`}>
                                                    <Button variant="ghost" className="rounded-xl h-9 px-4 font-semibold uppercase text-[10px] gap-2 hover:bg-primary hover:text-white transition-all">
                                                        Manage
                                                        <ChevronRight className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center font-semibold uppercase text-foreground/60 text-[12px]">
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
    </RequireBranch>
    );
}
