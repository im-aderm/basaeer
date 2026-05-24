"use client";
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS } from '@/lib/table-styles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { History, ArrowLeft, ArrowUpRight, ArrowDownRight, RotateCcw, Package } from 'lucide-react';
import { InventoryService, InventoryPurchase, InventoryIssue } from '@/services/inventoryService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import Link from 'next/link';

export default function InventoryHistoryPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [purchases, setPurchases] = useState<InventoryPurchase[]>([]);
    const [issues, setIssues] = useState<InventoryIssue[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmReturn, setConfirmReturn] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const [p, i] = await Promise.all([
                InventoryService.getPurchases(),
                InventoryService.getIssues()
            ]);
            setPurchases(p);
            setIssues(i);
        } catch (error) {
            showError('Failed to load transaction history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReturn = async (issueId: string) => {
        setConfirmReturn(issueId);
    };

    const handleConfirmReturn = async () => {
        if (!confirmReturn) return;
        try {
            await InventoryService.returnItem(confirmReturn);
            showSuccess('Items returned to stock');
            fetchData();
        } catch (error) {
            showError('Failed to process return');
        }
        setConfirmReturn(null);
    };

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <Link href="/dashboard/inventory" className="flex items-center gap-2 text-foreground/60 hover:text-primary font-bold transition-colors mb-2">
                        <ArrowLeft className="h-4 w-4" /> Back to Inventory
                    </Link>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Transaction History</h1>
                    <p className="text-foreground/60 font-medium mt-1">Detailed log of all stock movements and issuances.</p>
                </div>
            </div>

            <Tabs defaultValue="purchases" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl h-14">
                    <TabsTrigger value="purchases" className="rounded-xl font-semibold uppercase px-8 data-[state=active]:bg-background">
                        <ArrowUpRight className="h-4 w-4 mr-2" /> Purchases
                    </TabsTrigger>
                    <TabsTrigger value="issues" className="rounded-xl font-semibold uppercase px-8 data-[state=active]:bg-background">
                        <ArrowDownRight className="h-4 w-4 mr-2" /> Issuances
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="purchases">
                    <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="px-4 py-3 border-b border-primary/20">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                                <Package className="h-5 w-5 text-emerald-500" />
                                Procurement Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className={TABLE_HEADER}>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Date / Voucher</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Product</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Supplier</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Qty</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Total Price</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={TABLE_BODY}>
                                    {purchases.map((p) => (
                                        <TableRow key={p.id} className={TABLE_ROW}>
                                            <TableCell className={TABLE_CELL_PRIMARY}>
                                                <div className="flex flex-col">
                                                    <span>{p.voucherNo || 'N/A'}</span>
                                                    <span className="text-[10px] font-bold text-foreground/60">{new Date(p.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className={TABLE_CELL + " uppercase"}>{p.product?.name}</TableCell>
                                            <TableCell className={TABLE_CELL + " text-foreground/60"}>{p.supplier?.name}</TableCell>
                                            <TableCell className={TABLE_CELL}>{p.quantity}</TableCell>
                                            <TableCell className={TABLE_CELL + " text-right text-primary"}>₦{(Number(p.quantity) * Number(p.unitPrice)).toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="issues">
                    <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="px-4 py-3 border-b border-primary/20">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                                <ArrowDownRight className="h-5 w-5 text-amber-500" />
                                Issuance Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className={TABLE_HEADER}>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Date / User</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Product</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Issued To</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Qty</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Status</TableHead>
                                        <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody className={TABLE_BODY}>
                                    {issues.map((i) => (
                                        <TableRow key={i.id} className={TABLE_ROW}>
                                            <TableCell className={TABLE_CELL_PRIMARY}>
                                                <span className="text-[10px] font-bold text-foreground/60">{new Date(i.createdAt).toLocaleDateString()}</span>
                                            </TableCell>
                                            <TableCell className={TABLE_CELL + " uppercase"}>{i.product?.name}</TableCell>
                                            <TableCell className={TABLE_CELL + " text-foreground/60"}>{i.issuedTo}</TableCell>
                                            <TableCell className={TABLE_CELL + " text-center"}>{i.quantity}</TableCell>
                                            <TableCell className={TABLE_CELL + " text-center"}>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${i.status === 'RETURNED' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                                    {i.status}
                                                </span>
                                            </TableCell>
                                            <TableCell className={TABLE_CELL_ACTIONS}>
                                                {i.status === 'ISSUED' && (
                                                    <Button variant="secondary" size="sm" className="h-9 px-4 rounded-xl font-semibold uppercase text-[10px] gap-1.5" onClick={() => handleReturn(i.id)}>
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

            <ConfirmDialog
                isOpen={!!confirmReturn}
                onConfirm={handleConfirmReturn}
                onCancel={() => setConfirmReturn(null)}
                title="Return Items"
                message="Mark these items as returned to stock?"
                confirmLabel="Return"
            />
        </div>
          </RequireBranch>
  );
}
