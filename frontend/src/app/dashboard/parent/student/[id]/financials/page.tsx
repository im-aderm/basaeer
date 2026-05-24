'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    ChevronLeft,
    FileText,
    CreditCard,
    TrendingDown,
    Download,
    Eye
} from 'lucide-react';
import { StakeholderService } from '@/services/stakeholderService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function ChildFinancialsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showError } = useNotification();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StakeholderService.getChildFinancials(id as string);
                setInvoices(data);
            } catch (error) {
                showError('Failed to load financial records');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const totalBalance = invoices.reduce((acc, inv) => acc + inv.balance, 0);
    const paidInvoices = (invoices ?? []).filter(inv => inv.status === 'PAID').length;

    if (loading) return <div className="flex h-96 items-center justify-center font-semibold animate-pulse">Loading Financials...</div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl h-12 w-12 border border-border/50"
                    onClick={() => router.push(`/dashboard/parent/student/${id}`)}
                >
                    <ChevronLeft className="h-6 w-6" />
                </Button>
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Financial Overview</h1>
                    <p className="text-foreground/60 font-medium mt-1">Invoice history and payment tracking.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={`rounded-2xl border-primary/20 shadow-xl bg-background p-6 space-y-4 ${STAT_CARD}`}>
                    <div className="flex items-center gap-3 font-semibold uppercase text-[10px] text-foreground/60">
                        <Wallet className="h-4 w-4" /> Total Outstanding
                    </div>
                    <div className={STAT_VALUE + " text-rose-500"}>₦{totalBalance.toLocaleString()}</div>
                    <p className="text-[10px] font-bold text-foreground/60">Total balance across all active invoices.</p>
                </Card>

                {/* Visual Summary */}
                <Card className="md:col-span-2 rounded-2xl border-primary/20 shadow-xl bg-black text-white p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <CreditCard className="h-48 w-48 text-primary rotate-12" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-[16px] font-semibold">Account Health</h3>
                            <p className="text-white/50 font-medium text-[12px]">You have {paidInvoices} paid and {invoices.length - paidInvoices} pending invoices.</p>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <Button className="h-10 px-6 rounded-xl font-semibold uppercase shadow-lg shadow-primary/20 text-[12px]">Pay Outstanding Balance</Button>
                            <Button variant="outline" className="h-10 px-6 rounded-xl font-semibold uppercase border-white/10 hover:bg-white/5 text-[12px]">Auto-Pay Settings</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl bg-background overflow-hidden">
                <CardHeader className="p-4 border-b border-primary/20 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-[14px] font-semibold uppercase flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            Invoice History
                        </CardTitle>
                        <CardDescription className="font-bold text-[12px]">Itemized billing and receipts.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Invoice #</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Total</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Balance</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Due Date</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {invoices.length > 0 ? (invoices ?? []).map((inv) => (
                                    <tr key={inv.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>#{inv.invoiceNumber}</td>
                                        <td className={TABLE_CELL}>₦{inv.totalAmount.toLocaleString()}</td>
                                        <td className={TABLE_CELL + " text-rose-500 font-semibold"}>₦{inv.balance.toLocaleString()}</td>
                                        <td className={TABLE_CELL + " text-foreground/60"}>{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className={TABLE_CELL}>
                                            <Badge
                                                className={`rounded-xl px-4 py-1.5 font-semibold uppercase text-[10px] ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        inv.status === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-rose-500/10 text-rose-500'
                                                    }`}
                                            >
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border border-primary/20 hover:border-primary/50 text-primary">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 border border-primary/20 hover:border-primary/50">
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center font-semibold uppercase text-foreground/60 text-[12px]">
                                            No financial records found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
