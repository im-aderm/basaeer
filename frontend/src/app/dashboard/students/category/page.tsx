'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Tag } from 'lucide-react';
import { StudentService, StudentCategory } from '@/services/studentService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function StudentCategoryPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [categories, setCategories] = useState<StudentCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

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
            const data = await StudentService.getCategories(resolvedBranchId);
            setCategories(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch categories', error);
            showError('Failed to load student categories');
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
            await StudentService.createCategory({
                ...formData,
                branchId: resolvedBranchId
            });
            setIsDialogOpen(false);
            fetchCategories();
            setFormData({ name: '', description: '' });
            showSuccess('Category created successfully');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to create category', error);
            showError('Failed to create student category');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await StudentService.deleteCategory(confirmDeleteId);
            fetchCategories();
            showSuccess('Category deleted successfully');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to delete category', error);
            showError('Failed to delete student category');
        } finally {
            setDeleting(false);
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
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Student Categories</h1>
                    <p className="text-foreground/60 font-medium">Categorize students for better organization and reporting.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 rounded-xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                            <Plus className="h-4 w-4" /> Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl border-primary/20 shadow-2xl p-6 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-[14px] font-semibold mb-4">Add New Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Category Name</label>
                                <Input
                                    placeholder="e.g. Science, Arts, Special Needs"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/30 border-none font-semibold text-[12px]"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Description</label>
                                <Input
                                    placeholder="Optional description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="h-10 rounded-xl bg-muted/30 border-none font-semibold text-[12px]"
                                />
                            </div>
                            <Button type="submit" className="w-full h-10 rounded-xl font-semibold text-[14px] shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Create Category
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl shadow-2xl shadow-primary/5 border-primary/20 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                        <Tag className="h-5 w-5 text-primary" />
                        Category List
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-2xl border border-primary/20 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-primary/20">
                                    <TableHead className="font-semibold h-10 text-[12px]">Name</TableHead>
                                    <TableHead className="font-semibold h-10 text-[12px]">Description</TableHead>
                                    <TableHead className="font-semibold h-10 text-[12px] text-center">Students</TableHead>
                                    <TableHead className="text-right font-semibold h-10 text-[12px] px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.map((cat) => (
                                    <TableRow key={cat.id} className="border-primary/20 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold py-1.5 text-[12px]">{cat.name}</TableCell>
                                        <TableCell className="text-foreground/60 font-medium text-[12px]">{cat.description || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[12px] font-semibold">
                                                {cat._count?.students || 0}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-all"
                                                onClick={() => handleDelete(cat.id)}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {categories.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-foreground/60 font-medium">
                                            No categories found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Category"
                message="Are you sure you want to delete this category? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
            </div>
        </RequireBranch>
    );
}
