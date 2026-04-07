'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function DesignationsPage() {
    const { user } = useAuth();
    const [designations, setDesignations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const fetchDesignations = async () => {
        try {
            const res = await api.get('/designations');
            setDesignations(res.data);
        } catch (error) {
            console.error('Failed to fetch designations', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDesignations();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/designations', {
                ...formData,
                branchId: user?.branchId
            });
            setIsDialogOpen(false);
            fetchDesignations();
            setFormData({ name: '', description: '' });
        } catch (error) {
            console.error('Failed to create designation', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this designation?')) {
            try {
                await api.delete(`/designations/${id}`);
                fetchDesignations();
            } catch (error) {
                console.error('Failed to delete designation', error);
            }
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Designations</h1>
                    <p className="text-muted-foreground font-medium">Manage and organize staff designations.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> Add Designation
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-border/50 shadow-2xl p-10 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold mb-6">Add New Designation</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Designation Name</label>
                                <Input
                                    placeholder="e.g. Senior Teacher, HOD, Principal"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Description</label>
                                <Input
                                    placeholder="Optional description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Create Designation
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[2rem] shadow-2xl shadow-primary/5 border-border/50 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="text-h3 font-semibold">Designation List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="font-semibold h-14">Name</TableHead>
                                    <TableHead className="font-semibold h-14">Description</TableHead>
                                    <TableHead className="text-right font-semibold h-14 px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {designations.map((desig) => (
                                    <TableRow key={desig.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold py-4">{desig.name}</TableCell>
                                        <TableCell className="text-muted-foreground font-medium">{desig.description || '-'}</TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                                                onClick={() => handleDelete(desig.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {designations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-12 text-muted-foreground font-medium">
                                            No designations found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
