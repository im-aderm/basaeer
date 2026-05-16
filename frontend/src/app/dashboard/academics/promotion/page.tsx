'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowRight, GraduationCap, Users } from 'lucide-react';
import { ClassService, Class, Section } from '@/services/classService';
import { StudentService, Student } from '@/services/studentService';
import { AcademicService } from '@/services/academicService';
import { toast } from 'sonner';

export default function StudentPromotionPage() {
    const { user, resolvedBranchId } = useAuth();

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
                toast.error('Failed to fetch classes');
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
            toast.error('Failed to fetch students');
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
            toast.error('Please select students and target destination');
            return;
        }

        setIsPromoting(true);
        try {
            await AcademicService.promoteStudents({
                studentIds: selectedStudentIds,
                targetClassId: targetClass,
                targetSectionId: targetSection
            });
            toast.success(`Successfully promoted ${selectedStudentIds.length} students`);
            fetchStudents(); // Refresh current list
        } catch (error) {
            toast.error('Promotion failed');
        } finally {
            setIsPromoting(false);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Student Promotion</h1>
                    <p className="text-muted-foreground font-medium mt-1">Move students to the next academic level.</p>
                </div>
                <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Selected</p>
                        <p className="text-h3 font-semibold">{selectedStudentIds.length} <span className="text-sm text-muted-foreground">Students</span></p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Source/Target Selection */}
                <Card className="lg:col-span-1 rounded-[2.5rem] shadow-2xl p-2 h-fit sticky top-8">
                    <CardHeader className="bg-primary/5 rounded-[2rem] mb-2">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" /> Selection
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {/* Source */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60 px-2">Source Level</h3>
                            <div className="space-y-4 p-4 bg-muted/30 rounded-3xl border">
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-1">Class</label>
                                    <Select value={selectedClass} onValueChange={handleClassChange}>
                                        <SelectTrigger className="h-12 rounded-2xl font-bold">
                                            <SelectValue placeholder="Select class" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-1">Section</label>
                                    <Select value={selectedSection} onValueChange={setSelectedSection}>
                                        <SelectTrigger className="h-12 rounded-2xl font-bold">
                                            <SelectValue placeholder="Select section" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {sections.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button className="w-full h-12 rounded-2xl font-semibold" onClick={fetchStudents} disabled={!selectedSection}>
                                    Find Students
                                </Button>
                            </div>
                        </div>

                        {/* Target */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600/60 px-2">Target Level</h3>
                            <div className="space-y-4 p-4 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-1">Target Class</label>
                                    <Select value={targetClass} onValueChange={handleTargetClassChange}>
                                        <SelectTrigger className="h-12 rounded-2xl border-emerald-500/10 font-bold">
                                            <SelectValue placeholder="To class" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {classes.map(c => (
                                                <SelectItem key={c.id} value={c.id} className="font-bold">{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-1">Target Section</label>
                                    <Select value={targetSection} onValueChange={setTargetSection}>
                                        <SelectTrigger className="h-12 rounded-2xl border-emerald-500/10 font-bold">
                                            <SelectValue placeholder="To section" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            {targetSections.map(s => (
                                                <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-16 rounded-3xl font-semibold text-h3 shadow-xl shadow-primary/20 bg-primary hover:scale-[1.02] transition-all"
                            disabled={selectedStudentIds.length === 0 || !targetSection || isPromoting}
                            onClick={handlePromote}
                        >
                            Promote <ArrowRight className="ml-2 h-6 w-6" />
                        </Button>
                    </CardContent>
                </Card>

                {/* Students List */}
                <div className="lg:col-span-3">
                    <Card className="rounded-[3rem] shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                                    <Users className="h-7 w-7 text-primary" />
                                    Student List
                                    {students.length > 0 && <span className="text-sm font-medium text-muted-foreground ml-2 not-italic">({students.length} found)</span>}
                                </CardTitle>
                                {students.length > 0 && (
                                    <div className="flex items-center gap-3 bg-muted/50 p-3 rounded-2xl">
                                        <Checkbox
                                            id="select-all"
                                            checked={selectedStudentIds.length === students.length && students.length > 0}
                                            onCheckedChange={toggleAll}
                                            className="h-5 w-5 rounded-lg border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                        />
                                        <label htmlFor="select-all" className="text-sm font-semibold cursor-pointer">Select All</label>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 flex-grow">
                            <div className="h-full">
                                <Table>
                                    <TableHeader className="bg-muted/30 h-16">
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead className="w-16 px-8"></TableHead>
                                            <TableHead className="font-semibold px-4 uppercase tracking-tighter text-muted-foreground">Admission No</TableHead>
                                            <TableHead className="font-semibold px-4 uppercase tracking-tighter text-muted-foreground">Full Name</TableHead>
                                            <TableHead className="font-semibold px-4 uppercase tracking-tighter text-muted-foreground">Father Name</TableHead>
                                            <TableHead className="font-semibold px-4 uppercase tracking-tighter text-muted-foreground">Previous Grade</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow
                                                key={student.id}
                                                className={`border-border/30 h-16 transition-colors hover:bg-primary/5 cursor-pointer ${selectedStudentIds.includes(student.id) ? 'bg-primary/5' : ''
                                                    }`}
                                                onClick={() => toggleStudent(student.id)}
                                            >
                                                <TableCell className="px-8" onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedStudentIds.includes(student.id)}
                                                        onCheckedChange={() => toggleStudent(student.id)}
                                                        className="h-6 w-6 rounded-xl border-2 border-primary/20 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all"
                                                    />
                                                </TableCell>
                                                <TableCell className="font-semibold text-primary/70">{student.admissionNumber || 'N/A'}</TableCell>
                                                <TableCell className="font-bold flex items-center gap-3 h-16">
                                                    <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center font-semibold text-primary text-xs">
                                                        {student.firstName[0]}{student.lastName[0]}
                                                    </div>
                                                    {student.firstName} {student.lastName}
                                                </TableCell>
                                                <TableCell className="font-medium text-muted-foreground">{student.parent?.user?.firstName || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary" className="font-semibold text-[10px] bg-muted/50">
                                                        {student.class?.name} - {student.section?.name}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {students.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-[400px]">
                                                    <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground opacity-50">
                                                        <Users className="h-20 w-20 stroke-[1]" />
                                                        <p className="font-semibold text-h3">Select a class & section to begin</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
