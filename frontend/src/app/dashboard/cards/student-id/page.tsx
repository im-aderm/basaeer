"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Search,
    Loader2,
    Users,
    ChevronRight,
    CheckCircle2,
    Clock,
    Filter,
    ArrowRightCircle,
    Printer,
    Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentService, Student } from "@/services/studentService";
import { ClassService, Class } from "@/services/classService";
import { SessionService, AcademicSession } from "@/services/sessionService";
import { CardService, IdCardTemplate, IdCard } from "@/services/cardService";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function StudentIdCardsPage() {
    const { user, resolvedBranchId } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [templates, setTemplates] = useState<IdCardTemplate[]>([]);
    const [cards, setCards] = useState<IdCard[]>([]);

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [filters, setFilters] = useState({
        classId: "",
        sessionId: "",
        templateId: ""
    });

    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [previewCard, setPreviewCard] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, classesData, sessionsData, templatesData] = await Promise.all([
                StudentService.getAll(),
                ClassService.getAll(),
                SessionService.getAll(),
                CardService.getAllTemplates(resolvedBranchId)
            ]);

            setStudents(studentsData);
            setClasses(classesData);
            setSessions(sessionsData);
            setTemplates(templatesData);

            // Set default session if available
            const activeSession = sessionsData.find(s => s.isActive);
            if (activeSession && !filters.sessionId) {
                setFilters(prev => ({ ...prev, sessionId: activeSession.id }));
            }
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    };

    const fetchCards = async () => {
        if (!filters.sessionId || !resolvedBranchId) return;
        try {
            const cardData = await CardService.getAllCards(resolvedBranchId, filters.sessionId);
            setCards(cardData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch cards:", error);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    useEffect(() => {
        if (filters.sessionId) fetchCards();
    }, [filters.sessionId]);

    const handleGenerate = async () => {
        if (!filters.templateId || !filters.sessionId || selectedStudents.length === 0) {
            toast.error("Please select a template, session, and at least one student");
            return;
        }

        setGenerating(true);
        try {
            await CardService.generateCards({
                templateId: filters.templateId,
                sessionId: filters.sessionId,
                studentIds: selectedStudents
            });
            toast.success(`Successfully generated cards for ${selectedStudents.length} students`);
            setSelectedStudents([]);
            fetchCards();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Generation failed:", error);
            toast.error("Failed to generate ID cards");
        } finally {
            setGenerating(false);
        }
    };

    const toggleStudent = (id: string) => {
        setSelectedStudents(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    const filteredStudents = (students ?? []).filter(s => {
        const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filters.classId ? s.classId === filters.classId : true;
        return matchesSearch && matchesClass;
    });

    const getCardForStudent = (studentId: string) => {
        return cards.find(c => c.studentId === studentId);
    };

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Users className="text-primary w-10 h-10" />
                        Student ID Management
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Batch generate and manage student identity cards.</p>
                </div>
                <div className="flex flex-wrap gap-4">
                    <Button
                        disabled={selectedStudents.length === 0 || generating}
                        onClick={handleGenerate}
                        className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all bg-primary"
                    >
                        {generating ? <Loader2 className="animate-spin" /> : <ArrowRightCircle size={20} />}
                        Generate {selectedStudents.length > 0 ? `(${selectedStudents.length})` : ''} Cards
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="rounded-[3rem] border-border/50 shadow-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground ml-2">Class</label>
                        <select
                            className="w-full h-12 rounded-xl bg-white border border-primary/90 font-bold px-4 focus:ring-2 ring-primary/20"
                            value={filters.classId}
                            onChange={(e) => setFilters({ ...filters, classId: e.target.value })}
                        >
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground ml-2">Session</label>
                        <select
                            className="w-full h-12 rounded-xl bg-white border border-primary/90 font-bold px-4 focus:ring-2 ring-primary/20"
                            value={filters.sessionId}
                            onChange={(e) => setFilters({ ...filters, sessionId: e.target.value })}
                        >
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground ml-2">ID Template</label>
                        <select
                            className="w-full h-12 rounded-xl bg-white border border-primary/90 font-bold px-4 focus:ring-2 ring-primary/20"
                            value={filters.templateId}
                            onChange={(e) => setFilters({ ...filters, templateId: e.target.value })}
                        >
                            <option value="">Select Template...</option>
                            {templates.filter(t => t.type === 'STUDENT').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-semibold uppercase text-muted-foreground ml-2">Search Students</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                placeholder="Name or registration..."
                                className="pl-12 h-12 rounded-xl bg-muted/50 border-none font-bold"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </Card>

            {/* Student List */}
            <Card className="rounded-[4rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-primary/10">
                <CardHeader className="p-10 pb-0">
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-h3 font-semibold tracking-tight">Student Enrollment List</CardTitle>
                        <div className="text-sm font-bold text-muted-foreground">
                            {selectedStudents.length} selected / {filteredStudents.length} total
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-muted/30 text-left">
                                    <th className="px-10 py-6 w-10">
                                        <Checkbox
                                            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
                                            onCheckedChange={(checked) => {
                                                if (checked) setSelectedStudents(filteredStudents.map(s => s.id));
                                                else setSelectedStudents([]);
                                            }}
                                        />
                                    </th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">Student Info</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">Class Info</th>
                                    <th className="px-6 py-6 text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground">ID Status</th>
                                    <th className="px-6 py-6 text-right text-[10px] uppercase tracking-[0.3em] font-semibold text-muted-foreground pr-10">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {filteredStudents.map((student) => {
                                    const card = getCardForStudent(student.id);
                                    return (
                                        <tr key={student.id} className="hover:bg-primary/5 transition-all group">
                                            <td className="px-10 py-6">
                                                <Checkbox
                                                    checked={selectedStudents.includes(student.id)}
                                                    onCheckedChange={() => toggleStudent(student.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-muted bg-muted">
                                                        {student.passportPhoto ? (
                                                            <img src={student.passportPhoto} alt={`${student.firstName || ''} ${student.lastName || ''}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                                <Users size={20} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-lg tracking-tight">{student.firstName} {student.lastName}</div>
                                                        <div className="text-xs font-bold text-muted-foreground">REG: {student.id.split('-')[0].toUpperCase()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="font-bold text-base">{student.class?.name || 'N/A'}</div>
                                                <div className="text-xs font-medium text-muted-foreground">{student.section?.name || ''}</div>
                                            </td>
                                            <td className="px-6 py-6">
                                                {card ? (
                                                    <div className="flex items-center gap-2 text-green-600 font-semibold uppercase text-xs">
                                                        <CheckCircle2 size={16} /> Generated
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-amber-500 font-semibold uppercase text-xs">
                                                        <Clock size={16} /> Not Issued
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 text-right pr-10">
                                                <div className="flex items-center justify-end gap-2">
                                                    {card && (
                                                        <>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary"
                                                                onClick={() => setPreviewCard(card)}
                                                            >
                                                                <Printer size={18} />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-primary">
                                                                <Download size={18} />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted group-hover:bg-white/50">
                                                        <ChevronRight size={18} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* ID Card Preview Dialog */}
            <Dialog open={!!previewCard} onOpenChange={(open) => !open && setPreviewCard(null)}>
                <DialogContent className="max-w-md rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl">
                    {previewCard && (
                        <div className="bg-white p-10 space-y-8 flex flex-col items-center text-center">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-primary/10 bg-muted mb-4 shadow-xl">
                                {previewCard.student?.passportPhoto ? (
                                    <img src={previewCard.student.passportPhoto} alt={`${previewCard.student?.firstName || ''} ${previewCard.student?.lastName || ''}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                        <Users size={40} />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                                    {previewCard.student?.firstName} {previewCard.student?.lastName}
                                </h2>
                                <p className="text-xl font-bold text-primary uppercase tracking-widest">Student ID</p>
                                <div className="text-sm font-black text-slate-400 mt-2">
                                    REG: {previewCard.student?.id.split('-')[0].toUpperCase()}
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                                <QRCodeSVG 
                                    value={previewCard.qrPayload || ''} 
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="w-full grid grid-cols-2 gap-4 text-left pt-4 border-t border-slate-100">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase block">Class</span>
                                    <span className="font-bold text-slate-700">{previewCard.student?.class?.name}</span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase block">Section</span>
                                    <span className="font-bold text-slate-700">{previewCard.student?.section?.name || 'N/A'}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[10px] font-black text-slate-400 uppercase block">Institution</span>
                                    <span className="font-bold text-slate-700">{previewCard.student?.branch?.name || 'Basaer Academy'}</span>
                                </div>
                            </div>

                            <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest gap-2" onClick={() => window.print()}>
                                <Printer size={20} />
                                Print ID Card
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
