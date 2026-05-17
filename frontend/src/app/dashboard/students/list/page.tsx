"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { StudentService, Student } from "@/services/studentService";
import { ClassService, Class } from "@/services/classService";
import {
    Users,
    Search,
    Filter,
    MoreVertical,
    Loader2,
    User,
    Mail,
    Phone,
    GraduationCap,
    MapPin,
    ExternalLink,
    Grid,
    List,
    Trash2,
    Edit3,
    IdCard,
    Printer,
    Download,
    X,
    Eye,
    Pencil
} from "lucide-react";
import { clsx } from "clsx";
import { StudentIDCard } from "@/components/StudentIDCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function StudentListPage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("");
    const [viewMode, setViewMode] = useState<"table" | "grid">("table");
    const [selectedStudentForCard, setSelectedStudentForCard] = useState<Student | null>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, classesData] = await Promise.all([
                StudentService.getAll(),
                ClassService.getAll()
            ]);
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch students:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = (students ?? []).filter(student => {
        const matchesSearch =
            student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesClass = selectedClassId === "" || student.classId === selectedClassId;

        return matchesSearch && matchesClass;
    });

    if (loading && students.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
                <BranchContextBanner />
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Users className="text-primary w-10 h-10" />
                        Student Directory
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Browse and manage pupils across all educational levels.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-muted p-1 rounded-xl border border-border">
                        <button
                            onClick={() => setViewMode("table")}
                            className={clsx("p-2 rounded-lg transition-all", viewMode === "table" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                        >
                            <List size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode("grid")}
                            className={clsx("p-2 rounded-lg transition-all", viewMode === "grid" ? "bg-background shadow-sm text-primary" : "text-muted-foreground hover:text-foreground")}
                        >
                            <Grid size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => window.location.href = "/dashboard/students/admission"}
                        className="flex items-center gap-2 px-8 py-3.5 bg-primary text-white rounded-2xl font-semibold shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                    >
                        Admission
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 bg-white/75 border border-border p-4 rounded-[2rem] shadow-sm">
                <div className="relative group lg:col-span-2">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search by name, email, or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-white border border-primary/90 rounded-xl focus:border-primary outline-none transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <select
                        className="w-full pl-12 pr-4 py-3 bg-white border border-primary/90 rounded-xl focus:border-primary outline-none appearance-none font-medium cursor-pointer"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center px-4 text-sm text-muted-foreground font-bold">
                    {filteredStudents.length} Students Listed
                </div>
            </div>

            {/* Directory View */}
            {viewMode === "table" ? (
                <div className="bg-white/75 border border-border rounded-[2.5rem] shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-left border-b border-border">
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Student Name</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Class & Section</th>
                                    <th className="px-8 py-6 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Email / Login</th>
                                    <th className="px-10 py-6 text-[10px] text-right uppercase tracking-[0.2em] font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredStudents.map(student => (
                                    <tr key={student.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg group-hover:scale-110 transition-transform">
                                                    {student.firstName[0]}{student.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mt-0.5">ID: {student.id.split('-')[0].toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/5 border border-primary/10 rounded-lg text-xs font-semibold text-primary w-fit uppercase tracking-tighter">
                                                    <GraduationCap size={12} />
                                                    {student.class?.name || "No Class"}
                                                </span>
                                                <span className="text-xs text-muted-foreground font-bold pl-1">
                                                    Section: {student.section?.name || "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-bold">
                                                    <Mail size={14} className="text-primary/60" />
                                                    {student.user?.email}
                                                </div>
                                                {student.user?.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium pl-1">
                                                        <Phone size={12} />
                                                        {student.user.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-right relative">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-9 w-9 rounded-xl bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border-none"
                                                    onClick={() => router.push(`/dashboard/students/${student.id}`)}
                                                >
                                                    <Eye size={18} />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="h-9 w-9 rounded-xl bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all border-none"
                                                    onClick={() => router.push(`/dashboard/students/edit/${student.id}`)}
                                                >
                                                    <Pencil size={18} />
                                                </Button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedStudentForCard(student);
                                                        setIsCardModalOpen(true);
                                                    }}
                                                    className="p-2.5 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary rounded-xl transition-all"
                                                    title="Generate ID Card"
                                                >
                                                    <IdCard size={18} />
                                                </button>
                                                <button className="p-2.5 bg-muted hover:bg-red-500/10 text-muted-foreground hover:text-red-600 rounded-xl transition-all"><Trash2 size={18} /></button>
                                                <button
                                                    onClick={() => router.push(`/dashboard/students/${student.id}`)}
                                                    className="p-2.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20"
                                                >
                                                    <ExternalLink size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map(student => (
                        <div key={student.id} className="bg-white/75 border border-border rounded-[2.5rem] p-8 space-y-6 hover:shadow-2xl hover:shadow-primary/5 transition-all text-center group border-t-8 border-t-primary/10 hover:border-t-primary">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="w-24 h-24 rounded-[2rem] bg-muted/50 border-4 border-card group-hover:bg-primary/10 transition-colors flex items-center justify-center text-h1 font-semibold text-muted-foreground group-hover:text-primary transform group-hover:rotate-6 transition-all duration-500">
                                    {student.firstName[0]}{student.lastName[0]}
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg border-4 border-card">
                                    <GraduationCap size={18} />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="text-h3 font-semibold">{student.firstName} {student.lastName}</h3>
                                <p className="text-sm font-semibold text-primary uppercase tracking-widest">{student.class?.name} • {student.section?.name}</p>
                            </div>

                            <div className="pt-4 flex items-center justify-center gap-3">
                                <button
                                    onClick={() => {
                                        setSelectedStudentForCard(student);
                                        setIsCardModalOpen(true);
                                    }}
                                    className="flex-1 py-3 bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all rounded-2xl font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <IdCard size={14} /> Card
                                </button>
                                <button
                                    onClick={() => window.location.href = `/dashboard/students/${student.id}`}
                                    className="px-4 py-3 bg-primary text-white rounded-2xl shadow-xl shadow-primary/20"
                                >
                                    <ExternalLink size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }

            {/* ID Card Modal */}
            <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
                <DialogContent className="max-w-4xl rounded-[3rem] border-border/50 shadow-2xl overflow-hidden p-0 bg-transparent border-none">
                    <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-[3rem] overflow-hidden">
                        <DialogHeader className="p-8 pb-0 flex flex-row items-center justify-between">
                            <DialogTitle className="text-h1 font-semibold tracking-tight">Student ID Card</DialogTitle>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                                >
                                    <Printer size={18} /> Print Card
                                </button>
                                <button
                                    onClick={() => setIsCardModalOpen(false)}
                                    className="p-2.5 bg-muted hover:bg-muted-foreground/10 text-muted-foreground rounded-xl transition-all"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </DialogHeader>
                        <div className="p-10 flex justify-center items-center">
                            {selectedStudentForCard && <StudentIDCard student={selectedStudentForCard} />}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {
                filteredStudents.length === 0 && (
                    <div className="py-32 text-center animate-in fade-in zoom-in-95">
                        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-muted mb-6">
                            <Users size={48} className="text-muted-foreground/30" />
                        </div>
                        <h2 className="text-h3 font-semibold">No matching records</h2>
                        <p className="text-muted-foreground mt-2 max-w-xs mx-auto font-medium">Adjust your filters or search terms to find the student you're looking for.</p>
                    </div>
                )
            }
        </div >
        </RequireBranch>
    );
}
