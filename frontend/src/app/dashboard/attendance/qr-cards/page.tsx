"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Download, Search, Users, QrCode, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNotification } from '@/context/NotificationContext';
import api from "@/lib/api";
import { QRCodeCanvas } from "qrcode.react";

export default function QRIDCardsPage() {
    const router = useRouter();
    const { showError } = useNotification();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    
    const [classes, setClasses] = useState<any[]>([]);
    const [sections, setSections] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedSectionId, setSelectedSectionId] = useState("");
    
    const [students, setStudents] = useState<any[]>([]);
    const [qrData, setQrData] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (error) {
            showError("Failed to load classes");
        }
    };

    const handleClassChange = async (classId: string) => {
        setSelectedClassId(classId);
        setSelectedSectionId("");
        try {
            const res = await api.get(`/sections/class/${classId}`);
            setSections(res.data);
        } catch (error) {
            showError("Failed to load sections");
        }
    };

    const fetchStudents = async () => {
        if (!selectedSectionId) return;
        setFetching(true);
        try {
            const res = await api.get(`/students`, { params: { sectionId: selectedSectionId } });
            const studentList = res.data;
            setStudents(studentList);

            // Fetch QR payloads in bulk
            const qrRes = await api.post('/attendance/qr/bulk', { 
                studentIds: studentList.map((s: any) => s.id) 
            });
            const qrMap: Record<string, string> = {};
            qrRes.data.forEach((item: any) => {
                qrMap[item.studentId] = item.qrPayload;
            });
            setQrData(qrMap);
        } catch (error) {
            showError("Failed to load students or QR data");
        } finally {
            setFetching(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
                <BranchContextBanner />
                {/* Header - Hidden on Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
                        <ArrowLeft size={22} />
                    </Button>
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">QR ID Cards</h1>
                        <p className="text-muted-foreground font-medium mt-1">Generate and print student attendance QR codes.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button 
                        variant="outline" 
                        className="h-12 px-6 rounded-2xl font-bold gap-2"
                        onClick={handlePrint}
                        disabled={students.length === 0}
                    >
                        <Printer size={18} />
                        Print All
                    </Button>
                </div>
            </div>

            {/* Filters - Hidden on Print */}
            <Card className="rounded-[2.5rem] shadow-sm print:hidden">
                <CardContent className="p-8 flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Select Class</label>
                        <Select value={selectedClassId} onValueChange={handleClassChange}>
                            <SelectTrigger className="h-14 rounded-2xl ">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-bold text-muted-foreground ml-1">Select Section</label>
                        <Select value={selectedSectionId} onValueChange={setSelectedSectionId} disabled={!selectedClassId}>
                            <SelectTrigger className="h-14 rounded-2xl ">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent>
                                {sections.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button 
                            className="h-14 px-8 rounded-2xl font-bold uppercase tracking-widest gap-2 shadow-lg shadow-primary/20"
                            onClick={fetchStudents}
                            disabled={!selectedSectionId || fetching}
                        >
                            {fetching ? <Loader2 className="animate-spin" /> : <Users size={20} />}
                            Load Students
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Print Layout */}
            {students.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 print:grid-cols-3 print:gap-4">
                    {students.map((student) => (
                        <Card key={student.id} className="rounded-[2rem] border-2 border-slate-100 shadow-none overflow-hidden group print:shadow-none print:border-slate-200">
                            <CardContent className="p-0">
                                {/* Card Header */}
                                <div className="bg-slate-900 text-white p-6 text-center space-y-1">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-primary/80">Student ID Card</div>
                                    <div className="text-xl font-bold truncate leading-tight">
                                        {student.firstName} {student.lastName}
                                    </div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        {selectedClassId && classes.find(c => c.id === selectedClassId)?.name} | {selectedSectionId && sections.find(s => s.id === selectedSectionId)?.name}
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-8 flex flex-col items-center justify-center space-y-6">
                                    <div className="p-4 bg-white rounded-3xl border-4 border-slate-50 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                        {qrData[student.id] ? (
                                            <QRCodeCanvas 
                                                value={qrData[student.id]} 
                                                size={160}
                                                level="H"
                                                includeMargin={false}
                                            />
                                        ) : (
                                            <div className="w-40 h-40 flex items-center justify-center bg-muted animate-pulse rounded-2xl">
                                                <QrCode size={40} className="text-muted-foreground/20" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="text-center space-y-1">
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">Student Portal ID</div>
                                        <div className="text-lg font-black text-slate-900 tracking-tighter">
                                            {student.userId || "BAS-000-000"}
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="border-t border-slate-100 bg-slate-50 p-4 text-center">
                                    <div className="text-[10px] font-bold text-slate-400">Basaer Education System</div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                !fetching && (
                    <div className="py-40 text-center space-y-6 bg-muted/5 rounded-[3rem] border-2 border-dashed">
                        <QrCode className="w-20 h-20 mx-auto text-muted-foreground/20" />
                        <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-slate-400">No Students Loaded</h3>
                            <p className="text-muted-foreground max-w-xs mx-auto">Select a class and section above to generate printable ID cards.</p>
                        </div>
                    </div>
                )
            )}

            {/* Print Instructions */}
            <div className="bg-primary/5 p-8 rounded-[2.5rem] border border-primary/10 print:hidden">
                <h4 className="font-bold text-primary uppercase tracking-widest text-sm mb-3">Printing Instructions</h4>
                <ul className="text-slate-600 space-y-2 text-sm font-medium">
                    <li>• Use A4 or Card stock for best results.</li>
                    <li>• Ensure "Background Graphics" is enabled in print settings.</li>
                    <li>• Scaling should be set to "Default" or "100%".</li>
                    <li>• These cards are designed for easy scanning via teacher mobile devices.</li>
                </ul>
            </div>
        </div>
    </RequireBranch>
    );
}
