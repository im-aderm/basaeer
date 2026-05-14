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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Plus, Search, MoreHorizontal, AlertCircle, CheckCircle2, Clock, Trash2, Edit3, Loader2 } from 'lucide-react';
import { ReceptionService, Complaint } from '@/services/receptionService';
import { SettingsService, GlobalSetting } from '@/services/settingsService';
import { toast } from 'sonner';

export default function ComplaintPage() {
    const { user } = useAuth();
    const [complaints, setComplaints] = useState<Complaint[]>([]);
    const [complaintTypes, setComplaintTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingComplaint, setEditingComplaint] = useState<Complaint | null>(null);

    const [form, setForm] = useState({
        complaintType: '',
        source: '',
        name: '',
        phone: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        actionTaken: '',
        assignedTo: '',
    });

    const fetchData = async () => {
        if (!user?.branchId) {
            setLoading(false);
            return;
        }
        try {
            const [complaintsData, configs] = await Promise.all([
                ReceptionService.getComplaints(user.branchId),
                SettingsService.getSettings()
            ]);
            setComplaints(complaintsData);

            const typesSetting = configs.find((c: GlobalSetting) => c.key === 'reception_complaint_types')?.value;
            if (typesSetting) {
                try {
                    const parsed = JSON.parse(typesSetting);
                    if (Array.isArray(parsed)) {
                        setComplaintTypes(parsed);
                    }
                } catch {
                    // Fallback for comma separated or single string
                    setComplaintTypes(typesSetting.split(',').map(t => t.trim()));
                }
            }
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createComplaint({ ...form, branchId: user?.branchId });
            toast.success('Complaint logged successfully');
            setIsAddDialogOpen(false);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error('Failed to log complaint');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingComplaint) return;
        try {
            await ReceptionService.updateComplaint(editingComplaint.id, form);
            toast.success('Complaint updated successfully');
            setEditingComplaint(null);
            fetchData();
            resetForm();
        } catch (error) {
            toast.error('Failed to update complaint');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this complaint?')) return;
        try {
            await ReceptionService.deleteComplaint(id);
            toast.success('Complaint deleted successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete complaint');
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await ReceptionService.updateComplaint(id, { status });
            toast.success(`Status updated to ${status}`);
            fetchData();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const resetForm = () => {
        setForm({
            complaintType: '',
            source: '',
            name: '',
            phone: '',
            date: new Date().toISOString().split('T')[0],
            description: '',
            actionTaken: '',
            assignedTo: '',
        });
    };

    const startEdit = (complaint: Complaint) => {
        setEditingComplaint(complaint);
        setForm({
            complaintType: complaint.complaintType || '',
            source: complaint.source || '',
            name: complaint.name,
            phone: complaint.phone,
            date: new Date(complaint.date).toISOString().split('T')[0],
            description: complaint.description || '',
            actionTaken: complaint.actionTaken || '',
            assignedTo: complaint.assignedTo || '',
        });
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'RESOLVED': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />;
            case 'IN_PROGRESS': return <Clock className="h-4 w-4 text-amber-500" />;
            default: return <AlertCircle className="h-4 w-4 text-destructive" />;
        }
    };

    const filtered = (complaints ?? []).filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone.includes(searchTerm) ||
        c.complaintType?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-h1 font-semibold tracking-tight uppercase">Complaints & Feedback</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track and resolve issues raised by parents, students, or staff.</p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search complaints..."
                            className="pl-9 h-12 rounded-2xl bg-white/50 border border-border shadow-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <Plus className="h-5 w-5" />
                                Log Complaint
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold uppercase">New Complaint</DialogTitle>
                                <DialogDescription className="font-bold text-muted-foreground">Record details of the complaint for tracking and resolution.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <ComplaintForm form={form} setForm={setForm} complaintTypes={complaintTypes} />
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Log Complaint</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border shadow-2xl overflow-hidden bg-card">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        Complaint Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Complainant</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Type/Source</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Description</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                                <TableHead className="font-semibold px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((c) => (
                                <TableRow key={c.id} className="border-border/50 h-24 transition-all hover:bg-primary/5">
                                    <TableCell className="px-8 flex flex-col justify-center h-24">
                                        <span className="font-semibold uppercase text-sm leading-tight">{c.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground opacity-60 tracking-wider">#{c.phone}</span>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-[10px] uppercase">
                                        <span className="block text-primary">{c.complaintType}</span>
                                        <span className="block text-muted-foreground opacity-50">{c.source}</span>
                                    </TableCell>
                                    <TableCell className="px-8 max-w-xs font-medium text-xs text-muted-foreground truncate">
                                        "{c.description}"
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <Select value={c.status} onValueChange={(v) => handleStatusUpdate(c.id, v)}>
                                            <SelectTrigger className="h-9 w-36 rounded-full font-semibold uppercase text-[10px] border-none bg-muted/50">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(c.status)}
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl border-border bg-card font-semibold uppercase text-[10px]">
                                                <SelectItem value="PENDING">PENDING</SelectItem>
                                                <SelectItem value="IN_PROGRESS">IN PROGRESS</SelectItem>
                                                <SelectItem value="RESOLVED">RESOLVED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600" onClick={() => startEdit(c)}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(c.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Edit Dialog */}
            <Dialog open={!!editingComplaint} onOpenChange={(open) => { if (!open) setEditingComplaint(null); }}>
                <DialogContent className="rounded-[2.5rem] max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold uppercase">Edit Complaint</DialogTitle>
                        <DialogDescription className="font-semibold opacity-60">Update tracking info for {editingComplaint?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <ComplaintForm form={form} setForm={setForm} complaintTypes={complaintTypes} isEdit />
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Complaint</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ComplaintForm({ form, setForm, complaintTypes, isEdit = false }: { form: any, setForm: any, complaintTypes: string[], isEdit?: boolean }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Complainant Name</Label>
                    <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Phone Number</Label>
                    <Input required className="h-12 rounded-xl bg-muted/50 border-none font-bold" placeholder="+234..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Complaint Type</Label>
                    <Select value={form.complaintType} onValueChange={(v) => setForm({ ...form, complaintType: v })}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                            <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card font-bold text-xs uppercase">
                            {complaintTypes.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                            {complaintTypes.length === 0 && <SelectItem value="General">General</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Source</Label>
                    <Input placeholder="e.g., In-person, Phone, Email" className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Issue Description</Label>
                <Textarea required className="rounded-xl bg-muted/50 border-none font-bold min-h-[100px]" placeholder="Explain the problem in detail..." rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Assigned To</Label>
                    <Input className="h-12 rounded-xl bg-muted/50 border-none font-bold" placeholder="Staff name" value={form.assignedTo} onChange={(e) => setForm({ ...form, assignedTo: e.target.value })} />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Date</Label>
                    <Input type="date" className="h-12 rounded-xl bg-muted/50 border-none font-bold" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                </div>
            </div>
            {isEdit && (
                <div className="space-y-2 border-t pt-4 border-border/50">
                    <Label className="font-semibold text-[10px] uppercase text-primary ml-1">Resolution / Action Taken</Label>
                    <Textarea className="rounded-xl bg-primary/5 border-none font-bold min-h-[80px]" placeholder="What was done to resolve this?" value={form.actionTaken} onChange={(e) => setForm({ ...form, actionTaken: e.target.value })} />
                </div>
            )}
        </div>
    );
}
