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
import { Ruler, Plus, Search, MoreHorizontal } from 'lucide-react';
import { InventoryService, InventoryUnit } from '@/services/inventoryService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function InventoryUnitPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [units, setUnits] = useState<InventoryUnit[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<InventoryUnit | null>(null);
    const [newName, setNewName] = useState('');
    const [editName, setEditName] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchUnits = async () => {
        try {
            const data = await InventoryService.getUnits();
            setUnits(data);
        } catch (error) {
            showError('Failed to load units');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnits();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createUnit({ name: newName });
            showSuccess('Unit of measure added');
            setIsAddDialogOpen(false);
            setNewName('');
            fetchUnits();
        } catch (error) {
            showError('Failed to add unit');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUnit) return;
        try {
            await InventoryService.updateUnit(selectedUnit.id, { name: editName });
            showSuccess('Unit updated');
            setIsEditDialogOpen(false);
            fetchUnits();
        } catch (error) {
            showError('Failed to update unit');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await InventoryService.deleteUnit(confirmDelete);
            showSuccess('Unit deleted');
            fetchUnits();
        } catch (error) {
            showError('Failed to delete unit');
        }
        setConfirmDelete(null);
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Units of Measure</h1>
                    <p className="text-muted-foreground font-medium mt-1">Define quantities like KG, Pcs, Liters, etc.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Unit
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold">New Unit</DialogTitle>
                                <DialogDescription className="font-bold">Define a new measurement unit for products.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="Pcs, Pack, Box, KG, etc."
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Add Unit</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Ruler className="h-8 w-8 text-primary" />
                        Measurement Units
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Unit Name</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {units.map((u) => (
                                <TableRow key={u.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-semibold uppercase leading-tight">
                                        {u.name}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedUnit(u); setEditName(u.name); setIsEditDialogOpen(true); }}
                                            >
                                                Pencil Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                onClick={() => handleDelete(u.id)}
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
                        <DialogTitle className="text-h3 font-semibold">Edit Unit</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Unit Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Unit</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Unit"
                message="Are you sure you want to delete this unit? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
          </RequireBranch>
  );
}
