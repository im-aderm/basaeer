'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import { clsx } from 'clsx';
import { ClassService, Class, Section } from '@/services/classService';
import { StudentService, Student } from '@/services/studentService';
import { AcademicService } from '@/services/academicService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY } from '@/lib/table-styles';

export default function StudentPromotionPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();

    // Source Selection
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClass, setSelectedClass] = useState<string>('');
    const [sections, setSections] = useState<Section[]>([]);
    const [selectedSection, setSelectedSection] = useState<string>('');

    // Students
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

    // Target Selection
    const [targetClass, setTargetClass] = useState<string>('');
    const [targetSections, setTargetSections] = useState<Section[]>([]);
    const [targetSection, setTargetSection] = useState<string>('');

    const [isPromoting, setIsPromoting] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await ClassService.getAll();
                setClasses(data);
            } catch (error) {
                showError('Failed to fetch classes');
            }
        };
        fetchClasses();
    }, []);

    const handleClassChange = (classId: string) => {
        setSelectedClass(classId);
        const cls = classes.find(c => c.id === classId);
        setSections(cls?.sections || []);
        setSelectedSection('');
        setStudents([]);
    };

    const handleTargetClassChange = (classId: string) => {
        setTargetClass(classId);
        const cls = classes.find(c => c.id === classId);
        setTargetSections(cls?.sections || []);
        setTargetSection('');
    };

    const fetchStudents = async () => {
        if (!selectedSection) return;
        try {
            const data = await StudentService.getAll({ classId: selectedClass, sectionId: selectedSection });
            setStudents(data);
            setSelectedStudentIds([]);
        } catch (error) {
            showError('Failed to fetch students');
        }
    };

    const toggleStudent = (studentId: string) => {
        setSelectedStudentIds(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const toggleAll = () => {
        if (selectedStudentIds.length === students.length) {
            setSelectedStudentIds([]);
        } else {
            setSelectedStudentIds(students.map(s => s.id));
        }
    };

    const handlePromote = async () => {
        if (selectedStudentIds.length === 0 || !targetClass || !targetSection) {
            showError('Please select students and target destination');
            return;
        }

        setIsPromoting(true);
        try {
            await AcademicService.promoteStudents({
                studentIds: selectedStudentIds,
                targetClassId: targetClass,
                targetSectionId: targetSection
            });
            showSuccess(`Successfully promoted ${selectedStudentIds.length} students`);
            fetchStudents(); // Refresh current list
        } catch (error) {
            showError('Promotion failed');
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="space-y-8 max-w-7xl mx-auto">
                <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Student Promotion</h1>
                    <p className="text-foreground/60 font-medium mt-1 text-[12px]">Move students to the next academic level.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60">Selected</p>
                        <p className="text-[16px] font-semibold">{selectedStudentIds.length} <span className="text-[12px] text-foreground/60">Students</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Source/Target Selection */}
                <Card className="lg:col-span-1 rounded-2xl shadow-sm p-1.5 h-fit sticky top-8">
                    <CardHeader className="bg-primary/5 rounded-xl mb-1.5">
                        <CardTitle className="text-[14px] font-semibold flex items-center gap-2">
                            <GraduationCap className="h-4 w-4" /> Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        {/* Source */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary/60 px-1">Source Level</h3>
                            <div className="space-y-3 p-3 bg-muted/30 rounded-xl border">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Class</label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className="h-10 rounded-lg font-semibold text-[12px]">
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="font-semibold text-[12px]">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Section</label>
                                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                                        <SelectTrigger className="h-10 rounded-lg font-semibold text-[12px]">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {sections.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-semibold text-[12px]">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full h-10 rounded-lg font-semibold text-[12px]" onClick={fetchStudents} disabled={!selectedSection}>
                                    Find Students
                                </Button>
                            </div>
                        </div>

                        {/* Target */}
                        <div className="space-y-3">
                            <h3 className="text-[9px] font-semibold uppercase tracking-[0.2em] text-primary/60 px-1">Target Level</h3>
                            <div className="space-y-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Target Class</label>
                                    <Select value={targetClass} onValueChange={handleTargetClassChange}>
                                        <SelectTrigger className="h-10 rounded-lg border-primary/10 font-semibold text-[12px]">
                                            <SelectValue placeholder="To class" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="font-semibold text-[12px]">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-semibold uppercase tracking-widest text-foreground/60 ml-1">Target Section</label>
                                    <Select value={targetSection} onValueChange={setTargetSection}>
                                        <SelectTrigger className="h-10 rounded-lg border-primary/10 font-semibold text-[12px]">
                                            <SelectValue placeholder="To section" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                            {targetSections.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-semibold text-[12px]">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-12 rounded-xl font-semibold shadow-sm bg-primary hover:scale-[1.01] transition-all text-[12px]"
                            disabled={selectedStudentIds.length === 0 || !targetSection || isPromoting}
                            onClick={handlePromote}
                        >
                            Promote <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Students List */}
                <div className="lg:col-span-3">
                    <Card className="rounded-2xl shadow-sm overflow-hidden min-h-[400px] flex flex-col">
                        <CardHeader className="p-4 pb-3">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-2">
                                    <Users className="h-5 w-5 text-primary" />
                                    Student List
                                    {students.length > 0 && <span className="text-[10px] font-medium text-foreground/60 ml-1 not-italic">({students.length} found)</span>}
                                </CardTitle>
                                {students.length > 0 && (
                                    <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-lg">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedStudentIds.length === students.length && students.length > 0}
                                            onCheckedChange={toggleAll}
                                            className="h-4 w-4 rounded border border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label htmlFor="select-all" className="text-[12px] font-semibold cursor-pointer">Select All</label>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                            <div className="h-full">
                                <table className={TABLE_ROOT}>
                                    <thead>
                                        <tr className={TABLE_HEADER}>
                                            <th className={clsx(TABLE_HEADER_CELL_NO_SORT, "w-12")}></th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Admission No</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Full Name</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Father Name</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Previous Grade</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className={`transition-colors hover:bg-primary/5 cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-primary/5' : ''}`}
                                                onClick={() => toggleStudent(student.id)}
                                            >
                                                <td className={TABLE_CELL} onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onCheckedChange={() => toggleStudent(student.id)}
                                                        className="h-4 w-4 rounded border border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                    />
                                                </td>
                                                <td className={clsx(TABLE_CELL, "text-primary/70 font-semibold")}>{student.admissionNumber || 'N/A'}</td>
                                                <td className={clsx(TABLE_CELL_PRIMARY, "flex items-center gap-2")}>
                                                    <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center font-semibold text-primary text-[9px]">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    {student.firstName} {student.lastName}
                                                </td>
                                                <td className={TABLE_CELL}>{student.parent?.user?.firstName || 'N/A'}</td>
                                                <td className={TABLE_CELL}>
                                                    <Badge variant="secondary" className="font-semibold text-[9px] bg-muted/50">
                                                        {student.class?.name} - {student.section?.name}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                        {students.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="py-20">
                                                    <div className="flex flex-col items-center justify-center gap-3 text-foreground/60 opacity-50">
                                                        <Users className="h-12 w-12 stroke-[1]" />
                                                        <p className="font-semibold text-[14px]">Select a class & section to begin</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}
