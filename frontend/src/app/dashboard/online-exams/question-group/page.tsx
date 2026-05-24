'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Layers, Plus, Search, MoreVertical, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { OnlineExamService, QuestionGroup } from '@/services/onlineExamService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function QuestionGroupPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [groups, setGroups] = useState<QuestionGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    const fetchGroups = async () => {
        try {
            const data = await OnlineExamService.getGroups();
            setGroups(data);
        } catch (error) {
            showError('Failed to load question groups');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleCreateGroup = async () => {
        if (!newGroupName.trim()) return;
        try {
            await OnlineExamService.createGroup(newGroupName, resolvedBranchId || '');
            showSuccess('Question group created successfully');
            setNewGroupName('');
            setIsDialogOpen(false);
            fetchGroups();
        } catch (error) {
            showError('Failed to create group');
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-4">Loading question groups...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8">
                <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Question Groups</h1>
                    <p className="text-foreground/60 font-medium mt-1">Organize your assessment questions by topics, difficulty, or subjects.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 px-8 rounded-2xl font-semibold text-lg gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
                            <Plus className="h-6 w-6" />
                            New Group
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2rem] sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">Create Question Group</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-widest ml-1">Group Name</Label>
                                <Input
                                    placeholder="e.g. Mathematics - Algebra"
                                    className="h-12 rounded-2xl border-border/50 bg-background/50 font-bold"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button className="rounded-xl font-bold px-8" onClick={handleCreateGroup}>Create Group</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-4 pb-2 border-b border-primary/20">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                            <Layers className="h-5 w-5 text-primary" />
                            All Groups
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                            <Input
                                placeholder="Search groups..."
                                className="pl-9 h-9 rounded-xl bg-muted/50 border-none font-medium text-[12px]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Group Name</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Total Questions</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {filteredGroups.map((group) => (
                                    <tr key={group.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>{group.name}</td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-[12px]">
                                                <HelpCircle className="h-4 w-4" />
                                                {group._count?.questions || 0} Questions
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex justify-end gap-3">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl border-primary/20 text-foreground/60 hover:text-primary hover:bg-primary/5"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl border-primary/20 text-foreground/60 hover:text-destructive hover:bg-destructive/5"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredGroups.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                                <Layers className="h-20 w-20 stroke-[1]" />
                                                <p className="font-semibold text-[12px]">No question groups found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}
