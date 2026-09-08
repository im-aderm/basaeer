'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Loader2, Tag } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { financeService, Voucher } from '@/services/financeService';
import { useAuth } from '@/context/AuthContext';

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  APPROVED: 'default',
  PENDING: 'secondary',
  REJECTED: 'destructive',
};

export default function VoucherManagementPage() {
  const { showSuccess, showError } = useNotification();
  const { resolvedBranchId } = useAuth();

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
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
      const cat = await financeService.createExpenseCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
        branchId: resolvedBranchId,
      });
      setCategories((prev) => [...prev, cat]);
      setFormData((prev) => ({ ...prev, expenseCategoryId: (cat as any).id }));
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
      await financeService.createVoucher({
        ...formData,
        amount: parseFloat(formData.amount),
        branchId: resolvedBranchId,
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Category</label>
                  <span className="text-[11px] text-muted-foreground">{categories.length} categories</span>
                </div>
                <Select onValueChange={(val) => setFormData({ ...formData, expenseCategoryId: val })} value={formData.expenseCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="px-3 py-6 text-center text-[12px] text-muted-foreground">No categories yet — create one below</div>
                    ) : (
                      categories.map((cat) => (<SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>))
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
