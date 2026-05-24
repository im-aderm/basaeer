'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Tag } from 'lucide-react';
import { AttachmentService, AttachmentCategory } from '@/services/attachmentService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function AttachmentTypePage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [categories, setCategories] = useState<AttachmentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    const fetchCategories = async () => {
        if (!resolvedBranchId) {
            setLoading(false);
            return;
        }
        try {
            const data = await AttachmentService.getCategories(resolvedBranchId);
            setCategories(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch categories', error);
            showError('Failed to load attachment categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (resolvedBranchId) {
                fetchCategories();
            } else {
                setLoading(false);
            }
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AttachmentService.createCategory({
                ...formData,
                branchId: resolvedBranchId,
            });
            setIsDialogOpen(false);
            fetchCategories();
            setFormData({ name: '', description: '' });
            showSuccess('Category created successfully');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to create category', error);
            showError('Failed to create category');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        try {
            await AttachmentService.deleteCategory(confirmDeleteId);
            fetchCategories();
            showSuccess('Category deleted successfully');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to delete category', error);
            showError('Failed to delete category');
        } finally {
            setConfirmDeleteId(null);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Attachment Categories</h1>
                    <p className="text-foreground/60 font-medium">Organize digital resources by category.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] border-border/50 shadow-2xl p-10 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold mb-6">Add New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Category Name</label>
                                <Input
                                    placeholder="e.g. Worksheets, Lesson Plans"
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
                                Create Category
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl shadow-2xl shadow-primary/5 border-primary/20 overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="pb-2 p-4">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Category List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Name</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Description</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Resources</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {categories.map((cat) => (
                                    <tr key={cat.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>{cat.name}</td>
                                        <td className={TABLE_CELL + " text-foreground/60"}>{cat.description || '-'}</td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-semibold">
                                                {cat._count?.resources || 0}
                                            </span>
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {categories.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-foreground/60 font-medium text-[12px]">
                                            No categories found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>

        <ConfirmDialog
            isOpen={!!confirmDeleteId}
            onConfirm={handleConfirmDelete}
            onCancel={() => setConfirmDeleteId(null)}
            title="Delete Category"
            message="Are you sure you want to delete this category?"
            confirmLabel="Delete"
        />
        </RequireBranch>
    );
}
