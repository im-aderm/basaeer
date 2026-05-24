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
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function TransportRoutesPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<any>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
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
            showError("Failed to fetch routes");
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
                    showError("Invalid stops format. Use comma separated values.");
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
                showSuccess("Route updated successfully");
            } else {
                await api.post("/transport/routes", payload);
                showSuccess("Route created successfully");
            }

            setIsDialogOpen(false);
            setEditingRoute(null);
            setFormData({ name: "", startPoint: "", endPoint: "", stops: "" });
            fetchRoutes();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save route:", error);
            showError("Failed to save route");
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await api.delete(`/transport/routes/${confirmDelete}`);
            showSuccess("Route deleted successfully");
            fetchRoutes();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to delete route:", error);
            showError("Failed to delete route");
        }
        setConfirmDelete(null);
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

    if (loading) return <RequireBranch requireSpecificBranch><div className="p-4 text-center"><BranchContextBanner /><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div></RequireBranch>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        <Map className="text-primary w-10 h-10" />
                        Transport Routes
                    </h1>
                    <p className="text-foreground/60 font-medium text-[12px]">Manage school bus routes and pick-up points.</p>
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
                    <DialogContent className="rounded-2xl border-primary/20 shadow-2xl p-4 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-[20px] font-semibold mb-4">
                                {editingRoute ? "Edit Route" : "Create New Route"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Route Name</label>
                                <Input
                                    placeholder="e.g. North Area Bus A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-12 rounded-2xl bg-muted/30 border-none font-semibold text-[12px]"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Start Point</label>
                                    <Input
                                        placeholder="e.g. School Gate"
                                        value={formData.startPoint}
                                        onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                                        className="h-12 rounded-2xl bg-muted/30 border-none font-semibold text-[12px]"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">End Point</label>
                                    <Input
                                        placeholder="e.g. Digital Valley"
                                        value={formData.endPoint}
                                        onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                                        className="h-12 rounded-2xl bg-muted/30 border-none font-semibold text-[12px]"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold uppercase tracking-[0.2em] text-foreground/60 ml-1">Intermediate Stops (Comma separated)</label>
                                <textarea
                                    placeholder="e.g. Landmark Mall, City Center, Square Plaza"
                                    value={formData.stops}
                                    onChange={(e) => setFormData({ ...formData, stops: e.target.value })}
                                    className="w-full min-h-[100px] p-3 rounded-2xl bg-white border border-primary/90 font-semibold text-[12px] focus:ring-2 ring-primary/20 transition-all resize-none"
                                />
                            </div>
                            <Button type="submit" className="w-full h-12 rounded-2xl font-semibold text-[12px] shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                {editingRoute ? "Update Route" : "Create Route"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-4">
                    <CardTitle className="text-[12px] font-semibold">Route Directory</CardTitle>
                    <div className="relative w-72">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/60" size={18} />
                        <Input
                            placeholder="Search routes..."
                            className="pl-12 rounded-xl bg-muted/30 border-none font-medium h-10 text-[12px]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Route Name</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Path Way</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Stops</th>
                                    <th className={`${TABLE_HEADER_CELL_NO_SORT} text-right`}>Actions</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {filteredRoutes.map((route) => (
                                    <tr key={route.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Navigation size={16} />
                                                </div>
                                                <span className="font-semibold text-[12px]">{route.name}</span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex items-center gap-2 font-semibold text-[12px]">
                                                <span className="text-foreground">{route.startPoint}</span>
                                                <ChevronRight size={14} className="text-foreground/60" />
                                                <span className="text-foreground">{route.endPoint}</span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL}>
                                            <div className="flex items-center gap-1">
                                                <MapPinned size={14} className="text-primary/60" />
                                                <span className="font-semibold text-[12px] text-foreground/60">
                                                    {Array.isArray(route.stops) ? `${route.stops.length} Managed Stops` : "No Stops Defined"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10">
                                                        <MoreVertical size={20} />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="rounded-xl p-2 min-w-[160px]">
                                                    <DropdownMenuItem onClick={() => handleEdit(route)} className="rounded-lg gap-3 font-semibold py-2 text-[12px]">
                                                        <Pencil size={16} className="text-blue-500" /> Edit Route
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(route.id)} className="rounded-lg gap-3 font-semibold py-2 text-[12px] text-destructive focus:text-destructive">
                                                        <Trash2 size={16} /> Delete Route
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRoutes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-3 py-12 text-center text-foreground/60 font-medium text-[12px]">
                                            No transport routes found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Route"
                message="Are you sure you want to delete this route? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
        </RequireBranch>
    );
}
