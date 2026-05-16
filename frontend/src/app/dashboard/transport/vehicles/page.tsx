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
    ShieldCheck,
    Pencil,
    Trash2
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function TransportVehiclesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<any>(null);
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
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch vehicles:", error);
            toast.error("Failed to fetch vehicles");
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
            const payload = {
                ...formData,
                capacity: parseInt(formData.capacity),
                branchId: resolvedBranchId
            };

            if (editingVehicle) {
                await api.patch(`/transport/vehicles/${editingVehicle.id}`, payload);
                toast.success("Vehicle updated successfully");
            } else {
                await api.post("/transport/vehicles", payload);
                toast.success("Vehicle registered successfully");
            }

            setIsDialogOpen(false);
            setEditingVehicle(null);
            setFormData({ registrationNumber: "", model: "", capacity: "", driverName: "", driverPhone: "" });
            fetchVehicles();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save vehicle:", error);
            toast.error("Failed to save vehicle");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        try {
            await api.delete(`/transport/vehicles/${id}`);
            toast.success("Vehicle deleted successfully");
            fetchVehicles();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to delete vehicle:", error);
            toast.error("Failed to delete vehicle");
        }
    };

    const handleEdit = (vehicle: any) => {
        setEditingVehicle(vehicle);
        setFormData({
            registrationNumber: vehicle.registrationNumber,
            model: vehicle.model,
            capacity: vehicle.capacity.toString(),
            driverName: vehicle.driverName,
            driverPhone: vehicle.driverPhone || ""
        });
        setIsDialogOpen(true);
    };

    const filteredVehicles = (vehicles ?? []).filter(v =>
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.driverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Bus className="text-primary w-10 h-10" />
                        School Fleet
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Monitor and manage all school vehicles and drivers.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingVehicle(null);
                        setFormData({ registrationNumber: "", model: "", capacity: "", driverName: "", driverPhone: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Add New Vehicle
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold mb-6">
                                {editingVehicle ? "Edit Vehicle" : "Register Vehicle"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Reg Number</label>
                                <Input
                                    placeholder="e.g. ABC-123-XY"
                                    value={formData.registrationNumber}
                                    onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Model / Make</label>
                                <Input
                                    placeholder="e.g. Toyota Coaster 2024"
                                    value={formData.model}
                                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Capacity</label>
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
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Driver Name</label>
                                <Input
                                    placeholder="e.g. John Smith"
                                    value={formData.driverName}
                                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Driver Phone</label>
                                <Input
                                    placeholder="e.g. +234..."
                                    value={formData.driverPhone}
                                    onChange={(e) => setFormData({ ...formData, driverPhone: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                />
                            </div>
                            <Button type="submit" className="md:col-span-2 h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                {editingVehicle ? "Update Vehicle" : "Register Vehicle"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative max-w-md mb-8">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                    placeholder="Search fleet..."
                    className="pl-12 rounded-[1.5rem] border-none h-14 font-bold shadow-xl shadow-primary/5"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id} className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 hover:shadow-primary/10 transition-all group overflow-hidden border-t-8 border-t-primary/20">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex justify-between items-start">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-all duration-500">
                                    <Bus size={32} />
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                            <MoreVertical size={20} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                        <DropdownMenuItem onClick={() => handleEdit(vehicle)} className="rounded-xl gap-3 font-bold py-3">
                                            <Pencil size={18} className="text-blue-500" /> Edit Vehicle
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleDelete(vehicle.id)} className="rounded-xl gap-3 font-bold py-3 text-destructive focus:text-destructive">
                                            <Trash2 size={18} /> Delete Vehicle
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="mt-6">
                                <h3 className="text-h3 font-semibold tracking-tight">{vehicle.registrationNumber}</h3>
                                <p className="text-muted-foreground font-bold">{vehicle.model}</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center justify-between py-4 border-y border-border/50">
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-primary/60" />
                                    <span className="text-sm font-semibold text-muted-foreground">Capacity</span>
                                </div>
                                <span className="font-semibold text-lg">{vehicle.capacity} Seats</span>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                        <User size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Driver</p>
                                        <p className="font-bold">{vehicle.driverName}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                        <Phone size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-widest">Contact</p>
                                        <p className="font-bold">{vehicle.driverPhone || "N/A"}</p>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full rounded-2xl h-12 font-semibold border-2 hover:bg-primary hover:text-white hover:border-primary transition-all">
                                Assignment Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredVehicles.length === 0 && (
                <div className="py-20 text-center text-muted-foreground font-medium animate-in fade-in zoom-in-95">
                    No vehicles registered in the fleet.
                </div>
            )}
        </div>
    );
}
