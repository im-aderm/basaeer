"use client";

import { useState, useEffect } from "react";
import {
    MapPin,
    Plus,
    Search,
    MoreVertical,
    Navigation,
    Map,
    ChevronRight,
    Loader2
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TransportRoutesPage() {
    const { user } = useAuth();
    const [routes, setRoutes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        startPoint: "",
        endPoint: ""
    });

    const fetchRoutes = async () => {
        try {
            const res = await api.get("/transport/routes");
            setRoutes(res.data);
        } catch (error) {
            console.error("Failed to fetch routes:", error);
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
            await api.post("/transport/routes", {
                ...formData,
                branchId: user?.branchId
            });
            setIsDialogOpen(false);
            setFormData({ name: "", startPoint: "", endPoint: "" });
            fetchRoutes();
        } catch (error) {
            console.error("Failed to create route:", error);
        }
    };

    const filteredRoutes = routes.filter(route =>
        route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.startPoint.toLowerCase().includes(searchTerm.toLowerCase()) ||
        route.endPoint.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
                        <Map className="text-primary w-10 h-10" />
                        Transport Routes
                    </h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage school bus routes and pick-up points.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                            <Plus size={20} /> Add New Route
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-10 max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black italic mb-6">Create New Route</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Route Name</label>
                                <Input
                                    placeholder="e.g. North Area Bus A"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Start Point</label>
                                <Input
                                    placeholder="e.g. School Main Gate"
                                    value={formData.startPoint}
                                    onChange={(e) => setFormData({ ...formData, startPoint: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">End Point</label>
                                <Input
                                    placeholder="e.g. Digital Valley Estate"
                                    value={formData.endPoint}
                                    onChange={(e) => setFormData({ ...formData, endPoint: e.target.value })}
                                    className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-2xl font-black text-xl shadow-xl shadow-primary/20 mt-4 transition-all hover:scale-[1.02]">
                                Create Route
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 p-8">
                    <CardTitle className="text-xl font-black italic">Route Directory</CardTitle>
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
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Route Name</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Start Point</th>
                                    <th className="px-8 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">End Point</th>
                                    <th className="px-8 py-5 text-right text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground">Actions</th>
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
                                                <span className="font-black text-lg">{route.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 font-bold text-muted-foreground">{route.startPoint}</td>
                                        <td className="px-8 py-6 font-bold text-muted-foreground">{route.endPoint}</td>
                                        <td className="px-8 py-6 text-right">
                                            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-primary/10 hover:text-primary">
                                                <MoreVertical size={20} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRoutes.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center text-muted-foreground font-medium italic">
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
    );
}
