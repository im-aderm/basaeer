'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Store, Plus, Search, MapPin, MoreHorizontal } from 'lucide-react';
import { InventoryService, InventoryStore } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryStorePage() {
    const { user } = useAuth();
    const [stores, setStores] = useState<InventoryStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<InventoryStore | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [editData, setEditData] = useState({ name: '', code: '' });

    const fetchStores = async () => {
        if (!user?.branchId) return;
        try {
            const data = await InventoryService.getStores(user.branchId);
            setStores(data);
        } catch (error) {
            toast.error('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createStore({ ...formData, branchId: user?.branchId });
            toast.success('Store location added');
            setIsAddDialogOpen(false);
            setFormData({ name: '', code: '' });
            fetchStores();
        } catch (error) {
            toast.error('Failed to add store');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStore) return;
        try {
            await InventoryService.updateStore(selectedStore.id, editData);
            toast.success('Store location updated');
            setIsEditDialogOpen(false);
            fetchStores();
        } catch (error) {
            toast.error('Failed to update store');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this store?')) return;
        try {
            await InventoryService.deleteStore(id);
            toast.success('Store location deleted');
            fetchStores();
        } catch (error) {
            toast.error('Failed to delete store');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Store Locations</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage physical warehouses and storage rooms.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Store
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">New Store</DialogTitle>
                                <DialogDescription className="font-bold">Define a new physical storage area.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="Main Warehouse, Science Lab Store..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store Code</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="WH-01"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Add Store</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <Store className="h-8 w-8 text-primary" />
                        Active Warehouses
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Store Location</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Code</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stores.map((s) => (
                                <TableRow key={s.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary/50" />
                                            {s.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-xs opacity-50">
                                        {s.code || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedStore(s); setEditData({ name: s.name, code: s.code || '' }); setIsEditDialogOpen(true); }}
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
                <DialogContent className="rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Edit Store</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Store Code</Label>
                            <Input
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.code}
                                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Update Store</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
