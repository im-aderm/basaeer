"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/DataTable";
import { useNotification } from '@/context/NotificationContext';
import { AcademicOpsService } from "@/services/academicOpsService";

export default function AssignmentEvaluation() {
    const { showSuccess, showError } = useNotification();
    const params = useParams();
    const router = useRouter();
    const assignmentId = params.id as string;

    const [assignment, setAssignment] = useState<any>(null);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [assignmentId]);

    const fetchData = async () => {
        try {
            const [assignmentData, submissionsData] = await Promise.all([
                AcademicOpsService.getAssignmentById(assignmentId),
                AcademicOpsService.getAssignmentSubmissions(assignmentId),
            ]);
            setAssignment(assignmentData);
            setSubmissions(submissionsData);
        } catch (error) {
            showError("Failed to load assignment data");
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submissionId: string, grade: number, feedback: string) => {
        try {
            await AcademicOpsService.gradeSubmission(submissionId, grade, feedback);
            showSuccess("Submission graded successfully!");
            fetchData();
        } catch (error) {
            showError("Failed to grade submission");
        }
    };

    const columns = [
        {
            header: "Student",
            accessorKey: "student",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">{row.student?.user?.firstName} {row.student?.user?.lastName}</p>
                    <p className="text-sm text-slate-500">{row.student?.admissionNumber}</p>
                </div>
            ),
        },
        {
            header: "Submitted",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Content",
            accessorKey: "contentUrl",
            cell: (row: any) => (
                <a
                    href={row.contentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                >
                    <FileText className="w-4 h-4" />
                    View Submission
                </a>
            ),
        },
        {
            header: "Grade",
            accessorKey: "grade",
            cell: (row: any) => (
                <Input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={row.grade || ""}
                    className="w-20"
                    onBlur={(e) => {
                        const grade = parseInt(e.target.value);
                        if (grade >= 0 && grade <= 100) {
                            handleGrade(row.id, grade, row.feedback || "");
                        }
                    }}
                />
            ),
        },
        {
            header: "Feedback",
            accessorKey: "feedback",
            cell: (row: any) => (
                <Textarea
                    defaultValue={row.feedback || ""}
                    className="min-w-[200px]"
                    rows={2}
                    onBlur={(e) => {
                        handleGrade(row.id, row.grade || 0, e.target.value);
                    }}
                />
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            cell: (row: any) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs ${row.status === "GRADED"
 ? "bg-green-100 text-green-700 "
 : "bg-yellow-100 text-yellow-700 "
                        }`}
                >
                    {row.status}
                </span>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-primary/5 to-primary/5 p-6">
            {/* Header */}
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Assignments
                </Button>
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                    <h1 className="text-h1 font-bold tracking-tight text-primary">
                        {assignment?.title}
                    </h1>
 <p className="text-slate-600 mb-4">
                        {assignment?.description}
                    </p>
 <div className="flex items-center gap-6 text-sm text-slate-600 ">
                        <div>
                            <span className="font-semibold">Due Date:</span>{" "}
                            {new Date(assignment?.dueDate).toLocaleDateString()}
                        </div>
                        <div>
                            <span className="font-semibold">Submissions:</span>{" "}
                            {submissions.length}
                        </div>
                        <div>
                            <span className="font-semibold">Graded:</span>{" "}
                            {(submissions ?? []).filter((s) => s.status === "GRADED").length}
                        </div>
                    </div>
                    {assignment?.attachmentUrl && (
                        <div className="mt-4">
                            <a
                                href={assignment.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium"
                            >
                                <FileText className="w-4 h-4" />
                                View Attached Resources
                            </a>
                        </div>
                    )}
                </div>
            </div>

            {/* Submissions Table */}
 <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 ">
                <h2 className="text-xl font-semibold mb-4">Student Submissions</h2>
                <DataTable
                    columns={columns}
                    data={submissions}
                    searchKey="student"
                />
            </div>
        </div>
    );
}
