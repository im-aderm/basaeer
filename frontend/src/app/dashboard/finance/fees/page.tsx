
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function FeeSetupPage() {
    const { user } = useAuth();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newCategory, setNewCategory] = useState({ name: '', description: '' });

    const fetchCategories = async () => {
        try {
            const res = await api.get('/finance/fee-categories');
            setCategories(res.data);
        } catch (error) {
            console.error('Failed to fetch fee categories', error);
            toast.error('Failed to load fee categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async () => {
        if (!newCategory.name) return;
        setSubmitting(true);
        try {
            await api.post('/finance/fee-categories', {
                ...newCategory,
                branchId: user?.branchId
            });
            setNewCategory({ name: '', description: '' });
            fetchCategories();
            toast.success('Fee category added');
        } catch (error) {
            console.error('Failed to add category', error);
            toast.error('Failed to add fee category');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Fee Structure Setup</h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Fee Categories</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Category Name (e.g. Tuition)"
                                value={newCategory.name}
                                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                            />
                            <Button onClick={handleAddCategory} disabled={submitting}>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Add'}
                            </Button>
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Define the types of fees collected (e.g., Tuition, Transport, Hostel, Uniform).
                        </div>

                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Description</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4">Loading...</TableCell>
                                        </TableRow>
                                    ) : categories.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                                                No categories found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        categories.map((category) => (
                                            <TableRow key={category.id}>
                                                <TableCell className="font-medium">{category.name}</TableCell>
                                                <TableCell>{category.description || '-'}</TableCell>
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
                        <CardTitle>Class Fee Structures</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                            Assign standard fee amounts to specific classes.
                        </p>
                        <Button variant="outline" className="w-full">
                            <Plus className="h-4 w-4 mr-2" /> Assign Fees to Class
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
