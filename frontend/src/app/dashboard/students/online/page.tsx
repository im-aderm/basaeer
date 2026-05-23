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

    const fetchAdmissions = async (branchId: string) => {
        setLoading(true);
        try {
            const data = await OnlineAdmissionService.getAll(branchId);
            setAdmissions(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch admissions:', error);
            showError('Failed to load admission applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            if (resolvedBranchId) {
                // resolvedBranchId from useAuth()
                fetchAdmissions(resolvedBranchId);
            } else {
                BranchService.getAll().then(data => {
                    setBranches(data);
                    if (data.length > 0) {
                        // resolvedBranchId from useAuth();
                        fetchAdmissions(data[0].id);
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
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold">PENDING</Badge>;
            case 'APPROVED':
            case 'ENROLLED':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">ENROLLED</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-semibold text-[10px] tracking-widest">REJECTED</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className="bg-emerald-500 text-white font-bold text-[10px] px-2 rounded-lg">PAID</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-bold text-[10px] px-2 rounded-lg">FAILED</Badge>;
            default:
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold text-[10px] px-2 rounded-lg">PENDING</Badge>;
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

            <Card className="rounded-[2.5rem] shadow-2xl border-none overflow-hidden">
                <CardHeader className="p-8 bg-muted/30 border-b border-border">
                    <CardTitle className="text-h3 font-black italic uppercase flex items-center gap-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Application Pipeline
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow className="hover:bg-transparent border-border/50">
                                <TableHead className="font-black h-16 uppercase text-[10px] tracking-widest pl-8">Student</TableHead>
                                <TableHead className="font-black h-16 uppercase text-[10px] tracking-widest">Applied Class</TableHead>
                                <TableHead className="font-black h-16 uppercase text-[10px] tracking-widest">Guardian</TableHead>
                                <TableHead className="font-black h-16 uppercase text-[10px] tracking-widest">Payment</TableHead>
                                <TableHead className="font-black h-16 uppercase text-[10px] tracking-widest">Status</TableHead>
                                <TableHead className="text-right font-black h-16 uppercase text-[10px] tracking-widest pr-8">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {admissions.map((adm) => (
                                <TableRow key={adm.id} className="border-border/50 hover:bg-primary/5 transition-colors group">
                                    <TableCell className="py-6 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs shadow-inner">
                                                {adm.firstName[0]}{adm.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="font-black italic ">{adm.firstName} {adm.lastName}</p>
                                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{new Date(adm.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-bold">{adm.desiredClass?.name || 'N/A'}</TableCell>
                                    <TableCell>
                                        <p className="font-bold text-sm italic">{adm.guardianName}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold tracking-tighter">{adm.guardianPhone}</p>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getPaymentBadge(adm.paymentStatus)}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(adm.status)}</TableCell>
                                    <TableCell className="text-right pr-8">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                className="h-10 px-4 rounded-xl text-primary hover:bg-primary/10 transition-all border-2 border-primary/5 font-black italic uppercase text-[10px]"
                                                onClick={() => setSelectedAdmission(adm)}
                                            >
                                                <Eye className="h-4 w-4 mr-1.5" /> Details
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all border-2 border-destructive/5"
                                                onClick={() => handleDelete(adm.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {admissions.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-black italic uppercase tracking-widest opacity-30 text-2xl">
                                        Queue Empty
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
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
