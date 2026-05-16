'use client';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Search, Truck, Calendar, Receipt, Package } from 'lucide-react';
import { InventoryService, InventoryPurchase, InventoryProduct, InventorySupplier } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryPurchasePage() {
    const { user, resolvedBranchId } = useAuth();
    const [purchases, setPurchases] = useState<InventoryPurchase[]>([]);
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        productId: '', supplierId: '', quantity: 0, unitPrice: 0, voucherNo: '', date: new Date().toISOString().split('T')[0]
    });

    const fetchData = async () => {
        if (!resolvedBranchId) return;
        try {
            const [pur, prod, sup] = await Promise.all([
                InventoryService.getPurchases(resolvedBranchId),
                InventoryService.getProducts(resolvedBranchId),
                InventoryService.getSuppliers(resolvedBranchId)
            ]);
            setPurchases(pur);
            setProducts(prod);
            setSuppliers(sup);
        } catch (error) {
            toast.error('Failed to load purchase data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createPurchase({
                ...formData,
                branchId: resolvedBranchId,
                quantity: Number(formData.quantity),
                unitPrice: Number(formData.unitPrice)
            });
            toast.success('Purchase recorded and stock updated');
            setIsAddDialogOpen(false);
            setFormData({ productId: '', supplierId: '', quantity: 0, unitPrice: 0, voucherNo: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) { toast.error('Failed to record purchase'); }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Purchase Records</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track procurement history and manage incoming stock shipments.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">
                            <Plus className="h-5 w-5" />
                            Record New Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">New Stock Purchase</DialogTitle>
                            <DialogDescription className="font-bold">Enter details of the procurement to update inventory levels.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product to Buy</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select Product" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Supplier / Vendor</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, supplierId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Quantity</Label>
                                    <Input type="number" required className="h-12 rounded-xl font-bold" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit Price ($)</Label>
                                    <Input type="number" required className="h-12 rounded-xl font-bold" value={formData.unitPrice} onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Voucher / Bill No.</Label>
                                    <Input className="h-12 rounded-xl font-bold" value={formData.voucherNo} onChange={(e) => setFormData({ ...formData, voucherNo: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Date</Label>
                                    <Input type="date" className="h-12 rounded-xl font-bold" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-700">Confirm Purchase</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3 text-emerald-600">
                        <Receipt className="h-8 w-8" />
                        Procurement History
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by voucher or product..."
                            className="pl-11 h-12 rounded-2xl font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 py-6 uppercase tracking-widest text-[10px] text-muted-foreground">Voucher / Date</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product Details</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Supplier</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {purchases.filter(p => p.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) || p.product?.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                <TableRow key={p.id} className="border-border/50 transition-all hover:bg-muted/30 group">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-lg group-hover:text-emerald-600 transition-colors">{p.voucherNo || 'V-AUTO-' + p.id.slice(0, 4).toUpperCase()}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50 flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {new Date(p.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-xs">{p.product?.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50">QTY: {p.quantity} {p.product?.unit?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="inline-flex items-center gap-1.5 font-semibold text-[10px] uppercase text-emerald-600 bg-emerald-500/5 px-2.5 py-1 rounded-lg w-fit">
                                            <Truck className="h-3 w-3" /> {p.supplier?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-h3 font-semibold text-emerald-600">${(Number(p.quantity) * Number(p.unitPrice)).toFixed(2)}</span>
                                            <span className="text-[10px] font-semibold uppercase opacity-30">${Number(p.unitPrice)}/unit</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
          </RequireBranch>
  );
}
