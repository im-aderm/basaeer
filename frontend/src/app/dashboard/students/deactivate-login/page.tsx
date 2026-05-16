"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
    UserX,
    UserCheck,
    Shield,
    AlertTriangle,
    History,
    Search,
    ChevronLeft,
    ChevronRight,
    Trash2,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertCircle,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";

interface Student {
    id: string;
    userId: string | null;
    admissionNumber: string | null;
    firstName: string;
    lastName: string;
    gender: string | null;
    class: { id: string; name: string } | null;
    section: { id: string; name: string } | null;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        isActive: boolean;
        role: string;
    } | null;
}

interface PaginatedResponse {
    data: Student[];
    totalCount: number;
}

interface Deactivation {
    id: string;
    studentId: string;
    userId: string;
    reason: string;
    reasonId: string | null;
    branchId: string;
    deactivatedBy: string | null;
    reactivatedAt: string | null;
    reactivatedBy: string | null;
    createdAt: string;
    updatedAt: string;
    student?: { id: string; firstName: string; lastName: string; admissionNumber: string | null };
}

const PAGE_SIZE = 20;

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) => (
    <div className="flex items-center justify-between mt-4 px-2">
        <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages || 1}
        </p>
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => onPageChange(currentPage - 1)}
            >
                <ChevronLeft size={16} />
            </Button>
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => onPageChange(currentPage + 1)}
            >
                <ChevronRight size={16} />
            </Button>
        </div>
    </div>
);

export default function StudentLoginDeactivationPage() {
    const [activeStudents, setActiveStudents] = useState<Student[]>([]);
    const [inactiveStudents, setInactiveStudents] = useState<Student[]>([]);
    const [activeTotal, setActiveTotal] = useState(0);
    const [inactiveTotal, setInactiveTotal] = useState(0);
    const [deactivations, setDeactivations] = useState<Deactivation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [deactivationReason, setDeactivationReason] = useState("");
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
    const [showReactivateDialog, setShowReactivateDialog] = useState(false);
    const [reactivateStudent, setReactivateStudent] = useState<Student | null>(null);
    const [activePage, setActivePage] = useState(1);
    const [inactivePage, setInactivePage] = useState(1);
    const [sortBy, setSortBy] = useState("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [deactivating, setDeactivating] = useState(false);
    const [reactivating, setReactivating] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [activeRes, inactiveRes, deactivationsRes] = await Promise.all([
                api.get("/students", {
                    params: {
                        isActive: "true",
                        search: searchTerm || undefined,
                        sortBy,
                        sortOrder,
                        skip: (activePage - 1) * PAGE_SIZE,
                        take: PAGE_SIZE,
                    },
                }),
                api.get("/students", {
                    params: {
                        isActive: "false",
                        search: searchTerm || undefined,
                        sortBy,
                        sortOrder,
                        skip: (inactivePage - 1) * PAGE_SIZE,
                        take: PAGE_SIZE,
                    },
                }),
                api.get("/students/login-deactivations"),
            ]);

            const activeData = activeRes.data as PaginatedResponse;
            const inactiveData = inactiveRes.data as PaginatedResponse;
            setActiveStudents(activeData.data || []);
            setActiveTotal(activeData.totalCount || 0);
            setInactiveStudents(inactiveData.data || []);
            setInactiveTotal(inactiveData.totalCount || 0);
            setDeactivations(deactivationsRes.data || []);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to load deactivation data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortBy, sortOrder, activePage, inactivePage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectAll = (checked: boolean, students: Student[]) => {
        if (checked) {
            setSelectedStudents(students.map(s => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (studentId: string, checked: boolean) => {
        setSelectedStudents(prev => {
            if (checked) {
                return [...prev, studentId];
            } else {
                return prev.filter(id => id !== studentId);
            }
        });
    };

    const handleDeactivate = async () => {
        if (!deactivationReason.trim()) {
            toast.error("Please provide a reason for deactivation");
            return;
        }
        if (selectedStudents.length === 0) {
            toast.error("No students selected");
            return;
        }

        setDeactivating(true);
        try {
            const result = await api.post("/students/deactivate-login", {
                studentIds: selectedStudents,
                reason: deactivationReason,
            });
            toast.success(result.data.message || `${selectedStudents.length} student(s) deactivated`);
            setShowDeactivateDialog(false);
            setSelectedStudents([]);
            setDeactivationReason("");
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to deactivate login");
        } finally {
            setDeactivating(false);
        }
    };

    const handleReactivate = async (student: Student) => {
        setReactivateStudent(student);
        setShowReactivateDialog(true);
    };

    const confirmReactivate = async () => {
        if (!reactivateStudent) return;
        setReactivating(true);
        try {
            await api.post(`/students/${reactivateStudent.id}/reactivate-login`);
            toast.success(`${reactivateStudent.firstName} ${reactivateStudent.lastName} login reactivated`);
            setShowReactivateDialog(false);
            setReactivateStudent(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reactivate login");
        } finally {
            setReactivating(false);
        }
    };

    const handleBulkReactivate = async () => {
        if (selectedStudents.length === 0) {
            toast.error("No students selected");
            return;
        }

        setReactivating(true);
        try {
            const result = await api.post("/students/bulk-reactivate-login", {
                studentIds: selectedStudents,
            });
            toast.success(result.data.message || `${selectedStudents.length} student(s) reactivated`);
            setSelectedStudents([]);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to bulk reactivate");
        } finally {
            setReactivating(false);
        }
    };

    const getDeactivationInfo = (student: Student): Deactivation | null => {
        if (!student.userId) return null;
        return deactivations.find(d => d.userId === student.userId) || null;
    };

    const deactivationMap = useMemo(() => {
        const map = new Map<string, Deactivation>();
        deactivations.forEach(d => map.set(d.userId, d));
        return map;
    }, [deactivations]);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    const hasActiveSelection = selectedStudents.some(id =>
        activeStudents.some(s => s.id === id)
    );
    const hasInactiveSelection = selectedStudents.some(id =>
        inactiveStudents.some(s => s.id === id)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 px-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Student Login Management</h1>
                    <p className="text-muted-foreground font-medium mt-1">Deactivate and reactivate student portal access.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search students..."
                            className="pl-10 h-10 w-64"
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value);
                                setActivePage(1);
                                setInactivePage(1);
                            }}
                        />
                    </div>
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40 h-10">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="class">Class</SelectItem>
                            <SelectItem value="section">Section</SelectItem>
                            <SelectItem value="admissionNumber">Admission No.</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="h-10"
                    >
                        {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-6 bg-card rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Users size={20} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Total Students</p>
                            <p className="text-2xl font-bold">{activeTotal + inactiveTotal}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                            <UserCheck size={20} className="text-green-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Active Logins</p>
                            <p className="text-2xl font-bold">{activeTotal}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                            <UserX size={20} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Inactive Logins</p>
                            <p className="text-2xl font-bold">{inactiveTotal}</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-card rounded-2xl border border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                            <History size={20} className="text-amber-500" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase text-muted-foreground">Total Deactivations</p>
                            <p className="text-2xl font-bold">{deactivations.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Active Students */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserCheck size={20} className="text-green-500" />
                        <h2 className="font-bold text-lg">Active Student Logins</h2>
                        <span className="text-sm text-muted-foreground">({activeStudents.length})</span>
                    </div>
                    {selectedStudents.length > 0 && hasActiveSelection && (
                        <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                            <DialogTrigger asChild>
                                <Button className="bg-red-500 hover:bg-red-600 text-white">
                                    <UserX size={16} className="mr-2" />
                                    Deactivate Selected ({selectedStudents.filter(id => activeStudents.some(s => s.id === id)).length})
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2 text-red-600">
                                        <AlertTriangle size={20} />
                                        Confirm Login Deactivation
                                    </DialogTitle>
                                    <DialogDescription>
                                        This will prevent {selectedStudents.filter(id => activeStudents.some(s => s.id === id)).length} student(s) from accessing the student portal.
                                        They will not be able to log in until reactivated by an administrator.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <div className="flex items-start gap-3">
                                            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 shrink-0" />
                                            <div>
                                                <p className="font-semibold text-red-900 text-sm">Warning: This action affects student portal access</p>
                                                <p className="text-sm text-red-700 mt-1">Deactivated students cannot view grades, submit assignments, or access any portal features.</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="deactivation-reason">Reason for Deactivation *</Label>
                                        <Textarea
                                            id="deactivation-reason"
                                            value={deactivationReason}
                                            onChange={e => setDeactivationReason(e.target.value)}
                                            rows={4}
                                            placeholder="Provide a detailed reason for deactivating these students..."
                                            required
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleDeactivate}
                                        disabled={deactivating || !deactivationReason.trim()}
                                        className="bg-red-500 hover:bg-red-600"
                                    >
                                        {deactivating ? <Loader2 size={16} className="animate-spin mr-2" /> : <Trash2 size={16} className="mr-2" />}
                                        Confirm Deactivation
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                                <th className="px-6 py-4 w-12">
                                    <Checkbox
                                        checked={activeStudents.length > 0 && selectedStudents.length >= activeStudents.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked, activeStudents)}
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Class</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {activeStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-16 text-center">
                                        <UserCheck size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                                        <p className="text-muted-foreground font-medium">No active students found</p>
                                    </td>
                                </tr>
                            ) : (
                                activeStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-6 py-4">
                                            <Checkbox
                                                checked={selectedStudents.includes(student.id)}
                                                onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-semibold">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-muted-foreground font-mono">{student.admissionNumber || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm">{student.user?.email || "N/A"}</td>
                                        <td className="px-6 py-4 text-sm">
                                            {student.class ? `${student.class.name}${student.section ? ` - ${student.section.name}` : ""}` : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-600">
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {activeStudents.length > 0 && (
                    <PaginationControls currentPage={activePage} totalPages={Math.ceil(activeTotal / PAGE_SIZE) || 1} onPageChange={setActivePage} />
                )}
            </div>

            {/* Inactive Students */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <UserX size={20} className="text-red-500" />
                        <h2 className="font-bold text-lg">Deactivated Student Logins</h2>
                        <span className="text-sm text-muted-foreground">({inactiveStudents.length})</span>
                    </div>
                    {selectedStudents.length > 0 && hasInactiveSelection && (
                        <Button
                            onClick={handleBulkReactivate}
                            disabled={reactivating}
                            className="bg-green-500 hover:bg-green-600 text-white"
                        >
                            {reactivating ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserCheck size={16} className="mr-2" />}
                            Reactivate Selected ({selectedStudents.filter(id => inactiveStudents.some(s => s.id === id)).length})
                        </Button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                                <th className="px-6 py-4 w-12">
                                    <Checkbox
                                        checked={inactiveStudents.length > 0 && selectedStudents.filter(id => inactiveStudents.some(s => s.id === id)).length === inactiveStudents.length}
                                        onCheckedChange={(checked) => handleSelectAll(!!checked, inactiveStudents)}
                                    />
                                </th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Student</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Email</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Deactivated</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold uppercase text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {inactiveStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <UserCheck size={40} className="mx-auto text-green-300/50 mb-3" />
                                        <p className="text-muted-foreground font-medium">All students have active logins</p>
                                    </td>
                                </tr>
                            ) : (
                                inactiveStudents.map(student => {
                                    const deactivation = deactivationMap.get(student.userId || "");
                                    return (
                                        <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                                            <td className="px-6 py-4">
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={(checked) => handleSelectStudent(student.id, !!checked)}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-semibold">{student.firstName} {student.lastName}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{student.admissionNumber || "N/A"}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm">{student.user?.email || "N/A"}</td>
                                            <td className="px-6 py-4 text-sm">
                                                {deactivation ? new Date(deactivation.createdAt).toLocaleDateString() : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-sm max-w-xs truncate" title={deactivation?.reason}>
                                                {deactivation?.reason || "No reason provided"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600">
                                                    Inactive
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-600 hover:bg-green-50 border-green-200"
                                                    onClick={() => handleReactivate(student)}
                                                >
                                                    <UserCheck size={14} className="mr-1" />
                                                    Reactivate
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                {inactiveStudents.length > 0 && (
                    <PaginationControls currentPage={inactivePage} totalPages={Math.ceil(inactiveTotal / PAGE_SIZE) || 1} onPageChange={setInactivePage} />
                )}
            </div>

            {/* Single Reactivate Confirmation Dialog */}
            <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-green-600">
                            <UserCheck size={20} />
                            Confirm Login Reactivation
                        </DialogTitle>
                        <DialogDescription>
                            This will restore portal access for {reactivateStudent?.firstName} {reactivateStudent?.lastName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-semibold text-green-900 text-sm">Student will regain full portal access</p>
                                    <p className="text-sm text-green-700 mt-1">They will be able to view grades, submit assignments, and access all student portal features.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReactivateDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmReactivate}
                            disabled={reactivating}
                            className="bg-green-500 hover:bg-green-600"
                        >
                            {reactivating ? <Loader2 size={16} className="animate-spin mr-2" /> : <UserCheck size={16} className="mr-2" />}
                            Confirm Reactivation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
