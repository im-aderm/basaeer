"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useEffect, useState, useCallback } from "react";
import { Bus, MapPin, RadioTower, Loader2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transportService, VehicleLocation } from "@/services/transportService";
import { useNotification } from "@/context/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const POLL_INTERVAL_MS = 15000;

export default function TransportTrackingPage() {
    const { showError } = useNotification();
    const [locations, setLocations] = useState<VehicleLocation[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLocations = useCallback(async () => {
        try {
            const data = await transportService.getAllVehicleLocations();
            setLocations(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error(error);
            showError("Failed to load vehicle locations");
        } finally {
            setLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [fetchLocations]);

    const isStale = (lastPing: string | null) => {
        if (!lastPing) return true;
        return Date.now() - new Date(lastPing).getTime() > 30 * 60 * 1000;
    };

    if (loading) return (
        <RequireBranch requireSpecificBranch>
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        </RequireBranch>
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
                <BranchContextBanner />
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        <RadioTower className="text-primary w-9 h-9" />
                        Live Fleet Tracking
                    </h1>
                    <p className="text-muted-foreground mt-2 font-medium">
                        Vehicle positions refresh automatically every 15 seconds.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {locations.map(loc => (
                        <Card key={loc.vehicleId} className="rounded-[2rem] border-border/50 shadow-xl">
                            <CardContent className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                            <Bus size={22} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{loc.registrationNumber}</h3>
                                            <p className="text-sm text-muted-foreground">{loc.model} • {loc.driverName}</p>
                                        </div>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${isStale(loc.lastPing) ? 'bg-muted text-muted-foreground' : 'bg-green-100 text-green-700'}`}>
                                        {isStale(loc.lastPing) ? 'Offline' : 'Live'}
                                    </span>
                                </div>
                                {loc.lat != null && loc.lng != null ? (
                                    <div className="flex items-center gap-2 text-sm font-semibold bg-muted/30 rounded-xl px-4 py-3">
                                        <MapPin size={16} className="text-primary shrink-0" />
                                        {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                                    </div>
                                ) : (
                                    <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl px-4 py-3">
                                        No position reported yet.
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <Clock size={13} />
                                    {loc.lastPing
                                        ? `Updated ${formatDistanceToNow(new Date(loc.lastPing), { addSuffix: true })}`
                                        : 'Never reported'}
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {locations.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-white/75 border-2 border-dashed border-border/50 rounded-[3rem]">
                            <Bus size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                            <h2 className="text-xl font-semibold mb-1">No Vehicles Registered</h2>
                            <p className="text-muted-foreground">Add a vehicle to the fleet to begin tracking.</p>
                        </div>
                    )}
                </div>
            </div>
        </RequireBranch>
    );
}
