"use client";

import { useState, useEffect } from "react";
import {
    Calendar,
    MapPin,
    Users,
    Clock,
    Loader2,
    Plus,
    ExternalLink,
    Video,
    Globe,
    CheckCircle2,
    CalendarDays,
    ChevronRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { StakeholderService, AlumniEvent } from "@/services/stakeholderService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function AlumniEventsPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<AlumniEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        eventDate: "",
        location: "",
        isOnline: false,
        meetingUrl: ""
    });

    const fetchEvents = async () => {
        if (!user?.branchId) return;
        try {
            const data = await StakeholderService.getEvents(user.branchId);
            setEvents(data);
        } catch (error) {
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [user?.branchId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StakeholderService.createEvent({ ...formData, branchId: user?.branchId });
            toast.success("Event created successfully");
            setIsDialogOpen(false);
            setFormData({ title: "", description: "", eventDate: "", location: "", isOnline: false, meetingUrl: "" });
            fetchEvents();
        } catch (error) {
            toast.error("Failed to create event");
        }
    };

    const handleRsvp = async (eventId: string) => {
        try {
            await StakeholderService.rsvpEvent(eventId, "ATTENDING");
            toast.success("RSVP confirmed!");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to RSVP");
        }
    };

    const now = new Date();
    const upcomingEvents = (events ?? []).filter(e => new Date(e.eventDate) >= now).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const pastEvents = (events ?? []).filter(e => new Date(e.eventDate) < now).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="bg-card border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight flex items-center gap-3 text-emerald-600">
                        <CalendarDays className="w-10 h-10" />
                        Alumni Events
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg font-medium">Stay connected with alumni meetups, reunions, and networking events.</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-14 rounded-2xl px-8 font-semibold shadow-xl shadow-emerald-500/20 gap-3 bg-emerald-600 hover:scale-105 transition-all">
                            <Plus className="w-5 h-5" /> Create Event
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg rounded-[2.5rem] p-8">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">New Alumni Event</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1">Event Title</Label>
                                <Input required className="h-12 rounded-xl font-bold" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="font-bold ml-1">Description</Label>
                                <textarea
                                    className="w-full rounded-xl h-24 px-4 py-3 border bg-card font-medium resize-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1">Event Date</Label>
                                    <Input type="date" required className="h-12 rounded-xl font-bold" value={formData.eventDate} onChange={e => setFormData({ ...formData, eventDate: e.target.value })} />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="font-bold ml-1">Location</Label>
                                    <Input className="h-12 rounded-xl font-bold" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
                                </div>
                            </div>
                            <Button type="submit" className="w-full h-14 rounded-xl font-semibold text-lg bg-emerald-600 mt-2">
                                <Calendar className="w-5 h-5 mr-2" /> Schedule Event
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {upcomingEvents.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-h2 font-semibold tracking-tight flex items-center gap-3">
                        <Clock className="w-7 h-7 text-emerald-500" /> Upcoming Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {upcomingEvents.map((event) => (
                            <EventCard key={event.id} event={event} onRsvp={handleRsvp} />
                        ))}
                    </div>
                </div>
            )}

            {pastEvents.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-h2 font-semibold tracking-tight flex items-center gap-3">
                        <CalendarDays className="w-7 h-7 text-muted-foreground" /> Past Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {pastEvents.map((event) => (
                            <EventCard key={event.id} event={event} onRsvp={handleRsvp} past />
                        ))}
                    </div>
                </div>
            )}

            {events.length === 0 && (
                <div className="py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto border-2 border-dashed border-border">
                        <CalendarDays size={32} className="text-muted-foreground/30" />
                    </div>
                    <h3 className="text-h3 font-semibold">No events yet</h3>
                    <p className="text-muted-foreground font-medium">Create the first alumni event to get started.</p>
                </div>
            )}
        </div>
    );
}

function EventCard({ event, onRsvp, past }: { event: AlumniEvent; onRsvp: (id: string) => void; past?: boolean }) {
    const eventDate = new Date(event.eventDate);
    const isToday = eventDate.toDateString() === new Date().toDateString();

    return (
        <Card className={`rounded-[2.5rem] border-border/50 shadow-xl overflow-hidden transition-all hover:shadow-2xl group ${past ? 'opacity-70 hover:opacity-100' : ''}`}>
            <div className={`h-2 ${past ? 'bg-muted-foreground/20' : isToday ? 'bg-emerald-500' : 'bg-primary'}`} />
            <CardContent className="p-8 space-y-5">
                <div className="flex justify-between items-start">
                    <Badge className={`rounded-lg font-semibold ${past ? 'bg-muted/50 text-muted-foreground' : isToday ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                        {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                    </Badge>
                    {event.isOnline ? (
                        <Video className="w-5 h-5 text-blue-500" />
                    ) : (
                        <MapPin className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>

                <div>
                    <h3 className="text-h3 font-semibold tracking-tight mb-1">{event.title}</h3>
                    {event.description && (
                        <p className="text-muted-foreground font-medium text-sm line-clamp-2">{event.description}</p>
                    )}
                </div>

                <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    {event.location ? (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.location}</span>
                    ) : event.isOnline && event.meetingUrl ? (
                        <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Virtual Event</span>
                    ) : (
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Location TBD</span>
                    )}
                </div>

                {!past && (
                    <Button
                        className="w-full h-12 rounded-xl font-semibold gap-2"
                        variant={isToday ? "default" : "outline"}
                        onClick={() => onRsvp(event.id)}
                    >
                        {isToday ? (
                            <><CheckCircle2 className="w-4 h-4" /> Join Now</>
                        ) : (
                            <><Users className="w-4 h-4" /> RSVP</>
                        )}
                        <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                    </Button>
                )}

                {past && event.meetingUrl && (
                    <Button variant="ghost" className="w-full h-12 rounded-xl font-semibold gap-2" asChild>
                        <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" /> Event Recap
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
