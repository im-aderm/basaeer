
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
import { Plus, Search, FileText, Percent } from 'lucide-react';
import { toast } from 'sonner';
import { financeService } from '@/services/financeService';
import api from '@/lib/api';

export default function InvoicesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState('');

    // For applying a discount
    const [discountInvoice, setDiscountInvoice] = useState<any | null>(null);
    const [discountForm, setDiscountForm] = useState<{ discountType: 'PERCENTAGE' | 'FIXED'; discountValue: string; discountReason: string }>({
        discountType: 'PERCENTAGE',
        discountValue: '',
        discountReason: '',
    });
    const [discountSubmitting, setDiscountSubmitting] = useState(false);

    const openDiscount = (inv: any) => {
        setDiscountForm({ discountType: 'PERCENTAGE', discountValue: '', discountReason: '' });
        setDiscountInvoice(inv);
    };

    const submitDiscount = async () => {
        if (!discountInvoice) return;
        const value = parseFloat(discountForm.discountValue);
        if (!value || value <= 0) { toast.error('Enter a discount value greater than zero.'); return; }
        if (!discountForm.discountReason.trim()) { toast.error('A reason is required.'); return; }
        setDiscountSubmitting(true);
        try {
            await financeService.applyInvoiceDiscount(discountInvoice.id, {
                discountType: discountForm.discountType,
                discountValue: value,
                discountReason: discountForm.discountReason.trim(),
            });
            toast.success('Discount applied.');
            setDiscountInvoice(null);
            fetchInvoices();
        } catch (e: any) {
            toast.error(e?.response?.data?.message || 'Could not apply the discount.');
        } finally {
            setDiscountSubmitting(false);
        }
    };

    // For creating invoice
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [feeCategories, setFeeCategories] = useState<any[]>([]);
    const [createData, setCreateData] = useState({
        studentId: '',
        dueDate: '',
        items: [{ categoryId: '', amount: 0 }]
    });

    const fetchInvoices = async () => {
        try {
            // Note: In a real app, we'd have pagination and filtering
            // For now, if studentId is provided, we search, else maybe show recent
            if (studentId) {
                const res = await api.get(`/finance/invoices/student/${studentId}`);
                setInvoices(res.data);
            } else {
                // If endpoint exists for all invoices, use it. Otherwise, empty state.
                // Assuming we might need a general endpoint or just show empty
                setInvoices([]);
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch invoices', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/finance/fee-categories');
                setFeeCategories(res.data);
            } catch (e) {
                if (process.env.NODE_ENV === 'development') console.error('Failed to fetch fee categories', e);
            }
        };
        fetchCategories();
    }, []);

    const handleCreate = async () => {
        try {
            await api.post('/finance/invoices', {
                ...createData,
                branchId: resolvedBranchId
            });
            setIsCreateOpen(false);
            if (createData.studentId === studentId) fetchInvoices();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to create invoice', error);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-center">
                <h1 className="text-[20px] font-bold tracking-tight text-primary">Student Invoices</h1>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Generate Invoice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Generate New Invoice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Student ID/Admission No</label>
                                    <Input
                                        value={createData.studentId}
                                        onChange={(e) => setCreateData({ ...createData, studentId: e.target.value })}
                                        placeholder="Enter Student ID"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Due Date</label>
                                    <Input
                                        type="date"
                                        value={createData.dueDate}
                                        onChange={(e) => setCreateData({ ...createData, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="border rounded-md p-4 bg-muted/20">
                                <h4 className="font-medium mb-2">Invoice Items</h4>
                                {createData.items.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 mb-2">
                                        <Input
                                            placeholder="Amount"
                                            type="number"
                                            value={item.amount}
                                            onChange={(e) => {
                                                const newItems = [...createData.items];
                                                newItems[idx].amount = parseFloat(e.target.value);
                                                setCreateData({ ...createData, items: newItems });
                                            }}
                                        />
                                        <Select
                                            value={item.categoryId}
                                            onValueChange={(val) => {
                                                const newItems = [...createData.items];
                                                newItems[idx].categoryId = val;
                                                setCreateData({ ...createData, items: newItems });
                                            }}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder="Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {feeCategories.map((cat) => (
                                                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                                <Button variant="outline" size="sm" onClick={() => setCreateData({
                                    ...createData,
                                    items: [...createData.items, { categoryId: '', amount: 0 }]
                                })}>
                                    Add Item
                                </Button>
                            </div>

                            <Button onClick={handleCreate} className="w-full">Generate Invoice</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground/60" />
                            <Input
                                placeholder="Search by Student ID..."
                                className="pl-8"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" onClick={fetchInvoices}>Search</Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table className={TABLE_ROOT}>
                        <TableHeader>
                            <TableRow className={TABLE_HEADER}>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Invoice #</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Due Date</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Total</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Balance</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Status</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {invoices.map((inv) => (
                                <TableRow key={inv.id} className={TABLE_ROW}>
                                    <TableCell className={`${TABLE_CELL_PRIMARY} font-mono`}>{inv.invoiceNumber}</TableCell>
                                    <TableCell className={TABLE_CELL}>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell className={TABLE_CELL}>₦{inv.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell className={`${TABLE_CELL} text-red-600`}>₦{inv.balance.toLocaleString()}</TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <span className={`px-2 py-1 rounded-full text-[12px] font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            inv.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL_ACTIONS}>
                                        <div className="flex items-center justify-end gap-1.5">
                                            {inv.discountAmount == null && inv.status !== 'PAID' && inv.status !== 'VOIDED' && Number(inv.balance) > 0 && (
                                                <Button size="sm" variant="outline" onClick={() => openDiscount(inv)} title="Apply discount">
                                                    <Percent className="h-3.5 w-3.5 mr-1" /> Discount
                                                </Button>
                                            )}
                                            {inv.discountAmount != null && (
                                                <span className="text-[11px] text-green-700 font-medium">−₦{Number(inv.discountAmount).toLocaleString()}</span>
                                            )}
                                            <Button size="sm" variant="outline">View</Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className={`${TABLE_CELL} text-center py-8 text-foreground/60`}>
                                        Enter a student ID to view invoices.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!discountInvoice} onOpenChange={(o) => !o && setDiscountInvoice(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Apply Discount</DialogTitle>
                    </DialogHeader>
                    {discountInvoice && (
                        <div className="space-y-4">
                            <div className="text-[13px] text-foreground/70">
                                Invoice <span className="font-mono">{discountInvoice.invoiceNumber}</span> · Outstanding{' '}
                                <span className="font-semibold text-red-600">₦{Number(discountInvoice.balance).toLocaleString()}</span>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium">Discount type</label>
                                <Select value={discountForm.discountType} onValueChange={(v) => setDiscountForm((f) => ({ ...f, discountType: v as 'PERCENTAGE' | 'FIXED' }))}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                        <SelectItem value="FIXED">Fixed amount (₦)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium">{discountForm.discountType === 'PERCENTAGE' ? 'Percentage' : 'Amount'}</label>
                                <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discountForm.discountValue}
                                    onChange={(e) => setDiscountForm((f) => ({ ...f, discountValue: e.target.value }))}
                                    placeholder={discountForm.discountType === 'PERCENTAGE' ? 'e.g. 10' : 'e.g. 5000'}
                                />
                                {discountForm.discountValue && Number(discountForm.discountValue) > 0 && (
                                    <p className="text-[11px] text-foreground/60">
                                        Net after discount: ₦{Math.max(
                                            0,
                                            Number(discountInvoice.balance) - (discountForm.discountType === 'PERCENTAGE'
                                                ? (Number(discountInvoice.balance) * Number(discountForm.discountValue)) / 100
                                                : Number(discountForm.discountValue)),
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[12px] font-medium">Reason</label>
                                <Input
                                    value={discountForm.discountReason}
                                    onChange={(e) => setDiscountForm((f) => ({ ...f, discountReason: e.target.value }))}
                                    placeholder="e.g. Sibling discount"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <Button variant="outline" onClick={() => setDiscountInvoice(null)}>Cancel</Button>
                                <Button onClick={submitDiscount} disabled={discountSubmitting}>
                                    {discountSubmitting ? 'Applying…' : 'Apply Discount'}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
        </RequireBranch>
    );
}
