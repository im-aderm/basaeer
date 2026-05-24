"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
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
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function GradingPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [activeTab, setActiveTab] = useState<"scales" | "components">("scales");
    
    // Grading Scales State
    const [scales, setScales] = useState<GradingScale[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedBranchId, setSelectedBranchId] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [confirmDeleteName, setConfirmDeleteName] = useState("");

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
            showSuccess("Component updated");
            setEditDialogOpen(false);
            setEditingComponent(null);
            await fetchData();
        } catch (error) {
            showError("Failed to update component");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteComponent = async (id: string, name: string) => {
        setConfirmDeleteId(id);
        setConfirmDeleteName(name);
    };

    const handleConfirmDeleteComponent = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await AcademicService.deleteAssessmentComponent(confirmDeleteId);
            showSuccess("Component deactivated");
            await fetchData();
        } catch (error) {
            showError("Failed to delete component");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
            setConfirmDeleteName("");
        }
    };

    const handleAddScale = async () => {
        if (!newScale.grade || newScale.minScore === undefined) return;
        setSaving(true);
        try {
            await ExamService.createGradingScale(newScale as GradingScale);
            showSuccess("Grading rule added");
            await fetchData();
            setNewScale({
                name: "Standard",
                minScore: 0,
                maxScore: 100,
                grade: "",
                remark: ""
            });
        } catch (error) {
            showError("Failed to create scale");
        } finally {
            setSaving(false);
        }
    };

    const handleAddComponent = async () => {
        if (!newComponent.name || !newComponent.component) return;
        setSaving(true);
        try {
            await AcademicService.createAssessmentComponent(newComponent);
            showSuccess("Assessment component added");
            await fetchData();
            setNewComponent({
                name: "",
                component: "",
                weight: 0,
                maxScore: 100,
                isExam: false,
            });
        } catch (error) {
            showError("Failed to create component");
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
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Award className="text-primary w-10 h-10" />
                        Grading Configuration
                    </h1>
                    <p className="text-foreground/60 mt-2 text-[12px]">Define how performance is calculated and translated into grades.</p>
                </div>

                <div className="flex bg-muted/30 p-1 rounded-xl border border-primary/20">
                    <button 
                        onClick={() => setActiveTab("scales")}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                            activeTab === "scales" ? "bg-white text-primary shadow-sm" : "text-foreground/60 hover:text-foreground"
                        )}
                    >
                        Grading Scales
                    </button>
                    <button 
                        onClick={() => setActiveTab("components")}
                        className={clsx(
                            "px-4 py-1.5 rounded-lg text-[12px] font-semibold transition-all",
                            activeTab === "components" ? "bg-white text-primary shadow-sm" : "text-foreground/60 hover:text-foreground"
                        )}
                    >
                        Assessment Components
                    </button>
                </div>
            </div>

            {activeTab === "scales" ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Scale Form */}
                        <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white/75 border border-primary/20 rounded-2xl p-4 space-y-4 shadow-sm">
                            <h2 className="text-[14px] font-semibold flex items-center gap-2">
                                <Plus className="text-primary" size={16} /> Add New Grade
                            </h2>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Grade Label (e.g. A1)</label>
                                    <input
                                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                        value={newScale.grade}
                                        onChange={e => setNewScale({ ...newScale, grade: e.target.value })}
                                        placeholder="A1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Min Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                            value={newScale.minScore}
                                            onChange={e => setNewScale({ ...newScale, minScore: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Max Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                            value={newScale.maxScore}
                                            onChange={e => setNewScale({ ...newScale, maxScore: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Remark</label>
                                    <input
                                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                        value={newScale.remark}
                                        onChange={e => setNewScale({ ...newScale, remark: e.target.value })}
                                        placeholder="Excellent"
                                    />
                                </div>

                                <button
                                    onClick={handleAddScale}
                                    disabled={saving || !newScale.grade}
                                    className="w-full py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 text-[12px]"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Save Grading Rule"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scale List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/75 border border-primary/20 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-primary">
                            <div className="p-4 border-b border-primary/20 bg-muted/10">
                                <h2 className="text-[14px] font-semibold tracking-tight text-primary flex items-center gap-2">
                                    <Sliders className="text-primary" size={18} />
                                    Active Grading Scale
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className={TABLE_ROOT}>
                                    <thead>
                                        <tr className={TABLE_HEADER}>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Grade</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Range</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Remark</th>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-right")}>Scope</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {scales.map((scale) => (
                                            <tr key={scale.id} className={TABLE_ROW}>
                                                <td className={TABLE_CELL_PRIMARY}>
                                                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/10 text-primary rounded-lg font-semibold text-[12px]">
                                                        {scale.grade}
                                                    </span>
                                                </td>
                                                <td className={TABLE_CELL_PRIMARY}>
                                                    {scale.minScore} - {scale.maxScore}
                                                </td>
                                                <td className={TABLE_CELL}>
                                                    {scale.remark || "No remark"}
                                                </td>
                                                <td className={clsx(TABLE_CELL, "text-right")}>
                                                    <span className={clsx(
                                                        "px-2 py-1 rounded-full text-[10px] font-semibold",
                                                        scale.branchId ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" : "bg-primary/10 text-primary border border-primary/20"
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
                        <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white/75 border border-primary/20 rounded-2xl p-4 space-y-4 shadow-sm">
                            <h2 className="text-[14px] font-semibold flex items-center gap-2">
                                <Layers className="text-primary" size={16} /> Define Component
                            </h2>

                            <div className="space-y-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Display Name (e.g. Test 1)</label>
                                    <input
                                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                        value={newComponent.name}
                                        onChange={e => setNewComponent({ ...newComponent, name: e.target.value })}
                                        placeholder="First Continuous Assessment"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Short Code (e.g. CA1)</label>
                                    <input
                                        className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                        value={newComponent.component}
                                        onChange={e => setNewComponent({ ...newComponent, component: e.target.value })}
                                        placeholder="CA1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Weight (%)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                            value={newComponent.weight}
                                            onChange={e => setNewComponent({ ...newComponent, weight: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Max Score</label>
                                        <input
                                            type="number"
                                            className="w-full p-2.5 bg-white border border-primary/20 rounded-lg focus:border-primary outline-none font-semibold text-[12px]"
                                            value={newComponent.maxScore}
                                            onChange={e => setNewComponent({ ...newComponent, maxScore: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 bg-muted/20 rounded-lg">
                                    <input 
                                        type="checkbox" 
                                        id="isExam" 
                                        className="w-4 h-4 rounded accent-primary"
                                        checked={newComponent.isExam}
                                        onChange={e => setNewComponent({ ...newComponent, isExam: e.target.checked })}
                                    />
                                    <label htmlFor="isExam" className="text-[12px] font-semibold cursor-pointer">This is a Summative Exam</label>
                                </div>

                                <button
                                    onClick={handleAddComponent}
                                    disabled={saving || !newComponent.name}
                                    className="w-full py-2 bg-primary text-white rounded-lg font-semibold shadow-sm hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 text-[12px]"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin mx-auto" /> : "Add Component"}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl space-y-2">
                            <div className="flex items-center gap-2 text-primary font-semibold text-[12px]">
                                <Percent size={14} /> Weighting System
                            </div>
                            <p className="text-[10px] text-primary-800/70 font-medium leading-relaxed">
                                Components with "Is Exam" checked will be hidden from **Open Day** reports. The sum of all component weights for a term should ideally equal 100%.
                            </p>
                        </div>
                    </div>

                    {/* Component List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/75 border border-primary/20 rounded-2xl shadow-sm overflow-hidden border-t-4 border-t-primary">
                            <div className="p-4 border-b border-primary/20 bg-muted/10">
                                <h2 className="text-[14px] font-semibold tracking-tight text-primary flex items-center gap-2">
                                    <Layout className="text-primary" size={18} />
                                    Active Components
                                </h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className={TABLE_ROOT}>
                                    <thead>
                                        <tr className={TABLE_HEADER}>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Component</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Code</th>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-center")}>Weight</th>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-center")}>Max Score</th>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-right")}>Type</th>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "text-right")}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {components.map((comp) => (
                                            <tr key={comp.id} className={TABLE_ROW}>
                                                <td className={TABLE_CELL_PRIMARY}>
                                                    {comp.name}
                                                </td>
                                                <td className={TABLE_CELL}>
                                                    <span className="px-2 py-0.5 bg-muted rounded-md font-mono text-[10px] font-semibold">{comp.component}</span>
                                                </td>
                                                <td className={clsx(TABLE_CELL, "text-center")}>
                                                    <span className="font-bold text-primary">{comp.weight}%</span>
                                                </td>
                                                <td className={clsx(TABLE_CELL, "text-center")}>
                                                    <span className="text-foreground/60">{comp.maxScore}</span>
                                                </td>
                                                <td className={clsx(TABLE_CELL, "text-right")}>
                                                    <span className={clsx(
                                                        "px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase",
                                                        comp.isExam ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                                    )}>
                                                        {comp.isExam ? "Exam" : "CA"}
                                                    </span>
                                                </td>
                                                <td className={TABLE_CELL_ACTIONS}>
                                                    <div className="flex justify-end gap-1.5">
                                                        <button
                                                            onClick={() => { setEditingComponent(comp); setEditDialogOpen(true); }}
                                                            className="p-1.5 hover:bg-primary/10 rounded-md transition-colors text-primary"
                                                            title="Edit component"
                                                        >
                                                            <Pencil size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteComponent(comp.id, comp.name)}
                                                            className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors text-destructive"
                                                            title="Delete component"
                                                        >
                                                            <Trash2 size={14} />
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
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDeleteComponent}
                onCancel={() => { setConfirmDeleteId(null); setConfirmDeleteName(""); }}
                title="Delete Component"
                message={`Delete "${confirmDeleteName}"? This will deactivate the component but keep existing scores.`}
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
        </RequireBranch>
    );
}
