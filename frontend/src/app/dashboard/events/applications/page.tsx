'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { EventsService, EventApplication } from '@/services/eventsService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
    Search,
    Filter,
    Eye,
    Check,
    X,
    FileText,
    Download,
    Printer,
    Mail,
    AlertCircle,
    ArrowUpDown,
    CheckCircle2,
    XCircle,
    Clock,
    UserCheck,
    Lock
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

export default function ApplicationsPage() {
    const searchParams = useSearchParams();
    const eventIdParam = searchParams.get('eventId');
    const { user } = useAuth();
    const { showSuccess, showError } = useNotification();

    const [applications, setApplications] = useState<EventApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<EventApplication | null>(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<{ url: string; label: string } | null>(null);

    // Filter and sorting states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [paymentFilter, setPaymentFilter] = useState('ALL');
    const [eventFilter, setEventFilter] = useState(eventIdParam || 'ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState<keyof EventApplication>('createdAt');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const pageSize = 15;

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const data = await EventsService.getAllApplications();
            setApplications(data);
        } catch (error) {
            showError('Failed to load applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    // Get list of unique events for filter dropdown
    const uniqueEvents = useMemo(() => {
        const map = new Map<string, string>();
        applications.forEach(app => {
            if (app.eventId && app.event?.title) {
                map.set(app.eventId, app.event.title);
            }
        });
        return Array.from(map.entries()).map(([id, title]) => ({ id, title }));
    }, [applications]);

    const handleSort = (field: keyof EventApplication) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentPage(1);
    };

    // Filtered Applications
    const filteredApps = useMemo(() => {
        return applications
            .filter(app => {
                const matchesSearch = app.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (app.parentName && app.parentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    app.id.includes(searchTerm);
                const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
                const matchesPayment = paymentFilter === 'ALL' || app.paymentStatus === paymentFilter;
                const matchesEvent = eventFilter === 'ALL' || app.eventId === eventFilter;
                return matchesSearch && matchesStatus && matchesPayment && matchesEvent;
            })
            .sort((a, b) => {
                let aVal = a[sortField];
                let bVal = b[sortField];
                // Resolve nested values if needed
                if (sortField === 'createdAt') {
                    aVal = new Date(a.createdAt).getTime();
                    bVal = new Date(b.createdAt).getTime();
                }
                if (aVal == null) return 1;
                if (bVal == null) return -1;
                const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
                return sortDirection === 'asc' ? cmp : -cmp;
            });
    }, [applications, searchTerm, statusFilter, paymentFilter, eventFilter, sortField, sortDirection]);

    const paginatedApps = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredApps.slice(start, start + pageSize);
    }, [filteredApps, currentPage]);

    const totalPages = Math.ceil(filteredApps.length / pageSize);

    // Status Action triggers
    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            await EventsService.updateApplicationStatus(id, newStatus);
            showSuccess(`Application status updated to ${newStatus}`);
            fetchApplications();
            // Update detail modal state if open
            if (selectedApp?.id === id) {
                setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
            }
        } catch (error) {
            showError('Failed to update application status');
        }
    };

    const handlePaymentUpdate = async (id: string, newPaymentStatus: string) => {
        try {
            await EventsService.verifyPayment(id, newPaymentStatus);
            showSuccess(`Payment verified as ${newPaymentStatus}`);
            fetchApplications();
            // Update detail modal state if open
            if (selectedApp?.id === id) {
                setSelectedApp(prev => prev ? { ...prev, paymentStatus: newPaymentStatus } : null);
            }
        } catch (error) {
            showError('Failed to verify payment status');
        }
    };

    const viewDetails = (app: EventApplication) => {
        setSelectedApp(app);
        setDetailOpen(true);
    };

    const printApplication = () => {
        if (!selectedApp) return;
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <html>
            <head>
                <title>Print Application - ${selectedApp.fullName}</title>
                <style>
                    body { font-family: system-ui, sans-serif; color: #111; margin: 40px; }
                    .header { text-align: center; border-bottom: 2px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
                    .header h1 { margin: 0; color: #1e3a8a; font-size: 24px; }
                    .header p { margin: 5px 0 0 0; color: #4B5563; font-size: 14px; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-bottom: 15px; color: #1e3a8a; text-transform: uppercase; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .field { font-size: 12px; }
                    .label { font-weight: bold; color: #4b5563; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 2px; }
                    .value { font-size: 13px; font-weight: 500; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>BASAEER ERP & SCHOOLS</h1>
                    <p>Registration Slip - Event Application</p>
                </div>
                
                <div class="section">
                    <div class="section-title">Event & Package Details</div>
                    <div class="grid">
                        <div class="field"><span class="label">Event Name</span><span class="value">${selectedApp.event?.title || 'Unknown'}</span></div>
                        <div class="field"><span class="label">Selected Package</span><span class="value">${selectedApp.package?.title || 'Unknown'} (NGN ${Number(selectedApp.package?.fee || 0).toLocaleString()})</span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Applicant Information</div>
                    <div class="grid">
                        <div class="field"><span class="label">Full Name</span><span class="value">${selectedApp.fullName}</span></div>
                        <div class="field"><span class="label">Gender</span><span class="value">${selectedApp.gender}</span></div>
                        <div class="field"><span class="label">Date of Birth</span><span class="value">${new Date(selectedApp.dateOfBirth).toLocaleDateString()}</span></div>
                        <div class="field"><span class="label">Age</span><span class="value">${selectedApp.age} Years</span></div>
                        <div class="field"><span class="label">Parent/Guardian Name</span><span class="value">${selectedApp.parentName || 'N/A'}</span></div>
                        <div class="field"><span class="label">Emergency Contact</span><span class="value">${selectedApp.emergencyContact}</span></div>
                        <div class="field"><span class="label">Address</span><span class="value">${selectedApp.address || 'N/A'}</span></div>
                        <div class="field"><span class="label">State / LGA</span><span class="value">${selectedApp.state || 'N/A'} / ${selectedApp.localGovernment || 'N/A'}</span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Educational & Religious Info</div>
                    <div class="grid">
                        <div class="field"><span class="label">Current Memorization Level</span><span class="value">${selectedApp.memorizationLevel || 'N/A'}</span></div>
                        <div class="field"><span class="label">Islamic Background</span><span class="value">${selectedApp.islamicBackground || 'N/A'}</span></div>
                        <div class="field"><span class="label">Current School</span><span class="value">${selectedApp.school || 'N/A'}</span></div>
                        <div class="field"><span class="label">Previous Participation</span><span class="value">${selectedApp.previousParticipation || 'N/A'}</span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Medical / Health Status</div>
                    <div class="grid">
                        <div class="field"><span class="label">Medical Conditions</span><span class="value">${selectedApp.medicalConditions || 'None'}</span></div>
                        <div class="field"><span class="label">Allergies</span><span class="value">${selectedApp.allergies || 'None'}</span></div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Registration Metadata</div>
                    <div class="grid">
                        <div class="field"><span class="label">Application Reference ID</span><span class="value">${selectedApp.id}</span></div>
                        <div class="field"><span class="label">Submission Date</span><span class="value">${new Date(selectedApp.createdAt).toLocaleString()}</span></div>
                        <div class="field"><span class="label">Application Status</span><span class="value">${selectedApp.status}</span></div>
                        <div class="field"><span class="label">Payment Status</span><span class="value">${selectedApp.paymentStatus}</span></div>
                    </div>
                </div>
                
                <script>window.print();</script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">Approved</Badge>;
            case 'PENDING': return <Badge className="bg-blue-50/50 text-blue-600 border border-blue-200 text-[10px] font-bold uppercase">Pending</Badge>;
            case 'UNDER_REVIEW': return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase">Under Review</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold uppercase">Rejected</Badge>;
            case 'WAITLISTED': return <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 text-[10px] font-bold uppercase">Waitlisted</Badge>;
            default: return <Badge className="bg-muted text-muted-foreground text-[10px] font-bold uppercase">{status}</Badge>;
        }
    };

    const getPaymentBadge = (status: string) => {
        switch (status) {
            case 'VERIFIED': return <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-bold uppercase">Verified</Badge>;
            case 'PENDING': return <Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/20 text-[10px] font-bold uppercase">Pending</Badge>;
            case 'REJECTED': return <Badge className="bg-red-500/10 text-red-600 border border-red-500/20 text-[10px] font-bold uppercase">Rejected</Badge>;
            default: return <Badge className="bg-muted text-muted-foreground text-[10px] font-bold uppercase">{status}</Badge>;
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 pb-20">
                <BranchContextBanner />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-primary">Event Applications</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-0.5">Manage event registration profiles, audit documentation uploads, verify boarding fees.</p>
                    </div>
                </div>

                {/* Filters Board */}
                <div className="grid gap-3 md:grid-cols-4 items-center bg-card p-3.5 rounded-2xl border border-primary/10 shadow-sm">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by applicant name or registration ID..."
                            className="pl-10 h-10 rounded-xl bg-muted/20 border-primary/10 font-medium text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                    <select
                        className="h-10 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer"
                        value={eventFilter}
                        onChange={(e) => { setEventFilter(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="ALL">All Events</option>
                        {uniqueEvents.map(evt => (
                            <option key={evt.id} value={evt.id}>{evt.title}</option>
                        ))}
                    </select>
                    <div className="flex gap-2 w-full">
                        <select
                            className="h-10 flex-1 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="APPROVED">Approved</option>
                            <option value="REJECTED">Rejected</option>
                            <option value="WAITLISTED">Waitlisted</option>
                        </select>
                        <select
                            className="h-10 flex-1 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/10 outline-none text-foreground/80 cursor-pointer"
                            value={paymentFilter}
                            onChange={(e) => { setPaymentFilter(e.target.value); setCurrentPage(1); }}
                        >
                            <option value="ALL">All Payments</option>
                            <option value="PENDING">Pending</option>
                            <option value="VERIFIED">Verified</option>
                            <option value="REJECTED">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Applications Table */}
                <div className="overflow-x-auto rounded-xl border border-primary/20 bg-card shadow-sm">
                    <table className={TABLE_ROOT}>
                        <thead>
                            <tr className={TABLE_HEADER}>
                                <th className={TABLE_HEADER_CELL + " w-[22%]"} onClick={() => handleSort('fullName')}>
                                    Applicant Name <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[18%]"}>Event</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[12%]"}>Package</th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[6%] text-center"}>Age/Gender</th>
                                <th className={TABLE_HEADER_CELL + " w-[10%] text-center"} onClick={() => handleSort('status')}>
                                    Status <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-center"}>Payment</th>
                                <th className={TABLE_HEADER_CELL + " w-[12%] text-center"} onClick={() => handleSort('createdAt')}>
                                    Date Submitted <ArrowUpDown className="inline h-3 w-3 ml-1 opacity-60" />
                                </th>
                                <th className={TABLE_HEADER_CELL_NO_SORT + " w-[10%] text-right"}>Actions</th>
                            </tr>
                        </thead>
                        <tbody className={TABLE_BODY}>
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex justify-center items-center gap-2">
                                            <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            Loading applications...
                                        </div>
                                    </td>
                                </tr>
                            ) : paginatedApps.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-foreground/50 text-[12px]">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <AlertCircle className="h-8 w-8 opacity-30 text-primary" />
                                            <span>No applications found matching criteria.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedApps.map((app) => (
                                    <tr key={app.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL + " font-semibold text-foreground"}>
                                            <div className="truncate" title={app.fullName}>{app.fullName}</div>
                                            <div className="text-[9px] text-muted-foreground font-mono truncate">{app.id}</div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="truncate" title={app.event?.title}>{app.event?.title}</div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="truncate">{app.package?.title}</div>
                                            <div className="text-[9px] text-muted-foreground">₦{Number(app.package?.fee || 0).toLocaleString()}</div>
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            {app.age} / {app.gender === 'MALE' || app.gender === 'Male' ? 'M' : 'F'}
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>{getStatusBadge(app.status)}</td>
                                        <td className={TABLE_CELL + " text-center"}>{getPaymentBadge(app.paymentStatus)}</td>
                                        <td className={TABLE_CELL + " text-center text-muted-foreground"}>
                                            {new Date(app.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/5 rounded" onClick={() => viewDetails(app)} title="View Details">
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Button>
                                                {app.status === 'PENDING' && (
                                                    <>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 rounded" onClick={() => handleStatusUpdate(app.id, 'APPROVED')} title="Approve">
                                                            <Check className="h-3.5 w-3.5" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-50 rounded" onClick={() => handleStatusUpdate(app.id, 'REJECTED')} title="Reject">
                                                            <X className="h-3.5 w-3.5" />
                                                        </Button>
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

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className={PAGINATION_BAR}>
                        <p className={PAGINATION_INFO}>
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, filteredApps.length)} of {filteredApps.length} applications
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

                {/* Application Detail Dialog */}
                {selectedApp && (
                    <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                        <DialogContent className="rounded-[2rem] max-w-3xl overflow-y-auto max-h-[85vh] custom-scrollbar border-primary/25">
                            <DialogHeader>
                                <div className="flex items-center justify-between border-b border-primary/10 pb-3">
                                    <div>
                                        <DialogTitle className="text-lg font-bold text-primary">{selectedApp.fullName}</DialogTitle>
                                        <DialogDescription className="text-xs font-semibold font-mono">Ref ID: {selectedApp.id}</DialogDescription>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="h-8 rounded-lg font-bold border-primary/10 gap-1.5" onClick={printApplication}>
                                            <Printer size={13} /> Print Slip
                                        </Button>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-6 py-4 md:grid-cols-2 text-xs font-semibold text-foreground/80">
                                {/* Event & Package selection */}
                                <div className="space-y-4 bg-muted/15 p-4 rounded-2xl border border-primary/5">
                                    <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-1.5 uppercase">Registration details</h3>
                                    <div className="space-y-2">
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Event</span><span className="font-bold text-sm">{selectedApp.event?.title}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Package</span><span className="font-bold">{selectedApp.package?.title}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Package Fee</span><span className="font-bold text-primary">NGN {Number(selectedApp.package?.fee || 0).toLocaleString()}</span></div>
                                        {selectedApp.accommodationPreference && <div><span className="text-[10px] text-muted-foreground block uppercase">Accommodation Preference</span><span>{selectedApp.accommodationPreference}</span></div>}
                                    </div>
                                </div>

                                {/* Personal info */}
                                <div className="space-y-4 bg-muted/15 p-4 rounded-2xl border border-primary/5">
                                    <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-1.5 uppercase">Applicant Information</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Gender</span><span>{selectedApp.gender}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Age</span><span>{selectedApp.age} Years</span></div>
                                        <div className="col-span-2"><span className="text-[10px] text-muted-foreground block uppercase">Date of Birth</span><span>{new Date(selectedApp.dateOfBirth).toLocaleDateString()}</span></div>
                                        <div className="col-span-2"><span className="text-[10px] text-muted-foreground block uppercase">Parent/Guardian Name</span><span>{selectedApp.parentName || 'N/A'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Parent Phone</span><span>{selectedApp.parentPhone || 'N/A'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Emergency Contact</span><span>{selectedApp.emergencyContact}</span></div>
                                    </div>
                                </div>

                                {/* Educational & Background */}
                                <div className="space-y-4 bg-muted/15 p-4 rounded-2xl border border-primary/5">
                                    <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-1.5 uppercase">Background & Education</h3>
                                    <div className="space-y-2">
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Current School</span><span>{selectedApp.school || 'N/A'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Hifz Memorization Level</span><span>{selectedApp.memorizationLevel || 'N/A'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Islamic Background</span><span>{selectedApp.islamicBackground || 'N/A'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Previous Participation</span><span>{selectedApp.previousParticipation || 'N/A'}</span></div>
                                    </div>
                                </div>

                                {/* Medical and Health */}
                                <div className="space-y-4 bg-muted/15 p-4 rounded-2xl border border-primary/5">
                                    <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-1.5 uppercase">Medical & Health Profile</h3>
                                    <div className="space-y-2">
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Medical Conditions</span><span>{selectedApp.medicalConditions || 'None reported'}</span></div>
                                        <div><span className="text-[10px] text-muted-foreground block uppercase">Allergies</span><span>{selectedApp.allergies || 'None reported'}</span></div>
                                    </div>
                                </div>

                                {/* Uploaded Documents */}
                                <div className="space-y-4 bg-muted/15 p-4 rounded-2xl border border-primary/5 md:col-span-2">
                                    <h3 className="font-bold text-sm text-primary border-b border-primary/10 pb-1.5 uppercase">Audit Verification Documents</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {selectedApp.passportPhotoUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.passportPhotoUrl!, label: 'Passport Photo' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">Passport Photo</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                        {selectedApp.birthCertificateUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.birthCertificateUrl!, label: 'Birth Certificate' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">Birth Certificate</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                        {selectedApp.ninUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.ninUrl!, label: 'NIN Document' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">NIN Document</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                        {selectedApp.schoolIdUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.schoolIdUrl!, label: 'School ID Card' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">School ID Card</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                        {selectedApp.medicalReportUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.medicalReportUrl!, label: 'Medical Report' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">Medical Report</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                        {selectedApp.proofOfPaymentUrl && (
                                            <button onClick={() => setViewingDoc({ url: selectedApp.proofOfPaymentUrl!, label: 'Proof of Payment' })} className="flex items-center gap-2 p-2 border border-primary/10 rounded-xl bg-card hover:bg-primary/5 transition w-full text-left">
                                                <FileText className="h-5 w-5 text-primary shrink-0" />
                                                <div className="truncate"><span className="text-[9px] text-muted-foreground block">Proof of Payment</span><span className="text-[10px] font-bold">View</span></div>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Statuses and Approval Controls */}
                            <div className="border-t border-primary/10 pt-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex gap-4 items-center">
                                    <div><span className="text-[10px] text-muted-foreground block uppercase">Current Status</span>{getStatusBadge(selectedApp.status)}</div>
                                    <div><span className="text-[10px] text-muted-foreground block uppercase">Payment Status</span>{getPaymentBadge(selectedApp.paymentStatus)}</div>
                                </div>
                                <div className="flex gap-2 w-full md:w-auto">
                                    {selectedApp.paymentStatus === 'PENDING' && selectedApp.proofOfPaymentUrl && (
                                        <Button size="sm" variant="outline" className="h-9 rounded-xl font-bold border-emerald-500/20 text-emerald-600 hover:bg-emerald-50" onClick={() => handlePaymentUpdate(selectedApp.id, 'VERIFIED')}>
                                            Approve Payment
                                        </Button>
                                    )}
                                    <select
                                        className="h-9 px-3 text-xs font-semibold rounded-xl bg-background border border-primary/20 outline-none text-foreground/80 cursor-pointer shrink-0"
                                        value={selectedApp.status}
                                        onChange={(e) => handleStatusUpdate(selectedApp.id, e.target.value)}
                                    >
                                        <option value="PENDING">Set Status: Pending</option>
                                        <option value="UNDER_REVIEW">Set Status: Under Review</option>
                                        <option value="APPROVED">Set Status: Approved</option>
                                        <option value="REJECTED">Set Status: Rejected</option>
                                        <option value="WAITLISTED">Set Status: Waitlisted</option>
                                    </select>
                                    <Button variant="outline" className="h-9 rounded-xl font-bold border-primary/10 text-muted-foreground shrink-0" onClick={() => setDetailOpen(false)}>Close</Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Document Viewer Modal */}
                {viewingDoc && (
                    <Dialog open={!!viewingDoc} onOpenChange={() => setViewingDoc(null)}>
                        <DialogContent className="rounded-[2rem] max-w-2xl border-primary/25">
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold text-primary">{viewingDoc.label}</DialogTitle>
                            </DialogHeader>
                            <div className="p-2 border border-primary/10 rounded-2xl bg-muted/5 flex items-center justify-center min-h-[400px]">
                                {viewingDoc.url.endsWith('.pdf') ? (
                                    <div className="text-center space-y-4 p-8">
                                        <FileText className="h-20 w-20 text-primary mx-auto opacity-75" />
                                        <p className="text-sm font-semibold text-muted-foreground">PDF document cannot be previewed inline.</p>
                                        <a href={viewingDoc.url} target="_blank" rel="noreferrer">
                                            <Button className="font-bold gap-2 rounded-xl">
                                                <Download size={15} /> Open PDF in New Tab
                                            </Button>
                                        </a>
                                    </div>
                                ) : (
                                    <img src={viewingDoc.url} className="max-h-[65vh] w-auto rounded-xl object-contain shadow border" alt={viewingDoc.label} />
                                )}
                            </div>
                            <div className="flex justify-end gap-2 mt-2">
                                <a href={viewingDoc.url} download target="_blank" rel="noreferrer">
                                    <Button variant="outline" className="h-10 rounded-xl font-bold border-primary/10 gap-1 text-primary">
                                        <Download size={15} /> Download
                                    </Button>
                                </a>
                                <Button variant="default" className="h-10 rounded-xl font-bold px-6" onClick={() => setViewingDoc(null)}>Close</Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </RequireBranch>
    );
}
