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
import { toast } from 'sonner';

export default function ChildFinancialsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await StakeholderService.getChildFinancials(id as string);
                setInvoices(data);
            } catch (error) {
                toast.error('Failed to load financial records');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const totalBalance = invoices.reduce((acc, inv) => acc + inv.balance, 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length;

    if (loading) return <div className="flex h-96 items-center justify-center font-black animate-pulse uppercase italic">Loading Financials...</div>;

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
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Financial Overview</h1>
                    <p className="text-muted-foreground font-medium mt-1">Invoice history and payment tracking.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-background p-8 space-y-4">
                    <div className="flex items-center gap-3 font-black italic uppercase text-xs opacity-50">
                        <Wallet className="h-4 w-4" /> Total Outstanding
                    </div>
                    <div className="text-5xl font-black italic text-rose-500">${totalBalance.toLocaleString()}</div>
                    <p className="text-xs font-bold opacity-70">Total balance across all active invoices.</p>
                </Card>

                {/* Visual Summary */}
                <Card className="md:col-span-2 rounded-[2.5rem] border-border/50 shadow-xl bg-black text-white p-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-10">
                        <CreditCard className="h-48 w-48 text-primary rotate-12" />
                    </div>
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="space-y-2">
                            <h3 className="text-xl font-black italic uppercase italic">Account Health</h3>
                            <p className="text-white/50 font-medium">You have {paidInvoices} paid and {invoices.length - paidInvoices} pending invoices.</p>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <Button className="h-12 px-8 rounded-xl font-black italic uppercase italic shadow-lg shadow-primary/20">Pay Outstanding Balance</Button>
                            <Button variant="outline" className="h-12 px-8 rounded-xl font-black italic uppercase italic border-white/10 hover:bg-white/5">Auto-Pay Settings</Button>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-black italic uppercase flex items-center gap-3">
                            <FileText className="h-8 w-8 text-primary" />
                            Invoice History
                        </CardTitle>
                        <CardDescription className="font-bold">Itemized billing and receipts.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/50 bg-muted/30">
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50">Invoice #</th>
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50">Total</th>
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50">Balance</th>
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50">Due Date</th>
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50">Status</th>
                                    <th className="p-6 font-black italic uppercase text-xs opacity-50 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.length > 0 ? invoices.map((inv) => (
                                    <tr key={inv.id} className="border-b border-border/50 hover:bg-primary/5 transition-colors">
                                        <td className="p-6 font-black italic uppercase text-sm">#{inv.invoiceNumber}</td>
                                        <td className="p-6 font-bold text-sm">${inv.totalAmount.toLocaleString()}</td>
                                        <td className="p-6 font-black text-rose-500 text-sm">${inv.balance.toLocaleString()}</td>
                                        <td className="p-6 font-bold text-sm opacity-60">{new Date(inv.dueDate).toLocaleDateString()}</td>
                                        <td className="p-6">
                                            <Badge
                                                className={`rounded-xl px-4 py-1.5 font-black italic uppercase text-[10px] ${inv.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        inv.status === 'PARTIALLY_PAID' ? 'bg-amber-500/10 text-amber-500' :
                                                            'bg-rose-500/10 text-rose-500'
                                                    }`}
                                            >
                                                {inv.status}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-right space-x-2">
                                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border/50 hover:border-primary/50 text-primary">
                                                <Eye className="h-5 w-5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 border border-border/50 hover:border-primary/50">
                                                <Download className="h-5 w-5" />
                                            </Button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="p-12 text-center font-black italic uppercase opacity-20 text-2xl">
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
