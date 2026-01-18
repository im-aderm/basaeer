"use client";

import { useState, useEffect } from "react";
import {
    UserPlus,
    Search,
    Bus,
    Navigation,
    Loader2,
    CheckCircle2,
    GraduationCap,
    MapPin,
    ArrowRight
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentService, Student } from "@/services/studentService";

export default function TransportAssignmentPage() {
    const { user } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState("");
    const [status, setStatus] = useState({ success: false, message: "" });

    useEffect(() => {
        if (user) {
            Promise.all([
                StudentService.getAll(),
                api.get("/transport/routes"),
                api.get("/transport/vehicles")
            ]).then(([stdData, rtData, vhData]) => {
                setStudents(stdData);
                setRoutes(rtData.data);
                setVehicles(vhData.data);
                setLoading(false);
            });
        }
    }, [user]);

    const handleAssign = async () => {
        if (!selectedStudent || !selectedRoute || !selectedVehicle) return;

        try {
            await api.post("/transport/assign", {
                studentId: selectedStudent.id,
                routeId: selectedRoute,
                vehicleId: selectedVehicle
            });
            setStatus({ success: true, message: "Transport assigned successfully!" });
            setSelectedStudent(null);
            setSelectedRoute("");
            setSelectedVehicle("");
            setTimeout(() => setStatus({ success: false, message: "" }), 3000);
        } catch (error) {
            console.error("Failed to assign transport:", error);
            setStatus({ success: false, message: "Failed to assign transport." });
        }
    };

    const filteredStudents = students.filter(s =>
        !s.transportAssignment &&
        (`${s.firstName} ${s.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                        <UserPlus className="text-primary w-10 h-10" />
                        Transport Assignment
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Assign students to routes and vehicles for school commute.</p>
                </div>
                {status.message && (
                    <div className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${status.success ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                        <CheckCircle2 size={18} /> {status.message}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Student Selection */}
                <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 lg:col-span-2 overflow-hidden min-h-[600px] flex flex-col">
                    <CardHeader className="p-10 pb-4">
                        <div className="flex justify-between items-center mb-6">
                            <CardTitle className="text-2xl font-black italic">Unassigned Students</CardTitle>
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 rounded-xl">
                                {filteredStudents.length} Students
                            </span>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                            <input
                                placeholder="Search by name..."
                                className="w-full pl-14 pr-6 py-4 bg-muted/30 border-none rounded-[1.5rem] focus:ring-2 ring-primary/20 transition-all font-bold text-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent className="p-10 pt-0 overflow-y-auto max-h-[500px] flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            {filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left group ${selectedStudent?.id === student.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/30 hover:bg-muted/30'}`}
                                >
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-transform group-hover:scale-110 ${selectedStudent?.id === student.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                        {student.firstName[0]}{student.lastName[0]}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-black text-lg italic">{student.firstName} {student.lastName}</p>
                                        <p className="text-xs font-black text-primary/60 uppercase tracking-tighter">{student.class?.name || "No Class"}</p>
                                    </div>
                                    {selectedStudent?.id === student.id && <CheckCircle2 className="text-primary" size={24} />}
                                </button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment Form */}
                <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 p-10 space-y-8 sticky top-8 bg-card border-t-8 border-t-primary/20">
                    <div>
                        <h3 className="text-2xl font-black italic mb-2 tracking-tight">Assignment Details</h3>
                        <p className="text-muted-foreground font-medium text-sm italic">Complete the selection below.</p>
                    </div>

                    {selectedStudent ? (
                        <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 animate-in zoom-in-95 duration-300">
                            <div className="flex items-center gap-4 mb-4">
                                <GraduationCap className="text-primary" size={24} />
                                <h4 className="font-black text-xl italic">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
                            </div>
                            <div className="h-px bg-primary/10 mb-4" />
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Commute Route</label>
                                    <select
                                        className="w-full p-4 bg-background border-2 border-border/50 rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={selectedRoute}
                                        onChange={(e) => setSelectedRoute(e.target.value)}
                                    >
                                        <option value="">Select Route</option>
                                        {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary ml-1">Fleet Vehicle</label>
                                    <select
                                        className="w-full p-4 bg-background border-2 border-border/50 rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={selectedVehicle}
                                        onChange={(e) => setSelectedVehicle(e.target.value)}
                                    >
                                        <option value="">Select Vehicle</option>
                                        {vehicles.map(v => <option key={v.id} value={v.id}>{v.registrationNumber} ({v.model})</option>)}
                                    </select>
                                </div>
                                <Button
                                    onClick={handleAssign}
                                    disabled={!selectedRoute || !selectedVehicle}
                                    className="w-full h-16 rounded-[1.5rem] font-black text-xl shadow-xl shadow-primary/20 mt-6 group overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center justify-center gap-3">
                                        Confirm Assignment <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="py-20 text-center space-y-4 bg-muted/20 rounded-[2.5rem] border-2 border-dashed border-border/50">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                                <UserPlus className="text-muted-foreground/30" size={32} />
                            </div>
                            <p className="text-muted-foreground font-bold italic px-10">Select a student from the directory to begin assignment.</p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-border/50">
                        <div className="flex gap-4">
                            <div className="flex-1 p-4 bg-muted/30 rounded-2xl text-center">
                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total Routes</p>
                                <p className="text-xl font-black italic">{routes.length}</p>
                            </div>
                            <div className="flex-1 p-4 bg-muted/30 rounded-2xl text-center">
                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Fleet Size</p>
                                <p className="text-xl font-black italic">{vehicles.length}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
