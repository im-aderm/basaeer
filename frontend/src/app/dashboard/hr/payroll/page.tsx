"use client";

import { useState, useEffect } from "react";
import {
    DollarSign,
    Calendar,
    Play,
    CheckCircle2,
    AlertCircle,
    Download,
    Search,
    Loader2,
    FileText,
    History
} from "lucide-react";
import { HRService, PayrollEntry } from "@/services/hrService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function PayrollDashboard() {
    const [month, setMonth] = useState<string>(new Date().getMonth() + 1 + "");
    const [year, setYear] = useState<string>(new Date().getFullYear() + "");
    const [generating, setGenerating] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    const handleGenerate = async () => {
        setGenerating(true);
        try {
            const res = await HRService.generatePayroll(Number(month), Number(year));
            toast.success(res.message || "Payroll generated successfully!");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to generate payroll");
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-12 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary mb-4">Payroll Engine</h1>
                        <p className="text-slate-400 text-xl font-medium max-w-xl leading-relaxed">
                            Automate salary generation across the entire branch. Ensure accuracy and timeliness in staff compensation.
                        </p>
                    </div>
                    <Card className="bg-slate-800/50 backdrop-blur-xl border-slate-700 p-8 rounded-[2.5rem] w-full md:w-auto min-w-[300px]">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-2">
                                <Calendar size={12} /> Select Period
                            </div>
                            <div className="flex gap-3">
                                <Select value={month} onValueChange={setMonth}>
                                    <SelectTrigger className="h-14 rounded-2xl font-semibold">
                                        <SelectValue placeholder="Month" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-primary/20 bg-white/10 text-foreground backdrop-blur-xl">
                                        {months.map((m, i) => (
                                            <SelectItem key={i} value={(i + 1).toString()} className="font-bold">{m}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={year} onValueChange={setYear}>
                                    <SelectTrigger className="h-14 rounded-2xl font-semibold w-32">
                                        <SelectValue placeholder="Year" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-primary/20 bg-white/10 text-foreground backdrop-blur-xl">
                                        {years.map(y => (
                                            <SelectItem key={y} value={y.toString()} className="font-bold">{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                className="h-14 rounded-2xl font-semibold tracking-wide text-lg bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 hover:scale-105 transition-all mt-2"
                                onClick={handleGenerate}
                                disabled={generating}
                            >
                                {generating ? <Loader2 className="animate-spin mr-2" /> : <Play className="mr-2" size={20} fill="currentColor" />}
                                Run Payroll Batch
                            </Button>
                        </div>
                    </Card>
                </div>
                {/* Decor */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-800 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all border-t-8 border-t-green-500">
                    <div className="flex items-start justify-between">
                        <div className="p-4 rounded-2xl bg-green-500/10 text-green-600"><DollarSign size={24} /></div>
                        <CheckCircle2 className="text-muted-foreground/30" />
                    </div>
                    <div className="mt-6">
                        <h3 className="text-h1 font-semibold tracking-tighter">₦0</h3>
                        <p className="text-muted-foreground font-bold mt-1 uppercase text-xs">Total Disbursed (MTD)</p>
                    </div>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all border-t-8 border-t-blue-500">
                    <div className="flex items-start justify-between">
                        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-600"><FileText size={24} /></div>
                        <div className="bg-blue-500/20 px-3 py-1 rounded-full text-[10px] font-semibold text-blue-700">ACTIVE</div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-h1 font-semibold tracking-tighter">0</h3>
                        <p className="text-muted-foreground font-bold mt-1 uppercase text-xs">Generated Slips</p>
                    </div>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all border-t-8 border-t-amber-500">
                    <div className="flex items-start justify-between">
                        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600"><AlertCircle size={24} /></div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-h1 font-semibold tracking-tighter">0</h3>
                        <p className="text-muted-foreground font-bold mt-1 uppercase text-xs">Missing Templates</p>
                    </div>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all border-t-8 border-t-slate-900/20">
                    <div className="flex items-start justify-between">
                        <div className="p-4 rounded-2xl bg-slate-500/10 text-slate-600"><Download size={24} /></div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-h3 font-semibold tracking-tight pt-2">Reports</h3>
                        <p className="text-muted-foreground font-bold mt-1 uppercase text-xs">Download History</p>
                    </div>
                </Card>
            </div>

            {/* Activity Hub */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <Card className="lg:col-span-2 rounded-[3.5rem] border-border/50 shadow-2xl overflow-hidden min-h-[500px]">
                    <CardHeader className="p-10 border-b border-border bg-muted/10 flex flex-row items-center justify-between">
                        <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                            <History size={24} className="text-primary" /> Recent Batches
                        </CardTitle>
                        <Button variant="ghost" className="font-semibold rounded-xl">View Archive</Button>
                    </CardHeader>
                    <CardContent className="p-0 flex flex-col items-center justify-center p-20 text-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-muted/50 flex items-center justify-center border-4 border-dashed border-border mb-4">
                            <Search className="text-muted-foreground/30" size={32} />
                        </div>
                        <p className="text-muted-foreground font-bold text-lg">No active batches detected for {months[Number(month) - 1]} {year}.</p>
                        <p className="text-muted-foreground/60 text-sm max-w-sm">Hit "Run Payroll Batch" to generate vouchers for all eligible staff members in this branch.</p>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl p-8 bg-primary/5 border-t-8 border-t-primary">
                        <h3 className="text-h3 font-semibold mb-6">Payroll Checklist</h3>
                        <div className="space-y-6">
                            {[
                                { t: "Staff Base Salaries Defined", d: "Ensure templates are active." },
                                { t: "Monthly Deductions Applied", d: "Fines and late arrivals." },
                                { t: "Advance Salary Adjustments", d: "Automatic deduction of loans." }
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border-2 border-primary/20 text-primary shrink-0 self-start">
                                        <CheckCircle2 size={16} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm">{item.t}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold">{item.d}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="rounded-[3rem] border-border/50 shadow-2xl p-8">
                        <h3 className="text-h3 font-semibold mb-6">Quick Tools</h3>
                        <div className="space-y-4">
                            <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-semibold gap-4 hover:bg-slate-900 hover:text-white transition-all border-2">
                                <DollarSign size={20} /> View All Templates
                            </Button>
                            <Button variant="outline" className="w-full h-14 rounded-2xl justify-start font-semibold gap-4 hover:bg-slate-900 hover:text-white transition-all border-2">
                                <FileText size={20} /> Batch Export Payslips
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
