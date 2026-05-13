"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BranchService } from "@/services/branchService";
import { ArrowLeft, Save, Building2, MapPin, Phone, Mail, Hash, Image, Palette } from "lucide-react";
import Link from "next/link";

export default function CreateBranchPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        email: "",
        logoUrl: "",
        primaryColor: "#2563EB"
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await BranchService.create(formData);
            router.push("/dashboard/branches");
        } catch (error: any) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to create branch:", error);
            alert("Failed to create branch. " + (error.response?.data?.message || "Check for duplicate code."));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/branches"
                        className="p-2 hover:bg-card border border-transparent hover:border-border rounded-xl transition-all text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Create New Branch</h1>
                        <p className="text-muted-foreground text-sm">Add a new campus or administrative branch to the system.</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="divide-y divide-border">
                    <div className="p-8 space-y-8">
                        {/* Essential Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" />
                                    Branch Name
                                </label>
                                <input
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g. Lagos City Campus"
                                    className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                                <p className="text-[11px] text-muted-foreground">The full official name of the branch.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Hash size={16} className="text-primary" />
                                    Branch Code
                                </label>
                                <input
                                    name="code"
                                    required
                                    value={formData.code}
                                    onChange={handleChange}
                                    placeholder="e.g. LCC-01"
                                    className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none uppercase"
                                />
                                <p className="text-[11px] text-muted-foreground">A unique identifier for internal records.</p>
                            </div>
                        </div>

                        {/* Contact Info Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Phone size={16} className="text-primary" />
                                    Phone Number
                                </label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+234 ..."
                                    className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                                <p className="text-[11px] text-muted-foreground">Main contact number for this branch.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Mail size={16} className="text-primary" />
                                    Official Email
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="branch@basaer.com"
                                    className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                />
                                <p className="text-[11px] text-muted-foreground">Email for administrative correspondence.</p>
                            </div>
                        </div>

                        {/* Address Section */}
                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin size={16} className="text-primary" />
                                Physical Address
                            </label>
                            <textarea
                                name="address"
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter the full physical address..."
                                className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                            />
                        </div>

                        {/* Branding Section */}
                        <div className="pt-6 border-t border-border">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Branch Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Image size={16} className="text-primary" />
                                        Logo URL
                                    </label>
                                    <input
                                        name="logoUrl"
                                        value={formData.logoUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    />
                                    <p className="text-[11px] text-muted-foreground">URL to the branch/school logo image.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Palette size={16} className="text-primary" />
                                        Primary Color
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color"
                                            name="primaryColor"
                                            value={formData.primaryColor}
                                            onChange={handleChange}
                                            className="w-14 h-12 p-1 bg-background border border-input rounded-xl cursor-pointer"
                                        />
                                        <input
                                            name="primaryColor"
                                            value={formData.primaryColor}
                                            onChange={handleChange}
                                            placeholder="#2563EB"
                                            className="flex-1 p-3 bg-background border border-input rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                        />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground">Brand color used in emails, reports, and certificates.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-6 bg-muted/30 flex items-center justify-end gap-3">
                        <Link
                            href="/dashboard/branches"
                            className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-border bg-card hover:bg-muted transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:shadow-none"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Branch
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
