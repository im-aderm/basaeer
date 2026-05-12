
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    DollarSign,
    CreditCard,
    FileText,
    TrendingUp,
    TrendingDown,
    Activity,
    Loader2,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function FinanceDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get('/finance/stats');
                setStats(response.data);
            } catch (error) {
                setError("Could not load financial data");
                toast.error("Failed to load finance statistics");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
                <AlertCircle className="w-12 h-12 text-destructive" />
                <p className="text-lg font-semibold text-destructive">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-h1 font-bold tracking-tight">Financial Overview</h1>
                <div className="flex gap-2">
                    <Link href="/dashboard/finance/fees">
                        <Button variant="outline">Fee Setup</Button>
                    </Link>
                    <Link href="/dashboard/finance/invoices">
                        <Button>Generate Invoices</Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Invoiced</h3>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ₦{stats?.totalInvoiced?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">This session</p>
                </Card>

                <Card className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Total Collected</h3>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ₦{stats?.totalCollected?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs text-green-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {stats?.collectionEfficiency?.toFixed(1)}% efficiency
                    </div>
                </Card>

                <Card className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Outstanding</h3>
                        <Activity className="h-4 w-4 text-orange-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ₦{stats?.totalOutstanding?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Pending payments</p>
                </Card>

                <Card className="p-6 space-y-2">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-muted-foreground">Office Expenses</h3>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        ₦{stats?.totalExpenses?.toLocaleString() || '0'}
                    </div>
                    <p className="text-xs text-muted-foreground">Cash Out</p>
                </Card>
            </div>

            {/* Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/dashboard/finance/invoices?action=create">
                            <Button variant="secondary" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                <FileText className="h-6 w-6" />
                                Create Invoice
                            </Button>
                        </Link>
                        <Link href="/dashboard/finance/expenses">
                            <Button variant="secondary" className="w-full h-20 flex flex-col items-center justify-center gap-2">
                                <CreditCard className="h-6 w-6" />
                                Record Expense
                            </Button>
                        </Link>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No recent transactions found.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
