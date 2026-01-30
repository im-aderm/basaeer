"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    BookOpen,
    Clock,
    Bus,
    FileText,
    CreditCard,
    Printer,
    Edit3,
    ArrowLeft,
    Loader2,
    Calendar,
    Phone,
    Mail,
    MapPin,
    ShieldCheck,
    Award
} from "lucide-react";
import { StudentService, Student } from "@/services/studentService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StudentIDCard } from "@/components/StudentIDCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function StudentProfilePage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [isIdCardOpen, setIsIdCardOpen] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const data = await StudentService.getById(id);
                setStudent(data);
            } catch (error) {
                console.error("Failed to fetch student:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;
    if (!student) return <div className="p-8 text-center font-bold text-2xl italic">Student Not Found</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-primary/10"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                            {student.firstName} {student.lastName}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className="bg-primary/10 text-primary border-none font-black px-3 py-1">
                                ID: {student.id.split('-')[0].toUpperCase()}
                            </Badge>
                            <Badge className="bg-green-500/10 text-green-500 border-none font-black px-3 py-1">
                                ACTIVE
                            </Badge>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setIsIdCardOpen(true)}
                        className="gap-2 rounded-2xl h-12 px-6 font-black shadow-lg shadow-primary/10 bg-muted text-foreground hover:bg-muted/80"
                    >
                        <CreditCard size={18} /> ID Card
                    </Button>
                    <Button className="gap-2 rounded-2xl h-12 px-6 font-black shadow-xl shadow-primary/20">
                        <Edit3 size={18} /> Edit Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Info Card */}
                <Card className="lg:col-span-1 rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-card/50 backdrop-blur-sm border-t-8 border-t-primary">
                    <CardHeader className="text-center pb-0 pt-10">
                        <div className="w-32 h-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mx-auto text-primary mb-4 transform rotate-6 hover:rotate-0 transition-transform duration-500 shadow-xl shadow-primary/10">
                            <User size={64} />
                        </div>
                        <CardTitle className="text-2xl font-black italic">{student.firstName} {student.lastName}</CardTitle>
                        <p className="text-muted-foreground font-bold">{student.class?.name || "No Class"} - {student.section?.name || "No Section"}</p>
                    </CardHeader>
                    <CardContent className="p-10 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Email Address</p>
                                    <p className="font-bold text-lg">{student.user?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Phone Number</p>
                                    <p className="font-bold text-lg">{student.user?.phone || "Not Provided"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 group">
                                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Date of Birth</p>
                                    <p className="font-bold text-lg">{student.dob ? new Date(student.dob).toLocaleDateString() : "Not Provided"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-border/50">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Quick Stats</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-muted/30 text-center">
                                    <p className="text-2xl font-black italic text-primary">
                                        {student.attendance && student.attendance.length > 0
                                            ? `${Math.round((student.attendance.filter(a => ['PRESENT', 'LATE'].includes(a.status)).length / student.attendance.length) * 100)}%`
                                            : "N/A"}
                                    </p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Attendance</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-muted/30 text-center">
                                    <p className="text-2xl font-black italic text-primary">A-</p>
                                    <p className="text-[10px] font-black uppercase text-muted-foreground">Avg Grade</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Main Content Areas */}
                <div className="lg:col-span-2 space-y-8">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="bg-muted/30 p-2 rounded-[2rem] h-16 w-full max-w-2xl border border-border/50">
                            <TabsTrigger value="overview" className="rounded-[1.5rem] font-black italic transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg flex gap-2">
                                <BookOpen size={18} /> Overview
                            </TabsTrigger>
                            <TabsTrigger value="attendance" className="rounded-[1.5rem] font-black italic transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg flex gap-2">
                                <Clock size={18} /> Attendance
                            </TabsTrigger>
                            <TabsTrigger value="transport" className="rounded-[1.5rem] font-black italic transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg flex gap-2">
                                <Bus size={18} /> Transport
                            </TabsTrigger>
                            <TabsTrigger value="docs" className="rounded-[1.5rem] font-black italic transition-all data-[state=active]:bg-background data-[state=active]:shadow-lg flex gap-2">
                                <FileText size={18} /> Documents
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-8 animate-in slide-in-from-left-4 duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 bg-card/50">
                                    <h3 className="text-xl font-black italic flex items-center gap-3 mb-6">
                                        <ShieldCheck className="text-primary" /> Father Details
                                    </h3>
                                    <div className="space-y-4">
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Full Name:</span> {student.parent?.firstName || "N/A"} {student.parent?.lastName || ""}</p>
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Occupation:</span> {student.guardianOccupation || "N/A"}</p>
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Phone:</span> {student.parent?.phone || "N/A"}</p>
                                    </div>
                                </Card>
                                <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 bg-card/50">
                                    <h3 className="text-xl font-black italic flex items-center gap-3 mb-6">
                                        <ShieldCheck className="text-primary" /> Mother Details
                                    </h3>
                                    <div className="space-y-4">
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Full Name:</span> {student.parent?.firstName || "N/A"} {student.parent?.lastName || ""}</p>
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Occupation:</span> {student.guardianOccupation || "N/A"}</p>
                                        <p className="font-bold flex justify-between"><span className="text-muted-foreground">Phone:</span> {student.parent?.phone || "N/A"}</p>
                                    </div>
                                </Card>
                                <Card className="md:col-span-2 rounded-[2.5rem] border-border/50 shadow-xl p-8 bg-card/50">
                                    <h3 className="text-xl font-black italic flex items-center gap-3 mb-6">
                                        <MapPin className="text-primary" /> Residential Address
                                    </h3>
                                    <p className="font-bold text-lg italic text-muted-foreground">
                                        {student.city ? `${student.city}, ${student.state}, ${student.country}` : "Address not set"}
                                    </p>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="transport" className="mt-8 animate-in slide-in-from-left-4 duration-500">
                            <Card className="rounded-[3rem] border-border/50 shadow-xl p-10 bg-card/50 text-center border-t-8 border-t-blue-500">
                                <Bus size={48} className="mx-auto text-blue-500 mb-6" />
                                <h3 className="text-2xl font-black italic mb-2">Transport Details</h3>
                                {student.transportAssignment ? (
                                    <div className="space-y-4 max-w-md mx-auto mt-6">
                                        <div className="p-4 rounded-2xl bg-muted/30 font-bold flex justify-between">
                                            <span>Route:</span> <span className="text-blue-500">{student.transportAssignment.route?.name || 'N/A'}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl bg-muted/30 font-bold flex justify-between">
                                            <span>Vehicle:</span> <span className="text-blue-500">{student.transportAssignment.vehicle?.registrationNumber || 'Pending'}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground font-medium italic">This student is not assigned to any school transport route.</p>
                                )}
                            </Card>
                        </TabsContent>

                        <TabsContent value="docs" className="mt-8 animate-in slide-in-from-left-4 duration-500">
                            <Card className="rounded-[3rem] border-border/50 shadow-xl p-10 bg-card/50 overflow-hidden">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-2xl font-black italic">Issued Documents</h3>
                                    <Button variant="outline" className="rounded-xl font-black italic">
                                        <Award className="mr-2" size={18} /> View All
                                    </Button>
                                </div>
                                <div className="space-y-4">
                                    {student.certificates && student.certificates.length > 0 ? (
                                        student.certificates.map(cert => (
                                            <div key={cert.id} className="p-6 rounded-2xl bg-muted/20 border border-border/30 flex justify-between items-center group hover:bg-muted/40 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black italic uppercase">{cert.type}</p>
                                                        <p className="text-xs font-bold text-muted-foreground">{cert.certificateNumber}</p>
                                                    </div>
                                                </div>
                                                <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Printer size={18} />
                                                </Button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <FileText size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                                            <p className="text-muted-foreground font-bold italic">No documents issued yet.</p>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* ID Card Modal */}
            <Dialog open={isIdCardOpen} onOpenChange={setIsIdCardOpen}>
                <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl bg-background/80 backdrop-blur-xl">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black italic mb-6 tracking-tight">Student ID Card</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-10">
                        <StudentIDCard student={student} />
                        <div className="flex gap-4">
                            <Button onClick={handlePrint} className="gap-3 h-14 rounded-2xl px-10 font-black text-lg shadow-xl shadow-primary/20">
                                <Printer size={20} /> Print Card
                            </Button>
                            <Button variant="outline" onClick={() => setIsIdCardOpen(false)} className="h-14 rounded-2xl px-10 font-black text-lg border-2">
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
