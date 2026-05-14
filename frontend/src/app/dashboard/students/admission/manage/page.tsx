"use client";

import { useState, useEffect } from "react";
import { OnlineAdmissionService, OnlineAdmission } from "@/services/onlineAdmissionService";
import { BranchService, Branch } from "@/services/branchService";
import { useAuth } from "@/context/AuthContext";
import {
    Users,
    Search,
    Filter,
    MoreHorizontal,
    Edit3,
    CheckCircle,
    XCircle,
    Eye,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Calendar,
    GraduationCap,
    Clock,
    UserCircle,
    ShieldAlert,
    Copy,
    ExternalLink,
    Receipt
} from "lucide-react";
import { clsx } from "clsx";
import SharableLink from "@/components/admission/SharableLink";

export default function AdmissionsManagementPage() {
    const { user } = useAuth();
    const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [resolvedBranchId, setResolvedBranchId] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            if (user.branchId) {
                setResolvedBranchId(user.branchId);
                fetchAdmissions(user.branchId);
            } else {
                // Super Admin case - fetch all branches to find a fallback
                BranchService.getAll().then(data => {
                    setBranches(data);
                    if (data.length > 0) {
                        setResolvedBranchId(data[0].id);
                        fetchAdmissions(data[0].id);
                    } else {
                        setLoading(false);
                    }
                }).catch(() => setLoading(false));
            }
        }
    }, [user]);

    const fetchAdmissions = async (branchId?: string) => {
        const idToUse = branchId || resolvedBranchId;
        if (!idToUse) return;
        try {
            const data = await OnlineAdmissionService.getAll(idToUse);
            setAdmissions(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch admissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        if (!confirm("Are you sure you want to approve this application and create a student record?")) return;
        setProcessingId(id);
        try {
            await OnlineAdmissionService.approve(id);
            alert("Application approved and student record created successfully!");
            fetchAdmissions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Approval failed:", error);
            alert("Approval failed. Please ensure the student doesn't already exist.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id: string) => {
        if (!confirm("Are you sure you want to reject this application?")) return;
        setProcessingId(id);
        try {
            await OnlineAdmissionService.update(id, { status: 'REJECTED' });
            fetchAdmissions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Rejection failed:", error);
        } finally {
            setProcessingId(null);
        }
    };

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED':
                return <span className="bg-emerald-500 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full">PAID</span>;
            case 'REJECTED':
                return <span className="bg-red-500 text-white font-semibold text-[10px] px-2 py-0.5 rounded-full">FAILED</span>;
            default:
                return <span className="bg-amber-500/20 text-amber-600 font-semibold text-[10px] px-2 py-0.5 rounded-full">PENDING</span>;
        }
    };

    const filteredAdmissions = (admissions ?? []).filter(adm => {
        const matchesSearch = `${adm.firstName} ${adm.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || adm.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 bg-card border border-border p-10 rounded-[3rem] shadow-2xl shadow-primary/5 relative overflow-hidden">
                <div className="space-y-3 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-semibold uppercase tracking-widest">
                        <Users size={14} /> Registrar Control
                    </div>
                    <h1 className="text-h1 font-semibold tracking-tight">Admission Management</h1>
                    <p className="text-muted-foreground font-medium text-lg">Process, verify and enroll prospective students into the academy.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            placeholder="Search applicants..."
                            className="pl-12 pr-6 py-4 bg-muted/30 border-2 border-transparent focus:border-primary/20 focus:bg-background rounded-2xl outline-none font-bold min-w-[300px] transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Sharable Link Section */}
            {resolvedBranchId && (
                <SharableLink branchId={resolvedBranchId} />
            )}

            {/* Stats / Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: "Total Applications", value: admissions.length, color: "bg-primary", status: "ALL" },
                    { label: "Pending Review", value: (admissions ?? []).filter(a => a.status === 'PENDING').length, color: "bg-yellow-500", status: "PENDING" },
                    { label: "Approved (Not Enrolled)", value: (admissions ?? []).filter(a => a.status === 'APPROVED').length, color: "bg-blue-500", status: "APPROVED" },
                    { label: "Enrolled", value: (admissions ?? []).filter(a => a.status === 'ENROLLED').length, color: "bg-green-500", status: "ENROLLED" },
                    { label: "Rejected", value: (admissions ?? []).filter(a => a.status === 'REJECTED').length, color: "bg-red-500", status: "REJECTED" },
                ].map(stat => (
                    <button
                        key={stat.status}
                        onClick={() => setStatusFilter(stat.status)}
                        className={clsx(
                            "p-8 rounded-[2.5rem] border transition-all text-left space-y-2 group shadow-lg",
                            statusFilter === stat.status ? "bg-card border-primary ring-4 ring-primary/10 scale-105" : "bg-card border-border hover:border-primary/30"
                        )}
                    >
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-h1 font-semibold">{stat.value}</h3>
                            <div className={clsx("w-3 h-3 rounded-full animate-pulse", stat.color)} />
                        </div>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-card border border-border rounded-[3.5rem] shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50">
                                <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Applicant</th>
                                <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Academic Intent</th>
                                <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Guardian Info</th>
                                <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {filteredAdmissions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-10 py-32 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground/30">
                                                <Users size={40} />
                                            </div>
                                            <p className="text-muted-foreground font-semibold text-h3">No applications found in this category.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredAdmissions.map(adm => (
                                    <tr key={adm.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 rounded-[1.25rem] bg-muted/30 flex items-center justify-center font-semibold text-h3 text-primary border-2 border-border group-hover:border-primary/20 transition-all">
                                                    {adm.firstName[0]}{adm.lastName[0]}
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-h3 tracking-tight">{adm.firstName} {adm.lastName}</p>
                                                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                                        <Clock size={12} /> Applied: {new Date(adm.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-1">
                                                <p className="font-semibold text-foreground flex items-center gap-2">
                                                    <GraduationCap size={16} className="text-primary" /> {adm.desiredClass?.name || "N/A"}
                                                </p>
                                                <p className="text-sm font-bold text-muted-foreground">{adm.academicSession?.name || "No Session"}</p>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2">
                                                <div className="space-y-1">
                                                    <p className="font-bold text-foreground">{adm.guardianName}</p>
                                                    <p className="text-sm font-bold text-muted-foreground">{adm.guardianPhone}</p>
                                                </div>
                                                <div className="flex flex-col gap-1.5 pt-1 border-t border-border/30">
                                                    {getPaymentBadge(adm.paymentStatus)}
                                                    {adm.paymentReceiptUrl && (
                                                        <a
                                                            href={adm.paymentReceiptUrl}
                                                            target="_blank"
                                                            className="text-[10px] text-primary font-semibold flex items-center gap-1 hover:underline group/receipt"
                                                        >
                                                            <Receipt className="h-3 w-3 group-hover/receipt:scale-110 transition-transform" /> VIEW RECEIPT
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className={clsx(
                                                "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest",
                                                adm.status === 'PENDING' ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" :
                                                    adm.status === 'ENROLLED' ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                                                        adm.status === 'APPROVED' ? "bg-blue-500/10 text-blue-600 border border-blue-500/20" :
                                                            "bg-red-500/10 text-red-600 border border-red-500/20"
                                            )}>
                                                <div className={clsx("w-1.5 h-1.5 rounded-full",
                                                    adm.status === 'PENDING' ? "bg-yellow-500" :
                                                        adm.status === 'ENROLLED' ? "bg-green-500" :
                                                            adm.status === 'APPROVED' ? "bg-blue-500" : "bg-red-500"
                                                )} />
                                                {adm.status}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3">
                                                <button className="p-3 bg-muted/20 hover:bg-primary/10 hover:text-primary rounded-xl transition-all" title="View Details">
                                                    <Eye size={20} />
                                                </button>
                                                {adm.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            disabled={processingId === adm.id}
                                                            onClick={() => handleApprove(adm.id)}
                                                            className="p-3 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                                                            title="Approve Policy"
                                                        >
                                                            {processingId === adm.id ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                                        </button>
                                                        <button
                                                            disabled={processingId === adm.id}
                                                            onClick={() => handleReject(adm.id)}
                                                            className="p-3 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-all disabled:opacity-50"
                                                            title="Reject Policy"
                                                        >
                                                            {processingId === adm.id ? <Loader2 size={20} className="animate-spin" /> : <XCircle size={20} />}
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Warning Dialog */}
            <div className="p-10 bg-yellow-500/5 border-2 border-yellow-500/20 rounded-[3rem] flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 shrink-0">
                    <ShieldAlert size={32} />
                </div>
                <div className="space-y-1 text-center md:text-left">
                    <h4 className="text-h3 font-semibold text-yellow-600">Administrative Advisory</h4>
                    <p className="text-yellow-600/70 font-bold leading-relaxed max-w-4xl">Approving an application will automatically generate a new Student ID and a portal account. Ensure all uploaded documents have been verified against school policy before final enrollment.</p>
                </div>
            </div>
        </div>
    );
}
