"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/DataTable";
import { useNotification } from '@/context/NotificationContext';
import { AcademicOpsService } from "@/services/academicOpsService";
import { ClassService } from "@/services/classService";
import { SubjectService } from "@/services/subjectService";

export default function HomeworkEvaluationReport() {
    const { showError } = useNotification();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        classId: "",
        subjectId: "",
        dateFrom: "",
        dateTo: "",
    });

    useEffect(() => {
        fetchData();
    }, [filters]);

    const fetchData = async () => {
        try {
            const [assignmentsData, classesData, subjectsData] = await Promise.all([
                AcademicOpsService.getAssignments(filters),
                ClassService.getAll(),
                SubjectService.getAll(),
            ]);
            setAssignments(assignmentsData);
            setClasses(classesData);
            setSubjects(subjectsData);
        } catch (error) {
            showError("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        const totalAssignments = assignments.length;
        const totalSubmissions = assignments.reduce((sum, a) => sum + (a._count?.submissions || 0), 0);
        const gradedSubmissions = assignments.reduce((sum, a) => {
            return sum + (a.submissions?.filter((s: any) => s.status === "GRADED").length || 0);
        }, 0);
        const avgGrade = assignments.reduce((sum, a) => {
            const grades = a.submissions?.filter((s: any) => s.grade).map((s: any) => s.grade) || [];
            const avg = grades.length > 0 ? grades.reduce((s: number, g: number) => s + g, 0) / grades.length : 0;
            return sum + avg;
        }, 0) / (totalAssignments || 1);

        return {
            totalAssignments,
            totalSubmissions,
            gradedSubmissions,
            avgGrade: avgGrade.toFixed(1),
            submissionRate: totalAssignments > 0 ? ((totalSubmissions / (totalAssignments * 30)) * 100).toFixed(1) : 0,
        };
    };

    const stats = calculateStats();

    const columns = [
        {
            header: "Assignment",
            accessorKey: "title",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">{row.title}</p>
                    <p className="text-sm text-slate-500">{row.subject?.name}</p>
                </div>
            ),
        },
        {
            header: "Due Date",
            accessorKey: "dueDate",
            cell: (row: any) => new Date(row.dueDate).toLocaleDateString(),
        },
        {
            header: "Submissions",
            accessorKey: "_count.submissions",
            cell: (row: any) => (
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    {row._count?.submissions || 0}
                </div>
            ),
        },
        {
            header: "Graded",
            accessorKey: "graded",
            cell: (row: any) => {
                const graded = row.submissions?.filter((s: any) => s.status === "GRADED").length || 0;
                const total = row._count?.submissions || 0;
                return (
                    <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                            <div
                                className="bg-emerald-500 h-2 rounded-full"
                                style={{ width: `${total > 0 ? (graded / total) * 100 : 0}%` }}
                            />
                        </div>
                        <span className="text-sm">{graded}/{total}</span>
                    </div>
                );
            },
        },
        {
            header: "Avg Grade",
            accessorKey: "avgGrade",
            cell: (row: any) => {
                const grades = row.submissions?.filter((s: any) => s.grade).map((s: any) => s.grade) || [];
                const avg = grades.length > 0 ? grades.reduce((s: number, g: number) => s + g, 0) / grades.length : 0;
                return (
                    <span className={`font-semibold ${avg >= 70 ? "text-emerald-600" : avg >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                        {avg > 0 ? avg.toFixed(1) : "N/A"}
                    </span>
                );
            },
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">
                            Homework Evaluation Report
                        </h1>
                        <p className="text-slate-600 mt-2">
                            Track assignment completion and student performance
                        </p>
                    </div>
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-indigo-600" />
                    </div>
                    <p className="text-sm text-slate-600">Total Assignments</p>
                    <p className="text-h1 font-bold text-slate-900">{stats.totalAssignments}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <Users className="w-8 h-8 text-emerald-600" />
                    </div>
                    <p className="text-sm text-slate-600">Total Submissions</p>
                    <p className="text-h1 font-bold text-slate-900">{stats.totalSubmissions}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 text-purple-600" />
                    </div>
                    <p className="text-sm text-slate-600">Graded</p>
                    <p className="text-h1 font-bold text-slate-900">{stats.gradedSubmissions}</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-8 h-8 text-yellow-600" />
                    </div>
                    <p className="text-sm text-slate-600">Avg Grade</p>
                    <p className="text-h1 font-bold text-slate-900">{stats.avgGrade}%</p>
                </div>

                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 text-teal-600" />
                    </div>
                    <p className="text-sm text-slate-600">Submission Rate</p>
                    <p className="text-h1 font-bold text-slate-900">{stats.submissionRate}%</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 mb-8">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="text-sm font-medium mb-2 block">Class</label>
                        <Select value={filters.classId} onValueChange={(value) => setFilters({ ...filters, classId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Classes" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Classes</SelectItem>
                                {classes.map((cls) => (
                                    <SelectItem key={cls.id} value={cls.id}>
                                        {cls.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">Subject</label>
                        <Select value={filters.subjectId} onValueChange={(value) => setFilters({ ...filters, subjectId: value })}>
                            <SelectTrigger>
                                <SelectValue placeholder="All Subjects" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Subjects</SelectItem>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.id}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">From Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={filters.dateFrom}
                            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium mb-2 block">To Date</label>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg"
                            value={filters.dateTo}
                            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Assignments Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50">
                <h2 className="text-xl font-semibold mb-4">Assignment Performance</h2>
                <DataTable
                    columns={columns}
                    data={assignments}
                    searchKey="title"
                />
            </div>
        </div>
    );
}
