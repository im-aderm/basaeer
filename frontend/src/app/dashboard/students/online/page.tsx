'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, Trash2, UserPlus, Copy, ExternalLink, Receipt } from 'lucide-react';
import { OnlineAdmissionService, OnlineAdmission } from '@/services/onlineAdmissionService';
import { BranchService, Branch } from "@/services/branchService";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import SharableLink from '@/components/admission/SharableLink';

import { AdmissionDetailDialog } from '@/components/admission/AdmissionDetailDialog';
import { 
    AlertDialog, 
    AlertDialogAction, 
    AlertDialogCancel, 
    AlertDialogContent, 
    AlertDialogDescription, 
    AlertDialogFooter, 
    AlertDialogHeader, 
    AlertDialogTitle 
} from "../../../../components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { PaginatedResponse } from '@/services/onlineAdmissionService';

export default function OnlineAdmissionsDashboard() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [rejectionTargetId, setRejectionTargetId] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [branches, setBranches] = useState<Branch[]>([]);
    const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [search, setSearch] = useState("");
    const limit = 50;

    const fetchAdmissions = async (branchId: string, pageNum = page, searchTerm = search) => {
        setLoading(true);
        try {
            const result = await OnlineAdmissionService.getAll(branchId, undefined, pageNum, limit, searchTerm || undefined);
            setAdmissions(result.data);
            setTotal(result.total);
            setPage(result.page);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch admissions:', error);
            showError('Failed to load admission applications');
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(total / limit);

    useEffect(() => {
        if (user) {
            if (resolvedBranchId) {
                fetchAdmissions(resolvedBranchId, 1, search);
            } else {
                BranchService.getAll().then(data => {
                    setBranches(data);
                    if (data.length > 0) {
                        fetchAdmissions(data[0].id, 1, search);
                    } else {
                        setLoading(false);
                    }
                }).catch(() => setLoading(false));
            }
        }
    }, [user]);

    const handleApprove = async (id: string) => {
        try {
            await OnlineAdmissionService.approve(id);
            showSuccess('Application approved and student enrolled!');
            if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
            setSelectedAdmission(null);
        } catch (error) {
            showError('Failed to approve application');
        }
    };

    const handleReject = async () => {
        if (!rejectionTargetId || !rejectionReason.trim()) {
            showError("Please provide a rejection reason");
            return;
        }

        try {
            await OnlineAdmissionService.reject(rejectionTargetId, rejectionReason);
            showSuccess('Application rejected');
            if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
            setRejectionTargetId(null);
            setRejectionReason("");
            setSelectedAdmission(null);
        } catch (error) {
            showError('Failed to reject application');
        }
    };

    const handleVerifyPayment = async (id: string) => {
        try {
            await OnlineAdmissionService.verifyPayment(id);
            showSuccess('Payment verified');
            if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
            if (selectedAdmission?.id === id) {
              const updated = await OnlineAdmissionService.getById(id);
              setSelectedAdmission(updated);
            }
        } catch (error) {
            showError('Failed to verify payment');
        }
    }

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await OnlineAdmissionService.delete(confirmDeleteId);
            showSuccess('Application deleted');
            if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Delete failed', error);
            showError('Failed to delete application');
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPLICATION_RECEIVED':
            case 'PENDING':
                return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-[12px]">NEW</Badge>;
            case 'APPROVED':
            case 'ENROLLED':
                return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold text-[12px]">ENROLLED</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-semibold text-[12px]">REJECTED</Badge>;
            default:
                return <Badge variant="outline" className="text-[12px]">{status}</Badge>;
        }
    };

    const getTypeBadge = (type?: string) => {
        if (!type) return null;
        return type === 'TRANSFER'
            ? <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-semibold text-[11px] ml-1.5">TRANSFER</Badge>
            : null;
    };

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className="bg-emerald-500 text-white font-semibold text-[12px] px-2 rounded-lg">PAID</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-semibold text-[12px] px-2 rounded-lg">FAILED</Badge>;
            default:
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold text-[12px] px-2 rounded-lg">PENDING</Badge>;
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="space-y-6">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Admission Control</h1>
                    <p className="text-muted-foreground font-medium italic">Review and manage incoming student applications.</p>
                </div>
            </div>

            {resolvedBranchId && (
                <SharableLink branchId={resolvedBranchId} />
            )}

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, email, phone, or admission number..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        const bid = resolvedBranchId || branches[0]?.id;
                        if (bid) fetchAdmissions(bid, 1, e.target.value);
                    }}
                    className="h-12 pl-10 rounded-2xl border-2 font-medium italic mb-4"
                />
            </div>

            <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden">
                <CardHeader className="p-8 bg-muted/30 border-b border-border">
                    <CardTitle className="text-h3 font-black italic uppercase flex items-center gap-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Application Pipeline
                        <span className="text-sm font-normal text-muted-foreground normal-case not-italic ml-auto">
                            {total} total
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-primary/5 border-b-2 border-primary/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="font-bold text-[12px] uppercase tracking-wide pl-4 h-10">Student</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wide h-10">Class</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wide h-10">Guardian</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wide h-10">Payment</TableHead>
                                <TableHead className="font-bold text-[12px] uppercase tracking-wide h-10">Status</TableHead>
                                <TableHead className="text-right font-bold text-[12px] uppercase tracking-wide pr-4 h-10">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admissions.map((adm) => (
                                <TableRow key={adm.id} className="border-primary/20 hover:bg-primary/5 transition-colors">
                                    <TableCell className="py-2 pl-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
                                                {adm.firstName[0]}{adm.lastName[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[12px] font-semibold truncate leading-tight">
                                                    {adm.firstName} {adm.lastName}
                                                    {getTypeBadge(adm.admissionType)}
                                                </p>
                                                <p className="text-[11px] text-muted-foreground font-medium">{new Date(adm.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-[12px] font-medium py-2">{adm.desiredClass?.name || 'N/A'}</TableCell>
                                    <TableCell className="py-2">
                                        <p className="text-[12px] font-medium leading-tight truncate max-w-[160px]">{adm.guardianName}</p>
                                        <p className="text-[11px] text-muted-foreground font-medium">{adm.guardianPhone}</p>
                                    </TableCell>
                                    <TableCell className="py-2">
                                        {getPaymentBadge(adm.paymentStatus)}
                                    </TableCell>
                                    <TableCell className="py-2">{getStatusBadge(adm.status)}</TableCell>
                                    <TableCell className="text-right pr-4 py-2">
                                        <div className="flex justify-end gap-1.5">
                                            <button
                                                onClick={() => setSelectedAdmission(adm)}
                                                className="h-8 px-3 rounded-lg text-primary hover:bg-primary/10 transition-all font-semibold text-[12px] inline-flex items-center gap-1 border border-primary/20"
                                            >
                                                <Eye className="h-3.5 w-3.5" /> View
                                            </button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 transition-all"
                                                onClick={() => handleDelete(adm.id)}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {admissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16 text-muted-foreground font-semibold italic opacity-30 text-lg">
                                        No applications yet
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-8 py-4 border-t border-border bg-muted/20">
                            <p className="text-[12px] font-medium text-muted-foreground">
                                Showing {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page <= 1}
                                    onClick={() => {
                                        const bid = resolvedBranchId || branches[0]?.id;
                                        if (bid) fetchAdmissions(bid, page - 1);
                                    }}
                                    className="h-8 rounded-xl font-bold text-[12px]"
                                >
                                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                                </Button>
                                <span className="text-[12px] font-medium text-muted-foreground px-2">
                                    Page {page} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={page >= totalPages}
                                    onClick={() => {
                                        const bid = resolvedBranchId || branches[0]?.id;
                                        if (bid) fetchAdmissions(bid, page + 1);
                                    }}
                                    className="h-8 rounded-xl font-bold text-[12px]"
                                >
                                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AdmissionDetailDialog 
                admission={selectedAdmission} 
                onClose={() => setSelectedAdmission(null)}
                onApprove={handleApprove}
                onReject={(id) => setRejectionTargetId(id)}
                onVerifyPayment={handleVerifyPayment}
            />

            <AlertDialog open={!!rejectionTargetId} onOpenChange={() => setRejectionTargetId(null)}>
                <AlertDialogContent className="rounded-[2.5rem] p-10">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-2xl font-black italic uppercase tracking-tight">Reject Application</AlertDialogTitle>
                        <AlertDialogDescription className="font-medium italic">
                            Please provide a reason for rejection. This will be visible to the parent.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-6 space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest ml-1">Reason for Rejection</Label>
                        <Input 
                            value={rejectionReason} 
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="e.g. Incomplete documents, Failed entrance test..."
                            className="h-12 rounded-2xl border-2 font-bold italic"
                        />
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-2xl h-12 font-bold italic">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleReject}
                            className="rounded-2xl h-12 font-black italic bg-destructive text-white hover:bg-destructive/90"
                        >
                            Confirm Rejection
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <ConfirmDialog
                isOpen={!!confirmDeleteId}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDeleteId(null)}
                title="Delete Application"
                message="Are you sure you want to delete this application? This action cannot be undone."
                confirmLabel="Delete"
                loading={deleting}
            />
            </div>
        </RequireBranch>
    );
}
