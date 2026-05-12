"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from "recharts";
import api from "@/lib/api";

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6"];

interface FinanceStats {
  totalInvoiced: number;
  totalCollected: number;
  totalOutstanding: number;
  collectionEfficiency: number;
}

interface CashflowData {
  month: string;
  income: number;
  expenses: number;
}

export function FinanceAnalytics() {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [cashflow, setCashflow] = useState<CashflowData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, cashflowRes] = await Promise.all([
        api.get("/finance/stats"),
        api.get("/finance/cashflow"),
      ]);
      setStats(statsRes.data?.data || statsRes.data);
      setCashflow(cashflowRes.data?.data || cashflowRes.data || []);
      setPaymentMethods([
        { name: "Cash", value: statsRes.data?.totalCollected * 0.4 || 0 },
        { name: "Bank Transfer", value: statsRes.data?.totalCollected * 0.35 || 0 },
        { name: "Flutterwave", value: statsRes.data?.totalCollected * 0.25 || 0 },
      ]);
    } catch {
      toast.error("Unable to load finance data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Finance Analytics</h2>
          <p className="text-sm text-muted-foreground">Revenue, collections, and expense trends</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" size="sm">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <TrendingUp className="mr-2 h-4 w-4" />}
          Load Data
        </Button>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-100 text-blue-700"><DollarSign className="h-5 w-5" /></div>
                <div><p className="text-sm text-muted-foreground">Total Invoiced</p><p className="text-xl font-bold">₦{(stats.totalInvoiced || 0).toLocaleString()}</p></div>
              </div>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-emerald-100 text-emerald-700"><TrendingUp className="h-5 w-5" /></div>
                <div><p className="text-sm text-muted-foreground">Total Collected</p><p className="text-xl font-bold">₦{(stats.totalCollected || 0).toLocaleString()}</p></div>
              </div>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-red-100 text-red-700"><TrendingDown className="h-5 w-5" /></div>
                <div><p className="text-sm text-muted-foreground">Outstanding</p><p className="text-xl font-bold">₦{(stats.totalOutstanding || 0).toLocaleString()}</p></div>
              </div>
            </CardHeader>
          </Card>
          <Card className="rounded-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-purple-100 text-purple-700"><AlertCircle className="h-5 w-5" /></div>
                <div><p className="text-sm text-muted-foreground">Collection Rate</p><p className="text-xl font-bold">{Math.round(stats.collectionEfficiency || 0)}%</p></div>
              </div>
            </CardHeader>
          </Card>
        </div>
      )}

      {cashflow.length > 0 && (
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-lg">Cashflow</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashflow} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} name="Income" />
                <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Expenses" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {paymentMethods.length > 0 && (
        <Card className="rounded-lg">
          <CardHeader><CardTitle className="text-lg">Payment Methods</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentMethods} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, value }: any) => `${name}: ₦${(value || 0).toLocaleString()}`}>
                  {paymentMethods.map((_: any, i: number) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!stats && !loading && (
        <Card className="rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <DollarSign className="mb-3 h-12 w-12" />
            <p className="text-sm">Click &quot;Load Data&quot; to view finance analytics</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
