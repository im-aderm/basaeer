"use client";

import { useState, useEffect } from "react";
import { Award, Plus, Trophy, Star, Medal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function StaffAwardsPage() {
    const { user } = useAuth();
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
            toast.error("Failed to load awards");
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
            toast.success("Award created successfully!");
            setIsDialogOpen(false);
            setFormData({
                staffId: "",
                title: "",
                description: "",
                awardDate: "",
            });
            fetchData();
        } catch (error) {
            toast.error("Failed to create award");
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
                        <div className="p-2 bg-gradient-to-br from-yellow-100 to-amber-100 dark:from-yellow-900/30 dark:to-amber-900/30 rounded-lg">
                            <Icon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
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
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{row.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">
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
        const thisMonth = awards.filter((a) => {
            const awardDate = new Date(a.awardDate);
            const now = new Date();
            return (
                awardDate.getMonth() === now.getMonth() &&
                awardDate.getFullYear() === now.getFullYear()
            );
        }).length;
        const thisYear = awards.filter((a) => {
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-yellow-50/30 to-amber-50/20 dark:from-slate-950 dark:via-yellow-950/20 dark:to-amber-950/10 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                            Staff Awards & Recognition
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            {isAdmin
                                ? "Recognize and reward outstanding staff performance"
                                : "View your awards and achievements"}
                        </p>
                    </div>
                    {isAdmin && (
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700">
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy className="w-8 h-8 text-yellow-600" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Awards</p>
                        <p className="text-h1 font-bold text-slate-900 dark:text-slate-100">
                            {stats.total}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <Star className="w-8 h-8 text-amber-600" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">This Month</p>
                        <p className="text-h1 font-bold text-slate-900 dark:text-slate-100">
                            {stats.thisMonth}
                        </p>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                        <div className="flex items-center justify-between mb-2">
                            <Medal className="w-8 h-8 text-orange-600" />
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">This Year</p>
                        <p className="text-h1 font-bold text-slate-900 dark:text-slate-100">
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
                                className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 backdrop-blur-xl rounded-2xl p-6 border-2 border-yellow-200/50 dark:border-yellow-800/50 hover:shadow-xl hover:shadow-yellow-500/20 transition-all duration-300"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                                            {award.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 dark:text-slate-400">
                                            {new Date(award.awardDate).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-slate-700 dark:text-slate-300">{award.description}</p>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Awards Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4">
                    {isAdmin ? "All Awards" : "My Awards"}
                </h2>
                {awards.length === 0 ? (
                    <div className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            No awards yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500">
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
    );
}
