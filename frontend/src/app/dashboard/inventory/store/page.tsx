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
import { Store, Plus, Search, MapPin, MoreHorizontal } from 'lucide-react';
import { InventoryService, InventoryStore } from '@/services/inventoryService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function InventoryStorePage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [stores, setStores] = useState<InventoryStore[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedStore, setSelectedStore] = useState<InventoryStore | null>(null);
    const [formData, setFormData] = useState({ name: '', code: '' });
    const [editData, setEditData] = useState({ name: '', code: '' });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchStores = async () => {
        try {
            const data = await InventoryService.getStores();
            setStores(data);
        } catch (error) {
            showError('Failed to load stores');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStores();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createStore({ ...formData });
            showSuccess('Store location added');
            setIsAddDialogOpen(false);
            setFormData({ name: '', code: '' });
            fetchStores();
        } catch (error) {
            showError('Failed to add store');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStore) return;
        try {
            await InventoryService.updateStore(selectedStore.id, editData);
            showSuccess('Store location updated');
            setIsEditDialogOpen(false);
            fetchStores();
        } catch (error) {
            showError('Failed to update store');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await InventoryService.deleteStore(confirmDelete);
            showSuccess('Store location deleted');
            fetchStores();
        } catch (error) {
            showError('Failed to delete store');
        }
        setConfirmDelete(null);
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Store Locations</h1>
                    <p className="text-foreground/60 font-medium mt-1">Manage physical warehouses and storage rooms.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Store
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-[14px] font-semibold">New Store</DialogTitle>
                                <DialogDescription className="font-bold">Define a new physical storage area.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="Main Warehouse, Science Lab Store..."
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Code</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="WH-01"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Add Store</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="px-4 py-3 border-b border-primary/20 flex flex-row items-center justify-between">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Store className="h-5 w-5 text-primary" />
                        Active Warehouses
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className={TABLE_HEADER}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Store Location</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Code</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {stores.map((s) => (
                                <TableRow key={s.id} className={TABLE_ROW}>
                                    <TableCell className={TABLE_CELL_PRIMARY}>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4 text-primary/50" />
                                            {s.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL + " opacity-50"}>
                                        {s.code || 'N/A'}
                                    </TableCell>
                                    <TableCell className={TABLE_CELL_ACTIONS}>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedStore(s); setEditData({ name: s.name, code: s.code || '' }); setIsEditDialogOpen(true); }}
                                            >
                                                Pencil Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
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
                <DialogContent className="rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-semibold">Edit Store</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Store Code</Label>
                            <Input
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.code}
                                onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Store</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Store"
                message="Are you sure you want to delete this store? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
          </RequireBranch>
  );
}
