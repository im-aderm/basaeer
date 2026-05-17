"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
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
    ArrowRight,
    Users,
    Trash2,
    UserCheck,
    Route
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StudentService, Student } from "@/services/studentService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function TransportAssignmentPage() {
    const { user, resolvedBranchId } = useAuth();
    const [students, setStudents] = useState<Student[]>([]);
    const [routes, setRoutes] = useState<any[]>([]);
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [selectedRoute, setSelectedRoute] = useState("");
    const [selectedVehicle, setSelectedVehicle] = useState("");

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [stdData, rtData, vhData] = await Promise.all([
                StudentService.getAll(),
                api.get("/transport/routes"),
                api.get("/transport/vehicles")
            ]);
            setStudents(stdData);
            setRoutes(rtData.data);
            setVehicles(vhData.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch data:", error);
            toast.error("Failed to load transport data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAssign = async () => {
        if (!selectedStudent || !selectedRoute || !selectedVehicle) return;

        try {
            await api.post("/transport/assign", {
                studentId: selectedStudent.id,
                routeId: selectedRoute,
                vehicleId: selectedVehicle
            });
            toast.success("Transport assigned successfully!");
            setSelectedStudent(null);
            setSelectedRoute("");
            setSelectedVehicle("");
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to assign transport:", error);
            toast.error("Failed to assign transport");
        }
    };

    const handleRemoveAssignment = async (studentId: string) => {
        if (!confirm("Are you sure you want to remove this transport assignment?")) return;
        try {
            await api.delete(`/transport/assign/${studentId}`);
            toast.success("Assignment removed successfully");
            fetchData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to remove assignment:", error);
            toast.error("Failed to remove assignment");
        }
    };

    const unassignedStudents = (students ?? []).filter(s =>
        !s.transportAssignment &&
        (`${s.firstName} ${s.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );

    const assignedStudents = (students ?? []).filter(s =>
        s.transportAssignment &&
        (`${s.firstName} ${s.lastName}`).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <RequireBranch requireSpecificBranch><div className="p-8 text-center"><BranchContextBanner /><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div></RequireBranch>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 h-full pb-20">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Users className="text-primary w-10 h-10" />
                        Transport Management
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage student transport assignments and routes.</p>
                </div>
            </div>

            <Tabs defaultValue="new" className="space-y-8">
                <TabsList className="bg-muted/50 p-1.5 rounded-[2rem] h-16 w-full max-w-md shadow-inner">
                    <TabsTrigger value="new" className="rounded-[1.5rem] h-13 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all">
                        <UserPlus size={18} className="mr-2" /> New Assignment
                    </TabsTrigger>
                    <TabsTrigger value="active" className="rounded-[1.5rem] h-13 font-semibold text-sm data-[state=active]:bg-primary data-[state=active]:text-white shadow-none transition-all">
                        <UserCheck size={18} className="mr-2" /> Active Assignments
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="new" className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Student Selection */}
                    <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 lg:col-span-2 overflow-hidden min-h-[600px] flex flex-col">
                        <CardHeader className="p-10 pb-4">
                            <div className="flex justify-between items-center mb-6">
                                <CardTitle className="text-h3 font-semibold">Unassigned Students</CardTitle>
                                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground bg-muted px-4 py-2 rounded-xl">
                                    {unassignedStudents.length} Students
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
                                {unassignedStudents.map(student => (
                                    <button
                                        key={student.id}
                                        onClick={() => setSelectedStudent(student)}
                                        className={`p-6 rounded-[2rem] border-2 transition-all flex items-center gap-4 text-left group ${selectedStudent?.id === student.id ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border/50 hover:border-primary/60 hover:bg-muted/30'}`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-semibold text-lg transition-transform group-hover:scale-110 ${selectedStudent?.id === student.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                                            {student.firstName[0]}{student.lastName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                            <p className="text-xs font-semibold text-primary/60 uppercase tracking-tighter">{student.class?.name || "No Class"}</p>
                                        </div>
                                        {selectedStudent?.id === student.id && <CheckCircle2 className="text-primary" size={24} />}
                                    </button>
                                ))}
                                {unassignedStudents.length === 0 && (
                                    <div className="col-span-2 py-20 text-center text-muted-foreground font-bold">
                                        No unassigned students found.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Assignment Form */}
                    <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 p-10 space-y-8 sticky top-8 border-t-8 border-t-primary/20">
                        <div>
                            <h3 className="text-h3 font-semibold mb-2 tracking-tight">Assignment Details</h3>
                            <p className="text-muted-foreground font-medium text-sm">Complete the selection below.</p>
                        </div>

                        {selectedStudent ? (
                            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/20 animate-in zoom-in-95 duration-300">
                                <div className="flex items-center gap-4 mb-4">
                                    <GraduationCap className="text-primary" size={24} />
                                    <h4 className="font-semibold text-h3">{selectedStudent.firstName} {selectedStudent.lastName}</h4>
                                </div>
                                <div className="h-px bg-primary/10 mb-4" />
                                <div className="space-y-4">
                                    <div className="space-y-3">
                                        <label className="text-label text-primary ml-1">Commute Route</label>
                                        <select
                                            className="w-full p-4 bg-white border-2 border-primary/90 rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer"
                                            value={selectedRoute}
                                            onChange={(e) => setSelectedRoute(e.target.value)}
                                        >
                                            <option value="">Select Route</option>
                                            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-label text-primary ml-1">Fleet Vehicle</label>
                                        <select
                                            className="w-full p-4 bg-white border-2 border-primary/90 rounded-2xl focus:border-primary outline-none transition-all font-bold appearance-none cursor-pointer"
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
                                        className="w-full h-16 rounded-[1.5rem] font-semibold text-h3 shadow-xl shadow-primary/20 mt-6 group overflow-hidden"
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
                                <p className="text-muted-foreground font-bold px-10">Select a student from the directory to begin assignment.</p>
                            </div>
                        )}
                    </Card>
                </TabsContent>

                <TabsContent value="active" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[3.5rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20">
                        <CardHeader className="p-10 pb-0">
                            <div className="flex justify-between items-center mb-6">
                                <CardTitle className="text-h3 font-semibold">Active Assignments</CardTitle>
                                <div className="relative w-72">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                                    <input
                                        placeholder="Filter by student..."
                                        className="w-full pl-12 pr-4 py-3 bg-muted/30 border-none rounded-xl font-bold text-sm"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-muted/30 text-left">
                                            <th className="px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Student</th>
                                            <th className="px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Route</th>
                                            <th className="px-10 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Vehicle</th>
                                            <th className="px-10 py-5 text-right text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {assignedStudents.map((student: any) => (
                                            <tr key={student.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-semibold text-xs text-primary">
                                                            {student.firstName[0]}{student.lastName[0]}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                                            <p className="text-[10px] font-semibold text-muted-foreground">{student.class?.name}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <Route size={16} className="text-primary/60" />
                                                        {student.transportAssignment?.route?.name || "Route N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6">
                                                    <div className="flex items-center gap-2 font-bold">
                                                        <Bus size={16} className="text-primary/60" />
                                                        {student.transportAssignment?.vehicle?.registrationNumber || "Fleet N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRemoveAssignment(student.id)}
                                                        className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                    >
                                                        <Trash2 size={20} />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {assignedStudents.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground font-medium">
                                                    No students are currently assigned to transport.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
        </RequireBranch>
    );
}
