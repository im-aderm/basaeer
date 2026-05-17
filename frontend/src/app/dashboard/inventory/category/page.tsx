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
import { Tags, Plus, Search, Layers, Pencil, Trash2 } from 'lucide-react';
import { InventoryService, InventoryCategory } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryCategoryPage() {
    const { user, resolvedBranchId } = useAuth();
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<InventoryCategory | null>(null);
    const [newName, setNewName] = useState('');
    const [editName, setEditName] = useState('');

    const fetchCategories = async () => {
        try {
            const data = await InventoryService.getCategories(resolvedBranchId);
            setCategories(data);
        } catch (error) {
            toast.error('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await InventoryService.createCategory({ name: newName, branchId: resolvedBranchId });
            toast.success('Category created');
            setIsAddDialogOpen(false);
            setNewName('');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCategory) return;
        try {
            await InventoryService.updateCategory(selectedCategory.id, { name: editName });
            toast.success('Category updated');
            setIsEditDialogOpen(false);
            fetchCategories();
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await InventoryService.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Item Categories</h1>
                    <p className="text-muted-foreground font-medium mt-1">Organize your inventory items by logical groupings.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Add Category
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold">New Category</DialogTitle>
                                <DialogDescription className="font-bold">Enter a name for the new inventory grouping.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Category Name</Label>
                                    <Input
                                        required
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="Stationery, Uniforms, Lab Equipment..."
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Create Category</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Layers className="h-8 w-8 text-primary" />
                        Category List
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Category Name</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
                                <TableRow key={c.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-semibold uppercase leading-tight">
                                        {c.name}
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5"
                                                onClick={() => { setSelectedCategory(c); setEditName(c.name); setIsEditDialogOpen(true); }}
                                            >
                                                <Pencil className="h-3 w-3" /> Edit
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                                onClick={() => handleDelete(c.id)}
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

            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="rounded-[2.5rem]">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Edit Category</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <div className="space-y-2">
                            <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Category Name</Label>
                            <Input
                                required
                                className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Category</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
          </RequireBranch>
  );
}
