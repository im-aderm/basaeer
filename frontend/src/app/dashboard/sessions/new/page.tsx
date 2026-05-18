"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Calendar, ArrowLeft, Info, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateSessionPage() {
    const router = useRouter();
    const { user, activeBranchId, refreshSessions, switchSession } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        status: "CURRENT" as "UPCOMING" | "CURRENT" | "COMPLETED",
        description: "",
        terms: 3,
        markingPeriod: "MONTHLY" as "MONTHLY" | "QUARTERLY" | "TERM_BASED",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Session name is required";
        } else if (!/^\d{4}[/\-]\d{4}$/.test(formData.name)) {
            newErrors.name = "Use format like 2026/2027 or 2026-2027";
        }

        if (!formData.startDate) {
            newErrors.startDate = "Start date is required";
        }

        if (!formData.endDate) {
            newErrors.endDate = "End date is required";
        }

        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);
            if (start >= end) {
                newErrors.endDate = "End date must be after start date";
            }
            if (end.getTime() - start.getTime() > 365 * 24 * 60 * 60 * 1000 * 2) {
                newErrors.endDate = "Session cannot exceed 2 years";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        if (!activeBranchId) {
            toast.error("Please select a branch first");
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/academic-sessions", {
                name: formData.name,
                startDate: formData.startDate,
                endDate: formData.endDate,
                status: formData.status,
                branchId: activeBranchId,
            });

            // Refresh session list in AuthContext
            await refreshSessions();

            // Auto-select the new session
            if (res.data?.id) {
                localStorage.setItem("basaer-active-session", res.data.id);
                await api.post("/auth/select-session", { sessionId: res.data.id });
            }

            toast.success("Academic session created successfully!");

            // Navigate back to previous page
            router.back();
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create session";
            toast.error(message);
            if (error.response?.data?.message?.includes("already exists")) {
                setErrors({ name: "A session with this name already exists for this branch" });
            }
        } finally {
            setLoading(false);
        }
    };

    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Create Academic Session</h1>
                        <p className="text-muted-foreground text-sm">
                            Set up a new academic year for your campus
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl mb-8">
                <div className="flex gap-3">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-blue-600 mb-1">What is an Academic Session?</p>
                        <p className="text-sm text-muted-foreground">
                            An academic session represents a school year (e.g., 2026/2027). All students, classes, exams, grades, and financial records are organized under a session. You can have multiple sessions but only one can be <strong>Current</strong> at a time.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Session Name */}
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Session Details</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">
                                Session Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder={`e.g., ${currentYear}/${nextYear}`}
                                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background ${
                                    errors.name ? "border-red-500" : "border-border"
                                }`}
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    {errors.name}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                                Format: YYYY/YYYY (e.g., 2026/2027)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    Start Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background ${
                                        errors.startDate ? "border-red-500" : "border-border"
                                    }`}
                                />
                                {errors.startDate && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.startDate}
                                    </p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">
                                    End Date <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.endDate}
                                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background ${
                                        errors.endDate ? "border-red-500" : "border-border"
                                    }`}
                                />
                                {errors.endDate && (
                                    <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {errors.endDate}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Status</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: "CURRENT", label: "Current", desc: "Active now", color: "emerald" },
                                    { value: "UPCOMING", label: "Upcoming", desc: "Future session", color: "amber" },
                                    { value: "COMPLETED", label: "Completed", desc: "Past session", color: "muted" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: option.value as any })}
                                        className={`p-3 rounded-lg border text-left transition-all ${
                                            formData.status === option.value
                                                ? `border-${option.color}-500 bg-${option.color}-500/10`
                                                : "border-border hover:border-primary/30"
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-3 h-3 rounded-full ${
                                                option.color === "emerald" ? "bg-emerald-500" :
                                                option.color === "amber" ? "bg-amber-500" : "bg-muted-foreground"
                                            }`} />
                                            <span className="text-sm font-medium">{option.label}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Session Configuration */}
                <div className="p-6 bg-card border border-border rounded-xl">
                    <h2 className="text-lg font-semibold mb-4">Session Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Number of Terms</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[1, 2, 3, 4].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, terms: num })}
                                        className={`p-3 rounded-lg border text-center transition-all ${
                                            formData.terms === num
                                                ? "border-primary bg-primary/10 text-primary font-medium"
                                                : "border-border hover:border-primary/30"
                                        }`}
                                    >
                                        {num} {num === 1 ? "Term" : "Terms"}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                How many terms/semesters in this academic year?
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Marking Period</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { value: "MONTHLY", label: "Monthly", desc: "Every month" },
                                    { value: "QUARTERLY", label: "Quarterly", desc: "Every 3 months" },
                                    { value: "TERM_BASED", label: "Term Based", desc: "Per term" },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, markingPeriod: option.value as any })}
                                        className={`p-3 rounded-lg border text-left transition-all ${
                                            formData.markingPeriod === option.value
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/30"
                                        }`}
                                    >
                                        <p className="text-sm font-medium">{option.label}</p>
                                        <p className="text-xs text-muted-foreground">{option.desc}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Creating...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-4 h-4" />
                                <span>Create Session</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
