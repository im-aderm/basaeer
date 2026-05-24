"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import {
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Calendar,
    User,
    Filter,
    Loader2,
    Check,
    X
} from "lucide-react";
import { HRService, LeaveRequest } from "@/services/hrService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotification } from '@/context/NotificationContext';
import { DataTable } from "@/components/DataTable";
import { STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function LeaveManagementPage() {
    const { showSuccess, showError } = useNotification();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await HRService.getBranchLeaves();
            setRequests(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch leaves:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
        try {
            await HRService.updateLeaveStatus(id, status);
            showSuccess(`Leave request ${status.toLowerCase()} successfully`);
            fetchRequests();
        } catch (error) {
            showError("Failed to update status");
        }
    };

    const columns = [
        {
            header: "Employee",
            accessor: (req: LeaveRequest) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {req.staff?.user?.firstName[0]}{req.staff?.user?.lastName[0]}
                    </div>
                    <div>
                        <div className="font-bold">{req.staff?.user?.firstName} {req.staff?.user?.lastName}</div>
                        <div className="text-[10px] text-muted-foreground uppercase font-semibold">{req.type}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Duration",
            accessor: (req: LeaveRequest) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <Calendar size={12} className="text-muted-foreground" />
                        {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}
                    </div>
                </div>
            )
        },
        {
            header: "Reason",
            accessor: (req: LeaveRequest) => (
                <div className="max-w-[200px] truncate text-xs font-medium text-muted-foreground">
                    {req.reason}
                </div>
            )
        },
        {
            header: "Status",
            accessor: (req: LeaveRequest) => (
                <Badge className={`rounded-xl px-4 py-1.5 font-semibold tracking-wide text-[10px] ${req.status === 'APPROVED' ? "bg-green-500/10 text-green-600 border border-green-500/20" :
                        req.status === 'REJECTED' ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                            "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                    }`}>
                    {req.status}
                </Badge>
            )
        }
    ];

    if (loading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto h-12 w-12 text-primary" /></div>;

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
                <BranchContextBanner />
                {/* Header section with glassmorphism */}
            <div className="relative overflow-hidden rounded-2xl bg-indigo-900 p-6 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary mb-2">Leave Management</h1>
                        <p className="text-indigo-200 text-[12px] font-medium max-w-2xl leading-relaxed">
                            Review and approve time-off requests. Maintain operational continuity while supporting staff well-being.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Card className="bg-white/10 backdrop-blur-md border-none p-4 rounded-2xl text-center min-w-[120px]">
                            <p className="text-indigo-200 text-[12px] mb-1">Pending</p>
                            <p className="text-[16px] font-semibold">{(requests ?? []).filter(r => r.status === 'PENDING').length}</p>
                        </Card>
                    </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden border-t-8 border-t-indigo-500/20">
                <CardHeader className="p-4 border-b border-primary/20 flex flex-row items-center justify-between bg-muted/5">
                    <CardTitle className="text-[12px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Clock className="text-indigo-600" /> Pending Applications
                    </CardTitle>
                    <div className="flex gap-2">
                        <Button variant="outline" className="rounded-lg font-semibold text-[12px] border-2"><Filter size={16} className="mr-2" /> Filter</Button>
                    </div>
                </CardHeader>
                <CardContent className="p-4">
                    <DataTable
                        columns={columns}
                        data={requests}
                        actions={(req) => (
                            <div className="flex items-center gap-2">
                                {req.status === 'PENDING' && (
                                    <>
                                        <Button
                                            size="sm"
                                            className="rounded-xl font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 px-6"
                                            onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                        >
                                            <Check size={16} className="mr-2" /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-xl font-semibold border-2 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white px-6"
                                            onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                        >
                                            <X size={16} className="mr-2" /> Reject
                                        </Button>
                                    </>
                                )}
                                <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-muted-foreground">View Details</Button>
                            </div>
                        )}
                    />
                    {requests.length === 0 && (
                        <div className="py-8 text-center space-y-3">
                            <Clock size={36} className="mx-auto text-foreground/20" />
                            <p className="text-foreground/60 font-semibold text-[12px]">No leave applications currently pending.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    </RequireBranch>
    );
}
