
'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Check, X, Tag } from 'lucide-react';
import api from '@/lib/api';
import { useNotification } from '@/context/NotificationContext';

export default function ExpensesPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [vouchers, setVouchers] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryDesc, setNewCategoryDesc] = useState('');
    const [creatingCategory, setCreatingCategory] = useState(false);

    const [formData, setFormData] = useState({
        amount: '',
        description: '',
        expenseCategoryId: '',
        paidTo: '',
        date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        try {
            const [vouchersRes, categoriesRes] = await Promise.all([
                api.get('/finance/vouchers'),
                api.get('/finance/expense-categories')
            ]);
            setVouchers(vouchersRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch expense data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            showError('Category name is required');
            return;
        }
        if (!resolvedBranchId) {
            showError('Select a branch first');
            return;
        }
        setCreatingCategory(true);
        try {
            const res = await api.post('/finance/expense-categories', {
                name: newCategoryName.trim(),
                description: newCategoryDesc.trim() || undefined,
                branchId: resolvedBranchId,
            });
            setCategories((prev) => [...prev, res.data]);
            setFormData((prev) => ({ ...prev, expenseCategoryId: res.data.id }));
            setNewCategoryName('');
            setNewCategoryDesc('');
            showSuccess('Category created');
        } catch (err: any) {
            showError(err?.response?.data?.message || 'Failed to create category');
        } finally {
            setCreatingCategory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!resolvedBranchId) {
            showError('Branch context required');
            return;
        }
        try {
            await api.post('/finance/vouchers', {
                ...formData,
                amount: parseFloat(formData.amount),
                branchId: resolvedBranchId,
            });
            setIsDialogOpen(false);
            fetchData();
            // Reset form
            setFormData({
                amount: '',
                description: '',
                expenseCategoryId: '',
                paidTo: '',
                date: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to create voucher', error);
        }
    };

    const updateStatus = async (id: string, status: string) => {
        try {
            await api.patch(`/finance/vouchers/${id}/status`, { status });
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to update status', error);
        }
    };

    if (loading) return <RequireBranch requireSpecificBranch><div className="p-4"><BranchContextBanner />Loading...</div></RequireBranch>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-center">
                <h1 className="text-[20px] font-bold tracking-tight text-primary">Office Expenses</h1>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Record Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>New Expense Voucher</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Date</label>
                                    <Input
                                        type="date"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Amount</label>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium">Category</label>
                                    <span className="text-[11px] text-muted-foreground">{categories.length} categories</span>
                                </div>
                                <Select
                                    onValueChange={(val) => setFormData({ ...formData, expenseCategoryId: val })}
                                    value={formData.expenseCategoryId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.length === 0 ? (
                                            <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">No categories yet — create one below</div>
                                        ) : (
                                            categories.map((cat: any) => (
                                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                                <div className="p-3 bg-muted/20 border rounded-xl space-y-2">
                                    <p className="text-[12px] font-medium flex items-center gap-1.5"><Tag size={12} /> Add new category</p>
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Category name *"
                                            value={newCategoryName}
                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                            className="h-9 text-[12px]"
                                        />
                                        <Button type="button" size="sm" onClick={handleCreateCategory} disabled={creatingCategory || !newCategoryName.trim()} className="shrink-0">
                                            {creatingCategory ? 'Adding…' : 'Add'}
                                        </Button>
                                    </div>
                                    <Input
                                        placeholder="Description (optional)"
                                        value={newCategoryDesc}
                                        onChange={(e) => setNewCategoryDesc(e.target.value)}
                                        className="h-9 text-[12px]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Paid To</label>
                                <Input
                                    placeholder="Recipient Name"
                                    value={formData.paidTo}
                                    onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Description</label>
                                <Input
                                    placeholder="Expense details..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>

                            <Button type="submit" className="w-full">Create Voucher</Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Expense History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table className={TABLE_ROOT}>
                        <TableHeader>
                            <TableRow className={TABLE_HEADER}>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Ref</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Date</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Category</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Description</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Paid To</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Amount</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Status</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {vouchers.map((voucher) => (
                                <TableRow key={voucher.id} className={TABLE_ROW}>
                                    <TableCell className={`${TABLE_CELL} font-mono`}>{voucher.voucherNumber}</TableCell>
                                    <TableCell className={TABLE_CELL}>{new Date(voucher.date).toLocaleDateString()}</TableCell>
                                    <TableCell className={TABLE_CELL}>{voucher.category?.name}</TableCell>
                                    <TableCell className={TABLE_CELL}>{voucher.description}</TableCell>
                                    <TableCell className={TABLE_CELL}>{voucher.paidTo}</TableCell>
                                    <TableCell className={TABLE_CELL_PRIMARY}>₦{voucher.amount.toLocaleString()}</TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <span className={`px-2 py-1 rounded-full text-[12px] font-medium ${voucher.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                            voucher.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {voucher.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL_ACTIONS}>
                                        {voucher.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => updateStatus(voucher.id, 'APPROVED')}>
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => updateStatus(voucher.id, 'REJECTED')}>
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                            {vouchers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} className={`${TABLE_CELL} text-center py-8 text-foreground/60`}>
                                        No expenses recorded yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}
