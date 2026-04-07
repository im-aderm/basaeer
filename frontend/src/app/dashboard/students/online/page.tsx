'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, Trash2, UserPlus, Copy, ExternalLink, Receipt } from 'lucide-react';
import { OnlineAdmissionService, OnlineAdmission } from '@/services/onlineAdmissionService';
import { BranchService, Branch } from "@/services/branchService";
import { toast } from 'sonner';
import SharableLink from '@/components/admission/SharableLink';

export default function OnlineAdmissionsDashboard() {
    const { user } = useAuth();
    const [selectedAdmission, setSelectedAdmission] = useState<OnlineAdmission | null>(null);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [resolvedBranchId, setResolvedBranchId] = useState<string | null>(null);
    const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmissions = async (branchId: string) => {
        setLoading(true);
        try {
            const data = await OnlineAdmissionService.getAll(branchId);
            setAdmissions(data);
        } catch (error) {
            console.error('Failed to fetch admissions:', error);
            toast.error('Failed to load admission applications');
        } finally {
            setLoading(false);
        }
    };

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

    const handleApprove = async (id: string) => {
        try {
            await OnlineAdmissionService.approve(id);
            toast.success('Application approved successfully');
            if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
        } catch (error) {
            console.error('Approval failed', error);
            toast.error('Failed to approve application');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await OnlineAdmissionService.delete(id);
                toast.success('Application deleted');
                if (resolvedBranchId) fetchAdmissions(resolvedBranchId);
            } catch (error) {
                console.error('Delete failed', error);
                toast.error('Failed to delete application');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-semibold">PENDING</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-semibold">APPROVED</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-semibold">REJECTED</Badge>;
            case 'ENROLLED':
                return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-semibold">ENROLLED</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status?: string) => {
        switch (status) {
            case 'VERIFIED':
                return <Badge className="bg-emerald-500 text-white font-semibold text-[10px] px-2">PAID</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-semibold text-[10px] px-2">FAILED</Badge>;
            default:
                return <Badge variant="secondary" className="font-semibold text-[10px] px-2">PENDING</Badge>;
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight">Online Admissions</h1>
                    <p className="text-muted-foreground font-medium">Review and process online admission applications.</p>
                </div>
            </div>

            {resolvedBranchId && (
                <SharableLink branchId={resolvedBranchId} />
            )}

            <Card className="rounded-[2rem] shadow-2xl shadow-primary/5 border-border/50 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Application List
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="font-semibold h-14">Student Name</TableHead>
                                    <TableHead className="font-semibold h-14">Applied Class</TableHead>
                                    <TableHead className="font-semibold h-14">Guardian</TableHead>
                                    <TableHead className="font-semibold h-14">Payment</TableHead>
                                    <TableHead className="font-semibold h-14">Status</TableHead>
                                    <TableHead className="font-semibold h-14">Applied Date</TableHead>
                                    <TableHead className="text-right font-semibold h-14 px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admissions.map((adm) => (
                                    <TableRow key={adm.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                                                    {adm.firstName[0]}{adm.lastName[0]}
                                                </div>
                                                <div>
                                                    <p>{adm.firstName} {adm.lastName}</p>
                                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">{adm.email || adm.phone}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold text-sm tracking-tight">{adm.desiredClass?.name || 'N/A'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium text-sm">{adm.guardianName}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">{adm.guardianPhone}</p>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                {getPaymentBadge(adm.paymentStatus)}
                                                {adm.paymentReceiptUrl && (
                                                    <a href={adm.paymentReceiptUrl} target="_blank" className="text-[10px] text-primary font-semibold flex items-center gap-1 hover:underline">
                                                        <Receipt className="h-3 w-3" /> VIEW RECEIPT
                                                    </a>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(adm.status)}</TableCell>
                                        <TableCell className="text-muted-foreground font-medium text-sm">
                                            {new Date(adm.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex justify-end gap-2">
                                                {adm.status === 'PENDING' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-9 w-9 rounded-xl text-emerald-600 hover:bg-emerald-500/10 transition-all border border-emerald-500/10"
                                                        onClick={() => handleApprove(adm.id)}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 rounded-xl text-primary hover:bg-primary/10 transition-all border border-primary/10"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-9 w-9 rounded-xl text-destructive hover:bg-destructive/10 transition-all border border-destructive/10"
                                                    onClick={() => handleDelete(adm.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {admissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-12 text-muted-foreground font-medium text-lg uppercase tracking-widest opacity-50">
                                            No applications found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
