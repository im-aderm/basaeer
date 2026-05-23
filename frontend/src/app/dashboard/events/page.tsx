'use client';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Calendar as CalendarIcon,
    Plus,
    MapPin,
    Clock,
    Users,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter,
    Check
} from 'lucide-react';
import { AutomationEventsService, CampusEvent } from '@/services/automationEventsService';
import { useNotification } from '@/context/NotificationContext';

export default function EventsPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [eventForm, setEventForm] = useState({
        title: '', description: '', startDate: '', endDate: '', location: '', category: 'ACADEMIC', isPublic: true, allowRSVP: true
    });

    const categories = ['ACADEMIC', 'HOLIDAY', 'SPORTS', 'CULTURAL', 'ADMINISTRATIVE'];

    const fetchData = async () => {
        try {
            const data = await AutomationEventsService.getEvents();
            setEvents(data);
        } catch (error) {
            showError('Failed to load events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await AutomationEventsService.createEvent(eventForm);
            showSuccess('Event scheduled successfully');
            setIsCreateOpen(false);
            fetchData();
        } catch (error) { showError('Failed to schedule event'); }
    };

    const handleRSVP = async (id: string, status: string) => {
        try {
            await AutomationEventsService.rsvpEvent(id, status);
            showSuccess('RSVP updated');
            fetchData();
        } catch (error) { showError('Failed to update RSVP'); }
    };

    const getCategoryColor = (cat: string) => {
        switch (cat) {
            case 'ACADEMIC': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'HOLIDAY': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'SPORTS': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'CULTURAL': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 pb-20">
                <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Campus Calendar</h1>
                    <p className="text-muted-foreground font-medium mt-1">Unified view of all school activities, holidays, and events.</p>
                </div>
                {(user?.role === 'SUPER_ADMIN' || user?.role === 'BRANCH_ADMIN') && (
                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-8 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" /> Schedule Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl">
                            <DialogHeader>
                                <CardTitle className="text-h3 font-semibold">New Campus Event</CardTitle>
                                <CardDescription className="font-bold">Enter event details to notify the school community.</CardDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Event Title</Label>
                                    <Input required className="h-12 rounded-xl font-bold" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Start Date</Label>
                                        <Input type="datetime-local" required className="h-12 rounded-xl font-bold" value={eventForm.startDate} onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">End Date</Label>
                                        <Input type="datetime-local" required className="h-12 rounded-xl font-bold" value={eventForm.endDate} onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Category</Label>
                                        <Select value={eventForm.category} onValueChange={(v) => setEventForm({ ...eventForm, category: v })}>
                                            <SelectTrigger className="h-12 rounded-xl font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                                                {categories.map(c => <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Location</Label>
                                        <Input className="h-12 rounded-xl font-bold" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
                                    </div>
                                </div>
                                <Button type="submit" className="h-14 w-full rounded-2xl font-semibold uppercase tracking-wider shadow-xl shadow-primary/20">Create Event</Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-muted/30 p-4 rounded-[2rem] border border-border/50">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search events by title or location..."
                        className="pl-12 h-14 rounded-2xl bg-background border-none font-bold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="h-14 px-6 rounded-2xl font-semibold gap-2 border-none bg-background shadow-sm hover:bg-muted/50">
                        <Filter className="h-5 w-5" /> Filter
                    </Button>
                    <div className="flex bg-background p-1 rounded-2xl shadow-sm border border-border/50">
                        <Button variant="ghost" className="h-12 rounded-xl font-semibold px-6 bg-primary text-white shadow-lg shadow-primary/20">List</Button>
                        <Button variant="ghost" className="h-12 rounded-xl font-semibold px-6 opacity-40">Calendar</Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(events ?? []).filter(e => e.title.toLowerCase().includes(searchTerm.toLowerCase())).map((event) => (
                    <Card key={event.id} className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background group hover:border-primary/50 transition-all duration-500">
                        <div className="p-8 border-b border-border/50 bg-primary/5 relative">
                            <Badge className={`rounded-xl px-4 py-1.5 font-semibold uppercase tracking-tighter text-[10px] border-2 shadow-sm ${getCategoryColor(event.category)}`}>
                                {event.category}
                            </Badge>
                            <h3 className="text-h3 font-semibold uppercase mt-4 group-hover:text-primary transition-colors">{event.title}</h3>
                            <p className="text-sm font-medium text-muted-foreground mt-2 line-clamp-2">{event.description || 'No description provided.'}</p>
                        </div>
                        <CardContent className="p-8 space-y-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary"><Clock className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-semibold opacity-40 leading-none">Date & Time</span>
                                        <span className="italic">{new Date(event.startDate).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-bold opacity-60">
                                    <div className="h-10 w-10 rounded-xl bg-muted/50 flex items-center justify-center text-primary"><MapPin className="h-5 w-5" /></div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase font-semibold opacity-40 leading-none">Location</span>
                                        <span className="italic">{event.location || 'Campus Wide'}</span>
                                    </div>
                                </div>
                            </div>

                            {event.allowRSVP && (
                                <div className="pt-4 border-t border-border/50 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-semibold">
                                        <span className="flex items-center gap-2"><Users className="h-4 w-4" /> RSVP Status</span>
                                        <span className="text-primary">{event._count?.rsvps || 0} Attending</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button variant="outline" className="rounded-xl font-semibold uppercase text-xs h-10 border-2 border-primary/20 text-primary hover:bg-primary/10" onClick={() => handleRSVP(event.id, 'GOING')}>
                                            Going
                                        </Button>
                                        <Button variant="outline" className="rounded-xl font-semibold uppercase text-xs h-10 border-2 border-primary/20 hover:bg-primary/10" onClick={() => handleRSVP(event.id, 'DECLINED')}>
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {events.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center py-40 text-center space-y-4 opacity-20">
                    <CalendarIcon className="h-24 w-24" strokeWidth={0.5} />
                    <h3 className="text-h3 font-semibold">No Events Scheduled</h3>
                    <p className="font-bold">The campus is quiet for now. Check back later!</p>
                </div>
            )}
        </div>
    </RequireBranch>
    );
}
