"use client";

import { useState, useEffect } from "react";
import { BookOpen, Clock, CheckCircle2, AlertCircle, Send, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useNotification } from '@/context/NotificationContext';
import { AcademicOpsService } from "@/services/academicOpsService";
import { useAuth } from "@/context/AuthContext";

export default function StudentHomeworkView() {
    const { showSuccess, showError } = useNotification();
    const { user, resolvedBranchId } = useAuth();
    const [assignments, setAssignments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
    const [contentUrl, setContentUrl] = useState("");

    useEffect(() => {
        if (user?.student?.id) {
            fetchAssignments();
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            if (!user?.student?.id) return;
            const data = await AcademicOpsService.getStudentAssignments(user.student.id);
            setAssignments(data);
        } catch (error) {
            showError("Failed to load assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!contentUrl || !selectedAssignment || !user?.student?.id) return;

        try {
            await AcademicOpsService.submitAssignment({
                assignmentId: selectedAssignment.id,
                studentId: user.student.id,
                contentUrl,
            });
            showSuccess("Assignment submitted successfully!");
            setContentUrl("");
            setSelectedAssignment(null);
            fetchAssignments();
        } catch (error) {
            showError("Failed to submit assignment");
        }
    };

    const getStatus = (assignment: any) => {
        const submission = assignment.submissions?.[0];
        if (!submission) return { text: "Not Submitted", color: "red", icon: AlertCircle };
        if (submission.status === "GRADED") return { text: "Graded", color: "green", icon: CheckCircle2 };
        return { text: "Submitted", color: "yellow", icon: Clock };
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
 <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-h1 font-bold tracking-tight text-primary">
                    My Homework
                </h1>
 <p className="text-slate-600 mt-2">
                    View and submit your assignments
                </p>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.length === 0 ? (
                    <div className="col-span-full text-center py-12">
 <BookOpen className="w-16 h-16 mx-auto text-slate-300 mb-4" />
 <h3 className="text-lg font-semibold text-slate-600 mb-2">
                            No assignments yet
                        </h3>
 <p className="text-slate-500 ">
                            Your teachers haven't assigned any homework yet
                        </p>
                    </div>
                ) : (
                    assignments.map((assignment) => {
                        const status = getStatus(assignment);
                        const StatusIcon = status.icon;
                        const submission = assignment.submissions?.[0];

                        return (
                            <div
                                key={assignment.id}
 className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
 <h3 className="font-semibold text-lg text-slate-900 mb-1">
                                            {assignment.title}
                                        </h3>
 <p className="text-sm text-slate-600 line-clamp-2">
                                            {assignment.description}
                                        </p>
                                    </div>
                                </div>

 <div className="flex items-center gap-4 text-sm text-slate-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" />
                                        Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mb-4">
 <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 ">
                                        {assignment.subject?.name || "General"}
                                    </span>
 <div className={`flex items-center gap-1 text-xs px-3 py-1 rounded-full bg-${status.color}-100 text-${status.color}-700 `}>
                                        <StatusIcon className="w-3 h-3" />
                                        {status.text}
                                    </div>
                                </div>

                                {assignment.attachmentUrl && (
                                    <div className="mb-4">
                                        <a
                                            href={assignment.attachmentUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
 className="text-xs flex items-center gap-2 p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                                        >
                                            <FileText className="w-4 h-4" />
                                            View Assignment Resources
                                        </a>
                                    </div>
                                )}

                                {submission?.grade && (
 <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold">Grade:</span>
                                            <span className="text-lg font-bold text-emerald-600">{submission.grade}/100</span>
                                        </div>
                                        {submission.feedback && (
 <p className="text-sm text-slate-600 ">
                                                <span className="font-semibold">Feedback:</span> {submission.feedback}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {!submission && (
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <Button
                                                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
                                                onClick={() => setSelectedAssignment(assignment)}
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Submit Assignment
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Submit Assignment</DialogTitle>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="contentUrl">Submission URL</Label>
                                                    <Input
                                                        id="contentUrl"
                                                        placeholder="https://drive.google.com/..."
                                                        value={contentUrl}
                                                        onChange={(e) => setContentUrl(e.target.value)}
                                                    />
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Paste a link to your Google Drive, Dropbox, or other cloud storage
                                                    </p>
                                                </div>
                                                <Button onClick={handleSubmit} className="w-full">
                                                    Submit
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
