"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import {
    MapPin,
    Plus,
    Search,
    MoreVertical,
    Navigation,
    Map,
    ChevronRight,
    Loader2,
    Pencil,
    Trash2,
    MapPinned
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function TransportRoutesPage() {
    const { user, resolvedBranchId } = useAuth();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        startPoint: "",
        endPoint: "",
        stops: "" // Will be handled as JSON string in the form but JSON object in the API
    });

    const fetchRoutes = async () => {
        try {
            const res = await api.get("/transport/routes");
            setRoutes(res.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch routes:", error);
            toast.error("Failed to fetch routes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchRoutes();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let stopsData = null;
            if (formData.stops.trim()) {
                try {
                    // Try to parse comma separated stops into an array of objects
                    stopsData = formData.stops.split(',').map(s => ({ location: s.trim() }));
                } catch (e) {
                    toast.error("Invalid stops format. Use comma separated values.");
                    return;
                }
            }

            const payload = {
                name: formData.name,
                startPoint: formData.startPoint,
                endPoint: formData.endPoint,
                stops: stopsData,
                branchId: resolvedBranchId
            };

            if (editingRoute) {
                await api.patch(`/transport/routes/${editingRoute.id}`, payload);
                toast.success("Route updated successfully");
            } else {
                await api.post("/transport/routes", payload);
                toast.success("Route created successfully");
            }

            setIsDialogOpen(false);
            setEditingRoute(null);
            setFormData({ name: "", startPoint: "", endPoint: "", stops: "" });
            fetchRoutes();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save route:", error);
            toast.error("Failed to save route");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this route?")) return;
        try {
            await api.delete(`/transport/routes/${id}`);
            toast.success("Route deleted successfully");
            fetchRoutes();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to delete route:", error);
            toast.error("Failed to delete route");
        }
    };

    const handleEdit = (route: any) => {
        setEditingRoute(route);
        // Convert stops object/array back to string for the form
        const stopsStr = Array.isArray(route.stops)
            ? route.stops.map((s: any) => s.location).join(', ')
            : "";

        setFormData({
            name: route.name,
            startPoint: route.startPoint,
            endPoint: route.endPoint,
            stops: stopsStr
        });
        setIsDialogOpen(true);
    };

    const filteredRoutes = (routes ?? []).filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <RequireBranch requireSpecificBranch><div className="p-8 text-center"><BranchContextBanner /><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div></RequireBranch>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Map className="text-primary w-10 h-10" />
                        Transport Routes
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage school bus routes and pick-up points.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) {
                        setEditingRoute(null);
                        setFormData({ name: "", startPoint: "", endPoint: "", stops: "" });
                    }
                }}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-semibold text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Add New Route
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-h1 font-semibold mb-6">
                                {editingRoute ? "Edit Route" : "Create New Route"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Route Name</label>
                                <Input
                                    placeholder="e.g. North Area Bus A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Start Point</label>
                                    <Input
                                        placeholder="e.g. School Gate"
                                        value={formData.startPoint}
                                        onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                                        className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">End Point</label>
                                    <Input
                                        placeholder="e.g. Digital Valley"
                                        value={formData.endPoint}
                                        onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                                        className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground ml-1">Intermediate Stops (Comma separated)</label>
                                <textarea
                                    placeholder="e.g. Landmark Mall, City Center, Square Plaza"
                                    value={formData.stops}
                                    onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                                    className="w-full min-h-[100px] p-4 rounded-2xl bg-white border border-primary/90 font-bold text-lg focus:ring-2 ring-primary/20 transition-all resize-none"
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl font-semibold text-h3 shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                {editingRoute ? "Update Route" : "Create Route"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 p-8">
                    <CardTitle className="text-h3 font-semibold">Route Directory</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                        <Input
                            placeholder="Search routes..."
                            className="pl-12 rounded-xl bg-muted/30 border-none font-medium h-12"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-left">
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Route Name</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Path Way</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Stops</th>
                                    <th className="px-8 py-5 text-right text-[10px] uppercase tracking-[0.2em] font-semibold text-muted-foreground">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredRoutes.map((route) => (
                                    <tr key={route.id} className="hover:bg-muted/10 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <Navigation size={20} />
                                                </div>
                                                <span className="font-semibold text-lg">{route.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2 font-bold text-sm">
                                                <span className="text-foreground">{route.startPoint}</span>
                                                <ChevronRight size={14} className="text-muted-foreground" />
                                                <span className="text-foreground">{route.endPoint}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-1">
                                                <MapPinned size={14} className="text-primary/60" />
                                                <span className="font-bold text-xs text-muted-foreground">
                                                    {Array.isArray(route.stops) ? `${route.stops.length} Managed Stops` : "No Stops Defined"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                        <MoreVertical size={20} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-2xl p-2 min-w-[160px]">
                                                    <DropdownMenuItem onClick={() => handleEdit(route)} className="rounded-xl gap-3 font-bold py-3">
                                                        <Pencil size={18} className="text-blue-500" /> Edit Route
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(route.id)} className="rounded-xl gap-3 font-bold py-3 text-destructive focus:text-destructive">
                                                        <Trash2 size={18} /> Delete Route
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRoutes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium">
                                            No transport routes found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}
