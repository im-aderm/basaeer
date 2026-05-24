"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { FileText, Plus, Edit2, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { STAT_CARD, STAT_LABEL, STAT_VALUE } from "@/lib/table-styles";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import api from "@/lib/api";

export default function ExamTypesPage() {
    const { showSuccess, showError } = useNotification();
    const [examTypes, setExamTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        weightage: 0,
    });

    useEffect(() => {
        fetchExamTypes();
    }, []);

    const fetchExamTypes = async () => {
        try {
            const response = await api.get("/exams/types");
            setExamTypes(response.data);
        } catch (error) {
            showError("Failed to load exam types");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await api.patch(`/exams/types/${editingType.id}`, formData);
                showSuccess("Exam type updated successfully!");
            } else {
                await api.post("/exams/types", formData);
                showSuccess("Exam type created successfully!");
            }
            setIsDialogOpen(false);
            setEditingType(null);
            setFormData({ name: "", description: "", weightage: 0 });
            fetchExamTypes();
        } catch (error) {
            showError("Failed to save exam type");
        }
    };

    const handleEdit = (type: any) => {
        setEditingType(type);
        setFormData({
            name: type.name,
            description: type.description || "",
            weightage: type.weightage || 0,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await api.delete(`/exams/types/${confirmDeleteId}`);
            showSuccess("Exam type deleted successfully!");
            fetchExamTypes();
        } catch (error) {
            showError("Failed to delete exam type");
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const handleDuplicate = (type: any) => {
        setFormData({
            name: `${type.name} (Copy)`,
            description: type.description || "",
            weightage: type.weightage || 0,
        });
        setIsDialogOpen(true);
    };

    const columns = [
        {
            header: "Exam Type",
            accessorKey: "name",
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-md shrink-0">
                        <FileText className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-[12px] truncate">{row.name}</p>
                        <p className="text-[11px] text-foreground/60 truncate">
                            {row.description || "No description"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Weightage",
            accessorKey: "weightage",
            cell: (row: any) => (
                <span className="font-medium text-[12px]">{row.weightage || 0}%</span>
            ),
        },
        {
            header: "Exams",
            accessorKey: "_count.exams",
            cell: (row: any) => (
                <span className="text-foreground/60 text-[12px]">
                    {row._count?.exams || 0} exams
                </span>
            ),
        },
        {
            header: "Created",
            accessorKey: "createdAt",
            cell: (row: any) => <span className="text-[12px]">{new Date(row.createdAt).toLocaleDateString()}</span>,
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (row: any) => (
                <div className="flex gap-1">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(row)} className="h-7 text-[12px] px-2">
                        <Edit2 className="w-3 h-3 mr-1" />
                        Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(row)} className="h-7 text-[12px] px-2">
                        <Copy className="w-3 h-3 mr-1" />
                        Duplicate
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50 h-7 text-[12px] px-2"
                        onClick={() => handleDelete(row.id)}
                        disabled={row._count?.exams > 0}
                    >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
                <BranchContextBanner />
                {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">
                            Exam Types
                        </h1>
                        <p className="text-foreground/60 mt-1 text-[12px]">
                            Manage exam types and their weightage
                        </p>
                    </div>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) {
                                setEditingType(null);
                                setFormData({ name: "", description: "", weightage: 0 });
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Exam Type
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingType ? "Edit Exam Type" : "Add New Exam Type"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Exam Type Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        placeholder="e.g., Mid-Term Exam"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description (Optional)</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) =>
                                            setFormData({ ...formData, description: e.target.value })
                                        }
                                        rows={3}
                                        placeholder="Describe this exam type..."
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="weightage">Weightage (%)</Label>
                                    <Input
                                        id="weightage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={formData.weightage}
                                        onChange={(e) =>
                                            setFormData({ ...formData, weightage: parseInt(e.target.value) || 0 })
                                        }
                                        placeholder="e.g., 30"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">
                                        Percentage contribution to final grade
                                    </p>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        {editingType ? "Update" : "Create"} Exam Type
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-1 text-[14px]">
                    About Exam Types
                </h3>
                <p className="text-[12px] text-blue-700">
                    Exam types help categorize different kinds of examinations (e.g., Mid-Term, Final, Quiz).
                    Assign weightage to determine how much each exam type contributes to the final grade.
                    The total weightage across all exam types should ideally equal 100%.
                </p>
            </div>

            {/* Exam Types Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-primary/20">
                <h2 className="text-[14px] font-semibold mb-3">All Exam Types</h2>
                {examTypes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 mx-auto text-foreground/20 mb-3" />
                        <h3 className="text-[14px] font-semibold text-foreground/60 mb-1">
                            No exam types yet
                        </h3>
                        <p className="text-foreground/50 text-[12px] mb-3">
                            Create your first exam type to get started
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={examTypes} searchKey="name" />
                )}
            </div>

            {/* Common Exam Types Suggestions */}
            {examTypes.length === 0 && (
                <div className="mt-6 bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-primary/20">
                    <h3 className="font-semibold mb-3 text-[14px]">Common Exam Type Examples</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                            { name: "Mid-Term Exam", weightage: 30, desc: "Conducted mid-semester" },
                            { name: "Final Exam", weightage: 50, desc: "End of semester examination" },
                            { name: "Quiz", weightage: 10, desc: "Short assessments" },
                            { name: "Assignment", weightage: 10, desc: "Take-home assignments" },
                            { name: "Unit Test", weightage: 20, desc: "Tests after each unit" },
                            { name: "Practical Exam", weightage: 30, desc: "Hands-on assessments" },
                        ].map((suggestion) => (
                            <button
                                key={suggestion.name}
                                className="text-left p-3 rounded-lg border border-primary/20 hover:bg-primary/5 transition-colors"
                                onClick={() => {
                                    setFormData({
                                        name: suggestion.name,
                                        description: suggestion.desc,
                                        weightage: suggestion.weightage,
                                    });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-0.5">
                                    <p className="text-[12px] font-medium text-foreground">
                                        {suggestion.name}
                                    </p>
                                    <span className="text-[11px] font-semibold text-primary">
                                        {suggestion.weightage}%
                                    </span>
                                </div>
                                <p className="text-[11px] text-foreground/50">
                                    {suggestion.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Exam Type"
                message="Are you sure you want to delete this exam type? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
        </div>
        </RequireBranch>
    );
}
