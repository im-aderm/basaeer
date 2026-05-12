"use client";

import { useState, useEffect } from "react";
import { DollarSign, Plus, Clock, CheckCircle2, XCircle, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function AdvanceSalaryPage() {
    const { user } = useAuth();
    const [advances, setAdvances] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        amount: "",
        reason: "",
    });

    const isAdmin = ["SUPER_ADMIN", "BRANCH_ADMIN", "HR"].includes(user?.role || "");

    useEffect(() => {
        fetchAdvances();
    }, []);

    const fetchAdvances = async () => {
        try {
            const endpoint = isAdmin ? "/employees/advance-salary" : "/employees/my-advance-salary";
            const response = await api.get(endpoint);
            setAdvances(response.data);
        } catch (error) {
            toast.error("Failed to load advance salary requests");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/employees/advance-salary/request", {
                amount: parseFloat(formData.amount),
                reason: formData.reason,
            });
            toast.success("Advance salary request submitted!");
            setIsDialogOpen(false);
            setFormData({ amount: "", reason: "" });
            fetchAdvances();
        } catch (error) {
            toast.error("Failed to submit request");
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await api.patch(`/employees/advance-salary/${id}/approve`);
            toast.success("Request approved!");
            fetchAdvances();
        } catch (error) {
            toast.error("Failed to approve request");
        }
    };

    const handleReject = async (id: string) => {
        try {
            await api.patch(`/employees/advance-salary/${id}/reject`);
            toast.success("Request rejected!");
            fetchAdvances();
        } catch (error) {
            toast.error("Failed to reject request");
        }
    };

    const calculateStats = () => {
        const total = advances.length;
        const pending = advances.filter((a) => a.status === "PENDING").length;
        const approved = advances.filter((a) => a.status === "APPROVED").length;
        const totalAmount = advances
            .filter((a) => a.status === "APPROVED")
            .reduce((sum, a) => sum + a.amount, 0);

        return { total, pending, approved, totalAmount };
    };

    const stats = calculateStats();

    const columns = [
        {
            header: "Employee",
            accessorKey: "staff",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">
                        {row.staff?.user?.firstName} {row.staff?.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{row.staff?.employeeId}</p>
                </div>
            ),
        },
        {
            header: "Amount",
            accessorKey: "amount",
            cell: (row: any) => (
                <span className="font-semibold text-emerald-600">
                    ${row.amount.toLocaleString()}
                </span>
            ),
        },
        {
            header: "Reason",
            accessorKey: "reason",
            cell: (row: any) => (
                <p className="max-w-xs truncate">{row.reason || "N/A"}</p>
            ),
        },
        {
            header: "Requested",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${row.status === "APPROVED"
 ? "bg-emerald-100 text-emerald-700 "
                        : row.status === "REJECTED"
 ? "bg-red-100 text-red-700 "
 : "bg-yellow-100 text-yellow-700 "
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
        ...(isAdmin
            ? [
                {
                    header: "Actions",
                    accessorKey: "actions",
                    cell: (row: any) =>
                        row.status === "PENDING" ? (
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-emerald-600 hover:bg-emerald-50"
                                    onClick={() => handleApprove(row.id)}
                                >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    Approve
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 hover:bg-red-50"
                                    onClick={() => handleReject(row.id)}
                                >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Reject
                                </Button>
                            </div>
                        ) : (
                            <span className="text-sm text-slate-500">-</span>
                        ),
                },
            ]
            : []),
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                            Advance Salary Management
                        </h1>
 <p className="text-slate-600 mt-2">
                            {isAdmin
                                ? "Review and approve salary advance requests"
                                : "Request and track your salary advances"}
                        </p>
                    </div>
                    {!isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Request Advance
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Request Salary Advance</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="amount">Amount</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) =>
                                                setFormData({ ...formData, amount: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="reason">Reason</Label>
                                        <Textarea
                                            id="reason"
                                            value={formData.reason}
                                            onChange={(e) =>
                                                setFormData({ ...formData, reason: e.target.value })
                                            }
                                            rows={4}
                                            placeholder="Please explain why you need this advance..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit">Submit Request</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                        <div className="flex items-center justify-between mb-2">
                            <DollarSign className="w-8 h-8 text-indigo-600" />
                        </div>
 <p className="text-sm text-slate-600 ">Total Requests</p>
 <p className="text-h1 font-bold text-slate-900 ">
                            {stats.total}
                        </p>
                    </div>

 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                        <div className="flex items-center justify-between mb-2">
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
 <p className="text-sm text-slate-600 ">Pending</p>
 <p className="text-h1 font-bold text-slate-900 ">
                            {stats.pending}
                        </p>
                    </div>

 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                        <div className="flex items-center justify-between mb-2">
                            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                        </div>
 <p className="text-sm text-slate-600 ">Approved</p>
 <p className="text-h1 font-bold text-slate-900 ">
                            {stats.approved}
                        </p>
                    </div>

 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp className="w-8 h-8 text-teal-600" />
                        </div>
 <p className="text-sm text-slate-600 ">Total Amount</p>
 <p className="text-h1 font-bold text-slate-900 ">
                            ${stats.totalAmount.toLocaleString()}
                        </p>
                    </div>
                </div>
            )}

            {/* Requests Table */}
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                <h2 className="text-xl font-semibold mb-4">
                    {isAdmin ? "All Requests" : "My Requests"}
                </h2>
                <DataTable columns={columns} data={advances} searchKey="staff" />
            </div>
        </div>
    );
}
