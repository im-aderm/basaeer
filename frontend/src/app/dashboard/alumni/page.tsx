'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
    GraduationCap,
    Search,
    Plus,
    Calendar,
    Briefcase,
    Linkedin,
    Mail,
    Users,
    ChevronRight,
    MapPin,
    ExternalLink
} from 'lucide-react';
import { StakeholderService, Alumni, AlumniEvent } from '@/services/stakeholderService';
import { toast } from 'sonner';

export default function AlumniPage() {
    const { user } = useAuth();
    const [alumni, setAlumni] = useState<Alumni[]>([]);
    const [events, setEvents] = useState<AlumniEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddAlumniOpen, setIsAddAlumniOpen] = useState(false);
    const [isAddEventOpen, setIsAddEventOpen] = useState(false);

    const [alumniForm, setAlumniForm] = useState({
        studentId: '', graduationDate: '', currentOccupation: '', currentCompany: '', linkedInUrl: ''
    });

    const [eventForm, setEventForm] = useState({
        title: '', description: '', eventDate: '', location: '', isOnline: false, meetingUrl: ''
    });

    const fetchData = async () => {
        if (!user?.branchId) return;
        try {
            const [alumniData, eventsData] = await Promise.all([
                StakeholderService.getAlumni(user.branchId),
                StakeholderService.getEvents(user.branchId)
            ]);
            setAlumni(alumniData);
            setEvents(eventsData);
        } catch (error) {
            toast.error('Failed to load alumni data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.branchId]);

    const handleAddAlumni = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StakeholderService.createAlumni({ ...alumniForm, branchId: user?.branchId });
            toast.success('Alumni added successfully');
            setIsAddAlumniOpen(false);
            fetchData();
        } catch (error) { toast.error('Failed to add alumni'); }
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StakeholderService.createEvent({ ...eventForm, branchId: user?.branchId });
            toast.success('Event scheduled successfully');
            setIsAddEventOpen(false);
            fetchData();
        } catch (error) { toast.error('Failed to schedule event'); }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase">Alumni & Graduates</h1>
                    <p className="text-muted-foreground font-medium mt-1">Celebrating success and maintaining professional connections.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 px-6 rounded-2xl font-semibold gap-2 border-primary/20">
                                <Calendar className="h-5 w-5" /> Schedule Event
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem]">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold uppercase">Post New Event</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Event Title</Label>
                                    <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Date</Label>
                                        <Input type="date" required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Location</Label>
                                        <Input className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
                                    </div>
                                </div>
                                <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Create Event</Button>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button onClick={() => setIsAddAlumniOpen(true)} className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20">
                        <Plus className="h-5 w-5" /> Register Alumni
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                            <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                                <Users className="h-8 w-8 text-primary" />
                                Alumni Directory
                            </CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search graduates..."
                                    className="pl-9 h-11 rounded-xl bg-muted/50 border-none font-bold"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-muted/30 h-16">
                                    <TableRow className="border-border/50 hover:bg-transparent">
                                        <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Name & Graduation</TableHead>
                                        <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Current Profile</TableHead>
                                        <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Connect</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {alumni.filter(a => (a.student?.firstName + ' ' + a.student?.lastName).toLowerCase().includes(searchTerm.toLowerCase())).map((a) => (
                                        <TableRow key={a.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                            <TableCell className="px-8 flex flex-col justify-center h-24">
                                                <span className="font-semibold uppercase">{a.student?.firstName} {a.student?.lastName}</span>
                                                <span className="text-xs font-bold text-muted-foreground opacity-60 tracking-wider flex items-center gap-1">
                                                    <GraduationCap className="h-3 w-3" /> Class of {new Date(a.graduationDate).getFullYear()}
                                                </span>
                                            </TableCell>
                                            <TableCell className="px-8 text-[11px] font-bold uppercase leading-tight">
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Briefcase className="h-3 w-3" /> {a.currentOccupation || 'Professional Graduate'}
                                                </div>
                                                <div className="text-muted-foreground opacity-60 ml-5">{a.currentCompany || 'N/A'}</div>
                                            </TableCell>
                                            <TableCell className="text-right px-8">
                                                <div className="flex justify-end gap-2">
                                                    {a.linkedInUrl && (
                                                        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl" asChild>
                                                            <a href={a.linkedInUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
                                                        </Button>
                                                    )}
                                                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                                                        <Mail className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl bg-background overflow-hidden border-l-4 border-l-primary">
                        <CardHeader className="p-8 border-b border-border/50">
                            <CardTitle className="text-h3 font-semibold uppercase">Upcoming Meetups</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="p-5 rounded-3xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold">
                                            {new Date(event.eventDate).toLocaleDateString()}
                                        </Badge>
                                        <Users className="h-5 w-5 opacity-20" />
                                    </div>
                                    <div>
                                        <div className="font-semibold uppercase text-lg">{event.title}</div>
                                        <p className="text-xs font-medium text-muted-foreground line-clamp-2">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-muted-foreground">
                                        <MapPin className="h-3 w-3" /> {event.location || 'Location Pending'}
                                    </div>
                                    <Button className="w-full h-10 rounded-xl font-semibold uppercase tracking-wider text-xs bg-primary/5 text-primary hover:bg-primary/10 border-none shadow-none">
                                        Join Event <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
