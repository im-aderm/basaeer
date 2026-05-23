'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Loader2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { financeService, Voucher } from '@/services/financeService';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

export default function VoucherManagementPage() {
  const { showSuccess, showError } = useNotification();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    expenseCategoryId: '',
    paidTo: '',
    date: new Date().toISOString().split('T')[0],
  });

  const fetchData = async () => {
    try {
      const [vouchersData, categoriesData] = await Promise.all([
        financeService.getVouchers(),
        financeService.getExpenseCategories(),
      ]);
      setVouchers(vouchersData);
      setCategories(categoriesData);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to fetch voucher data', error);
      showError('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await financeService.createVoucher({
        ...formData,
        amount: parseFloat(formData.amount),
        branchId: '',
      });
      setIsDialogOpen(false);
      setFormData({ amount: '', description: '', expenseCategoryId: '', paidTo: '', date: new Date().toISOString().split('T')[0] });
      fetchData();
      showSuccess('Voucher created');
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to create voucher', error);
      showError('Failed to create voucher');
    }
  };

  const updateStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await financeService.updateVoucherStatus(id, status);
      fetchData();
      showSuccess(`Voucher ${status.toLowerCase()}`);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to update status', error);
      showError('Failed to update voucher status');
    }
  };

  if (loading) return <div className="flex h-[60vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-h1 font-bold tracking-tight text-primary">Voucher Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4" /> New Voucher</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Voucher</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date</label>
                  <Input type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount (₦)</label>
                  <Input type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select onValueChange={(val) => setFormData({ ...formData, expenseCategoryId: val })} value={formData.expenseCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Paid To</label>
                <Input placeholder="Recipient name" value={formData.paidTo} onChange={(e) => setFormData({ ...formData, paidTo: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input placeholder="Expense details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
              </div>
              <Button type="submit" className="w-full">Create Voucher</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader><CardTitle>All Vouchers</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Paid To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-mono text-xs">{v.voucherNumber}</TableCell>
                  <TableCell>{new Date(v.date).toLocaleDateString()}</TableCell>
                  <TableCell>{v.category?.name}</TableCell>
                  <TableCell>{v.description}</TableCell>
                  <TableCell>{v.paidTo}</TableCell>
                  <TableCell className="font-bold">₦{Number(v.amount).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={statusVariant[v.status]}>{v.status}</Badge></TableCell>
                  <TableCell>
                    {v.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary" onClick={() => updateStatus(v.id, 'APPROVED')}><Check className="h-4 w-4" /></Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => updateStatus(v.id, 'REJECTED')}><X className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {vouchers.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No vouchers found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
