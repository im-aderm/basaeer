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
import { Truck, Plus, Search, Phone, Mail, MoreHorizontal } from 'lucide-react';
import { InventoryService, InventorySupplier } from '@/services/inventoryService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function InventorySupplierPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<InventorySupplier | null>(null);
    const [formData, setFormData] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    const [editData, setEditData] = useState({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchSuppliers = async () => {
        try {
            const data = await InventoryService.getSuppliers();
            setSuppliers(data);
        } catch (error) {
            showError('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSuppliers();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createSupplier({ ...formData });
            showSuccess('Supplier profile created');
            setIsAddDialogOpen(false);
            setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
            fetchSuppliers();
        } catch (error) {
            showError('Failed to add supplier');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSupplier) return;
        try {
            await InventoryService.updateSupplier(selectedSupplier.id, editData);
            showSuccess('Supplier profile updated');
            setIsEditDialogOpen(false);
            fetchSuppliers();
        } catch (error) {
            showError('Failed to update supplier');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await InventoryService.deleteSupplier(confirmDelete);
            showSuccess('Supplier profile deleted');
            fetchSuppliers();
        } catch (error) {
            showError('Failed to delete supplier');
        }
        setConfirmDelete(null);
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Suppliers & Vendors</h1>
                    <p className="text-foreground/60 font-medium mt-1">Manage your supply chain contacts and partners.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Supplier
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-[14px] font-semibold">New Supplier</DialogTitle>
                                <DialogDescription className="font-bold">Enter vendor information for procurement tracking.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Supplier/Company Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Contact Person</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.contactPerson}
                                            onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Email Address</Label>
                                    <Input
                                        type="email"
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Address</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Onboard Supplier</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="px-4 py-3 border-b border-primary/20">
                    <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Truck className="h-5 w-5 text-primary" />
                        Procurement Partners
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className={TABLE_HEADER}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Supplier Name</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Contact Person</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Communication</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {suppliers.map((s) => (
                                <TableRow key={s.id} className={TABLE_ROW}>
                                    <TableCell className={TABLE_CELL_PRIMARY}>
                                        {s.name}
                                    </TableCell>
                                    <TableCell className={TABLE_CELL + " text-foreground/60"}>
                                        {s.contactPerson || 'N/A'}
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold flex items-center gap-1.5 text-[10px]"><Phone className="h-3 w-3 text-primary" /> {s.phone || 'N/A'}</span>
                                            <span className="text-[10px] font-medium text-foreground/60">{s.email || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL_ACTIONS}>
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedSupplier(s); setEditData({ name: s.name, contactPerson: s.contactPerson || '', phone: s.phone || '', email: s.email || '', address: s.address || '' }); setIsEditDialogOpen(true); }}
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
                <DialogContent className="rounded-2xl max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="text-[14px] font-semibold">Edit Supplier</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Supplier/Company Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editData.name}
                                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Contact Person</Label>
                                <Input
                                    className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                    value={editData.contactPerson}
                                    onChange={(e) => setEditData({ ...editData, contactPerson: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                <Input
                                    className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Email Address</Label>
                                    <Input
                                        type="email"
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={editData.email}
                                        onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Address</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={editData.address}
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Supplier</Button>
                                </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Supplier"
                message="Are you sure you want to delete this supplier? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
          </RequireBranch>
  );
}
