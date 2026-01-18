"use client";

import { useState, useEffect } from "react";
import {
    Bus,
    Plus,
    Search,
    MoreVertical,
    Users,
    Phone,
    User,
    Loader2,
    ShieldCheck
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TransportVehiclesPage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        registrationNumber: "",
        model: "",
        capacity: "",
        driverName: "",
        driverPhone: ""
    });

    const fetchVehicles = async () => {
        try {
            const res = await api.get("/transport/vehicles");
            setVehicles(res.data);
        } catch (error) {
            console.error("Failed to fetch vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchVehicles();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post("/transport/vehicles", {
                ...formData,
                capacity: parseInt(formData.capacity),
                branchId: user?.branchId
            });
            setIsDialogOpen(false);
            setFormData({ registrationNumber: "", model: "", capacity: "", driverName: "", driverPhone: "" });
            fetchVehicles();
        } catch (error) {
            console.error("Failed to create vehicle:", error);
        }
    };

    const filteredVehicles = vehicles.filter(v =>
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                        <Bus className="text-primary w-10 h-10" />
                        School Fleet
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Monitor and manage all school vehicles and drivers.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Add New Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black italic mb-6">Register Vehicle</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Reg Number</label>
                                <Input
                                    placeholder="e.g. ABC-123-XY"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Model / Make</label>
                                <Input
                                    placeholder="e.g. Toyota Coaster 2024"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Capacity</label>
                                <Input
                                    type="number"
                                    placeholder="e.g. 32"
                                    value={formData.capacity}
                                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Driver Name</label>
                                <Input
                                    placeholder="e.g. John Smith"
                                    value={formData.driverName}
                                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Driver Phone</label>
                                <Input
                                    placeholder="e.g. +234..."
                                    value={formData.driverPhone}
                                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                />
                            </div>
                            <Button type="submit" className="md:col-span-2 h-14 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Register Vehicle
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all group overflow-hidden border-t-8 border-t-primary/20 bg-card">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500">
                                    <Bus size={32} />
                                </div>
                                <div className="px-3 py-1 bg-green-500/10 text-green-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-500/20">
                                    Active
                                </div>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-2xl font-black italic tracking-tight">{vehicle.registrationNumber}</h3>
                                <p className="text-muted-foreground font-bold">{vehicle.model}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between py-4 border-y border-border/50">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-primary/60" />
                                    <span className="text-sm font-black text-muted-foreground">Capacity</span>
                                </div>
                                <span className="font-black text-lg">{vehicle.capacity} Seats</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Driver</p>
                                        <p className="font-bold">{vehicle.driverName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-muted-foreground tracking-widest">Contact</p>
                                        <p className="font-bold">{vehicle.driverPhone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-2xl h-12 font-black border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                Assignment Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <div className="py-20 text-center text-muted-foreground font-medium italic animate-in fade-in zoom-in-95">
                    No vehicles registered in the fleet.
                </div>
            )}
        </div>
    );
}
