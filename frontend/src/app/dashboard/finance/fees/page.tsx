'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { financeService } from '@/services/financeService';

export default function FeeSetupPage() {
    const { user, resolvedBranchId } = useAuth();
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
            toast.error('Failed to load fee categories');
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
            toast.success('Fee category added');
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to add category', error);
            toast.error('Failed to add fee category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-h1 font-bold tracking-tight text-primary">Fee Structure Setup</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-h3">Fee Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Category Name (e.g. Tuition)"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                className="text-body"
                            />
                            <Button onClick={handleAddCategory} disabled={submitting} className="text-btn font-medium">
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                            </Button>
                        </div>
                        <p className="text-secondary">
                            Define the types of fees collected (e.g., Tuition, Transport, Hostel, Uniform).
                        </p>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-label">Name</TableHead>
                                        <TableHead className="text-label">Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4 text-secondary">Loading...</TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4 text-secondary">
                                                No categories found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="text-table-cell font-medium">{category.name}</TableCell>
                                                <TableCell className="text-table-cell">{category.description || '-'}</TableCell>
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
                        <CardTitle className="text-h3">Class Fee Structures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-secondary mb-4">
                            Assign standard fee amounts to specific classes.
                        </p>
                        <Button variant="outline" className="w-full text-btn font-medium">
                            <Plus className="h-4 w-4 mr-2" /> Assign Fees to Class
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
