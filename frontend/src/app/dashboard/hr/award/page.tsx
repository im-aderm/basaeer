"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { Award, Plus, Trophy, Star, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { useNotification } from '@/context/NotificationContext';
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function StaffAwardsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [awards, setAwards] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        staffId: "",
        title: "",
        description: "",
        awardDate: "",
    });

    const isAdmin = ["SUPER_ADMIN", "BRANCH_ADMIN", "HR"].includes(user?.role || "");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [awardsData, staffData] = await Promise.all([
                api.get(isAdmin ? "/employees/awards" : "/employees/my-awards"),
                isAdmin ? api.get("/employees") : Promise.resolve({ data: [] }),
            ]);
            setAwards(awardsData.data);
            setStaff(staffData.data);
        } catch (error) {
            showError("Failed to load awards");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/employees/awards", {
                ...formData,
                awardDate: new Date(formData.awardDate).toISOString(),
            });
            showSuccess("Award created successfully!");
            setIsDialogOpen(false);
            setFormData({
                staffId: "",
                title: "",
                description: "",
                awardDate: "",
            });
            fetchData();
        } catch (error) {
            showError("Failed to create award");
        }
    };

    const getAwardIcon = (title: string) => {
        const lowerTitle = title.toLowerCase();
        if (lowerTitle.includes("best") || lowerTitle.includes("excellence")) return Trophy;
        if (lowerTitle.includes("star") || lowerTitle.includes("outstanding")) return Star;
        if (lowerTitle.includes("achievement")) return Medal;
        return Award;
    };

    const columns = [
        {
            header: "Employee",
            accessorKey: "staff",
            cell: (row: any) => {
                const Icon = getAwardIcon(row.title);
                return (
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg">
                            <Icon className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {row.staff?.user?.firstName} {row.staff?.user?.lastName}
                            </p>
                            <p className="text-sm text-slate-500">{row.staff?.employeeId}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            header: "Award",
            accessorKey: "title",
            cell: (row: any) => (
                <div>
                    <p className="font-semibold text-slate-900">{row.title}</p>
                    <p className="text-sm text-slate-600 line-clamp-1">
                        {row.description}
                    </p>
                </div>
            ),
        },
        {
            header: "Award Date",
            accessorKey: "awardDate",
            cell: (row: any) => new Date(row.awardDate).toLocaleDateString(),
        },
        {
            header: "Awarded",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
    ];

    const calculateStats = () => {
        const total = awards.length;
        const thisMonth = (awards ?? []).filter((a) => {
            const awardDate = new Date(a.awardDate);
            const now = new Date();
            return (
                awardDate.getMonth() === now.getMonth() &&
                awardDate.getFullYear() === now.getFullYear()
            );
        }).length;
        const thisYear = (awards ?? []).filter((a) => {
            const awardDate = new Date(a.awardDate);
            const now = new Date();
            return awardDate.getFullYear() === now.getFullYear();
        }).length;

        return { total, thisMonth, thisYear };
    };

    const stats = calculateStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-primary/5 p-4">
                <BranchContextBanner />
                {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-[20px] font-bold tracking-tight text-primary">
                            Staff Awards & Recognition
                        </h1>
                        <p className="text-foreground/60 mt-2 text-[12px]">
                            {isAdmin
                                ? "Recognize and reward outstanding staff performance"
                                : "View your awards and achievements"}
                        </p>
                    </div>
                    {isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Award
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Create New Award</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <Label htmlFor="staffId">Employee</Label>
                                        <Select
                                            value={formData.staffId}
                                            onValueChange={(value) =>
                                                setFormData({ ...formData, staffId: value })
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staff.map((s) => (
                                                    <SelectItem key={s.id} value={s.id}>
                                                        {s.user?.firstName} {s.user?.lastName} - {s.employeeId}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="title">Award Title</Label>
                                        <Input
                                            id="title"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({ ...formData, title: e.target.value })
                                            }
                                            placeholder="e.g., Employee of the Month"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={formData.description}
                                            onChange={(e) =>
                                                setFormData({ ...formData, description: e.target.value })
                                            }
                                            rows={4}
                                            placeholder="Describe the achievement or reason for this award..."
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="awardDate">Award Date</Label>
                                        <Input
                                            id="awardDate"
                                            type="date"
                                            value={formData.awardDate}
                                            onChange={(e) =>
                                                setFormData({ ...formData, awardDate: e.target.value })
                                            }
                                            required
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
                                        <Button type="submit">Create Award</Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className={STAT_CARD}>
                        <div className="flex items-center justify-between mb-2">
                            <Trophy className="w-6 h-6 text-yellow-600" />
                        </div>
                        <p className={STAT_LABEL}>Total Awards</p>
                        <p className={STAT_VALUE}>
                            {stats.total}
                        </p>
                    </div>

                    <div className={STAT_CARD}>
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-6 h-6 text-primary" />
                        </div>
                        <p className={STAT_LABEL}>This Month</p>
                        <p className={STAT_VALUE}>
                            {stats.thisMonth}
                        </p>
                    </div>

                    <div className={STAT_CARD}>
                        <div className="flex items-center justify-between mb-2">
                            <Medal className="w-6 h-6 text-primary" />
                        </div>
                        <p className={STAT_LABEL}>This Year</p>
                        <p className={STAT_VALUE}>
                            {stats.thisYear}
                        </p>
                    </div>
                </div>
            )}

            {/* Awards Display */}
            {!isAdmin && awards.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {awards.map((award) => {
                        const Icon = getAwardIcon(award.title);
                        return (
                            <div
                                key={award.id}
                                className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-200/50 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900">
                                            {award.title}
                                        </h3>
                                        <p className="text-sm text-slate-600">
                                            {new Date(award.awardDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-slate-700">{award.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Awards Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-4 border border-primary/20">
                <h2 className="text-[16px] font-semibold mb-4">
                    {isAdmin ? "All Awards" : "My Awards"}
                </h2>
                {awards.length === 0 ? (
                    <div className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No awards yet
                        </h3>
                        <p className="text-slate-500">
                            {isAdmin
                                ? "Start recognizing your staff by creating awards"
                                : "Keep up the great work!"}
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={awards} searchKey="staff" />
                )}
            </div>
        </div>
    </RequireBranch>
    );
}
