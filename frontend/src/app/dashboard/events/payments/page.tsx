'use client';

import React, { useState, useEffect, useMemo } from 'react';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { EventsService, EventApplication } from '@/services/eventsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    Search,
    CreditCard,
    CheckCircle,
    XCircle,
    FileText,
    Download,
    Eye,
    TrendingUp,
    AlertCircle,
    ArrowUpDown,
    CheckCircle2
} from 'lucide-react';
import {
    TABLE_ROOT,
    TABLE_HEADER,
    TABLE_HEADER_CELL,
    TABLE_HEADER_CELL_NO_SORT,
    TABLE_BODY,
    TABLE_ROW,
    TABLE_CELL,
    TABLE_CELL_ACTIONS,
    PAGINATION_BAR,
    PAGINATION_INFO,
    PAGINATION_BUTTON,
    PAGINATION_BUTTON_ACTIVE
} from '@/lib/table-styles';

export default function PaymentsPage() {
    const { showError, showSuccess } = useNotification();
    
    const [applications, setApplications] = useState<EventApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
    const [receiptOpen, setReceiptOpen] = useState(false);
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('PENDING'); // default to pending verification
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 15;

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await EventsService.getAllApplications();
            // Filter only registrations that require payment or have payment receipts
            setApplications(data.filter(app => app.proofOfPaymentUrl || app.package?.fee));
        } catch (error) {
            showError('Failed to load payment applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleVerify = async (id: string, status: 'VERIFIED' | 'REJECTED') => {
        try {
            await EventsService.verifyPayment(id, status);
            showSuccess(`Payment status marked as ${status}`);
            fetchApplications();
        } catch (error) {
            showError('Failed to update payment verification');
        }
    };

    // Filtered applications
    const filteredApps = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                (app.event?.title && app.event.title.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesStatus = statusFilter === 'ALL' || app.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchTerm, statusFilter]);

    // Paginated applications
    const paginatedApps = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredApps.slice(start, start + pageSize);
    }, [filteredApps, currentPage]);

    const totalPages = Math.ceil(filteredApps.length / pageSize);

    // Sum of verified payments for metrics
    const totalCollected = useMemo(() => {
        return applications
            .filter(app => app.paymentStatus === 'VERIFIED')
            .reduce((sum, app) => sum + Number(app.package?.fee || 0), 0);
    }, [applications]);

    const totalPending = useMemo(() => {
        return applications
            .filter(app => app.paymentStatus === 'PENDING')
            .reduce((sum, app) => sum + Number(app.package?.fee || 0), 0);
    }, [applications]);

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">Verified</Badge>;
            case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase">Pending Verification</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold uppercase">Rejected</Badge>;
            default: return <Badge className="bg-muted text-muted-foreground text-[10px] font-bold uppercase">{status}</Badge>;
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-primary">Payment Verifications</h1>
                    <p className="text-muted-foreground text-sm font-medium mt-0.5">Audit transaction bank statements, check uploaded invoice receipts, verify boarder slots.</p>
                </div>

                {/* Financial Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Verified Collections</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">₦{totalCollected.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Pending Verification</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-amber-50 text-amber-600"><CreditCard className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">₦{totalPending.toLocaleString()}</p>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-primary/10 shadow-sm">
                        <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground uppercase">Total Applications (Paid)</span>
                            <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 text-blue-600"><TrendingUp className="h-4 w-4" /></div>
                        </CardHeader>
                        <CardContent className="pb-4 px-4">
                            <p className="text-2xl font-bold text-foreground">{applications.filter(a => a.paymentStatus === 'VERIFIED').length}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Board */}
                <div className="flex flex-col md:flex-row gap-3 items-center bg-card p-3.5 rounded-2xl border border-primary/10 shadow-sm">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by applicant name or event..."
                            className="pl-10 h-10 rounded-xl bg-muted/20 border-primary/10 font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <select
                        className="h-10 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer w-full md:w-48"
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">All Payments</option>
                        <option value="PENDING">Pending Verification</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="REJECTED">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-xl border border-primary/20 bg-card shadow-sm">
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[22%]"}>Applicant Name</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[22%]"}>Event Program</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[14%]"}>Package Selected</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[12%] text-right"}>Fee Due</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-center"}>Payment Slip</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-center"}>Status</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-right"}>Verification</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Loading payments...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="h-8 w-8 opacity-30 text-primary" />
                                            <span>No payment applications found.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedApps.map((app) => (
                                    <tr key={app.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL + " font-semibold text-foreground"}>
                                            <div className="truncate">{app.fullName}</div>
                                            <div className="text-[9px] text-muted-foreground font-mono truncate">{app.id}</div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="truncate">{app.event?.title}</div>
                                        </td>
                                        <td className={TABLE_CELL}>{app.package?.title}</td>
                                        <td className={TABLE_CELL + " text-right font-semibold"}>
                                            ₦{Number(app.package?.fee || 0).toLocaleString()}
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            {app.proofOfPaymentUrl ? (
                                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 rounded border-primary/20 text-primary font-bold hover:bg-primary/5" onClick={() => { setSelectedReceipt(app.proofOfPaymentUrl || null); setReceiptOpen(true); }}>
                                                    <Eye className="h-3 w-3" /> View Slip
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-[10px]">No Receipt Uploaded</span>
                                            )}
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>{getPaymentBadge(app.paymentStatus)}</td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex items-center justify-end gap-1">
                                                {app.paymentStatus === 'PENDING' ? (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 rounded" onClick={() => handleVerify(app.id, 'VERIFIED')} title="Approve Verification">
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50 rounded" onClick={() => handleVerify(app.id, 'REJECTED')} title="Reject Proof">
                                                            <XCircle className="h-4 w-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <span className="text-[10px] text-muted-foreground italic mr-2">Verified</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={PAGINATION_BAR}>
                        <p className={PAGINATION_INFO}>
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredApps.length)} of {filteredApps.length} verifications
                        </p>
                        <div className="flex items-center space-x-1">
                            <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className={PAGINATION_BUTTON + " h-8"} variant="outline">Previous</Button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                <Button key={page} onClick={() => setCurrentPage(page)} className={(page === currentPage ? PAGINATION_BUTTON_ACTIVE : PAGINATION_BUTTON) + " h-8 w-8 p-0"} variant={page === currentPage ? 'default' : 'outline'}>{page}</Button>
                            ))}
                            <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className={PAGINATION_BUTTON + " h-8"} variant="outline">Next</Button>
                        </div>
                    </div>
                )}

                {/* Receipt Preview Dialog */}
                {selectedReceipt && (
                    <Dialog open={receiptOpen} onOpenChange={setReceiptOpen}>
                        <DialogContent className="rounded-[2rem] max-w-lg border-primary/25">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold text-primary">Payment Receipt Preview</DialogTitle>
                            </DialogHeader>
                            <div className="p-2 border border-primary/10 rounded-2xl bg-muted/5 flex items-center justify-center min-h-[300px]">
                                {selectedReceipt.endsWith('.pdf') ? (
                                    <div className="text-center space-y-3 p-6">
                                        <FileText className="h-16 w-16 text-primary mx-auto opacity-75 animate-bounce" />
                                        <span className="text-sm font-semibold block">Uploaded Receipt is a PDF Document</span>
                                        <a href={selectedReceipt} target="_blank" rel="noreferrer">
                                            <Button className="font-bold gap-1 rounded-xl">
                                                <Download size={14} /> Open PDF in New Tab
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <img src={selectedReceipt} className="max-h-[50vh] w-auto rounded-xl object-contain shadow border" alt="Payment Proof" />
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <a href={selectedReceipt} download target="_blank" rel="noreferrer">
                                    <Button variant="outline" className="h-10 rounded-xl font-bold border-primary/10 gap-1 text-primary">
                                        <Download size={15} /> Download Document
                                    </Button>
                                </a>
                                <Button variant="default" className="h-10 rounded-xl font-bold px-6" onClick={() => setReceiptOpen(false)}>Close</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </RequireBranch>
    );
}
