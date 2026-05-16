'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    Truck,
    ArrowDownRight,
    ArrowUpRight,
    Warehouse,
    Layers,
    Ruler,
    History,
    CreditCard,
    TrendingUp,
    AlertTriangle,
    Plus,
    FileBarChart
} from 'lucide-react';
import { InventoryService, InventoryProduct } from '@/services/inventoryService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventoryOverviewPage() {
    const { user, resolvedBranchId } = useAuth();
    const [products, setProducts] = useState<InventoryProduct[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!resolvedBranchId) return;
        try {
            const data = await InventoryService.getProducts(resolvedBranchId);
            setProducts(data);
        } catch (error) {
            toast.error('Failed to load inventory overview');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resolvedBranchId]);

    const lowStock = products.filter(p => p.stock <= 5);
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * (p.costPrice || 0)), 0);

    const quickActions = [
        { title: 'Add Product', icon: Plus, href: '/dashboard/inventory/product', color: 'bg-primary' },
        { title: 'Record Purchase', icon: ArrowUpRight, href: '/dashboard/inventory/purchase', color: 'bg-emerald-600' },
        { title: 'Issue Items', icon: ArrowDownRight, href: '/dashboard/inventory/issue', color: 'bg-amber-600' },
        { title: 'Item Sales', icon: CreditCard, href: '/dashboard/inventory/sales', color: 'bg-blue-600' },
    ];

    const navigationLinks = [
        { title: 'Categories', icon: Layers, href: '/dashboard/inventory/category', desc: 'Organize items by type' },
        { title: 'Store Locations', icon: Warehouse, href: '/dashboard/inventory/store', desc: 'Manage warehouses' },
        { title: 'Suppliers', icon: Truck, href: '/dashboard/inventory/supplier', desc: 'Manage vendor contacts' },
        { title: 'Units', icon: Ruler, href: '/dashboard/inventory/unit', desc: 'Manage measurements' },
        { title: 'Stock History', icon: History, href: '/dashboard/inventory/history', desc: 'View all transactions' },
        { title: 'Reports', icon: FileBarChart, href: '/dashboard/reports/inventory', desc: 'Deep analytics' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">
            {/* Header section with branding */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-2">
                    <h1 className="text-h1 font-bold tracking-tighter text-primary uppercase bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                        Inventory Command
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg max-w-xl">
                        Central control for school assets, procurement, and distribution.
                        Monitor stock levels in real-time.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                        <Link key={action.href} href={action.href}>
                            <Button className={`h-14 px-6 rounded-[1.25rem] font-semibold gap-3 shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all ${action.color}`}>
                                <action.icon className="h-5 w-5" />
                                <span className="uppercase tracking-wider">{action.title}</span>
                            </Button>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Top metrics grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-primary/5 hover:bg-primary/10 transition-colors group">
                    <CardHeader className="pb-2"><CardTitle className="text-label opacity-40">Total SKUs</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-h1 font-semibold tracking-tighter">{products.length}</span>
                        <Package className="h-10 w-10 text-primary opacity-20 group-hover:opacity-40 transition-opacity" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-destructive/5 hover:bg-destructive/10 transition-colors group">
                    <CardHeader className="pb-2"><CardTitle className="text-label opacity-40">Stock Alerts</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-h1 font-semibold tracking-tighter text-destructive">{lowStock.length}</span>
                        <AlertTriangle className="h-10 w-10 text-destructive opacity-20 group-hover:opacity-40 transition-opacity" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors group">
                    <CardHeader className="pb-2"><CardTitle className="text-label opacity-40">Total Value</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-h1 font-semibold tracking-tighter text-emerald-600">
                            {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(totalStockValue)}
                        </span>
                        <TrendingUp className="h-10 w-10 text-emerald-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-none shadow-2xl bg-blue-500/5 hover:bg-blue-500/10 transition-colors group">
                    <CardHeader className="pb-2"><CardTitle className="text-label opacity-40">Stores Active</CardTitle></CardHeader>
                    <CardContent className="flex items-center justify-between">
                        <span className="text-h1 font-semibold tracking-tighter text-blue-600">Active</span>
                        <Warehouse className="h-10 w-10 text-blue-500 opacity-20 group-hover:opacity-40 transition-opacity" />
                    </CardContent>
                </Card>
            </div>

            {/* Main navigation bento grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {navigationLinks.map((link) => (
                    <Link key={link.href} href={link.href} className="group">
                        <Card className="h-full rounded-[2.5rem] border border-border/50 shadow-xl hover:shadow-2xl hover:bg-muted/30 transition-all duration-300">
                            <CardHeader className="flex flex-row items-center gap-4 py-8 px-8">
                                <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <link.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-h3 font-semibold uppercase tracking-tight">{link.title}</CardTitle>
                                    <CardDescription className="text-xs font-bold uppercase opacity-60 tracking-widest">{link.desc}</CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    </Link>
                ))}
            </div>

            {/* Recent low stock items preview */}
            <Card className="rounded-[3rem] border border-border/50 shadow-2xl bg-background/50 backdrop-blur-md overflow-hidden">
                <CardHeader className="p-8 border-b border-border/50 bg-muted/10 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <AlertTriangle className="h-8 w-8 text-destructive animate-pulse" />
                        <div>
                            <CardTitle className="text-h3 font-semibold uppercase text-destructive">Critical Stock Levels</CardTitle>
                            <CardDescription className="font-bold">Immediately restock these products to avoid operational delays.</CardDescription>
                        </div>
                    </div>
                    <Link href="/dashboard/inventory/purchase">
                        <Button variant="ghost" className="font-semibold uppercase text-xs hover:bg-primary/5">Restock All Items</Button>
                    </Link>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-x divide-y divide-border/50">
                        {lowStock.length > 0 ? (
                            lowStock.slice(0, 6).map((p) => (
                                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-destructive/5 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-semibold uppercase text-sm">{p.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">{p.category?.name}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-h3 font-semibold text-destructive">{p.stock}</span>
                                        <span className="text-[10px] font-semibold uppercase opacity-30">{p.unit?.name} remaining</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full p-12 text-center">
                                <span className="font-semibold uppercase text-muted-foreground opacity-20 text-h1 select-none">All Stock Levels Healthy</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
