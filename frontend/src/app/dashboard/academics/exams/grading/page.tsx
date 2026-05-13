"use client";

import { useState, useEffect } from "react";
import { ExamService, GradingScale } from "@/services/examService";
import { AcademicService } from "@/services/academicService";
import {
    Award,
    Plus,
    Trash2,
    Pencil,
    Save,
    Loader2,
    AlertCircle,
    Sliders,
    Settings,
    FileText,
    Building2,
    Globe,
    Layers,
    Percent,
    Layout
} from "lucide-react";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { BranchService, Branch } from "@/services/branchService";
import { UserRole } from "@/types/enums";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function GradingPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<"scales" | "components">("scales");
    
    // Grading Scales State
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

    // Components State
    const [components, setComponents] = useState<any[]>([]);
    const [newComponent, setNewComponent] = useState({
        name: "",
        component: "",
        weight: 0,
        maxScore: 100,
        isExam: false,
    });
    const [editingComponent, setEditingComponent] = useState<any | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);

    useEffect(() => {
        if (user?.role === UserRole.SUPER_ADMIN) {
            loadBranches();
        }
        fetchData();
    }, [user, selectedBranchId, activeTab]);

    const loadBranches = async () => {
        try {
            const data = await BranchService.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Failed to load branches:", error);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === "scales") {
                const data = await ExamService.getGradingScales(selectedBranchId);
                setScales(data);
            } else {
                const data = await AcademicService.listAssessmentComponents();
                setComponents(data);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setSaving(false);
        }
    };

    const handleEditComponent = async () => {
        if (!editingComponent || !editingComponent.name) return;
        setSaving(true);
        try {
            await AcademicService.updateAssessmentComponent(editingComponent.id, {
                name: editingComponent.name,
                weight: editingComponent.weight,
                maxScore: editingComponent.maxScore,
                isExam: editingComponent.isExam,
            });
            toast.success("Component updated");
            setEditDialogOpen(false);
            setEditingComponent(null);
            await fetchData();
        } catch (error) {
            toast.error("Failed to update component");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteComponent = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This will deactivate the component but keep existing scores.`)) return;
        try {
            await AcademicService.deleteAssessmentComponent(id);
            toast.success("Component deactivated");
            await fetchData();
        } catch (error) {
            toast.error("Failed to delete component");
        }
    };

    const handleAddScale = async () => {
        if (!newScale.grade || newScale.minScore === undefined) return;
        setSaving(true);
        try {
            await ExamService.createGradingScale(newScale as GradingScale);
            toast.success("Grading rule added");
            await fetchData();
            setNewScale({
                name: "Standard",
                minScore: 0,
                maxScore: 100,
                grade: "",
                remark: ""
            });
        } catch (error) {
            toast.error("Failed to create scale");
        } finally {
            setSaving(false);
        }
    };

    const handleAddComponent = async () => {
        if (!newComponent.name || !newComponent.component) return;
        setSaving(true);
        try {
            await AcademicService.createAssessmentComponent(newComponent);
            toast.success("Assessment component added");
            await fetchData();
            setNewComponent({
                name: "",
                component: "",
                weight: 0,
                maxScore: 100,
                isExam: false,
            });
        } catch (error) {
            toast.error("Failed to create component");
        } finally {
            setSaving(false);
        }
    };

    if (loading && scales.length === 0 && components.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3">
                        <Award className="text-primary w-10 h-10" />
                        Grading Configuration
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Define how performance is calculated and translated into grades.</p>
                </div>

                <div className="flex bg-muted/30 p-1.5 rounded-3xl border border-border">
                    <button 
                        onClick={() => setActiveTab("scales")}
                        className={clsx(
                            "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all",
                            activeTab === "scales" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Grading Scales
                    </button>
                    <button 
                        onClick={() => setActiveTab("components")}
                        className={clsx(
                            "px-6 py-2.5 rounded-2xl text-sm font-bold transition-all",
                            activeTab === "components" ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        Assessment Components
                    </button>
                </div>
            </div>

            {activeTab === "scales" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Scale Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                            <h2 className="text-h3 font-semibold flex items-center gap-2">
                                <Plus className="text-primary" size={20} /> Add New Grade
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-2">Grade Label (e.g. A1)</label>
                                    <input
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                        value={newScale.grade}
                                        onChange={e => setNewScale({ ...newScale, grade: e.target.value })}
                                        placeholder="A1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-label text-muted-foreground ml-2">Min Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                            value={newScale.minScore}
                                            onChange={e => setNewScale({ ...newScale, minScore: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-label text-muted-foreground ml-2">Max Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                            value={newScale.maxScore}
                                            onChange={e => setNewScale({ ...newScale, maxScore: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-2">Remark</label>
                                    <input
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                        value={newScale.remark}
                                        onChange={e => setNewScale({ ...newScale, remark: e.target.value })}
                                        placeholder="Excellent"
                                    />
                                </div>

                                <button
                                    onClick={handleAddScale}
                                    disabled={saving || !newScale.grade}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Save Grading Rule"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scale List */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                            <div className="p-8 border-b border-border bg-muted/10">
                                <h2 className="text-h3 font-semibold tracking-tight flex items-center gap-3">
                                    <Sliders className="text-primary" size={24} />
                                    Active Grading Scale
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30 text-left border-b border-border">
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Grade</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Range</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Remark</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Scope</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {scales.map((scale) => (
                                            <tr key={scale.id} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-10 py-6">
                                                    <span className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-xl font-semibold text-lg">
                                                        {scale.grade}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <p className="font-semibold text-lg tracking-tight">
                                                        {scale.minScore} - {scale.maxScore}
                                                    </p>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <p className="font-medium text-muted-foreground">
                                                        {scale.remark || "No remark"}
                                                    </p>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <span className={clsx(
                                                        "px-4 py-1.5 rounded-full text-label",
                                                        scale.branchId ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-green-500/10 text-green-600 border border-green-500/20"
                                                    )}>
                                                        {scale.branchId ? "Branch Spec" : "Global System"}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Component Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 shadow-sm">
                            <h2 className="text-h3 font-semibold flex items-center gap-2">
                                <Layers className="text-primary" size={20} /> Define Component
                            </h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-2">Display Name (e.g. Test 1)</label>
                                    <input
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                        value={newComponent.name}
                                        onChange={e => setNewComponent({ ...newComponent, name: e.target.value })}
                                        placeholder="First Continuous Assessment"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-2">Short Code (e.g. CA1)</label>
                                    <input
                                        className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold uppercase"
                                        value={newComponent.component}
                                        onChange={e => setNewComponent({ ...newComponent, component: e.target.value })}
                                        placeholder="CA1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-label text-muted-foreground ml-2">Weight (%)</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                            value={newComponent.weight}
                                            onChange={e => setNewComponent({ ...newComponent, weight: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-label text-muted-foreground ml-2">Max Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-4 bg-muted/30 border border-border/50 rounded-2xl focus:border-primary outline-none font-bold"
                                            value={newComponent.maxScore}
                                            onChange={e => setNewComponent({ ...newComponent, maxScore: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-2xl">
                                    <input 
                                        type="checkbox" 
                                        id="isExam" 
                                        className="w-5 h-5 rounded-lg accent-primary"
                                        checked={newComponent.isExam}
                                        onChange={e => setNewComponent({ ...newComponent, isExam: e.target.checked })}
                                    />
                                    <label htmlFor="isExam" className="text-sm font-bold cursor-pointer">This is a Summative Exam</label>
                                </div>

                                <button
                                    onClick={handleAddComponent}
                                    disabled={saving || !newComponent.name}
                                    className="w-full py-4 bg-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader2 size={24} className="animate-spin mx-auto" /> : "Add Component"}
                                </button>
                            </div>
                        </div>

                        <div className="p-8 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-4">
                            <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                                <Percent size={18} /> Weighting System
                            </div>
                            <p className="text-xs text-primary-800/70 font-medium leading-relaxed">
                                Components with "Is Exam" checked will be hidden from **Open Day** reports. The sum of all component weights for a term should ideally equal 100%.
                            </p>
                        </div>
                    </div>

                    {/* Component List */}
                    <div className="lg:col-span-2">
                        <div className="bg-card border border-border rounded-[3rem] shadow-sm overflow-hidden border-t-8 border-t-primary">
                            <div className="p-8 border-b border-border bg-muted/10">
                                <h2 className="text-h3 font-semibold tracking-tight flex items-center gap-3">
                                    <Layout className="text-primary" size={24} />
                                    Active Components
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30 text-left border-b border-border">
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Component</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Code</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center">Weight</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-center">Max Score</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Type</th>
                                            <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {components.map((comp) => (
                                            <tr key={comp.id} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-10 py-6">
                                                    <p className="font-bold text-lg">{comp.name}</p>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <span className="px-3 py-1 bg-muted rounded-lg font-mono text-xs font-bold">{comp.component}</span>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <p className="font-black text-xl text-primary">{comp.weight}%</p>
                                                </td>
                                                <td className="px-10 py-6 text-center">
                                                    <p className="font-bold text-muted-foreground">{comp.maxScore}</p>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <span className={clsx(
                                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                        comp.isExam ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                                    )}>
                                                        {comp.isExam ? "Exam" : "CA"}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => { setEditingComponent(comp); setEditDialogOpen(true); }}
                                                            className="p-2 hover:bg-primary/10 rounded-full transition-colors text-primary"
                                                            title="Edit component"
                                                        >
                                                            <Pencil size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComponent(comp.id, comp.name)}
                                                            className="p-2 hover:bg-destructive/10 rounded-full transition-colors text-destructive"
                                                            title="Delete component"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Component Dialog */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>Edit Assessment Component</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={editingComponent?.name || ''}
                                onChange={(e) => setEditingComponent({ ...editingComponent, name: e.target.value, component: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Weight (%)</label>
                                <Input
                                    type="number"
                                    value={editingComponent?.weight || 0}
                                    onChange={(e) => setEditingComponent({ ...editingComponent, weight: Number(e.target.value) })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Max Score</label>
                                <Input
                                    type="number"
                                    value={editingComponent?.maxScore || 0}
                                    onChange={(e) => setEditingComponent({ ...editingComponent, maxScore: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="edit-isExam"
                                checked={editingComponent?.isExam || false}
                                onChange={(e) => setEditingComponent({ ...editingComponent, isExam: e.target.checked })}
                                className="h-4 w-4"
                            />
                            <label htmlFor="edit-isExam" className="text-sm font-medium">Is Exam (hidden from Open Day reports)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleEditComponent} disabled={saving}>
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
