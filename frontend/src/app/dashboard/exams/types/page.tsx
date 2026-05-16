"use client";

import { useState, useEffect } from "react";
import { FileText, Plus, Edit2, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ExamTypesPage() {
    const [examTypes, setExamTypes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<any>(null);
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
            toast.error("Failed to load exam types");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingType) {
                await api.patch(`/exams/types/${editingType.id}`, formData);
                toast.success("Exam type updated successfully!");
            } else {
                await api.post("/exams/types", formData);
                toast.success("Exam type created successfully!");
            }
            setIsDialogOpen(false);
            setEditingType(null);
            setFormData({ name: "", description: "", weightage: 0 });
            fetchExamTypes();
        } catch (error) {
            toast.error("Failed to save exam type");
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
        if (!confirm("Are you sure you want to delete this exam type?")) return;

        try {
            await api.delete(`/exams/types/${id}`);
            toast.success("Exam type deleted successfully!");
            fetchExamTypes();
        } catch (error) {
            toast.error("Failed to delete exam type");
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
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">{row.name}</p>
                        <p className="text-sm text-slate-600 line-clamp-1">
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
                <span className="font-medium">{row.weightage || 0}%</span>
            ),
        },
        {
            header: "Exams",
            accessorKey: "_count.exams",
            cell: (row: any) => (
                <span className="text-slate-600">
                    {row._count?.exams || 0} exams
                </span>
            ),
        },
        {
            header: "Created",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (row: any) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(row)}>
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDuplicate(row)}>
                        <Copy className="w-4 h-4 mr-1" />
                        Duplicate
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(row.id)}
                        disabled={row._count?.exams > 0}
                    >
                        <Trash2 className="w-4 h-4 mr-1" />
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">
                            Exam Types
                        </h1>
                        <p className="text-slate-600 mt-2">
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
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 mb-2">
                    About Exam Types
                </h3>
                <p className="text-sm text-blue-700">
                    Exam types help categorize different kinds of examinations (e.g., Mid-Term, Final, Quiz).
                    Assign weightage to determine how much each exam type contributes to the final grade.
                    The total weightage across all exam types should ideally equal 100%.
                </p>
            </div>

            {/* Exam Types Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <h2 className="text-xl font-semibold mb-4">All Exam Types</h2>
                {examTypes.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No exam types yet
                        </h3>
                        <p className="text-slate-500 mb-4">
                            Create your first exam type to get started
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={examTypes} searchKey="name" />
                )}
            </div>

            {/* Common Exam Types Suggestions */}
            {examTypes.length === 0 && (
                <div className="mt-8 bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <h3 className="font-semibold mb-4">Common Exam Type Examples</h3>
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
                                className="text-left p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                                onClick={() => {
                                    setFormData({
                                        name: suggestion.name,
                                        description: suggestion.desc,
                                        weightage: suggestion.weightage,
                                    });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-slate-900">
                                        {suggestion.name}
                                    </p>
                                    <span className="text-xs font-semibold text-blue-600">
                                        {suggestion.weightage}%
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">
                                    {suggestion.desc}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
