"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Plus, Search, CreditCard, ArrowLeft, TrendingUp } from 'lucide-react';
import { InventoryService, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventorySalesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [sales, setSales] = useState<any[]>([]);
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaleDialogOpen, setIsSaleDialogOpen] = useState(false);

    const [saleForm, setSaleForm] = useState({
        productId: '', quantity: 0, unitPrice: 0, customerName: '', invoiceNo: ''
    });

    const fetchData = async () => {
        try {
            const [s, p] = await Promise.all([
                InventoryService.getSales(resolvedBranchId),
                InventoryService.getProducts(resolvedBranchId)
            ]);
            setSales(s);
            setProducts(p);
        } catch (error) {
            toast.error('Failed to load sales data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resolvedBranchId]);

    const handleCreateSale = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createSale({
                ...saleForm,
                branchId: resolvedBranchId,
                quantity: Number(saleForm.quantity),
                unitPrice: Number(saleForm.unitPrice)
            });
            toast.success('Sale recorded');
            setIsSaleDialogOpen(false);
            setSaleForm({ productId: '', quantity: 0, unitPrice: 0, customerName: '', invoiceNo: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to record sale');
        }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <Link href="/dashboard/inventory" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </Link>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Sales & Revenue</h1>
                    <p className="text-muted-foreground font-medium mt-1">Record and track inventory-related sales transactions.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isSaleDialogOpen} onOpenChange={setIsSaleDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Record Sale
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold">Record New Sale</DialogTitle>
                                <DialogDescription className="font-bold">Enter sale details and update product stock.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateSale} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product</Label>
                                    <Select onValueChange={(v) => {
                                        const p = products.find(prod => prod.id === v);
                                        setSaleForm({ ...saleForm, productId: v, unitPrice: p?.id ? 0 : 0 }); // Optionally pre-fill price
                                    }}>
                                        <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select Product" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Stock: {p.stock} {p.unit?.name})</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Quantity</Label>
                                        <Input type="number" required className="h-12 rounded-xl font-bold" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: Number(e.target.value) })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit Price</Label>
                                        <Input type="number" required className="h-12 rounded-xl font-bold" value={saleForm.unitPrice} onChange={(e) => setSaleForm({ ...saleForm, unitPrice: Number(e.target.value) })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Customer Name (Optional)</Label>
                                    <Input className="h-12 rounded-xl font-bold" value={saleForm.customerName} onChange={(e) => setSaleForm({ ...saleForm, customerName: e.target.value })} />
                                </div>
                                <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Record Sale</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <ShoppingBag className="h-8 w-8 text-primary" />
                        Sales History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Invoice / Date</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Qty</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Unit Price</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Total Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sales.map((s) => (
                                <TableRow key={s.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-semibold leading-tight">
                                        <div className="flex flex-col">
                                            <span>{s.invoiceNo || 'SALE-' + s.id.slice(0, 5).toUpperCase()}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-semibold uppercase text-xs">
                                        {s.product?.name}
                                    </TableCell>
                                    <TableCell className="px-8 font-bold">
                                        {s.quantity}
                                    </TableCell>
                                    <TableCell className="px-8 font-bold">
                                        ${Number(s.unitPrice).toFixed(2)}
                                    </TableCell>
                                    <TableCell className="text-right px-8 font-semibold text-primary">
                                        ${Number(s.totalPrice).toFixed(2)}
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
