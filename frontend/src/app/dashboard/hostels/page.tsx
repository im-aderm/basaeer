"use client";

import { useState, useEffect } from "react";
import {
    Building2,
    Bed,
    Users,
    Plus,
    ArrowRight,
    ArrowUpRight,
    Home,
    ShieldCheck,
    AlertCircle,
    Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HostelService, Hostel } from "@/services/hostelService";
import Link from "next/link";

export default function HostelOverviewPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newHostel, setNewHostel] = useState({
        name: "",
        type: "COED",
        address: ""
    });

    const fetchData = async () => {
        try {
            const data = await HostelService.getAll();
            setHostels(data);
        } catch (error) {
            console.error("Failed to fetch hostels:", error);
            toast.error("Failed to load hostel data");
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
            await HostelService.createHostel(newHostel);
            toast.success("Hostel registered successfully");
            setIsCreateModalOpen(false);
            setNewHostel({ name: "", type: "COED", address: "" });
            fetchData();
        } catch (error) {
            console.error("Creation failed:", error);
            toast.error("Failed to register hostel");
        }
    };

    const stats = [
        {
            title: "Total Hostels",
            value: hostels.length,
            icon: Building2,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
            desc: "Active buildings"
        },
        {
            title: "Total Capacity",
            value: hostels.reduce((acc, h) => acc + (h.rooms?.reduce((rAcc, r) => rAcc + r.capacity, 0) || 0), 0),
            icon: Bed,
            color: "text-purple-500",
            bgColor: "bg-purple-500/10",
            desc: "Total beds available"
        },
        {
            title: "Occupied",
            value: hostels.reduce((acc, h) => acc + (h.rooms?.reduce((rAcc, r) => rAcc + (r.beds?.filter(b => b.status === "OCCUPIED").length || 0), 0) || 0), 0),
            icon: Users,
            color: "text-green-500",
            bgColor: "bg-green-500/10",
            desc: "Currently residing"
        },
        {
            title: "Maintenance",
            value: hostels.reduce((acc, h) => acc + (h.rooms?.reduce((rAcc, r) => rAcc + (r.beds?.filter(b => b.status === "MAINTENANCE").length || 0), 0) || 0), 0),
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
                    <h1 className="text-5xl font-black tracking-tight italic mb-4">Hostel Hub</h1>
                    <p className="text-slate-300 text-xl font-medium max-w-2xl leading-relaxed italic">
                        Streamline your residential management. Track occupancy, manage building wings, and ensure a comfortable stay for every student.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black italic text-lg gap-2 shadow-xl">
                                    <Plus size={20} strokeWidth={3} />
                                    Register building
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md rounded-[2.5rem] p-8">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black italic">Add New Building</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreateHostel} className="space-y-4 pt-4">
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Building Name</Label>
                                        <Input
                                            required
                                            className="rounded-xl h-12"
                                            placeholder="e.g. Diamond Hall"
                                            value={newHostel.name}
                                            onChange={e => setNewHostel({ ...newHostel, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Type</Label>
                                        <select
                                            className="w-full rounded-xl h-12 px-4 border bg-background font-bold italic appearance-none"
                                            value={newHostel.type}
                                            onChange={e => setNewHostel({ ...newHostel, type: e.target.value })}
                                        >
                                            <option value="BOYS">Boys Hostel</option>
                                            <option value="GIRLS">Girls Hostel</option>
                                            <option value="COED">Co-Ed (Mixed)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="font-bold ml-1 italic">Address / Location</Label>
                                        <Input
                                            className="rounded-xl h-12"
                                            placeholder="Building address"
                                            value={newHostel.address}
                                            onChange={e => setNewHostel({ ...newHostel, address: e.target.value })}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-14 rounded-xl font-black italic text-lg shadow-lg shadow-primary/20 mt-4">
                                        Register Building
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                {/* Decorative Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <Card key={i} className="rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden group hover:scale-[1.02] transition-all bg-card/40 backdrop-blur-md">
                        <CardContent className="p-8 text-center sm:text-left">
                            <div className={`w-14 h-14 rounded-2xl ${stat.bgColor} ${stat.color} flex items-center justify-center mb-6 mx-auto sm:mx-0 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={28} />
                            </div>
                            <h3 className="text-4xl font-black italic tracking-tighter">{stat.value}</h3>
                            <p className="text-muted-foreground font-bold mt-1">{stat.title}</p>
                            <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground/30 mt-4">{stat.desc}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Hostel List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {hostels.map(hostel => (
                    <Card key={hostel.id} className="rounded-[3.5rem] border-border/50 shadow-xl p-8 hover:shadow-2xl transition-all group overflow-hidden relative">
                        {/* Type Badge */}
                        <div className={`absolute top-8 right-8 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${hostel.type === 'BOYS' ? 'bg-blue-100 text-blue-600' :
                                hostel.type === 'GIRLS' ? 'bg-pink-100 text-pink-600' :
                                    'bg-purple-100 text-purple-600'
                            }`}>
                            {hostel.type}
                        </div>

                        <div className="flex gap-6 items-start">
                            <div className="w-[100px] h-[100px] rounded-[2rem] bg-muted/50 flex items-center justify-center shrink-0 border border-border/50">
                                <Home size={40} className="text-muted-foreground/50" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-3xl font-black italic tracking-tight">{hostel.name}</h3>
                                <p className="text-muted-foreground font-medium italic">{hostel.address || "No address provided"}</p>
                                <div className="flex gap-4 pt-2">
                                    <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground/70 uppercase tracking-widest">
                                        <Building2 size={14} /> {hostel.rooms?.length || 0} Rooms
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-black text-muted-foreground/70 uppercase tracking-widest">
                                        <Bed size={14} /> {hostel.rooms?.reduce((acc, r) => acc + r.capacity, 0) || 0} Beds
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 flex gap-3">
                            <Link href={`/dashboard/hostels/manage?id=${hostel.id}`} className="flex-1">
                                <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black italic gap-2 transition-all">
                                    Manage Rooms <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <Button variant="outline" className="h-14 w-14 rounded-2xl border-2">
                                <ArrowUpRight size={20} />
                            </Button>
                        </div>
                    </Card>
                ))}

                {hostels.length === 0 && (
                    <div className="col-span-full py-32 text-center bg-card/50 border-2 border-dashed border-border/50 rounded-[4rem] animate-in zoom-in-95">
                        <div className="w-24 h-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Building2 size={48} className="text-muted-foreground/30" />
                        </div>
                        <h2 className="text-3xl font-black italic mb-2">No Buildings Registered</h2>
                        <p className="text-muted-foreground text-lg font-medium italic max-w-md mx-auto">
                            Start by adding your first school hostel building to manage rooms and allocations.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
