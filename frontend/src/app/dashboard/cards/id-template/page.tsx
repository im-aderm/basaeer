"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Plus,
    Search,
    Trash2,
    Loader2,
    Edit3,
    Image as ImageIcon,
    Layout,
    Settings2,
    CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CardService, IdCardTemplate, IdCardType } from "@/services/cardService";
import TemplateDesigner from "@/components/cards/TemplateDesigner";

export default function IdTemplatesPage() {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDesignerOpen, setIsDesignerOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<IdCardTemplate | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        type: IdCardType.STUDENT,
        backgroundImage: ""
    });

    const fetchData = async () => {
        try {
            const data = await CardService.getAllTemplates(user?.branchId);
            setTemplates(data);
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
            const newTemplate = await CardService.createTemplate({
                ...formData,
                branchId: user?.branchId!,
                config: {
                    fields: {
                        name: { x: 50, y: 150, fontSize: 16, color: "#000", fontWeight: "bold" },
                        id: { x: 50, y: 180, fontSize: 14, color: "#666" },
                        photo: { x: 200, y: 50, width: 100, height: 100 }
                    }
                }
            });
            setIsDialogOpen(false);
            setFormData({ name: "", type: IdCardType.STUDENT, backgroundImage: "" });
            fetchData();
            // Open designer for the new template
            setSelectedTemplate(newTemplate);
            setIsDesignerOpen(true);
        } catch (error) {
            console.error("Failed to create template:", error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this template?")) return;
        try {
            await CardService.deleteTemplate(id);
            fetchData();
        } catch (error) {
            console.error("Failed to delete template:", error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, backgroundImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredTemplates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3">
                        <Layout className="text-primary w-10 h-10" />
                        ID Card Templates
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Design and manage identity card layouts for students and staff.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Create New Template
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl bg-background/80 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold mb-6 tracking-tight">New ID Card Template</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Template Name</label>
                                <Input
                                    placeholder="e.g. Standard Student ID 2024"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Card Type</label>
                                    <select
                                        className="w-full h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as IdCardType })}
                                    >
                                        <option value={IdCardType.STUDENT}>Student ID Card</option>
                                        <option value={IdCardType.EMPLOYEE}>Employee ID Card</option>
                                        <option value={IdCardType.ADMIT}>Admit Card</option>
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Background Image</label>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            className="hidden"
                                            id="bg-upload"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                        />
                                        <label
                                            htmlFor="bg-upload"
                                            className="flex items-center justify-center w-full h-14 rounded-2xl bg-muted/30 border-2 border-dashed border-muted-foreground/20 font-bold text-muted-foreground cursor-pointer hover:bg-muted/50 transition-all gap-2"
                                        >
                                            {formData.backgroundImage ? (
                                                <><CheckCircle2 className="text-green-500" size={20} /> Image Selected</>
                                            ) : (
                                                <><ImageIcon size={20} /> Upload Base Image</>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" className="h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Create & Setup Layout
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTemplates.map((template) => (
                    <Card key={template.id} className="rounded-[3rem] border-border/50 shadow-xl overflow-hidden group hover:shadow-2xl hover:shadow-primary/10 transition-all border-t-4 border-t-primary/20 bg-card/50 backdrop-blur-sm">
                        <div className="aspect-[1.6/1] bg-muted relative overflow-hidden">
                            {template.backgroundImage ? (
                                <img src={template.backgroundImage} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground/20">
                                    <CreditCard size={80} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                <Button
                                    variant="secondary"
                                    className="rounded-2xl font-bold gap-2"
                                    onClick={() => {
                                        setSelectedTemplate(template);
                                        setIsDesignerOpen(true);
                                    }}
                                >
                                    <Settings2 size={18} /> Design
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="rounded-2xl"
                                    onClick={() => handleDelete(template.id)}
                                >
                                    <Trash2 size={18} />
                                </Button>
                            </div>
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-label text-primary shadow-sm">
                                    {template.type}
                                </span>
                            </div>
                        </div>
                        <CardHeader className="p-8">
                            <CardTitle className="text-h3 font-semibold tracking-tight flex items-center justify-between">
                                {template.name}
                                <Edit3 size={18} className="opacity-0 group-hover:opacity-50 transition-opacity" />
                            </CardTitle>
                        </CardHeader>
                    </Card>
                ))}

                {filteredTemplates.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CreditCard size={40} className="text-muted-foreground/30" />
                        </div>
                        <h3 className="text-h3 font-semibold tracking-tight">No Templates Found</h3>
                        <p className="text-muted-foreground font-medium mt-2">Start by creating your first ID card layout.</p>
                    </div>
                )}
            </div>

            {isDesignerOpen && selectedTemplate && (
                <TemplateDesigner
                    template={selectedTemplate}
                    onClose={() => {
                        setIsDesignerOpen(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
}
