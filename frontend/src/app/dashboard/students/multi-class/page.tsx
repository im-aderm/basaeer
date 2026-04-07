"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/DataTable";
import { toast } from "sonner";
import api from "@/lib/api";

export default function MultiClassEnrollmentPage() {
    const [students, setStudents] = useState<any[]>([]);
    const [classes, setClasses] = useState<any[]>([]);
    const [enrollments, setEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState("");
    const [selectedClass, setSelectedClass] = useState("");
    const [selectedSection, setSelectedSection] = useState("");
    const [isPrimary, setIsPrimary] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [studentsData, classesData, enrollmentsData] = await Promise.all([
                api.get("/students"),
                api.get("/classes"),
                api.get("/students/multi-class-enrollments"),
            ]);
            setStudents(studentsData.data);
            setClasses(classesData.data);
            setEnrollments(enrollmentsData.data);
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async () => {
        try {
            await api.post("/students/multi-class-enrollments", {
                studentId: selectedStudent,
                classId: selectedClass,
                sectionId: selectedSection,
                isPrimary,
            });
            toast.success("Student enrolled successfully!");
            setIsDialogOpen(false);
            setSelectedStudent("");
            setSelectedClass("");
            setSelectedSection("");
            setIsPrimary(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to enroll student");
        }
    };

    const handleRemoveEnrollment = async (id: string) => {
        if (!confirm("Are you sure you want to remove this enrollment?")) return;

        try {
            await api.delete(`/students/multi-class-enrollments/${id}`);
            toast.success("Enrollment removed");
            fetchData();
        } catch (error) {
            toast.error("Failed to remove enrollment");
        }
    };

    const columns = [
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
            header: "Class/Section",
            accessorKey: "class",
            cell: (row: any) => (
                <div>
                    <p className="font-medium">{row.class?.name}</p>
                    <p className="text-sm text-slate-500">{row.section?.name}</p>
                </div>
            ),
        },
        {
            header: "Type",
            accessorKey: "isPrimary",
            cell: (row: any) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${row.isPrimary
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                            : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                >
                    {row.isPrimary ? "Primary" : "Secondary"}
                </span>
            ),
        },
        {
            header: "Enrolled",
            accessorKey: "createdAt",
            cell: (row: any) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
            header: "Actions",
            accessorKey: "actions",
            cell: (row: any) => (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:bg-red-50"
                    onClick={() => handleRemoveEnrollment(row.id)}
                    disabled={row.isPrimary}
                >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Remove
                </Button>
            ),
        },
    ];

    const selectedClassData = classes.find((c) => c.id === selectedClass);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 dark:from-slate-950 dark:via-indigo-950/20 dark:to-purple-950/10 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-h1 font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Multi-Class Enrollment
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mt-2">
                            Assign students to multiple classes for electives or special programs
                        </p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Enrollment
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Enroll Student in Additional Class</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="student">Student</Label>
                                    <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select student" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {students.map((student) => (
                                                <SelectItem key={student.id} value={student.id}>
                                                    {student.user?.firstName} {student.user?.lastName} -{" "}
                                                    {student.admissionNumber}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label htmlFor="class">Class</Label>
                                    <Select value={selectedClass} onValueChange={setSelectedClass}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select class" />
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

                                {selectedClassData?.sections && selectedClassData.sections.length > 0 && (
                                    <div>
                                        <Label htmlFor="section">Section</Label>
                                        <Select value={selectedSection} onValueChange={setSelectedSection}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select section" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectedClassData.sections.map((section: any) => (
                                                    <SelectItem key={section.id} value={section.id}>
                                                        {section.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isPrimary"
                                        checked={isPrimary}
                                        onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
                                    />
                                    <label
                                        htmlFor="isPrimary"
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        Set as primary class
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleEnroll}
                                        disabled={!selectedStudent || !selectedClass}
                                    >
                                        Enroll Student
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                    About Multi-Class Enrollment
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                    Students can be enrolled in multiple classes for elective subjects, special programs, or
                    advanced courses. Each student must have one primary class for administrative purposes.
                    Secondary enrollments cannot be removed if they are the primary class.
                </p>
            </div>

            {/* Enrollments Table */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/50">
                <h2 className="text-xl font-semibold mb-4">All Enrollments</h2>
                {enrollments.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">
                            No multi-class enrollments yet
                        </h3>
                        <p className="text-slate-500 dark:text-slate-500">
                            Enroll students in additional classes to get started
                        </p>
                    </div>
                ) : (
                    <DataTable columns={columns} data={enrollments} searchKey="student" />
                )}
            </div>
        </div>
    );
}
