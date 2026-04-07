"use client";

import { useState, useEffect } from "react";
import {
    Building2,
    Bed,
    Users,
    Plus,
    ArrowRight,
    Home,
    AlertCircle,
    Loader2,
    MoreVertical,
    Edit2,
    Trash2,
    MapPin,
    Wrench,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { HostelService, Hostel, MaintenanceRequest } from "@/services/hostelService";
import Link from "next/link";
import { format } from "date-fns";

export default function HostelOverviewPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        type: "COED",
        address: ""
    });

    const fetchData = async () => {
        try {
            const [hostelData, statsData, maintenanceData] = await Promise.all([
                HostelService.getAll(),
                HostelService.getStats(),
                HostelService.getMaintenanceRequests()
            ]);
            setHostels(hostelData);
            setStats(statsData);
            setMaintenanceRequests(maintenanceData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await HostelService.createHostel(formData);
            toast.success("Hostel registered successfully");
            setIsCreateModalOpen(false);
            setFormData({ id: "", name: "", type: "COED", address: "" });
            fetchData();
        } catch (error) {
            console.error("Creation failed:", error);
            toast.error("Failed to register hostel");
        }
    };

    const handleUpdateHostel = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await HostelService.updateHostel(formData.id, formData);
            toast.success("Hostel updated successfully");
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Failed to update hostel");
        }
    };

    const handleDeleteHostel = async () => {
        try {
            await HostelService.deleteHostel(formData.id);
            toast.success("Hostel deleted successfully");
            setIsDeleteAlertOpen(false);
            fetchData();
        } catch (error) {
            console.error("Deletion failed:", error);
            toast.error("Failed to delete hostel");
        }
    };

    const handleUpdateMaintenanceStatus = async (id: string, status: string) => {
        try {
            await HostelService.updateMaintenanceStatus(id, status);
            toast.success(`Maintenance request marked as ${status.toLowerCase()}`);
            fetchData();
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error("Failed to update status");
        }
    };

    const openEditModal = (hostel: Hostel) => {
        setFormData({
            id: hostel.id,
            name: hostel.name,
            type: hostel.type,
            address: hostel.address || ""
        });
        setIsEditModalOpen(true);
    };

    const openDeleteAlert = (hostel: Hostel) => {
        setFormData({ ...formData, id: hostel.id, name: hostel.name });
        setIsDeleteAlertOpen(true);
    };

    const statCards = [
        {
            title: "Total Hostels",
            value: stats?.hostels || 0,
            icon: Building2,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            desc: "Active buildings"
        },
        {
            title: "Total Capacity",
            value: stats?.capacity || 0,
            icon: Bed,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            desc: "Total beds available"
        },
        {
            title: "Occupied",
            value: stats?.occupied || 0,
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            desc: "Currently residing"
        },
        {
            title: "Maintenance",
            value: stats?.maintenance || 0,
            icon: AlertCircle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
            desc: "Beds under repair"
        }
    ];

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header Section */}
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-12 text-white shadow-2xl">
                <div className="relative z-10">
                    <h1 className="text-h1 font-semibold tracking-tight mb-4">Hostel Hub</h1>
                    <p className="text-slate-300 text-xl font-medium max-w-2xl leading-relaxed">
                        Streamline your residential management. Track occupancy, manage building wings, and ensure a comfortable stay for every student.
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden group hover:scale-[1.02] transition-all bg-card/40 backdrop-blur-md">
                        <CardContent className="p-8 text-center sm:text-left">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                            <h3 className="text-h1 font-semibold tracking-tighter">{stat.value}</h3>
                            <p className="text-muted-foreground font-bold mt-1">{stat.title}</p>
                            <p className="text-label text-muted-foreground/30 mt-4">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="buildings" className="space-y-8">
                <TabsList className="bg-muted/50 p-1 h-14 rounded-2xl w-full max-w-lg mx-auto grid grid-cols-3">
                    <TabsTrigger value="buildings" className="rounded-xl h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Buildings</TabsTrigger>
                    <TabsTrigger value="maintenance" className="rounded-xl h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Maintenance</TabsTrigger>
                    <TabsTrigger value="leaves" className="rounded-xl h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-md">Leave Requests</TabsTrigger>
                </TabsList>

                <TabsContent value="buildings" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-end">
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    onClick={() => setFormData({ id: "", name: "", type: "COED", address: "" })}
                                    className="h-14 px-8 rounded-2xl bg-primary text-white font-semibold text-lg gap-2 shadow-xl shadow-primary/20"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                    Register building
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-h3 font-semibold">Add New Building</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateHostel} className="space-y-4 pt-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1">Building Name</Label>
                                        <Input
                                            required
                                            className="rounded-xl h-12"
                                            placeholder="e.g. Diamond Hall"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1">Type</Label>
                                        <select
                                            className="w-full rounded-xl h-12 px-4 border bg-background font-bold appearance-none"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        >
                                            <option value="BOYS">Boys Hostel</option>
                                            <option value="GIRLS">Girls Hostel</option>
                                            <option value="COED">Co-Ed (Mixed)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1">Address / Location</Label>
                                        <Input
                                            className="rounded-xl h-12"
                                            placeholder="Building address"
                                            value={formData.address}
                                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20 mt-4">
                                        Register Building
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {hostels.map(hostel => (
                            <Card key={hostel.id} className="rounded-[3.5rem] border-border/50 shadow-xl p-8 hover:shadow-2xl transition-all group overflow-hidden relative">
                                {/* Type Badge */}
                                <div className={`absolute top-8 right-16 px-4 py-2 rounded-xl text-label ${hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-600' :
                                    hostel.type === 'GIRLS' ? 'bg-pink-100 text-pink-600' :
                                        'bg-purple-100 text-purple-600'
                                    }`}>
                                    {hostel.type}
                                </div>

                                {/* Actions Menu */}
                                <div className="absolute top-8 right-8">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full h-10 w-10">
                                                <MoreVertical size={20} className="text-muted-foreground" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                            <DropdownMenuItem onClick={() => openEditModal(hostel)} className="rounded-xl gap-3 font-bold cursor-pointer">
                                                <Edit2 size={16} className="text-primary" /> Edit Building
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => openDeleteAlert(hostel)} className="rounded-xl gap-3 font-bold text-destructive cursor-pointer">
                                                <Trash2 size={16} /> Delete Building
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="flex gap-6 items-start">
                                    <div className="w-[100px] h-[100px] rounded-[2rem] bg-muted/50 flex items-center justify-center shrink-0 border border-border/50">
                                        <Home size={40} className="text-muted-foreground/50" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-h1 font-semibold tracking-tight">{hostel.name}</h3>
                                        <div className="flex items-center gap-2 text-muted-foreground font-medium">
                                            <MapPin size={16} />
                                            {hostel.address || "No address provided"}
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
                                                <Building2 size={14} /> {hostel.rooms?.length || 0} Rooms
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/70 uppercase tracking-widest">
                                                <Bed size={14} /> {hostel.rooms?.reduce((acc, r) => acc + r.capacity, 0) || 0} Beds
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex gap-3">
                                    <Link href={`/dashboard/hostels/manage?id=${hostel.id}`} className="flex-1">
                                        <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold gap-2 transition-all">
                                            Manage Rooms <ArrowRight size={18} />
                                        </Button>
                                    </Link>
                                </div>
                            </Card>
                        ))}

                        {hostels.length === 0 && (
                            <div className="col-span-full py-32 text-center bg-card/50 border-2 border-dashed border-border/50 rounded-[4rem]">
                                <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Building2 size={48} className="text-muted-foreground/30" />
                                </div>
                                <h2 className="text-h1 font-semibold mb-2">No Buildings Registered</h2>
                                <p className="text-muted-foreground text-lg font-medium max-w-md mx-auto">
                                    Start by adding your first school hostel building to manage rooms and allocations.
                                </p>
                            </div>
                        )}
                    </div>
                </TabsContent>

                <TabsContent value="maintenance" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[3.5rem] border-border/50 shadow-xl overflow-hidden">
                        <CardHeader className="p-10 pb-4">
                            <CardTitle className="text-h1 font-semibold">Maintenance Requests</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="space-y-4">
                                {maintenanceRequests.length > 0 ? maintenanceRequests.map(req => (
                                    <div key={req.id} className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col md:flex-row gap-6 items-start justify-between group hover:bg-muted/50 transition-colors">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <Badge className={`rounded-lg px-3 py-1 font-semibold uppercase text-[10px] tracking-widest ${req.priority === 'URGENT' ? 'bg-red-500 hover:bg-red-600' :
                                                    req.priority === 'HIGH' ? 'bg-orange-500 hover:bg-orange-600' :
                                                        req.priority === 'MEDIUM' ? 'bg-yellow-500 text-yellow-950 hover:bg-yellow-600' :
                                                            'bg-blue-500 hover:bg-blue-600'
                                                    }`}>
                                                    {req.priority} Priority
                                                </Badge>
                                                <Badge variant="outline" className={`rounded-lg px-3 py-1 font-semibold uppercase text-[10px] tracking-widest border-2 ${req.status === 'RESOLVED' ? 'border-green-500 text-green-600 bg-green-50' :
                                                    req.status === 'IN_PROGRESS' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                                                        'border-slate-300 text-slate-500'
                                                    }`}>
                                                    {req.status.replace('_', ' ')}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xl font-bold">{req.title}</h3>
                                            <p className="text-muted-foreground">{req.description}</p>
                                            <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground/70 pt-2">
                                                {req.bed && (
                                                    <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border">
                                                        <Bed size={14} /> {req.bed.name} • Room {req.bed.room?.number}
                                                    </span>
                                                )}
                                                {!req.bed && req.roomId && (
                                                    <span className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border">
                                                        <Home size={14} /> Room ID: {req.roomId}
                                                    </span>
                                                )}
                                                {/* <span className="flex items-center gap-1.5">
                                                    <Clock size={14} /> {format(new Date(req.createdAt), 'MMM dd, yyyy')}
                                                </span> */}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            {req.status !== 'RESOLVED' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateMaintenanceStatus(req.id, 'RESOLVED')}
                                                    className="rounded-xl h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                                                >
                                                    <CheckCircle2 size={16} /> Mark Resolved
                                                </Button>
                                            )}
                                            {req.status === 'OPEN' && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateMaintenanceStatus(req.id, 'IN_PROGRESS')}
                                                    className="rounded-xl h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2"
                                                >
                                                    <Wrench size={16} /> Start Work
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="py-20 text-center text-muted-foreground">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={32} className="text-green-500" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">All Systems Go!</h3>
                                        <p className="max-w-xs mx-auto">No open maintenance requests at this time. Great job keeping the facilities in top shape.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="leaves" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <LeaveManagementTab />
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Edit Building</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateHostel} className="space-y-4 pt-4">
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1">Building Name</Label>
                            <Input
                                required
                                className="rounded-xl h-12"
                                placeholder="e.g. Diamond Hall"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1">Type</Label>
                            <select
                                className="w-full rounded-xl h-12 px-4 border bg-background font-bold appearance-none"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="BOYS">Boys Hostel</option>
                                <option value="GIRLS">Girls Hostel</option>
                                <option value="COED">Co-Ed (Mixed)</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="font-bold ml-1">Address / Location</Label>
                            <Input
                                className="rounded-xl h-12"
                                placeholder="Building address"
                                value={formData.address}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                            />
                        </div>
                        <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg shadow-lg shadow-primary/20 mt-4">
                            Save Changes
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold text-destructive">Delete Building?</DialogTitle>
                    </DialogHeader>
                    <div className="py-4 font-medium text-base">
                        This will permanently remove <span className="font-semibold text-foreground">"{formData.name}"</span> and all room assignments within it. This action cannot be undone.
                    </div>
                    <div className="flex gap-4 mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsDeleteAlertOpen(false)}
                            className="flex-1 h-12 rounded-xl font-bold"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteHostel}
                            className="flex-1 h-12 rounded-xl bg-destructive hover:bg-destructive/90 text-white font-semibold shadow-lg shadow-destructive/20"
                        >
                            Delete Building
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LeaveManagementTab() {
    const [leaves, setLeaves] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLeaves = async () => {
        try {
            const data = await HostelService.getLeaves();
            setLeaves(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch leaves");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            await HostelService.updateLeaveStatus(id, status);
            toast.success(`Leave request ${status.toLowerCase()}`);
            fetchLeaves();
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <Card className="rounded-[3.5rem] border-border/50 shadow-xl overflow-hidden">
            <CardHeader className="p-10 pb-4">
                <CardTitle className="text-h1 font-semibold">Student Leave Requests</CardTitle>
            </CardHeader>
            <CardContent className="p-10">
                <div className="space-y-4">
                    {leaves.length > 0 ? leaves.map(leave => (
                        <div key={leave.id} className="p-6 rounded-[2rem] bg-muted/30 border border-border/50 flex flex-col md:flex-row gap-6 items-start justify-between group hover:bg-muted/50 transition-colors">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={`rounded-lg px-3 py-1 font-semibold uppercase text-[10px] tracking-widest border-2 ${leave.status === 'APPROVED' ? 'border-green-500 text-green-600 bg-green-50' :
                                        leave.status === 'REJECTED' ? 'border-red-500 text-red-600 bg-red-50' :
                                            'border-yellow-500 text-yellow-600 bg-yellow-50'
                                        }`}>
                                        {leave.status}
                                    </Badge>
                                    <span className="text-sm font-bold text-muted-foreground">
                                        {format(new Date(leave.startDate), 'MMM dd')} - {format(new Date(leave.endDate), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold">{leave.student?.name || 'Unknown Student'}</h3>
                                <p className="text-muted-foreground">{leave.reason}</p>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                                {leave.status === 'PENDING' && (
                                    <>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdateStatus(leave.id, 'APPROVED')}
                                            className="rounded-xl h-10 px-4 bg-green-600 hover:bg-green-700 text-white font-bold gap-2"
                                        >
                                            <CheckCircle2 size={16} /> Approve
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() => handleUpdateStatus(leave.id, 'REJECTED')}
                                            className="rounded-xl h-10 px-4 bg-red-100 hover:bg-red-200 text-red-600 font-bold gap-2"
                                        >
                                            <XCircle size={16} /> Reject
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center text-muted-foreground">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                                <Users size={32} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Leave Requests</h3>
                            <p className="max-w-xs mx-auto">All students are present and accounted for.</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
