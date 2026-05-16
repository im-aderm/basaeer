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
import { Package, Plus, Search, Pencil, Trash2, Warehouse, Layers, Ruler } from 'lucide-react';
import { InventoryService, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryProductPage() {
    const { user, resolvedBranchId } = useAuth();
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<InventoryProduct | null>(null);

    const [categories, setCategories] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [units, setUnits] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: '', categoryId: '', storeId: '', unitId: '', code: '', description: '',
        costPrice: 0, sellingPrice: 0
    });

    const fetchProducts = async () => {
        if (!resolvedBranchId) return;
        try {
            const data = await InventoryService.getProducts(resolvedBranchId);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const fetchDependencies = async () => {
        if (!resolvedBranchId) return;
        try {
            const [c, s, u] = await Promise.all([
                InventoryService.getCategories(resolvedBranchId),
                InventoryService.getStores(resolvedBranchId),
                InventoryService.getUnits(resolvedBranchId)
            ]);
            setCategories(c);
            setStores(s);
            setUnits(u);
        } catch (error) {
            toast.error('Failed to load inventory dependencies');
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchDependencies();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createProduct({ ...formData, branchId: resolvedBranchId });
            toast.success('Product added successfully');
            setIsAddDialogOpen(false);
            setFormData({ name: '', categoryId: '', storeId: '', unitId: '', code: '', description: '', costPrice: 0, sellingPrice: 0 });
            fetchProducts();
        } catch (error) { toast.error('Failed to add product'); }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        try {
            await InventoryService.updateProduct(selectedProduct.id, formData);
            toast.success('Product updated successfully');
            setIsEditDialogOpen(false);
            fetchProducts();
        } catch (error) { toast.error('Failed to update product'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await InventoryService.deleteProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (error) { toast.error('Failed to delete product'); }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Product Catalog</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage and organize all inventory items and assets.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                            <Plus className="h-5 w-5" />
                            Add New Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">New Product Registration</DialogTitle>
                            <DialogDescription className="font-bold">Enter the product details to add it to your inventory.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product Name</Label>
                                    <Input required className="h-12 rounded-xl font-bold focus-visible:ring-primary" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product Code</Label>
                                    <Input className="h-12 rounded-xl font-bold" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Cost Price</Label>
                                    <Input type="number" className="h-12 rounded-xl font-bold" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Selling Price</Label>
                                    <Input type="number" className="h-12 rounded-xl font-bold" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Category</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                                        <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {categories.length > 0 ? categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>) : <SelectItem value="__none__" disabled>No categories — add one first</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Location</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, storeId: v })}>
                                        <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {stores.length > 0 ? stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>) : <SelectItem value="__none__" disabled>No stores — add one first</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, unitId: v })}>
                                        <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {units.length > 0 ? units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>) : <SelectItem value="__none__" disabled>No units — add one first</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Description</Label>
                                <Input className="h-12 rounded-xl font-bold" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                            </div>
                            <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider shadow-lg shadow-primary/20">Save Product</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        Master Product List
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter products..."
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
                                <TableHead className="font-semibold px-8 py-6 uppercase tracking-widest text-[10px] text-muted-foreground w-[40%]">Product Info</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Category / Store</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Stock</TableHead>
                                <TableHead className="font-semibold px-8 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.code?.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => (
                                <TableRow key={p.id} className="border-border/50 transition-all hover:bg-muted/30 group">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-lg group-hover:text-primary transition-colors">{p.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50 mt-0.5">ID: {p.code || 'NO-CODE'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="inline-flex items-center gap-1.5 font-semibold text-[10px] uppercase text-primary/70 bg-primary/5 px-2.5 py-1 rounded-lg w-fit">
                                                <Layers className="h-3 w-3" /> {p.category?.name}
                                            </div>
                                            <div className="inline-flex items-center gap-1.5 font-bold text-[10px] uppercase text-muted-foreground px-2.5 py-1 rounded-lg w-fit bg-muted/50">
                                                <Warehouse className="h-3 w-3" /> {p.store?.name || 'No Store'}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className="inline-flex flex-col items-center">
                                            <span className={`text-h3 font-semibold ${p.stock <= 5 ? 'text-destructive' : 'text-primary'}`}>{p.stock}</span>
                                            <span className="text-[10px] font-semibold uppercase opacity-30">{p.unit?.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-10 px-4 rounded-xl font-semibold uppercase text-[10px] gap-2 border border-transparent hover:border-primary/20 transition-all"
                                                onClick={() => {
                                                    setSelectedProduct(p);
                                                    setFormData({
                                                        name: p.name,
                                                        categoryId: p.categoryId,
                                                        storeId: p.storeId || '',
                                                        unitId: p.unitId,
                                                        code: p.code || '',

                                                        description: p.description || '',
                                                        costPrice: p.costPrice || 0,
                                                        sellingPrice: p.sellingPrice || 0
                                                    });
                                                    setIsEditDialogOpen(true);
                                                }}
                                            >
                                                <Pencil className="h-3.5 w-3.5" /> Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-10 px-4 rounded-xl font-semibold uppercase text-[10px] gap-2 bg-destructive/5 text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-all"
                                                onClick={() => handleDelete(p.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" /> Delete
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="rounded-[2.5rem] max-w-2xl border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Edit Product: {selectedProduct?.name}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product Name</Label>
                                <Input required className="h-12 rounded-xl font-bold" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product Code</Label>
                                <Input className="h-12 rounded-xl font-bold" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Cost Price</Label>
                                <Input type="number" className="h-12 rounded-xl font-bold" value={formData.costPrice} onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Selling Price</Label>
                                <Input type="number" className="h-12 rounded-xl font-bold" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Category</Label>
                                <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Location</Label>
                                <Select value={formData.storeId} onValueChange={(v) => setFormData({ ...formData, storeId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{stores.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit</Label>
                                <Select value={formData.unitId} onValueChange={(v) => setFormData({ ...formData, unitId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{units.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Description</Label>
                            <Input className="h-12 rounded-xl font-bold" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                        </div>
                        <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider shadow-lg shadow-primary/20">Update Product</Button></DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
          </RequireBranch>
  );
}
