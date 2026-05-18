"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Download,
    Printer,
    Trash2,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CertificateVaultPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/certificates?branchId=${resolvedBranchId}`);
            setCertificates(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleDownload = async (certId: string) => {
        try {
            const res = await api.get(`/certificates/${certId}/pdf`);
            const base64 = res.data;
            const link = document.createElement("a");
            link.href = `data:application/pdf;base64,${base64}`;
            link.download = `certificate-${certId}.pdf`;
            link.click();
        } catch (error) {
            showError("Download failed");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/certificates/${confirmDelete}`);
            showSuccess("Certificate deleted successfully");
            fetchData();
        } catch (error) {
            showError("Delete failed");
        } finally {
            setConfirmDelete(null);
        }
    };

    const filtered = (certificates ?? []).filter((cert) => {
        if (!searchTerm) return true;
        const q = searchTerm.toLowerCase();
        const name =
            `${cert.student?.firstName || ""} ${cert.student?.lastName || ""}`.toLowerCase();
        const num = (cert.certificateNumber || "").toLowerCase();
        return name.includes(q) || num.includes(q);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <FileText className="text-primary w-10 h-10" />
                        Certificate Vault
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">
                        Browse and manage all issued certificates.
                    </p>
                </div>
            </div>

            <div className="relative max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                    placeholder="Search by student name or certificate number..."
                    className="pl-12 rounded-2xl bg-muted/30 border-none h-14 text-lg font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
                        <FileText size={40} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-h3 font-semibold tracking-tight">
                        {searchTerm ? "No Matching Certificates" : "No Certificates Issued"}
                    </h3>
                    <p className="text-muted-foreground font-medium mt-2 max-w-md">
                        {searchTerm
                            ? "Try adjusting your search term."
                            : "Certificates will appear here once issued to students."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.map((cert) => (
                        <Card
                            key={cert.id}
                            className="rounded-[2rem] border-border/50 shadow-xl hover:shadow-2xl transition-all group hover:scale-[1.02] overflow-hidden"
                        >
                            <CardContent className="p-0">
                                <div className="p-8 pb-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                            <FileText size={28} />
                                        </div>
                                        {cert.isVerified ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                <CheckCircle2 size={12} /> Verified
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                <XCircle size={12} /> Unverified
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-1">
                                        {cert.type?.replace(/_/g, " ")}
                                    </p>
                                    <p className="text-sm font-mono font-bold text-primary mb-4">
                                        {cert.certificateNumber}
                                    </p>
                                    <p className="font-semibold text-base tracking-tight">
                                        {cert.student?.firstName} {cert.student?.lastName}
                                    </p>
                                    <p className="text-xs text-muted-foreground font-medium mt-1">
                                        Issued: {new Date(cert.issueDate).toLocaleDateString("en-US", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </p>
                                </div>
                                <div className="flex border-t border-border/50 divide-x divide-border/50">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-12 rounded-none hover:bg-primary/10 hover:text-primary transition-all gap-2"
                                        onClick={() => handleDownload(cert.id)}
                                    >
                                        <Download size={16} /> PDF
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-12 rounded-none hover:bg-primary/10 hover:text-primary transition-all gap-2"
                                        onClick={() => handleDownload(cert.id)}
                                    >
                                        <Printer size={16} /> Print
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-1 h-12 rounded-none text-red-500 hover:bg-red-500/10 transition-all gap-2"
                                        onClick={() => handleDelete(cert.id)}
                                    >
                                        <Trash2 size={16} /> Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Certificate"
                message="Are you sure you want to delete this certificate? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
    );
}
