"use client";

import { useState, useEffect } from "react";
import { TrendingUp, Users, CheckCircle2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import api from "@/lib/api";

export default function StudentPromotionPage() {
    const [classes, setClasses] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [promotionHistory, setPromotionHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFromClass, setSelectedFromClass] = useState("");
    const [selectedToClass, setSelectedToClass] = useState("");
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [promoting, setPromoting] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedFromClass) {
            fetchStudents();
        }
    }, [selectedFromClass]);

    const fetchData = async () => {
        try {
            const [classesData, historyData] = await Promise.all([
                api.get("/classes"),
                api.get("/students/promotions"),
            ]);
            setClasses(classesData.data);
            setPromotionHistory(historyData.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get(`/students?classId=${selectedFromClass}`);
            setStudents(response.data);
        } catch (error) {
            toast.error("Failed to load students");
        }
    };

    const handlePromote = async () => {
        if (!selectedToClass) {
            toast.error("Please select a destination class");
            return;
        }

        if (selectedStudents.length === 0) {
            toast.error("Please select at least one student");
            return;
        }

        setPromoting(true);
        try {
            await api.post("/students/promotions/bulk", {
                studentIds: selectedStudents,
                toClassId: selectedToClass,
            });
            toast.success(`${selectedStudents.length} students promoted successfully!`);
            setSelectedStudents([]);
            fetchStudents();
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to promote students");
        } finally {
            setPromoting(false);
        }
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedStudents(students.map((s) => s.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const columns = [
        {
            header: () => (
                <Checkbox
                    checked={selectedStudents.length === students.length && students.length > 0}
                    onCheckedChange={handleSelectAll}
                />
            ),
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
            header: "Current Class",
            accessorKey: "section",
            cell: (row: any) =>
                row.section ? `${row.section.class?.name} - ${row.section.name}` : "N/A",
        },
        {
            header: "Admission Year",
            accessorKey: "admissionDate",
            cell: (row: any) =>
                row.admissionDate ? new Date(row.admissionDate).getFullYear() : "N/A",
        },
    ];

    const historyColumns = [
        {
            header: "Student",
            accessorKey: "student",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">
                        {row.student?.user?.firstName} {row.student?.user?.lastName}
                    </p>
                    <p className="text-sm text-slate-500">{row.student?.admissionNumber}</p>
                </div>
            ),
        },
        {
            header: "From",
            accessorKey: "fromClass",
            cell: (row: any) => row.fromClass?.name || "N/A",
        },
        {
            header: "To",
            accessorKey: "toClass",
            cell: (row: any) => row.toClass?.name || "N/A",
        },
        {
            header: "Promoted On",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Promoted By",
            accessorKey: "promotedBy",
            cell: (row: any) =>
                row.promotedBy
                    ? `${row.promotedBy.firstName} ${row.promotedBy.lastName}`
                    : "System",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 dark:from-slate-950 dark:via-emerald-950/20 dark:to-teal-950/10 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Student Promotion
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                    Promote students to the next class or academic year
                </p>
            </div>

            {/* Promotion Form */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 mb-8">
                <h2 className="text-lg font-semibold mb-4">Bulk Promotion</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div>
                        <Label>From Class</Label>
                        <Select value={selectedFromClass} onValueChange={setSelectedFromClass}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select current class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>To Class</Label>
                        <Select value={selectedToClass} onValueChange={setSelectedToClass}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Select next class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            onClick={handlePromote}
                            disabled={!selectedFromClass || !selectedToClass || selectedStudents.length === 0 || promoting}
                            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                        >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            {promoting ? "Promoting..." : `Promote ${selectedStudents.length} Students`}
                        </Button>
                    </div>
                </div>

                {selectedStudents.length > 0 && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                            <CheckCircle2 className="w-4 h-4 inline mr-2" />
                            {selectedStudents.length} student(s) selected for promotion
                        </p>
                    </div>
                )}
            </div>

            {/* Students List */}
            {selectedFromClass && (
                <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50 mb-8">
                    <h2 className="text-xl font-semibold mb-4">
                        Students in {classes.find((c) => c.id === selectedFromClass)?.name}
                    </h2>
                    {students.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                                No students found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-500">
                                This class has no students to promote
                            </p>
                        </div>
                    ) : (
                        <DataTable columns={columns} data={students} searchKey="user" />
                    )}
                </div>
            )}

            {/* Promotion History */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <History className="w-5 h-5" />
                    Promotion History
                </h2>
                {promotionHistory.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            No promotion history
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500">
                            Student promotions will appear here
                        </p>
                    </div>
                ) : (
                    <DataTable columns={historyColumns} data={promotionHistory} searchKey="student" />
                )}
            </div>
        </div>
    );
}
