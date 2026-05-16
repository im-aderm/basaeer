'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Layers, Plus, Search, MoreVertical, Edit2, Trash2, HelpCircle } from 'lucide-react';
import { OnlineExamService, QuestionGroup } from '@/services/onlineExamService';
import { toast } from 'sonner';

export default function QuestionGroupPage() {
    const { user, resolvedBranchId } = useAuth();
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
            toast.error('Failed to load question groups');
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
            toast.success('Question group created successfully');
            setNewGroupName('');
            setIsDialogOpen(false);
            fetchGroups();
        } catch (error) {
            toast.error('Failed to create group');
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading question groups...</div>;

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Question Groups</h1>
                    <p className="text-muted-foreground font-medium mt-1">Organize your assessment questions by topics, difficulty, or subjects.</p>
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

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                            <Layers className="h-8 w-8 text-primary" />
                            All Groups
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search groups..."
                                className="pl-9 h-10 rounded-xl bg-muted/50 border-none font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground">Group Name</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-tighter text-muted-foreground text-center">Total Questions</TableHead>
                                <TableHead className="font-semibold px-8 h-16 text-right uppercase tracking-tighter text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredGroups.map((group) => (
                                <TableRow key={group.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-semibold text-lg leading-tight">{group.name}</TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                            <HelpCircle className="h-4 w-4" />
                                            {group._count?.questions || 0} Questions
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl border-border/50 text-muted-foreground hover:text-primary hover:bg-primary/5 hover:border-primary/20"
                                            >
                                                <Edit2 className="h-5 w-5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-12 w-12 rounded-2xl border-border/50 text-muted-foreground hover:text-destructive hover:bg-destructive/5 hover:border-destructive/20"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {filteredGroups.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center gap-4 opacity-30 grayscale saturate-0">
                                            <Layers className="h-20 w-20 stroke-[1]" />
                                            <p className="font-semibold text-h3">No question groups found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
