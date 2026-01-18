'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Package, Plus, Search, ShoppingBag, ArrowUpRight, ArrowDownRight, Warehouse, Users, TrendingUp, AlertTriangle, Pencil, Trash2, History, CreditCard } from 'lucide-react';
import { InventoryService, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventoryDashboardPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [isProductEditDialogOpen, setIsProductEditDialogOpen] = useState(false);
    const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = useState(false);
    const [isIssueDialogOpen, setIsIssueDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    const [productForm, setProductForm] = useState({
        name: '', categoryId: '', storeId: '', unitId: '', code: '', description: ''
    });

    const [purchaseForm, setPurchaseForm] = useState({
        supplierId: '', quantity: 0, unitPrice: 0, voucherNo: ''
    });

    const [issueForm, setIssueForm] = useState({
        issuedTo: '', quantity: 0, studentId: '', staffId: '', note: ''
    });

    const fetchProducts = async () => {
        if (!user?.branchId) return;
        try {
            const data = await InventoryService.getProducts(user.branchId);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load inventory');
        } finally {
            setLoading(false);
        }
    };

    const fetchDependencies = async () => {
        if (!user?.branchId) return;
        try {
            const [c, s, sup, u] = await Promise.all([
                InventoryService.getCategories(user.branchId),
                InventoryService.getStores(user.branchId),
                InventoryService.getSuppliers(user.branchId),
                InventoryService.getUnits(user.branchId)
            ]);
            setCategories(c);
            setStores(s);
            setSuppliers(sup);
            setUnits(u);
        } catch (error) { }
    };

    useEffect(() => {
        fetchProducts();
        fetchDependencies();
    }, [user?.branchId]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createProduct({ ...productForm, branchId: user?.branchId });
            toast.success('Product added');
            setIsProductDialogOpen(false);
            setProductForm({ name: '', categoryId: '', storeId: '', unitId: '', code: '', description: '' });
            fetchProducts();
        } catch (error) { toast.error('Failed to add product'); }
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        try {
            await InventoryService.updateProduct(selectedProduct.id, productForm);
            toast.success('Product updated');
            setIsProductEditDialogOpen(false);
            fetchProducts();
        } catch (error) { toast.error('Failed to update product'); }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await InventoryService.deleteProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) { toast.error('Failed to delete product'); }
    };

    const handlePurchase = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        try {
            await InventoryService.createPurchase({
                ...purchaseForm,
                productId: selectedProduct.id,
                branchId: user?.branchId,
                quantity: Number(purchaseForm.quantity),
                unitPrice: Number(purchaseForm.unitPrice)
            });
            toast.success('Purchase recorded');
            setIsPurchaseDialogOpen(false);
            fetchProducts();
        } catch (error) { toast.error('Failed to record purchase'); }
    };

    const handleIssue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        try {
            await InventoryService.issueItem({
                ...issueForm,
                productId: selectedProduct.id,
                branchId: user?.branchId,
                quantity: Number(issueForm.quantity)
            });
            toast.success('Items issued');
            setIsIssueDialogOpen(false);
            fetchProducts();
        } catch (error) { toast.error('Failed to issue item'); }
    };

    const lowStock = products.filter(p => p.stock <= 5);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Inventory & Stock</h1>
                    <p className="text-muted-foreground font-medium mt-1">Real-time tracking of school assets and consumables.</p>
                </div>
                <div className="flex gap-4">
                    <Link href="/dashboard/inventory/sales">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl font-black gap-2 border-primary/20 hover:bg-primary/5">
                            <CreditCard className="h-5 w-5" />
                            Record Sale
                        </Button>
                    </Link>
                    <Link href="/dashboard/inventory/history">
                        <Button variant="outline" className="h-12 px-6 rounded-2xl font-black gap-2 border-primary/20 hover:bg-primary/5">
                            <History className="h-5 w-5" />
                            Stock History
                        </Button>
                    </Link>
                    <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Product
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">New Product</DialogTitle>
                                <DialogDescription className="font-bold">Register a new item in the inventory system.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreateProduct} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Product Name</Label>
                                        <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Product Code</Label>
                                        <Input className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Category</Label>
                                        <Select onValueChange={(v) => setProductForm({ ...productForm, categoryId: v })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store</Label>
                                        <Select onValueChange={(v) => setProductForm({ ...productForm, storeId: v })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent className="rounded-xl">{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Unit</Label>
                                        <Select onValueChange={(v) => setProductForm({ ...productForm, unitId: v })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                            <SelectContent className="rounded-xl">{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Save Product</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Total Items</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{products.length}</span>
                        <Package className="h-8 w-8 text-primary/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-destructive/5 border-l-4 border-l-destructive">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Low Stock Alert</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{lowStock.length}</span>
                        <AlertTriangle className="h-8 w-8 text-destructive/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Suppliers</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{suppliers.length}</span>
                        <Users className="h-8 w-8 text-emerald-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-blue-500/5 border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Total Stores</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{stores.length}</span>
                        <Warehouse className="h-8 w-8 text-blue-500/40" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <TrendingUp className="h-8 w-8 text-primary" />
                        Live Stock Status
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by product or code..."
                            className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product Details</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Category</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Store Location</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Available Stock</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Quick Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                <TableRow key={p.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        <div className="flex flex-col">
                                            <span>{p.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50">CODE: {p.code || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-[10px] uppercase text-primary/70">
                                        {p.category?.name}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="inline-flex items-center gap-1.5 font-bold text-xs">
                                            <Warehouse className="h-3 w-3 text-muted-foreground" />
                                            {p.store?.name || 'Unassigned'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-2xl font-black italic ${p.stock <= 5 ? 'text-destructive' : 'text-primary'}`}>{p.stock}</span>
                                            <span className="text-[10px] font-bold uppercase opacity-30">{p.unit?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedProduct(p); setIsPurchaseDialogOpen(true); }}
                                            >
                                                <ArrowUpRight className="h-3 w-3" /> Purchase
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                                onClick={() => { setSelectedProduct(p); setIsIssueDialogOpen(true); }}
                                            >
                                                <ArrowDownRight className="h-3 w-3" /> Issue
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedProduct(p); setProductForm({ name: p.name, categoryId: p.categoryId, storeId: p.storeId || '', unitId: p.unitId, code: p.code || '', description: p.description || '' }); setIsProductEditDialogOpen(true); }}
                                            >
                                                <Pencil className="h-3 w-3" /> Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                onClick={() => handleDeleteProduct(p.id)}
                                            >
                                                <Trash2 className="h-3 w-3" /> Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Product Edit Dialog */}
            <Dialog open={isProductEditDialogOpen} onOpenChange={setIsProductEditDialogOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Edit Product: {selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateProduct} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Product Name</Label>
                                <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Product Code</Label>
                                <Input className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={productForm.code} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Category</Label>
                                <Select value={productForm.categoryId} onValueChange={(v) => setProductForm({ ...productForm, categoryId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store</Label>
                                <Select value={productForm.storeId} onValueChange={(v) => setProductForm({ ...productForm, storeId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Unit</Label>
                                <Select value={productForm.unitId} onValueChange={(v) => setProductForm({ ...productForm, unitId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Update Product</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                <DialogContent className="rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Purchase Stock: {selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePurchase} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Supplier</Label>
                            <Select onValueChange={(v) => setPurchaseForm({ ...purchaseForm, supplierId: v })}>
                                <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                                <SelectContent className="rounded-xl">{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Quantity</Label>
                                <Input type="number" required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Unit Price</Label>
                                <Input type="number" required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={purchaseForm.unitPrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, unitPrice: Number(e.target.value) })} />
                            </div>
                        </div>
                        <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Confirm Purchase</Button>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isIssueDialogOpen} onOpenChange={setIsIssueDialogOpen}>
                <DialogContent className="rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Issue Item: {selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleIssue} className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Issue To (Person's Name)</Label>
                            <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={issueForm.issuedTo} onChange={(e) => setIssueForm({ ...issueForm, issuedTo: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Quantity</Label>
                            <Input type="number" required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: Number(e.target.value) })} />
                        </div>
                        <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Issue Items</Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
