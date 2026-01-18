"use client";

import { useState, useEffect } from "react";
import { UserX, UserCheck, Shield, AlertTriangle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import api from "@/lib/api";

export default function StudentLoginDeactivationPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [deactivations, setDeactivations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeactivateDialogOpen, setIsDeactivateDialogOpen] = useState(false);
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [deactivationReason, setDeactivationReason] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsData, deactivationsData] = await Promise.all([
                api.get("/students?includeUser=true"),
                api.get("/students/login-deactivations"),
            ]);
            setStudents(studentsData.data);
            setDeactivations(deactivationsData.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!deactivationReason.trim()) {
            toast.error("Please provide a reason for deactivation");
            return;
        }

        try {
            await api.post("/students/deactivate-login", {
                studentIds: selectedStudents,
                reason: deactivationReason,
            });
            toast.success(`${selectedStudents.length} student login(s) deactivated`);
            setIsDeactivateDialogOpen(false);
            setSelectedStudents([]);
            setDeactivationReason("");
            fetchData();
        } catch (error) {
            toast.error("Failed to deactivate login");
        }
    };

    const handleReactivate = async (studentId: string) => {
        try {
            await api.post(`/students/${studentId}/reactivate-login`);
            toast.success("Student login reactivated");
            fetchData();
        } catch (error) {
            toast.error("Failed to reactivate login");
        }
    };

    const activeStudents = students.filter((s) => s.user?.isActive);
    const inactiveStudents = students.filter((s) => !s.user?.isActive);

    const calculateStats = () => {
        return {
            total: students.length,
            active: activeStudents.length,
            inactive: inactiveStudents.length,
            recentDeactivations: deactivations.filter((d) => {
                const deactivatedDate = new Date(d.createdAt);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return deactivatedDate >= thirtyDaysAgo;
            }).length,
        };
    };

    const stats = calculateStats();

    const activeColumns = [
        {
            header: "Select",
            accessorKey: "select",
            cell: (row: any) => (
                <Checkbox
                    checked={selectedStudents.includes(row.id)}
                    onCheckedChange={(checked) => {
                        if (checked) {
                            setSelectedStudents([...selectedStudents, row.id]);
                        } else {
                            setSelectedStudents(selectedStudents.filter((id) => id !== row.id));
                        }
                    }}
                />
            ),
        },
        {
            header: "Student",
            accessorKey: "user",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">
                        {row.user?.firstName} {row.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{row.admissionNumber}</p>
                </div>
            ),
        },
        {
            header: "Email",
            accessorKey: "user.email",
            cell: (row: any) => row.user?.email || "N/A",
        },
        {
            header: "Class",
            accessorKey: "section",
            cell: (row: any) =>
                row.section ? `${row.section.class?.name} - ${row.section.name}` : "N/A",
        },
        {
            header: "Status",
            accessorKey: "user.isActive",
            cell: (row: any) => (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    Active
                </span>
            ),
        },
    ];

    const inactiveColumns = [
        {
            header: "Student",
            accessorKey: "user",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">
                        {row.user?.firstName} {row.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{row.admissionNumber}</p>
                </div>
            ),
        },
        {
            header: "Email",
            accessorKey: "user.email",
            cell: (row: any) => row.user?.email || "N/A",
        },
        {
            header: "Deactivated",
            accessorKey: "deactivation",
            cell: (row: any) => {
                const deactivation = deactivations.find((d) => d.userId === row.userId);
                return deactivation ? new Date(deactivation.createdAt).toLocaleDateString() : "N/A";
            },
        },
        {
            header: "Reason",
            accessorKey: "reason",
            cell: (row: any) => {
                const deactivation = deactivations.find((d) => d.userId === row.userId);
                return (
                    <p className="max-w-xs truncate">{deactivation?.reason || "No reason provided"}</p>
                );
            },
        },
        {
            header: "Status",
            accessorKey: "user.isActive",
            cell: (row: any) => (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                    Inactive
                </span>
            ),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (row: any) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-emerald-600 hover:bg-emerald-50"
                    onClick={() => handleReactivate(row.id)}
                >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Reactivate
                </Button>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50/30 to-orange-50/20 dark:from-slate-950 dark:via-red-950/20 dark:to-orange-950/10 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                            Student Login Management
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Deactivate and reactivate student login access
                        </p>
                    </div>
                    <Dialog open={isDeactivateDialogOpen} onOpenChange={setIsDeactivateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                                disabled={selectedStudents.length === 0}
                            >
                                <UserX className="w-4 h-4 mr-2" />
                                Deactivate Selected ({selectedStudents.length})
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Deactivate Student Login</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                        <div>
                                            <p className="font-semibold text-red-900 dark:text-red-100">
                                                Warning
                                            </p>
                                            <p className="text-sm text-red-700 dark:text-red-300">
                                                Deactivating login will prevent {selectedStudents.length}{" "}
                                                student(s) from accessing the system.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="reason">Reason for Deactivation</Label>
                                    <Textarea
                                        id="reason"
                                        value={deactivationReason}
                                        onChange={(e) => setDeactivationReason(e.target.value)}
                                        rows={4}
                                        placeholder="Please provide a detailed reason for deactivating login access..."
                                        required
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDeactivateDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeactivate}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        Deactivate Login
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <Shield className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Students</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.total}
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <UserCheck className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active Logins</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.active}
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <UserX className="w-8 h-8 text-red-600" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Inactive Logins</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.inactive}
                    </p>
                </div>

                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <History className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Recent (30d)</p>
                    <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                        {stats.recentDeactivations}
                    </p>
                </div>
            </div>

            {/* Active Students Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Active Student Logins</h2>
                    {selectedStudents.length > 0 && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            {selectedStudents.length} selected
                        </p>
                    )}
                </div>
                <DataTable columns={activeColumns} data={activeStudents} searchKey="user" />
            </div>

            {/* Inactive Students Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4">Deactivated Student Logins</h2>
                {inactiveStudents.length === 0 ? (
                    <div className="text-center py-12">
                        <UserCheck className="w-16 h-16 mx-auto text-emerald-300 dark:text-emerald-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            All students have active logins
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500">
                            No deactivated student accounts
                        </p>
                    </div>
                ) : (
                    <DataTable columns={inactiveColumns} data={inactiveStudents} searchKey="user" />
                )}
            </div>
        </div>
    );
}
