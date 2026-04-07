'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileBarChart, Download, Filter, Search, Package, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react';
import { InventoryService, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';

export default function InventoryReportsPage() {
    const { user } = useAuth();
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.branchId) return;
        try {
            const data = await InventoryService.getProducts(user.branchId);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load inventory data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.branchId]);

    const lowStockItems = products.filter(p => p.stock <= 5);
    const totalItems = products.length;
    const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase text-primary">Inventory Intelligence</h1>
                    <p className="text-muted-foreground font-medium mt-1">Analytics and stock-level reports for better resource planning.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20 hover:bg-primary/5">
                        <Download className="h-5 w-5" />
                        Export PDF
                    </Button>
                    <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Filter className="h-5 w-5" />
                        Advanced Filter
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary overflow-hidden">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Operational Stock</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-h1 font-semibold">{totalStock}</span>
                            <span className="text-[10px] font-bold uppercase opacity-50">Total Units in Hand</span>
                        </div>
                        <Package className="h-12 w-12 text-primary/20 ml-auto" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-destructive/5 border-l-4 border-l-destructive overflow-hidden">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Critical Alerts</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-h1 font-semibold">{lowStockItems.length}</span>
                            <span className="text-[10px] font-bold uppercase opacity-50">Items Near Depletion</span>
                        </div>
                        <AlertTriangle className="h-12 w-12 text-destructive/20 ml-auto" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500 overflow-hidden">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">Unique SKUs</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-h1 font-semibold">{totalItems}</span>
                            <span className="text-[10px] font-bold uppercase opacity-50">Distinct Product Types</span>
                        </div>
                        <TrendingUp className="h-12 w-12 text-emerald-500/20 ml-auto" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/5">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                        <FileBarChart className="h-8 w-8 text-primary" />
                        Stock Utilization Report
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 py-6 uppercase tracking-widest text-[10px] text-muted-foreground w-1/3">Product Name</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Category</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="font-semibold px-8 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Available Quantity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((p) => (
                                <TableRow key={p.id} className="border-border/50 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 py-6 font-semibold uppercase text-xs">{p.name}</TableCell>
                                    <TableCell className="px-8 font-bold text-[10px] uppercase text-muted-foreground">{p.category?.name || 'Uncategorized'}</TableCell>
                                    <TableCell className="px-8 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${p.stock <= 0 ? 'bg-destructive/10 text-destructive' : p.stock <= 5 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                            {p.stock <= 0 ? 'Out of Stock' : p.stock <= 5 ? 'Low Stock' : 'Healthy'}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right px-8 font-semibold text-lg">
                                        {p.stock} <span className="text-[10px] uppercase opacity-30 not-italic ml-1">{p.unit?.name}</span>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
