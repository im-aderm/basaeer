"use client";

import { useState, useEffect } from "react";
import { ExamService, GradingScale } from "@/services/examService";
import {
    Award,
    Plus,
    Trash2,
    Save,
    Loader2,
    AlertCircle,
    Sliders,
    Settings,
    FileText,
    Building2,
    Globe
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { BranchService, Branch } from "@/services/branchService";
import { UserRole } from "@/types/enums";

export default function GradingPage() {
    const { user } = useAuth();
    const [scales, setScales] = useState<GradingScale[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [newScale, setNewScale] = useState<Partial<GradingScale>>({
        name: "Standard",
        minScore: 0,
        maxScore: 100,
        grade: "",
        remark: ""
    });

    useEffect(() => {
        if (user?.role === UserRole.SUPER_ADMIN) {
            loadBranches();
        }
        fetchScales();
    }, [user, selectedBranchId]);

    const loadBranches = async () => {
        try {
            const data = await BranchService.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    };

    const fetchScales = async () => {
        try {
            const data = await ExamService.getGradingScales(selectedBranchId);
            setScales(data);
        } catch (error) {
            console.error("Failed to fetch scales:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newScale.grade || newScale.minScore === undefined) return;
        setSaving(true);
        try {
            await ExamService.createGradingScale(newScale as GradingScale);
            await fetchScales();
            setNewScale({
                name: "Standard",
                minScore: 0,
                maxScore: 100,
                grade: "",
                remark: ""
            });
        } catch (error) {
            console.error("Failed to create scale:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 italic">
                        <Award className="text-primary w-10 h-10" />
                        Grading Configuration
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium italic">Define how pupil performance is translated into grades and remarks.</p>
                </div>

                {user?.role === UserRole.SUPER_ADMIN && (
                    <div className="flex items-center gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                        <Building2 className="text-primary" size={20} />
                        <select
                            className="bg-transparent border-none outline-none font-black italic text-sm"
                            value={selectedBranchId}
                            onChange={(e) => setSelectedBranchId(e.target.value)}
                        >
                            <option value="">Global System Scales</option>
                            {branches.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Configuration Form */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                        <h2 className="text-xl font-black italic flex items-center gap-2">
                            <Plus className="text-primary" size={20} /> Add New Grade
                        </h2>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Grade Label (e.g. A1)</label>
                                <input
                                    className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                    value={newScale.grade}
                                    onChange={e => setNewScale({ ...newScale, grade: e.target.value })}
                                    placeholder="A1"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Min Score</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                        value={newScale.minScore}
                                        onChange={e => setNewScale({ ...newScale, minScore: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Max Score</label>
                                    <input
                                        type="number"
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                        value={newScale.maxScore}
                                        onChange={e => setNewScale({ ...newScale, maxScore: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Remark</label>
                                <input
                                    className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                    value={newScale.remark}
                                    onChange={e => setNewScale({ ...newScale, remark: e.target.value })}
                                    placeholder="Excellent"
                                />
                            </div>

                            <button
                                onClick={handleAdd}
                                disabled={saving || !newScale.grade}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                            >
                                {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Save Grading Rule"}
                            </button>
                        </div>
                    </div>

                    <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-2 text-amber-600 font-black text-sm italic">
                            <AlertCircle size={18} /> Implementation Note
                        </div>
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            Grading scales are used during automated result processing. Ensure there are no overlaps between score ranges to avoid calculation errors.
                        </p>
                    </div>
                </div>

                {/* Grade List */}
                <div className="lg:col-span-2">
                    <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                        <div className="p-8 border-b border-border bg-muted/10">
                            <h2 className="text-2xl font-black italic tracking-tight flex items-center gap-3">
                                <Sliders className="text-primary" size={24} />
                                Current Branch Scale
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/30 text-left border-b border-border">
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Grade</th>
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Range</th>
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Remark</th>
                                        <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground text-right">Scope</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {scales.map((scale) => (
                                        <tr key={scale.id} className="hover:bg-muted/5 transition-colors">
                                            <td className="px-10 py-6">
                                                <span className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl font-black text-lg italic">
                                                    {scale.grade}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="font-black text-lg italic tracking-tight">
                                                    {scale.minScore} - {scale.maxScore}
                                                </p>
                                            </td>
                                            <td className="px-10 py-6">
                                                <p className="font-medium text-muted-foreground italic">
                                                    {scale.remark || "No remark"}
                                                </p>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <span className={clsx(
                                                    "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    scale.branchId ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20"
                                                )}>
                                                    {scale.branchId ? "Branch Spec" : "Global System"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {scales.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-10 py-20 text-center">
                                                <p className="text-muted-foreground font-black italic">No grading scales defined. Using system defaults.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
