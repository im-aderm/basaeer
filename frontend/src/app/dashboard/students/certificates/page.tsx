"use client";

import { useState, useEffect } from "react";
import {
    FileText,
    Plus,
    Search,
    Download,
    Printer,
    Trash2,
    Loader2,
    CheckCircle2,
    GraduationCap,
    Clock,
    UserCircle
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StudentService, Student } from "@/services/studentService";

export default function CertificatesPage() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        type: "TRANSFER",
        certificateNumber: "",
        studentId: "",
        content: ""
    });

    const fetchData = async () => {
        try {
            const [certsRes, studentsData] = await Promise.all([
                api.get(`/certificates?branchId=${user?.branchId}`),
                StudentService.getAll()
            ]);
            setCertificates(certsRes.data);
            setStudents(studentsData);
        } catch (error) {
            console.error("Failed to fetch certificate data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/certificates", {
                ...formData,
                branchId: user?.branchId,
                content: { note: formData.content }
            });
            setIsDialogOpen(false);
            setFormData({ type: "TRANSFER", certificateNumber: "", studentId: "", content: "" });
            fetchData();
        } catch (error) {
            console.error("Failed to issue certificate:", error);
        }
    };

    const filteredCerts = certificates.filter(cert =>
        cert.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cert.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                        <FileText className="text-primary w-10 h-10" />
                        Certificate Vault
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Issue and manage academic and character certificates for students.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Issue New Certificate
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl bg-background/80 backdrop-blur-xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black italic mb-6 tracking-tight">Issue Student Certificate</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Certificate Type</label>
                                <select
                                    className="w-full h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="TRANSFER">Transfer Certificate</option>
                                    <option value="CHARACTER">Character Certificate</option>
                                    <option value="PROVISIONAL">Provisional Certificate</option>
                                    <option value="ACHIEVEMENT">Achievement Certificate</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Reference Number</label>
                                <Input
                                    placeholder="e.g. TC/2024/001"
                                    value={formData.certificateNumber}
                                    onChange={(e) => setFormData({ ...formData, certificateNumber: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Select Student</label>
                                <select
                                    className="w-full h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg px-4 appearance-none focus:ring-2 ring-primary/20 cursor-pointer"
                                    value={formData.studentId}
                                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                    required
                                >
                                    <option value="">Search and select student...</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.firstName} {s.lastName} (ID: {s.id.split('-')[0]})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Certificate Notes / Remarks</label>
                                <textarea
                                    placeholder="Add any specific details or remarks for the certificate..."
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full h-32 rounded-2xl bg-muted/30 border-none font-bold text-lg p-4 focus:ring-2 ring-primary/20 outline-none resize-none"
                                />
                            </div>
                            <Button type="submit" className="md:col-span-2 h-14 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Generate & Save Certificate
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[4rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20 bg-card/50 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 p-10">
                    <CardTitle className="text-2xl font-black italic tracking-tight">Issued Certificates</CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <Input
                            placeholder="Recipient name or number..."
                            className="pl-14 rounded-2xl bg-muted/30 border-none font-bold h-14 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/50 text-left">
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Type & Ref</th>
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Student Name</th>
                                    <th className="px-10 py-6 text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Issue Date</th>
                                    <th className="px-10 py-6 text-right text-[10px] uppercase tracking-[0.3em] font-black text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredCerts.map((cert) => (
                                    <tr key={cert.id} className="hover:bg-primary/5 transition-all group">
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <span className="font-black text-lg block italic uppercase tracking-tight">{cert.type.replace('_', ' ')}</span>
                                                    <span className="text-xs font-black text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border/50">{cert.certificateNumber}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground">
                                                    <UserCircle size={20} />
                                                </div>
                                                <span className="font-black text-xl italic">{cert.student.firstName} {cert.student.lastName}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2 text-muted-foreground font-black italic">
                                                <Clock size={16} className="text-primary/60" />
                                                {new Date(cert.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                        </td>
                                        <td className="px-10 py-8 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                    <Printer size={20} />
                                                </Button>
                                                <Button variant="outline" size="icon" className="h-12 w-12 rounded-2xl border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                                    <Download size={20} />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all">
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredCerts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-10 py-32 text-center">
                                            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <FileText size={40} className="text-muted-foreground/30" />
                                            </div>
                                            <h3 className="text-2xl font-black italic tracking-tight">No Certificates Issued</h3>
                                            <p className="text-muted-foreground font-medium italic mt-2">Start by issuing a new certificate to a student.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
