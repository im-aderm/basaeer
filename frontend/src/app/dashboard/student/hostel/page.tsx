"use client";

import { useState, useEffect } from "react";
import {
    Bed,
    Home,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Plus,
    Loader2,
    Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { HostelService, HostelLeave, MaintenanceRequest } from "@/services/hostelService";
import { format } from "date-fns";

export default function StudentHostelPage() {
    const [myDetails, setMyDetails] = useState<any>(null);
    const [leaves, setLeaves] = useState<HostelLeave[]>([]);
    const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

    // Forms
    const [leaveForm, setLeaveForm] = useState({
        startDate: "",
        endDate: "",
        reason: ""
    });

    const [maintenanceForm, setMaintenanceForm] = useState({
        title: "",
        description: "",
        priority: "MEDIUM"
    });

    const fetchData = async () => {
        try {
            const [detailsData, leavesData, maintenanceData] = await Promise.all([
                HostelService.getMyHostelDetails(),
                HostelService.getLeaves(),
                HostelService.getMaintenanceRequests()
            ]);
            setMyDetails(detailsData);
            setLeaves(leavesData);
            setMaintenance(maintenanceData);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch hostel data:", error);
            // Don't toast error for details if just not allocated
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await HostelService.createLeave(leaveForm);
            toast.success("Leave request submitted");
            setIsLeaveModalOpen(false);
            setLeaveForm({ startDate: "", endDate: "", reason: "" });
            fetchData();
        } catch (error) {
            toast.error("Failed to submit leave request");
        }
    };

    const handleCreateMaintenance = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await HostelService.createMaintenance(maintenanceForm);
            toast.success("Maintenance request submitted");
            setIsMaintenanceModalOpen(false);
            setMaintenanceForm({ title: "", description: "", priority: "MEDIUM" });
            fetchData();
        } catch (error) {
            toast.error("Failed to submit maintenance request");
        }
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header / Current Residence */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-h1 font-bold tracking-tight text-primary mb-2">My Hostel Residence</h1>

                    {myDetails ? (
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <div className="text-white/60 font-bold uppercase tracking-widest text-xs mb-1">Building</div>
                                <div className="text-h3 font-semibold flex items-center gap-2">
                                    <Home className="text-blue-400" /> {myDetails.hostelName}
                                </div>
                                <div className="mt-2 text-xs font-medium bg-blue-500/20 px-2 py-1 rounded inline-block text-blue-200">
                                    {myDetails.hostelType} Hostel
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <div className="text-white/60 font-bold uppercase tracking-widest text-xs mb-1">Room & Bed</div>
                                <div className="text-h3 font-semibold flex items-center gap-2">
                                    <Bed className="text-purple-400" /> {myDetails.bedName}
                                </div>
                                <div className="mt-2 text-sm font-medium text-purple-200">
                                    Room {myDetails.roomNumber}
                                </div>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                                <div className="text-white/60 font-bold uppercase tracking-widest text-xs mb-1">Check-in Date</div>
                                <div className="text-h3 font-semibold flex items-center gap-2">
                                    <Calendar className="text-green-400" /> {format(new Date(myDetails.checkInDate), 'MMM dd, yyyy')}
                                </div>
                                <div className="mt-2 text-sm font-medium text-green-200">
                                    Active Resident
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-6 p-6 bg-white/5 rounded-3xl border border-dashed border-white/20 text-center">
                            <p className="text-xl font-medium text-slate-300">You are not currently allocated to any hostel room.</p>
                            <p className="text-sm text-slate-400 mt-2">Please contact the hostel administrator if this is a mistake.</p>
                        </div>
                    )}
                </div>

                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Management Tabs */}
            {myDetails && (
                <Tabs defaultValue="leaves" className="space-y-8">
                    <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl w-full max-w-md mx-auto grid grid-cols-2">
                        <TabsTrigger value="leaves" className="rounded-xl h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Leave Requests</TabsTrigger>
                        <TabsTrigger value="maintenance" className="rounded-xl h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Maintenance</TabsTrigger>
                    </TabsList>

                    <TabsContent value="leaves" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end">
                            <Dialog open={isLeaveModalOpen} onOpenChange={setIsLeaveModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 gap-2">
                                        <Plus size={18} strokeWidth={3} /> Request Leave
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-h3 font-semibold">Request Hostel Leave</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateLeave} className="space-y-4 pt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="font-bold ml-1">From Date</Label>
                                                <Input
                                                    type="date"
                                                    required
                                                    className="rounded-xl h-12"
                                                    value={leaveForm.startDate}
                                                    onChange={e => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="font-bold ml-1">To Date</Label>
                                                <Input
                                                    type="date"
                                                    required
                                                    className="rounded-xl h-12"
                                                    value={leaveForm.endDate}
                                                    onChange={e => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-bold ml-1">Reason</Label>
                                            <Textarea
                                                required
                                                className="rounded-xl min-h-[100px] resize-none"
                                                placeholder="Why do you need leave?"
                                                value={leaveForm.reason}
                                                onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg mt-2">
                                            Submit Request
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4">
                            {leaves.length > 0 ? leaves.map(leave => (
                                <Card key={leave.id} className="rounded-[2rem] border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                    <CardContent className="p-6 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="outline" className={`rounded-lg px-2 py-0.5 font-semibold uppercase text-[10px] tracking-widest border-2 ${leave.status === 'APPROVED' ? 'border-green-500 text-green-600 bg-green-50' :
                                                        leave.status === 'REJECTED' ? 'border-red-500 text-red-600 bg-red-50' :
                                                            'border-yellow-500 text-yellow-600 bg-yellow-50'
                                                    }`}>
                                                    {leave.status}
                                                </Badge>
                                                <span className="text-sm font-bold text-muted-foreground flex items-center gap-1.5">
                                                    <Calendar size={14} />
                                                    {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                                </span>
                                            </div>
                                            <p className="font-medium text-lg">{leave.reason}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-[2.5rem] border border-dashed border-border/50">
                                    <p className="italic">No leave requests found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    <TabsContent value="maintenance" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-end">
                            <Dialog open={isMaintenanceModalOpen} onOpenChange={setIsMaintenanceModalOpen}>
                                <DialogTrigger asChild>
                                    <Button className="h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-lg shadow-orange-500/20 gap-2">
                                        <Wrench size={18} strokeWidth={3} /> Report Issue
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-h3 font-semibold">Report Maintenance Issue</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateMaintenance} className="space-y-4 pt-4">
                                        <div className="space-y-1.5">
                                            <Label className="font-bold ml-1">Issue Title</Label>
                                            <Input
                                                required
                                                className="rounded-xl h-12"
                                                placeholder="e.g. Broken Fan"
                                                value={maintenanceForm.title}
                                                onChange={e => setMaintenanceForm({ ...maintenanceForm, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-bold ml-1">Priority</Label>
                                            <select
                                                className="w-full rounded-xl h-12 px-4 border border-primary/90 bg-white/75 font-bold appearance-none"
                                                value={maintenanceForm.priority}
                                                onChange={e => setMaintenanceForm({ ...maintenanceForm, priority: e.target.value })}
                                            >
                                                <option value="LOW">Low - Minor issue</option>
                                                <option value="MEDIUM">Medium - Needs attention</option>
                                                <option value="HIGH">High - Important</option>
                                                <option value="URGENT">Urgent - Emergency</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="font-bold ml-1">Description</Label>
                                            <Textarea
                                                required
                                                className="rounded-xl min-h-[100px] resize-none"
                                                placeholder="Describe the problem in detail..."
                                                value={maintenanceForm.description}
                                                onChange={e => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
                                            />
                                        </div>
                                        <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg mt-2">
                                            Submit Report
                                        </Button>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="grid gap-4">
                            {maintenance.length > 0 ? maintenance.map(req => (
                                <Card key={req.id} className="rounded-[2rem] border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                    <CardContent className="p-6 flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`rounded-lg px-2 py-0.5 font-semibold uppercase text-[10px] tracking-widest ${req.priority === 'URGENT' ? 'bg-red-500' :
                                                        req.priority === 'HIGH' ? 'bg-orange-500' :
                                                            req.priority === 'MEDIUM' ? 'bg-yellow-500 text-yellow-950' :
                                                                'bg-blue-500'
                                                    }`}>
                                                    {req.priority}
                                                </Badge>
                                                <Badge variant="outline" className={`rounded-lg px-2 py-0.5 font-semibold uppercase text-[10px] tracking-widest border-2 ${req.status === 'RESOLVED' ? 'border-green-500 text-green-600 bg-green-50' :
                                                        req.status === 'IN_PROGRESS' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                                                            'border-slate-300 text-slate-500'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <h3 className="font-bold text-lg">{req.title}</h3>
                                            <p className="text-muted-foreground text-sm">{req.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )) : (
                                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-[2.5rem] border border-dashed border-border/50">
                                    <p className="italic">No maintenance requests found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>
                </Tabs>
            )}
        </div>
    );
}
