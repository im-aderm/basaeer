"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { OnlineAdmissionService, OnlineAdmission } from "@/services/onlineAdmissionService";
import { BulkExportService } from "@/services/bulkExportService";
import { BranchService, Branch } from "@/services/branchService";
import { useAuth } from "@/context/AuthContext";
import {
    Users,
    Search,
    CheckCircle,
    XCircle,
    Eye,
    Loader2,
    GraduationCap,
    Clock,
    ShieldAlert,
    Receipt,
    ArrowUp,
    ArrowDown,
    FileDown,
    Archive,
} from "lucide-react";
import { clsx } from "clsx";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import SharableLink from "@/components/admission/SharableLink";
import { AdmissionDetailDialog } from "@/components/admission/AdmissionDetailDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE, STATUS_TAB, STATUS_TAB_ACTIVE, STATUS_TAB_INACTIVE, SORT_ICON } from "@/lib/table-styles";

type SortField = "name" | "class" | "guardian" | "status" | "payment" | "date";

export default function AdmissionsManagementPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [bulkExporting, setBulkExporting] = useState(false);
    const [bulkProgress, setBulkProgress] = useState(0);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject', id: string } | null>(null);
    const [processing, setProcessing] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [sortField, setSortField] = useState<SortField>("date");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    useEffect(() => {
        if (user) {
            if (resolvedBranchId) {
                fetchAdmissions(resolvedBranchId);
            } else {
                BranchService.getAll().then(data => {
                    setBranches(data);
                    if (data.length > 0) {
                        fetchAdmissions(data[0].id);
                    } else {
                        setLoading(false);
                    }
                }).catch(() => setLoading(false));
            }
        }
    }, [user]);

    const fetchAdmissions = async (branchId?: string) => {
        const idToUse = branchId !== undefined ? branchId : resolvedBranchId;
        try {
            const result = await OnlineAdmissionService.getAll(idToUse);
            setAdmissions(result.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch admissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        setConfirmAction({ type: 'approve', id });
    };

    const handleBulkDownloadSlips = async () => {
        setBulkExporting(true);
        setBulkProgress(0);
        try {
            // Exports the most recent admission slips for the active branch as a ZIP.
            await BulkExportService.runAndDownload("ADMISSION_SLIP", {}, setBulkProgress);
            showSuccess("Admission slips downloaded.");
        } catch (e: any) {
            showError(e?.message || "Bulk download failed. Please try again.");
        } finally {
            setBulkExporting(false);
            setBulkProgress(0);
        }
    };

    const handleDownloadSlip = async (adm: OnlineAdmission) => {
        setDownloadingId(adm.id);
        try {
            const ref = adm.admissionNumber || `${adm.firstName}-${adm.lastName}`;
            await OnlineAdmissionService.downloadSlip(adm.id, `admission-slip-${ref}.pdf`);
        } catch {
            showError("Could not download the admission slip. Please try again.");
        } finally {
            setDownloadingId(null);
        }
    };

    const handleConfirmAction = async () => {
        if (!confirmAction) return;
        setProcessing(true);
        try {
            if (confirmAction.type === 'approve') {
                await OnlineAdmissionService.approve(confirmAction.id);
                showSuccess("Application approved and student record created successfully!");
            }
            fetchAdmissions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Action failed:", error);
            if (confirmAction.type === 'approve') {
                showError("Approval failed. Please ensure the student doesn't already exist.");
            }
        } finally {
            setProcessing(false);
            setConfirmAction(null);
            setProcessingId(null);
        }
    };

    const handleRejectClick = (id: string) => {
        setProcessingId(id);
        setConfirmAction({ type: 'reject', id });
        setShowRejectDialog(true);
    };

    const handleVerifyPayment = async (id: string) => {
        try {
            await OnlineAdmissionService.verifyPayment(id);
            showSuccess("Payment verified successfully!");
            fetchAdmissions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Payment verification failed:", error);
            showError("Payment verification failed");
        }
    };

    const handleConfirmReject = async () => {
        if (!confirmAction) return;
        if (!rejectReason.trim()) {
            showError("Please provide a rejection reason");
            return;
        }
        setProcessing(true);
        try {
            await OnlineAdmissionService.reject(confirmAction.id, rejectReason);
            showSuccess("Application rejected");
            setShowRejectDialog(false);
            setRejectReason("");
            fetchAdmissions();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Rejection failed:", error);
            showError("Rejection failed");
        } finally {
            setProcessing(false);
            setConfirmAction(null);
            setProcessingId(null);
        }
    };

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const SortIndicator = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className={SORT_ICON}>↕</span>;
        return <span className={SORT_ICON}>{sortDirection === "asc" ? <ArrowUp size={10} /> : <ArrowDown size={10} />}</span>;
    };

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED':
                return <span className="bg-emerald-500/10 text-emerald-600 font-semibold text-[11px] px-2 py-0.5 rounded-full border border-emerald-500/20">PAID</span>;
            case 'REJECTED':
                return <span className="bg-red-500/10 text-red-600 font-semibold text-[11px] px-2 py-0.5 rounded-full border border-red-500/20">FAILED</span>;
            default:
                return <span className="bg-amber-500/10 text-amber-600 font-semibold text-[11px] px-2 py-0.5 rounded-full border border-amber-500/20">PENDING</span>;
        }
    };

    const filteredAdmissions = (admissions ?? []).filter(adm => {
        const matchesSearch = `${adm.firstName} ${adm.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "ALL" || adm.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedAdmissions = [...filteredAdmissions].sort((a, b) => {
        let cmp = 0;
        switch (sortField) {
            case "name":
                cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                break;
            case "class":
                cmp = (a.desiredClass?.name || "").localeCompare(b.desiredClass?.name || "");
                break;
            case "guardian":
                cmp = (a.guardianName || "").localeCompare(b.guardianName || "");
                break;
            case "status":
                cmp = (a.status || "").localeCompare(b.status || "");
                break;
            case "payment":
                cmp = (a.paymentStatus || "").localeCompare(b.paymentStatus || "");
                break;
            case "date":
                cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                break;
        }
        return sortDirection === "asc" ? cmp : -cmp;
    });

    const statusCounts = {
        ALL: admissions.length,
        PENDING: (admissions ?? []).filter(a => a.status === 'PENDING').length,
        APPROVED: (admissions ?? []).filter(a => a.status === 'APPROVED').length,
        ENROLLED: (admissions ?? []).filter(a => a.status === 'ENROLLED').length,
        REJECTED: (admissions ?? []).filter(a => a.status === 'REJECTED').length,
    };

    const statusTabs = [
        { label: "All", status: "ALL" },
        { label: "New", status: "PENDING" },
        { label: "Approved", status: "APPROVED" },
        { label: "Enrolled", status: "ENROLLED" },
        { label: "Rejected", status: "REJECTED" },
    ];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-[1600px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 px-4">
                <BranchContextBanner />

                {/* Header */}
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/75 border border-primary/20 p-5 rounded-2xl shadow-sm">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-[11px] font-semibold uppercase tracking-wide">
                            <Users size={12} /> Registrar
                        </div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">Admission Management</h1>
                        <p className="text-foreground/60 text-[12px] font-medium">Process, verify and enroll prospective students.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 group-focus-within:text-primary transition-colors" size={16} />
                            <input
                                placeholder="Search applicants..."
                                className="pl-10 pr-4 py-2.5 bg-muted/30 border border-primary/20 focus:border-primary/40 rounded-xl outline-none text-[12px] font-medium min-w-[260px] transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleBulkDownloadSlips}
                            disabled={bulkExporting}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-60 rounded-xl text-[12px] font-semibold transition-all whitespace-nowrap"
                            title="Download admission slips for this branch as a ZIP"
                        >
                            {bulkExporting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    {bulkProgress > 0 ? `${bulkProgress}%` : "Preparing…"}
                                </>
                            ) : (
                                <>
                                    <Archive size={14} /> Download All Slips
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Sharable Link */}
                {resolvedBranchId && <SharableLink branchId={resolvedBranchId} />}

                {/* Status Tabs */}
                <div className="flex items-center gap-2 flex-wrap">
                    {statusTabs.map(tab => (
                        <button
                            key={tab.status}
                            onClick={() => setStatusFilter(tab.status)}
                            className={clsx(STATUS_TAB, statusFilter === tab.status ? STATUS_TAB_ACTIVE : STATUS_TAB_INACTIVE)}
                        >
                            {tab.label}
                            <span className="ml-1.5 text-[10px] opacity-70">{statusCounts[tab.status as keyof typeof statusCounts]}</span>
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white/75 border border-primary/20 rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("name")}>
                                        Applicant <SortIndicator field="name" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("class")}>
                                        Class <SortIndicator field="class" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("guardian")}>
                                        Guardian <SortIndicator field="guardian" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("status")}>
                                        Status <SortIndicator field="status" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("payment")}>
                                        Payment <SortIndicator field="payment" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL} onClick={() => handleSort("date")}>
                                        Date <SortIndicator field="date" />
                                    </th>
                                    <th className={TABLE_HEADER_CELL + " text-right"}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {sortedAdmissions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-16 text-center text-foreground/50 text-[12px]">
                                            <div className="flex flex-col items-center gap-2">
                                                <Users size={24} className="text-foreground/20" />
                                                <p>No applications found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sortedAdmissions.map(adm => (
                                        <tr key={adm.id} className={TABLE_ROW + " group"}>
                                            <td className={TABLE_CELL_PRIMARY}>
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-semibold text-[11px] shrink-0">
                                                        {adm.firstName[0]}{adm.lastName[0]}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-[12px] truncate">{adm.firstName} {adm.lastName}</p>
                                                        <p className="text-[11px] text-foreground/50 flex items-center gap-1">
                                                            <Clock size={10} /> {new Date(adm.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap size={12} className="text-primary shrink-0" />
                                                    <span className="truncate">{adm.desiredClass?.name || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-medium truncate">{adm.guardianName}</p>
                                                    <p className="text-[11px] text-foreground/50 truncate">{adm.guardianPhone}</p>
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <span className={clsx(
                                                    "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                                                    adm.status === 'PENDING' ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                                                    adm.status === 'ENROLLED' ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                                                    adm.status === 'APPROVED' ? "bg-primary/10 text-primary border border-primary/20" :
                                                    "bg-red-500/10 text-red-600 border border-red-500/20"
                                                )}>
                                                    <div className={clsx("w-1.5 h-1.5 rounded-full",
                                                        adm.status === 'PENDING' ? "bg-amber-500" :
                                                        adm.status === 'ENROLLED' ? "bg-emerald-500" :
                                                        adm.status === 'APPROVED' ? "bg-primary" : "bg-red-500"
                                                    )} />
                                                    {adm.status}
                                                </span>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <div className="flex items-center gap-2">
                                                    {getPaymentBadge(adm.paymentStatus)}
                                                    {adm.paymentReceiptUrl && (
                                                        <a href={adm.paymentReceiptUrl} target="_blank" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                                                            <Receipt size={10} /> Receipt
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={TABLE_CELL}>
                                                <span className="text-[11px] text-foreground/60">{new Date(adm.createdAt).toLocaleDateString()}</span>
                                            </td>
                                            <td className={TABLE_CELL_ACTIONS}>
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => setSelectedAdmission(adm)}
                                                        className="p-1.5 rounded-md text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all"
                                                        title="View Details"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    <button
                                                        disabled={downloadingId === adm.id}
                                                        onClick={() => handleDownloadSlip(adm)}
                                                        className="p-1.5 rounded-md text-foreground/60 hover:text-primary hover:bg-primary/10 disabled:opacity-50 transition-all"
                                                        title="Download Admission Slip"
                                                    >
                                                        {downloadingId === adm.id ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
                                                    </button>
                                                    {adm.status === 'PENDING' && (
                                                        <>
                                                            <button
                                                                disabled={processingId === adm.id}
                                                                onClick={() => handleApprove(adm.id)}
                                                                className="p-1.5 rounded-md text-primary hover:bg-primary/10 disabled:opacity-50 transition-all"
                                                                title="Approve"
                                                            >
                                                                {processingId === adm.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                                            </button>
                                                            <button
                                                                disabled={processingId === adm.id}
                                                                onClick={() => handleRejectClick(adm.id)}
                                                                className="p-1.5 rounded-md text-red-600 hover:bg-red-500/10 disabled:opacity-50 transition-all"
                                                                title="Reject"
                                                            >
                                                                {processingId === adm.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
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

                {/* Advisory */}
                <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-center gap-4">
                    <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-500 shrink-0">
                        <ShieldAlert size={20} />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-[12px] font-semibold text-amber-600">Administrative Advisory</h4>
                        <p className="text-[12px] text-amber-600/70 font-medium">Approving an application generates a Student ID and portal account. Verify all documents before enrollment.</p>
                    </div>
                </div>

                {/* Detail Dialog */}
                {selectedAdmission && (
                    <AdmissionDetailDialog
                        admission={selectedAdmission}
                        onClose={() => setSelectedAdmission(null)}
                        onApprove={(id) => { handleApprove(id); setSelectedAdmission(null); }}
                        onReject={(id) => { handleRejectClick(id); setSelectedAdmission(null); }}
                        onVerifyPayment={handleVerifyPayment}
                    />
                )}

                {/* Approve Confirm */}
                <ConfirmDialog
                    isOpen={!!confirmAction && confirmAction.type === 'approve'}
                    onConfirm={handleConfirmAction}
                    onCancel={() => { setConfirmAction(null); setProcessingId(null); }}
                    title="Approve Application"
                    message="Are you sure you want to approve this application and create a student record?"
                    confirmLabel="Approve"
                    loading={processing}
                />

                {/* Reject Dialog with Reason */}
                <Dialog open={showRejectDialog} onOpenChange={(open: boolean) => { if (!open) { setShowRejectDialog(false); setConfirmAction(null); setProcessingId(null); } }}>
                    <DialogContent className="rounded-2xl border-primary/20">
                        <DialogHeader>
                            <DialogTitle className="text-[16px] font-semibold text-red-600 flex items-center gap-2">
                                <XCircle size={18} /> Reject Application
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            <div>
                                <Label htmlFor="reject-reason" className="text-[12px] font-medium">Rejection Reason *</Label>
                                <Textarea
                                    id="reject-reason"
                                    value={rejectReason}
                                    onChange={e => setRejectReason(e.target.value)}
                                    rows={3}
                                    placeholder="Provide a reason for rejection..."
                                    className="text-[12px] border-primary/20 focus:border-primary"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => { setShowRejectDialog(false); setConfirmAction(null); setProcessingId(null); }} className="text-[12px]">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmReject}
                                disabled={processing || !rejectReason.trim()}
                                className="bg-red-500 hover:bg-red-600 text-[12px]"
                            >
                                {processing ? <Loader2 size={14} className="animate-spin mr-2" /> : null}
                                Reject
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </RequireBranch>
    );
}
