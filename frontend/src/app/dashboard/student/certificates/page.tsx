"use client";

import { useState, useEffect } from "react";
import {
    Award,
    Download,
    ExternalLink,
    Search,
    Loader2,
    Calendar,
    FileText,
    ShieldCheck
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function StudentCertificatesPage() {
    const { user } = useAuth();
    const [certificates, setCertificates] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = async () => {
        try {
            // Fetch certificates belonging to the current logged-in student securely
            const res = await api.get("/certificates/my-certificates");
            setCertificates(Array.isArray(res.data) ? res.data : []);
        } catch (error) {
            console.error("Failed to fetch student certificates:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const handleDownload = async (id: string, name: string) => {
        try {
            const response = await api.get(`/certificates/${id}/pdf`);
            const base64Data = response.data;
            const byteCharacters = atob(base64Data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Certificate_${name.replace(/\s+/g, '_')}.pdf`;
            link.click();
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const filteredCertificates = certificates.filter(c =>
        c.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-10 rounded-[3rem] border border-primary/10 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                            <Award className="text-primary w-10 h-10" />
                            My Achievements
                        </h1>
                        <p className="text-muted-foreground font-medium text-lg">Your official credentials and certifications across all sessions.</p>
                    </div>
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
                        <Input
                            placeholder="Search certificates..."
                            className="pl-12 h-14 rounded-2xl bg-background/50 border-none shadow-sm focus-visible:ring-2 ring-primary/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Certificates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCertificates.map((cert) => (
                    <Card key={cert.id} className="rounded-[3rem] border-none shadow-xl overflow-hidden group hover:scale-[1.02] transition-all bg-card/40 backdrop-blur-sm">
                        <CardContent className="p-0">
                            {/* Visual Preview Area */}
                            <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
                                <div className="absolute inset-4 border border-slate-300 opacity-30 rounded-2xl" />
                                <div className="bg-white/80 p-4 rounded-full shadow-lg mb-3 group-hover:scale-110 transition-transform duration-500">
                                    <Award className="w-10 h-10 text-primary" />
                                </div>
                                <h3 className="text-xl font-black italic tracking-tight line-clamp-1">{cert.type}</h3>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mt-1">Ref: {cert.certificateNumber}</p>
                            </div>

                            {/* Details Area */}
                            <div className="p-8 space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                                        <Calendar size={18} className="text-primary" />
                                        <span>Issued: {new Date(cert.issuedDate || cert.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground bg-muted/30 p-3 rounded-2xl">
                                        <ShieldCheck size={18} className="text-primary" />
                                        <span>Verified Authentic</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 gap-2 rounded-2xl h-12 font-black text-sm transition-all shadow-lg shadow-primary/10"
                                        onClick={() => handleDownload(cert.id, user?.firstName + "_" + cert.type)}
                                    >
                                        <Download size={18} /> Download PDF
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="rounded-2xl h-12 w-14 border-border/50 group-hover:bg-primary group-hover:text-white transition-colors"
                                        onClick={() => window.open(`/public/verify/${cert.verificationCode}`, '_blank')}
                                    >
                                        <ExternalLink size={18} />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {filteredCertificates.length === 0 && (
                    <div className="md:col-span-3 py-32 text-center space-y-6">
                        <div className="w-24 h-24 bg-muted rounded-[2rem] flex items-center justify-center mx-auto opacity-50">
                            <FileText className="w-12 h-12 text-muted-foreground" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black italic text-slate-300">No Certificates Found</h3>
                            <p className="text-slate-400 font-medium max-w-sm mx-auto mt-2">Any achievements or official documents issued to you will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
