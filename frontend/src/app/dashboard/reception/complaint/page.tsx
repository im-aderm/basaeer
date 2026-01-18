'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, Search, MoreHorizontal, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { ReceptionService, Complaint } from '@/services/receptionService';
import { toast } from 'sonner';

export default function ComplaintPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [form, setForm] = useState({
        complaintType: '',
        source: '',
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        actionTaken: '',
        assignedTo: '',
        note: ''
    });

    const fetchComplaints = async () => {
        if (!user?.branchId) return;
        try {
            const data = await ReceptionService.getComplaints(user.branchId);
            setComplaints(data);
        } catch (error) {
            toast.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createComplaint({ ...form, branchId: user?.branchId });
            toast.success('Complaint logged successfully');
            setIsAddDialogOpen(false);
            setForm({
                complaintType: '', source: '', name: '', phone: '',
                date: new Date().toISOString().split('T')[0], description: '',
                actionTaken: '', assignedTo: '', note: ''
            });
            fetchComplaints();
        } catch (error) {
            toast.error('Failed to log complaint');
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-amber-500" />;
            default: return <AlertCircle className="h-4 w-4 text-destructive" />;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Complaints & Feedback</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track and resolve issues raised by parents, students, or staff.</p>
                </div>
                <div className="flex gap-4">
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <Plus className="h-5 w-5" />
                                Log Complaint
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">New Complaint</DialogTitle>
                                <DialogDescription className="font-bold">Record details of the complaint for tracking and resolution.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-4 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Complainant Name</Label>
                                        <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                        <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Complaint Type</Label>
                                        <Input placeholder="e.g., Fees, Teacher, Facility" className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.complaintType} onChange={(e) => setForm({ ...form, complaintType: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Source</Label>
                                        <Input placeholder="e.g., In-person, Phone, Email" className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Description</Label>
                                    <Textarea required className="rounded-xl bg-muted/50 border-none font-bold" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Assigned To</Label>
                                        <Input className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Date</Label>
                                        <Input type="date" className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Log Complaint</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50 flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        Complaint Records
                    </CardTitle>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search complaints..."
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
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Complainant</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Type/Source</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Description</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {complaints.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map((c) => (
                                <TableRow key={c.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 flex flex-col justify-center h-24">
                                        <span className="font-black italic uppercase">{c.name}</span>
                                        <span className="text-xs font-bold text-muted-foreground opacity-60 tracking-wider">#{c.phone}</span>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-[10px] uppercase">
                                        <span className="block text-primary">{c.complaintType}</span>
                                        <span className="block text-muted-foreground opacity-50">{c.source}</span>
                                    </TableCell>
                                    <TableCell className="px-8 max-w-xs truncate font-medium text-xs text-muted-foreground italic">
                                        "{c.description}"
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex items-center gap-2 font-black italic uppercase text-[10px]">
                                            {getStatusIcon(c.status)}
                                            {c.status}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                                            <MoreHorizontal className="h-5 w-5" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
