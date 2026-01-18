"use client";

import { useEffect, useState } from "react";
import { Branch, BranchService } from "@/services/branchService";
import {
    Plus,
    Trash2,
    Edit,
    Building2,
    MapPin,
    Phone,
    Mail,
    MoreVertical,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Search
} from "lucide-react";
import { clsx } from "clsx";

export default function BranchesPage() {
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        email: "",
        isActive: true
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchBranches = async () => {
        setLoading(true);
        try {
            const data = await BranchService.getAll();
            setBranches(data);
        } catch (error) {
            console.error("Failed to fetch branches:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleOpenModal = (branch?: Branch) => {
        if (branch) {
            setEditingBranch(branch);
            setFormData({
                name: branch.name,
                code: branch.code,
                address: branch.address || "",
                phone: branch.phone || "",
                email: branch.email || "",
                isActive: branch.isActive
            });
        } else {
            setEditingBranch(null);
            setFormData({
                name: "",
                code: "",
                address: "",
                phone: "",
                email: "",
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (editingBranch) {
                await BranchService.update(editingBranch.id, formData);
            } else {
                await BranchService.create(formData);
            }
            await fetchBranches();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save branch:", error);
            alert("An error occurred while saving the branch.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this branch? All associated laboratory data, students, and employees will be restricted.")) {
            try {
                await BranchService.delete(id);
                fetchBranches();
            } catch (error) {
                console.error("Failed to delete branch:", error);
            }
        }
    };

    const filteredBranches = branches.filter(b =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Branch Management</h1>
                    <p className="text-muted-foreground mt-1">Manage multiple school campuses and campuses-specific settings.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            className="pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none w-64 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        Add Branch
                    </button>
                </div>
            </div>

            {/* Grid of Branches */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBranches.map((branch) => (
                    <div key={branch.id} className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                        <div className="p-6 border-b border-border bg-muted/30 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:scale-110 transition-transform">
                                    <Building2 size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{branch.name}</h3>
                                    <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{branch.code}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {branch.isActive ? (
                                    <span className="p-1 text-green-600 bg-green-500/10 rounded-full">
                                        <CheckCircle2 size={16} />
                                    </span>
                                ) : (
                                    <span className="p-1 text-orange-500 bg-orange-500/10 rounded-full">
                                        <AlertCircle size={16} />
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                                    <p className="text-muted-foreground line-clamp-2">{branch.address || "No address provided"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-muted-foreground shrink-0" />
                                    <p className="text-muted-foreground">{branch.phone || "No phone number"}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-muted-foreground shrink-0" />
                                    <p className="text-muted-foreground truncate">{branch.email || "No email address"}</p>
                                </div>
                            </div>

                            <div className="pt-4 flex items-center gap-3">
                                <button
                                    onClick={() => handleOpenModal(branch)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-muted hover:bg-muted/80 rounded-xl text-sm font-semibold transition-colors"
                                >
                                    <Edit size={14} /> Edit Details
                                </button>
                                <button
                                    onClick={() => handleDelete(branch.id)}
                                    className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 rounded-xl transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredBranches.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                            <Building2 size={40} className="text-muted-foreground/30" />
                        </div>
                        <h2 className="text-xl font-bold">No branches found</h2>
                        <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Try adjusting your search or create a new branch to get started.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <form onSubmit={handleSubmit}>
                            <div className="p-8 border-b border-border bg-muted/20">
                                <h3 className="text-2xl font-bold">{editingBranch ? "Edit Branch" : "Create New Branch"}</h3>
                                <p className="text-muted-foreground text-sm mt-1">Fill in the details below to {editingBranch ? "update the" : "register a new"} school campus.</p>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Campus Name</label>
                                        <input
                                            required
                                            name="name"
                                            placeholder="e.g. Main Campus"
                                            className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Campus Code</label>
                                        <input
                                            required
                                            name="code"
                                            placeholder="e.g. MC-01"
                                            className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                            value={formData.code}
                                            onChange={handleChange}
                                            disabled={!!editingBranch}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Physical Address</label>
                                    <input
                                        name="address"
                                        placeholder="123 Education Way, Lagos"
                                        className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        value={formData.address}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Phone Number</label>
                                        <input
                                            name="phone"
                                            placeholder="+234 ..."
                                            className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.phone}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Email Address</label>
                                        <input
                                            name="email"
                                            type="email"
                                            placeholder="campus@basaeer.com"
                                            className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.email}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-dashed border-border">
                                    <input
                                        type="checkbox"
                                        id="branchActive"
                                        name="isActive"
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <div>
                                        <label htmlFor="branchActive" className="text-sm font-bold block">Active Status</label>
                                        <p className="text-xs text-muted-foreground">Inactive branches cannot have new students admitted.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-border bg-muted/20 flex items-center justify-end gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold hover:bg-muted bg-card border border-border rounded-xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-10 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 font-bold disabled:opacity-50 flex items-center gap-2"
                                >
                                    {submitting && <Loader2 size={18} className="animate-spin" />}
                                    {editingBranch ? "Update Details" : "Create Campus"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
