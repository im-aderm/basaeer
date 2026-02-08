"use client";

import { useState, useEffect } from "react";
import {
    Layout,
    Plus,
    Trash2,
    Edit3,
    Type,
    Palette,
    Image as ImageIcon,
    Loader2,
    CheckCircle2,
    Save
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function CertificateTemplatesPage() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "ACHIEVEMENT",
        config: {
            primaryColor: "#1a365d",
            secondaryColor: "#4a5568",
            borderStyle: "double",
            fontFamily: "Helvetica"
        }
    });

    const fetchData = async () => {
        try {
            const res = await api.get(`/certificates/templates?branchId=${user?.branchId}`);
            setTemplates(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch templates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/certificates/templates", {
                ...formData,
                branchId: user?.branchId
            });
            setIsDialogOpen(false);
            setFormData({ name: "", type: "ACHIEVEMENT", config: { primaryColor: "#1a365d", secondaryColor: "#4a5568", borderStyle: "double", fontFamily: "Helvetica" } });
            fetchData();
        } catch (error) {
            console.error("Failed to create template:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await api.delete(`/certificates/templates/${id}`);
            fetchData();
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                        <Palette className="text-primary w-10 h-10" />
                        Design Center
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage and customize certificate templates for your institution.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Create New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl bg-background/80 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black italic mb-6 tracking-tight">Design New Template</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Template Name</label>
                                <Input
                                    placeholder="e.g. Classic Achievement Template"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Certificate Type</label>
                                <select
                                    className="w-full h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="ACHIEVEMENT">Achievement</option>
                                    <option value="TRANSFER">Transfer</option>
                                    <option value="CHARACTER">Character</option>
                                    <option value="PROVISIONAL">Provisional</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Primary Color</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        className="h-14 w-14 rounded-xl border-none p-0 bg-transparent cursor-pointer"
                                        value={formData.config.primaryColor}
                                        onChange={(e) => setFormData({ ...formData, config: { ...formData.config, primaryColor: e.target.value } })}
                                    />
                                    <span className="font-mono font-bold text-lg">{formData.config.primaryColor}</span>
                                </div>
                            </div>
                            <Button type="submit" className="md:col-span-2 h-14 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                <Save className="mr-2" /> Save Design
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((tpl) => (
                    <Card key={tpl.id} className="rounded-[3rem] border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-all">
                        <div className="h-40 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden flex items-center justify-center">
                            <div
                                className="absolute inset-4 border-4 opacity-20"
                                style={{ borderColor: tpl.config?.primaryColor || "#000", borderStyle: tpl.config?.borderStyle || "solid" }}
                            />
                            <Award className="w-16 h-16 text-slate-400 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <CardHeader className="p-8">
                            <CardTitle className="text-2xl font-black italic tracking-tight">{tpl.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase px-3 py-1 bg-primary/10 text-primary rounded-full">
                                    {tpl.type}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex justify-between items-center">
                            <div className="flex gap-2">
                                <div className="w-6 h-6 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: tpl.config?.primaryColor }} />
                                <div className="w-6 h-6 rounded-full border border-slate-100 shadow-sm" style={{ backgroundColor: tpl.config?.secondaryColor }} />
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-400 hover:bg-slate-100">
                                    <Edit3 size={20} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-12 w-12 rounded-2xl text-red-400 hover:bg-red-50 transition-all"
                                    onClick={() => handleDelete(tpl.id)}
                                >
                                    <Trash2 size={20} />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {templates.length === 0 && (
                    <div className="md:col-span-3 py-20 text-center space-y-4">
                        <Palette className="w-16 h-16 text-slate-200 mx-auto" />
                        <h3 className="text-2xl font-black italic text-slate-300">No Custom Templates Yet</h3>
                        <p className="text-slate-400 font-medium max-w-xs mx-auto">Create beautiful layouts to personalize your institution's digital certificates.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
