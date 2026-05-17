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
import { ArrowDownRight, Plus, Search, User, RotateCcw, Calendar, Package, ArrowUpRight } from 'lucide-react';
import { InventoryService, InventoryIssue, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryIssuePage() {
    const { user, resolvedBranchId } = useAuth();
    const [issues, setIssues] = useState<InventoryIssue[]>([]);
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        productId: '', issuedTo: '', quantity: 0, studentId: '', staffId: '', note: ''
    });

    const fetchData = async () => {
        try {
            const [iss, prod] = await Promise.all([
                InventoryService.getIssues(resolvedBranchId),
                InventoryService.getProducts(resolvedBranchId)
            ]);
            setIssues(iss);
            setProducts(prod);
        } catch (error) {
            toast.error('Failed to load issuance data');
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
            await InventoryService.issueItem({
                productId: formData.productId,
                issuedTo: formData.issuedTo,
                quantity: Number(formData.quantity),
                studentId: formData.studentId || undefined,
                staffId: formData.staffId || undefined,
                branchId: resolvedBranchId,
            });
            toast.success('Items issued and stock updated');
            setIsAddDialogOpen(false);
            setFormData({ productId: '', issuedTo: '', quantity: 0, studentId: '', staffId: '', note: '' });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to issue items');
        }
    };

    const handleReturn = async (id: string) => {
        if (!confirm('Mark these items as returned to stock?')) return;
        try {
            await InventoryService.returnItem(id);
            toast.success('Items returned to stock');
            fetchData();
        } catch (error) { toast.error('Failed to process return'); }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Item Issuance</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage items issued to staff and students. Tracking returns and assignments.</p>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-700">
                            <Plus className="h-5 w-5" />
                            Issue New Items
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[2.5rem] max-w-xl border-none shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold uppercase text-amber-600">New Item Issuance</DialogTitle>
                            <DialogDescription className="font-bold">Record items being handed out to personnel or students.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Product to Issue</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, productId: v })}>
                                    <SelectTrigger className="h-12 rounded-xl font-bold"><SelectValue placeholder="Select Product" /></SelectTrigger>
                                    <SelectContent className="rounded-xl">{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} (Available: {p.stock})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Issued To (Person Name)</Label>
                                <Input required className="h-12 rounded-xl font-bold" value={formData.issuedTo} onChange={(e) => setFormData({ ...formData, issuedTo: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Quantity</Label>
                                    <Input type="number" required className="h-12 rounded-xl font-bold" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Note (Optional)</Label>
                                    <Input className="h-12 rounded-xl font-bold" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
                                </div>
                            </div>
                            <DialogFooter><Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider shadow-lg shadow-amber-500/20 bg-amber-600 hover:bg-amber-700">Confirm Issuance</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background/50 backdrop-blur-xl">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between bg-muted/10">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3 text-amber-600">
                        <ArrowDownRight className="h-8 w-8" />
                        Active & Past Issuances
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Filter by person or product..."
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
                                <TableHead className="font-semibold px-8 py-6 uppercase tracking-widest text-[10px] text-muted-foreground">Issuance Info</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Issued To</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="font-semibold px-8 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {issues.filter(i => i.issuedTo.toLowerCase().includes(searchTerm.toLowerCase()) || i.product?.name.toLowerCase().includes(searchTerm.toLowerCase())).map((i) => (
                                <TableRow key={i.id} className="border-border/50 transition-all hover:bg-muted/30 group">
                                    <TableCell className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-semibold text-muted-foreground opacity-50 flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(i.createdAt).toLocaleDateString()}</span>
                                            <span className="font-semibold uppercase text-xs text-muted-foreground group-hover:text-amber-600 transition-colors">ID: {i.id.slice(0, 8).toUpperCase()}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col">
                                            <span className="font-semibold uppercase text-xs flex items-center gap-1.5"><Package className="h-3 w-3 text-amber-500" /> {i.product?.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50 ml-4.5">QTY: {i.quantity}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="inline-flex items-center gap-1.5 font-semibold text-[10px] uppercase text-amber-600 bg-amber-500/5 px-2.5 py-1 rounded-lg w-fit">
                                            <User className="h-3 w-3" /> {i.issuedTo}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase ${i.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600 shadow-sm shadow-amber-500/10'}`}>
                                            {i.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        {i.status === 'ISSUED' && (
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5 hover:bg-emerald-500/10 hover:text-emerald-600 transition-all"
                                                onClick={() => handleReturn(i.id)}
                                            >
                                                <RotateCcw className="h-3.5 w-3.5" /> Return Stock
                                            </Button>
                                        )}
                                        {i.status === 'RETURNED' && (
                                            <span className="text-[10px] font-semibold uppercase text-emerald-600/50 flex items-center justify-end gap-1">
                                                <ArrowUpRight className="h-3 w-3" /> Returned on {new Date(i.returnDate!).toLocaleDateString()}
                                            </span>
                                        )}
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
