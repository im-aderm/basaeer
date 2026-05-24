'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from '@/lib/table-styles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { financeService } from '@/services/financeService';

export default function FeeSetupPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });

    const fetchCategories = async () => {
        try {
            const data = await financeService.getFeeCategories();
            setCategories(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch fee categories', error);
            showError('Failed to load fee categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleAddCategory = async () => {
        if (!newCategory.name) return;
        setSubmitting(true);
        try {
            await financeService.createFeeCategory({ ...newCategory, branchId: resolvedBranchId || '' });
            setNewCategory({ name: '', description: '' });
            fetchCategories();
            showSuccess('Fee category added');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to add category', error);
            showError('Failed to add fee category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-center">
                <h1 className="text-[20px] font-bold tracking-tight text-primary">Fee Structure Setup</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-[12px] font-semibold">Fee Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Category Name (e.g. Tuition)"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="text-[12px]"
                            />
                            <Button onClick={handleAddCategory} disabled={submitting} className="text-[12px] font-medium">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                            </Button>
                        </div>
                        <p className="text-[12px] text-foreground/60">
                            Define the types of fees collected (e.g., Tuition, Transport, Hostel, Uniform).
                        </p>

                        <div className="border rounded-md">
                            <Table className={TABLE_ROOT}>
                                <TableHeader>
                                    <TableRow className={TABLE_HEADER}>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Name</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={TABLE_BODY}>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className={`${TABLE_CELL} text-center py-4 text-foreground/60`}>Loading...</TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className={`${TABLE_CELL} text-center py-4 text-foreground/60`}>
                                                No categories found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category) => (
                                            <TableRow key={category.id} className={TABLE_ROW}>
                                                <TableCell className={TABLE_CELL_PRIMARY}>{category.name}</TableCell>
                                                <TableCell className={TABLE_CELL}>{category.description || '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-[12px] font-semibold">Class Fee Structures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-[12px] text-foreground/60 mb-4">
                            Assign standard fee amounts to specific classes.
                        </p>
                        <Button variant="outline" className="w-full text-[12px] font-medium">
                            <Plus className="h-4 w-4 mr-2" /> Assign Fees to Class
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
        </RequireBranch>
    );
}
