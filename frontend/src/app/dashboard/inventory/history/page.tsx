"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, ArrowLeft, ArrowUpRight, ArrowDownRight, RotateCcw, Package } from 'lucide-react';
import { InventoryService, InventoryPurchase, InventoryIssue } from '@/services/inventoryService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function InventoryHistoryPage() {
    const { user } = useAuth();
    const [purchases, setPurchases] = useState<InventoryPurchase[]>([]);
    const [issues, setIssues] = useState<InventoryIssue[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user?.branchId) return;
        try {
            const [p, i] = await Promise.all([
                InventoryService.getPurchases(user.branchId),
                InventoryService.getIssues(user.branchId)
            ]);
            setPurchases(p);
            setIssues(i);
        } catch (error) {
            toast.error('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.branchId]);

    const handleReturn = async (issueId: string) => {
        if (!confirm('Mark these items as returned to stock?')) return;
        try {
            await InventoryService.returnItem(issueId);
            toast.success('Items returned to stock');
            fetchData();
        } catch (error) {
            toast.error('Failed to process return');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <Link href="/dashboard/inventory" className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </Link>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Transaction History</h1>
                    <p className="text-muted-foreground font-medium mt-1">Detailed log of all stock movements and issuances.</p>
                </div>
            </div>

            <Tabs defaultValue="purchases" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="purchases" className="rounded-xl font-black italic uppercase px-8 data-[state=active]:bg-background">
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Purchases
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="rounded-xl font-black italic uppercase px-8 data-[state=active]:bg-background">
                        <ArrowDownRight className="h-4 w-4 mr-2" /> Issuances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="purchases">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                                <Package className="h-8 w-8 text-emerald-500" />
                                Procurement Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30 h-16">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Date / Voucher</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Supplier</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Qty</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Total Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {purchases.map((p) => (
                                        <TableRow key={p.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                            <TableCell className="px-8 font-black italic">
                                                <div className="flex flex-col">
                                                    <span>{p.voucherNo || 'N/A'}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="px-8 font-black uppercase text-xs">{p.product?.name}</TableCell>
                                            <TableCell className="px-8 font-bold text-muted-foreground italic text-xs uppercase">{p.supplier?.name}</TableCell>
                                            <TableCell className="px-8 font-black">{p.quantity}</TableCell>
                                            <TableCell className="text-right px-8 font-black text-emerald-600">${(p.quantity * p.unitPrice).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="issues">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                                <ArrowDownRight className="h-8 w-8 text-amber-500" />
                                Issuance Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30 h-16">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Date / User</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Product</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Issued To</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Qty</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</TableHead>
                                        <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {issues.map((i) => (
                                        <TableRow key={i.id} className="border-border/50 h-20 transition-all hover:bg-muted/20">
                                            <TableCell className="px-8 font-black italic">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(i.createdAt).toLocaleDateString()}</span>
                                            </TableCell>
                                            <TableCell className="px-8 font-black uppercase text-xs">{i.product?.name}</TableCell>
                                            <TableCell className="px-8 font-bold text-muted-foreground italic text-xs uppercase">{i.issuedTo}</TableCell>
                                            <TableCell className="px-8 text-center font-black">{i.quantity}</TableCell>
                                            <TableCell className="px-8 text-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase italic ${i.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {i.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                {i.status === 'ISSUED' && (
                                                    <Button variant="secondary" size="sm" className="h-9 px-4 rounded-xl font-black uppercase text-[10px] gap-1.5" onClick={() => handleReturn(i.id)}>
                                                        <RotateCcw className="h-3 w-3" /> Return
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
