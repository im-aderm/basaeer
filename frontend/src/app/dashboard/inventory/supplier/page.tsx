'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Truck, Plus, Search, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { InventoryService, InventorySupplier } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventorySupplierPage() {
    const { user } = useAuth();
    const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<InventorySupplier | null>(null);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    const [editData, setEditData] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });

    const fetchSuppliers = async () => {
        if (!user?.branchId) return;
        try {
            const data = await InventoryService.getSuppliers(user.branchId);
            setSuppliers(data);
        } catch (error) {
            toast.error('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createSupplier({ ...formData, branchId: user?.branchId });
            toast.success('Supplier profile created');
            setIsAddDialogOpen(false);
            setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to add supplier');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        try {
            await InventoryService.updateSupplier(selectedSupplier.id, editData);
            toast.success('Supplier profile updated');
            setIsEditDialogOpen(false);
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to update supplier');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this supplier?')) return;
        try {
            await InventoryService.deleteSupplier(id);
            toast.success('Supplier profile deleted');
            fetchSuppliers();
        } catch (error) {
            toast.error('Failed to delete supplier');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Suppliers & Vendors</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage your supply chain contacts and partners.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">New Supplier</DialogTitle>
                                <DialogDescription className="font-bold">Enter vendor information for procurement tracking.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Supplier/Company Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Contact Person</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Email Address</Label>
                                    <Input
                                        type="email"
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Onboard Supplier</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <Truck className="h-8 w-8 text-primary" />
                        Procurement Partners
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Supplier Name</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Contact Person</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Communication</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {suppliers.map((s) => (
                                <TableRow key={s.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        {s.name}
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs text-muted-foreground uppercase italic">
                                        {s.contactPerson || 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold flex items-center gap-1.5 text-[10px]"><Phone className="h-3 w-3 text-primary" /> {s.phone || 'N/A'}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground">{s.email || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedSupplier(s); setEditData({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '' }); setIsEditDialogOpen(true); }}
                                            >
                                                Pencil Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                onClick={() => handleDelete(s.id)}
                                            >
                                                Trash2 Delete
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
                <DialogContent className="rounded-[2.5rem] max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Edit Supplier</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Supplier/Company Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Contact Person</Label>
                                <Input
                                    className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                    value={editData.contactPerson}
                                    onChange={(e) => setEditData({ ...editData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                <Input
                                    className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Email Address</Label>
                            <Input
                                type="email"
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.email}
                                onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Update Supplier</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
