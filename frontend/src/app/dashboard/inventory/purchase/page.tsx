'use client';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS } from '@/lib/table-styles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Search, Truck, Calendar, Receipt, Package } from 'lucide-react';
import { InventoryService, InventoryPurchase, InventoryProduct, InventorySupplier } from '@/services/inventoryService';
import { useNotification } from '@/context/NotificationContext';

export default function InventoryPurchasePage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
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
        try {
            const [pur, prod, sup] = await Promise.all([
                InventoryService.getPurchases(),
                InventoryService.getProducts(),
                InventoryService.getSuppliers()
            ]);
            setPurchases(pur);
            setProducts(prod);
            setSuppliers(sup);
        } catch (error) {
            showError('Failed to load purchase data');
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
                quantity: Number(formData.quantity),
                unitPrice: Number(formData.unitPrice)
            });
            showSuccess('Purchase recorded and stock updated');
            setIsAddDialogOpen(false);
            setFormData({ productId: '', supplierId: '', quantity: 0, unitPrice: 0, voucherNo: '', date: new Date().toISOString().split('T')[0] });
            fetchData();
        } catch (error) { showError('Failed to record purchase'); }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Purchase Records</h1>
                    <p className="text-foreground/60 font-medium mt-1">Track procurement history and manage incoming stock shipments.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">
                            <Plus className="h-5 w-5" />
                            Record New Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl max-w-xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-[14px] font-semibold">New Stock Purchase</DialogTitle>
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
                            <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90">Confirm Purchase</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <CardHeader className="px-4 py-3 border-b border-primary/20 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-[14px] font-semibold flex items-center gap-3 text-primary">
                        <Receipt className="h-5 w-5" />
                        Procurement History
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
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
                        <TableHeader className={TABLE_HEADER}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Voucher / Date</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Product Details</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Supplier</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {purchases.filter(p => p.voucherNo?.toLowerCase().includes(searchTerm.toLowerCase()) || p.product?.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                <TableRow key={p.id} className={TABLE_ROW + " group"}>
                                    <TableCell className={TABLE_CELL_PRIMARY}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-[12px] group-hover:text-primary transition-colors">{p.voucherNo || 'V-AUTO-' + p.id.slice(0, 4).toUpperCase()}</span>
                                            <span className="text-[10px] font-bold text-foreground/60 opacity-50 flex items-center gap-1 mt-0.5"><Calendar className="h-3 w-3" /> {new Date(p.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-[12px]">{p.product?.name}</span>
                                            <span className="text-[10px] font-bold text-foreground/60 opacity-50">QTY: {p.quantity} {p.product?.unit?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <div className="inline-flex items-center gap-1.5 font-semibold text-[10px] uppercase text-primary bg-primary/5 px-2.5 py-1 rounded-lg w-fit">
                                            <Truck className="h-3 w-3" /> {p.supplier?.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL + " text-center"}>
                                        <div className="flex flex-col items-center">
                                            <span className="text-[14px] font-semibold text-primary">₦{(Number(p.quantity) * Number(p.unitPrice)).toFixed(2)}</span>
                                            <span className="text-[10px] font-semibold uppercase opacity-30">₦{Number(p.unitPrice)}/unit</span>
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
