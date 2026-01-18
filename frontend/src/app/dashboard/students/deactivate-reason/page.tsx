"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import api from "@/lib/api";

export default function DeactivationReasonPage() {
    const [reasons, setReasons] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingReason, setEditingReason] = useState<any>(null);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    useEffect(() => {
        fetchReasons();
    }, []);

    const fetchReasons = async () => {
        try {
            const response = await api.get("/students/deactivation-reasons");
            setReasons(response.data);
        } catch (error) {
            toast.error("Failed to load deactivation reasons");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingReason) {
                await api.patch(`/students/deactivation-reasons/${editingReason.id}`, formData);
                toast.success("Reason updated successfully!");
            } else {
                await api.post("/students/deactivation-reasons", formData);
                toast.success("Reason created successfully!");
            }
            setIsDialogOpen(false);
            setEditingReason(null);
            setFormData({ title: "", description: "" });
            fetchReasons();
        } catch (error) {
            toast.error("Failed to save reason");
        }
    };

    const handleEdit = (reason: any) => {
        setEditingReason(reason);
        setFormData({
            title: reason.title,
            description: reason.description || "",
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this reason?")) return;

        try {
            await api.delete(`/students/deactivation-reasons/${id}`);
            toast.success("Reason deleted successfully!");
            fetchReasons();
        } catch (error) {
            toast.error("Failed to delete reason");
        }
    };

    const columns = [
        {
            header: "Title",
            accessorKey: "title",
            cell: (row: any) => (
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/30 dark:to-orange-900/30 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{row.title}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
                            {row.description || "No description"}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            header: "Usage Count",
            accessorKey: "_count",
            cell: (row: any) => (
                <span className="text-slate-600 dark:text-slate-400">
                    {row._count?.deactivations || 0} times
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
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(row)}
                    >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(row.id)}
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-orange-950/10 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Deactivation Reasons
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Manage predefined reasons for student login deactivation
                        </p>
                    </div>
                    <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => {
                            setIsDialogOpen(open);
                            if (!open) {
                                setEditingReason(null);
                                setFormData({ title: "", description: "" });
                            }
                        }}
                    >
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Reason
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingReason ? "Edit Reason" : "Add New Reason"}
                                </DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="title">Reason Title</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) =>
                                            setFormData({ ...formData, title: e.target.value })
                                        }
                                        placeholder="e.g., Disciplinary Action"
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
                                        rows={4}
                                        placeholder="Provide additional context for this reason..."
                                    />
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
                                        {editingReason ? "Update" : "Create"} Reason
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    About Deactivation Reasons
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Create predefined reasons to streamline the student login deactivation process.
                    These reasons will be available as quick-select options when deactivating student
                    accounts, ensuring consistency and proper documentation.
                </p>
            </div>

            {/* Reasons Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4">Predefined Reasons</h2>
                {reasons.length === 0 ? (
                    <div className="text-center py-12">
                        <FileText className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            No reasons defined yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500 mb-4">
                            Create your first deactivation reason to get started
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={reasons} searchKey="title" />
                )}
            </div>

            {/* Common Reasons Suggestions */}
            {reasons.length === 0 && (
                <div className="mt-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <h3 className="font-semibold mb-4">Common Deactivation Reasons</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            "Disciplinary Action",
                            "Fee Payment Issues",
                            "Transferred to Another School",
                            "Temporary Suspension",
                            "Graduated/Left School",
                            "Parent Request",
                            "Academic Probation",
                            "Medical Leave",
                        ].map((suggestion) => (
                            <button
                                key={suggestion}
                                className="text-left p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                onClick={() => {
                                    setFormData({ title: suggestion, description: "" });
                                    setIsDialogOpen(true);
                                }}
                            >
                                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {suggestion}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Click to add
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
