'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function DepartmentsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [departments, setDepartments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const fetchDepartments = async () => {
        try {
            const res = await api.get('/departments');
            setDepartments(res.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch departments', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDepartments();
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/departments', {
                ...formData,
                branchId: resolvedBranchId
            });
            setIsDialogOpen(false);
            fetchDepartments();
            setFormData({ name: '', description: '' });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to create department', error);
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/departments/${confirmDelete}`);
            showSuccess('Department deleted successfully');
            fetchDepartments();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to delete department', error);
            showError('Failed to delete department');
        }
        setConfirmDelete(null);
    };

    if (loading) return <RequireBranch requireSpecificBranch><div className="p-4"><BranchContextBanner />Loading...</div></RequireBranch>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Departments</h1>
                    <p className="text-[12px] text-foreground/60 font-medium">Manage and organize school departments.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-2xl h-9 px-4 font-medium shadow-lg shadow-primary/20 text-[12px]">
                            <Plus className="h-4 w-4" /> Add Department
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-primary/20 shadow-2xl p-6 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-[16px] font-semibold mb-4">Add New Department</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Department Name</label>
                                <Input
                                    placeholder="e.g. Science, Arts, Administration"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/30 border-none font-medium text-[14px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Description</label>
                                <Input
                                    placeholder="Optional description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/30 border-none font-medium text-[14px]"
                                />
                            </div>
                            <Button type="submit" className="w-full h-10 rounded-xl font-semibold text-[14px] shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Create Department
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl shadow-2xl shadow-primary/5 border-primary/20 overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="text-[14px] font-semibold">Department List</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-2xl border border-primary/20 overflow-hidden">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Name</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Description</th>
                                    <th className={`${TABLE_HEADER_CELL_NO_SORT} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {departments.map((dept) => (
                                    <tr key={dept.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>{dept.name}</td>
                                        <td className={`${TABLE_CELL} text-foreground/60`}>{dept.description || '-'}</td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                                                onClick={() => handleDelete(dept.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {departments.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-foreground/60 font-medium text-[12px]">
                                            No departments found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Department"
                message="Are you sure you want to delete this department? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
        </RequireBranch>
    );
}
