
'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, FileText } from 'lucide-react';
import api from '@/lib/api';

export default function InvoicesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [studentId, setStudentId] = useState('');

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
                <h1 className="text-h1 font-bold tracking-tight text-primary">Student Invoices</h1>
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
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Invoice #</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Balance</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((inv) => (
                                <TableRow key={inv.id}>
                                    <TableCell className="font-mono">{inv.invoiceNumber}</TableCell>
                                    <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                                    <TableCell>₦{inv.totalAmount.toLocaleString()}</TableCell>
                                    <TableCell className="text-red-600">₦{inv.balance.toLocaleString()}</TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                            inv.status === 'PARTIALLY_PAID' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {inv.status}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Button size="sm" variant="outline">View</Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {invoices.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Enter a student ID to view invoices.
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
