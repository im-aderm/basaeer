'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
    ExternalLink,
    Pencil,
    Trash2,
    CheckCircle2
} from 'lucide-react';
import { StakeholderService, Alumni, AlumniEvent } from '@/services/stakeholderService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

export default function AlumniPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
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
        if (!resolvedBranchId) return;
        try {
            const [alumniData, eventsData] = await Promise.all([
                StakeholderService.getAlumni(resolvedBranchId),
                StakeholderService.getEvents(resolvedBranchId)
            ]);
            setAlumni(alumniData);
            setEvents(eventsData);
        } catch (error) {
            showError('Failed to load alumni data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [resolvedBranchId]);

    const handleAddAlumni = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StakeholderService.createAlumni({ ...alumniForm, branchId: resolvedBranchId });
            showSuccess('Alumni added successfully');
            setIsAddAlumniOpen(false);
            fetchData();
        } catch (error) { showError('Failed to add alumni'); }
    };

    const handleAddEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await StakeholderService.createEvent({ ...eventForm, branchId: resolvedBranchId });
            showSuccess('Event scheduled successfully');
            setIsAddEventOpen(false);
            fetchData();
        } catch (error) { showError('Failed to schedule event'); }
    };

    return (
        <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Alumni & Graduates</h1>
                    <p className="text-foreground/60 font-medium mt-1">Celebrating success and maintaining professional connections.</p>
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
                                <DialogTitle className="text-h3 font-semibold">Post New Event</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleAddEvent} className="space-y-4 pt-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Event Title</Label>
                                    <Input required className="h-12 rounded-xl font-bold" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Date</Label>
                                        <Input type="date" required className="h-12 rounded-xl font-bold" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-xs uppercase opacity-50 ml-1">Location</Label>
                                        <Input className="h-12 rounded-xl font-bold" value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })} />
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
                    <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden bg-background">
                        <CardHeader className="p-4 border-b border-primary/20 flex flex-row items-center justify-between">
                            <CardTitle className="text-[14px] font-bold tracking-tight text-primary flex items-center gap-3">
                                <Users className="h-5 w-5 text-primary" />
                                Alumni Directory
                            </CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                                <Input
                                    placeholder="Search graduates..."
                                    className="pl-9 h-9 rounded-xl font-bold text-[12px]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className={TABLE_ROOT}>
                                    <thead className={TABLE_HEADER}>
                                        <tr>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Name & Graduation</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Current Profile</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {alumni.filter(a => (a.student?.firstName + ' ' + a.student?.lastName).toLowerCase().includes(searchTerm.toLowerCase())).map((a) => (
                                            <tr key={a.id} className={TABLE_ROW}>
                                                <td className={TABLE_CELL_PRIMARY}>
                                                    <span className="font-semibold text-[12px]">{a.student?.firstName} {a.student?.lastName}</span>
                                                    <span className="text-[10px] font-bold text-foreground/60 tracking-wider flex items-center gap-1">
                                                        <GraduationCap className="h-3 w-3" /> Class of {new Date(a.graduationDate).getFullYear()}
                                                    </span>
                                                </td>
                                                <td className={TABLE_CELL}>
                                                    <div className="flex items-center gap-2 text-primary text-[12px] font-bold uppercase leading-tight">
                                                        <Briefcase className="h-3 w-3" /> {a.currentOccupation || 'Professional Graduate'}
                                                    </div>
                                                    <div className="text-foreground/60 ml-5 text-[10px]">{a.currentCompany || 'N/A'}</div>
                                                </td>
                                                <td className={TABLE_CELL}>
                                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] flex items-center gap-1 w-fit">
                                                        <CheckCircle2 className="w-3 h-3" /> Active Network
                                                    </Badge>
                                                </td>
                                                <td className={TABLE_CELL_ACTIONS}>
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted" title="Edit Profile">
                                                            <Pencil className="h-4 w-4 text-foreground/60" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-red-50 group" title="Delete record">
                                                            <Trash2 className="h-4 w-4 text-foreground/60 group-hover:text-red-500 transition-colors" />
                                                        </Button>
                                                        <div className="w-[1px] h-4 bg-border mx-1 self-center" />
                                                        {a.linkedInUrl && (
                                                            <Button variant="secondary" size="icon" className="h-9 w-9 rounded-xl shadow-sm" asChild title="LinkedIn Profile">
                                                                <a href={a.linkedInUrl} target="_blank" rel="noopener noreferrer"><Linkedin className="h-4 w-4" /></a>
                                                            </Button>
                                                        )}
                                                        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-primary/20 hover:bg-primary/5" title="Send Email">
                                                            <Mail className="h-4 w-4 text-primary" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="rounded-2xl border-primary/20 shadow-2xl bg-background overflow-hidden border-l-4 border-l-primary">
                        <CardHeader className="p-4 border-b border-primary/20">
                            <CardTitle className="text-[14px] font-semibold">Upcoming Meetups</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {events.map((event) => (
                                <div key={event.id} className="p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 transition-all space-y-4">
                                    <div className="flex justify-between items-start">
                                        <Badge className="rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border-none font-semibold text-[12px]">
                                            {new Date(event.eventDate).toLocaleDateString()}
                                        </Badge>
                                        <Users className="h-5 w-5 opacity-20" />
                                    </div>
                                    <div>
                                        <div className="font-semibold uppercase text-[12px]">{event.title}</div>
                                        <p className="text-[10px] font-medium text-foreground/60 line-clamp-2">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-foreground/60">
                                        <MapPin className="h-3 w-3" /> {event.location || 'Location Pending'}
                                    </div>
                                    <Button className="w-full h-9 rounded-xl font-semibold uppercase tracking-wider text-[10px] bg-primary/5 text-primary hover:bg-primary/10 border-none shadow-none">
                                        Join Event <ExternalLink className="ml-2 h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        </RequireBranch>
    );
}
