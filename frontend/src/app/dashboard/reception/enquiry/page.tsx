'use client';

import React, { useState, useEffect } from 'react';
import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Phone, Calendar, Search, Filter, MessageSquare, MoreHorizontal, CheckCircle2, AlertCircle, Clock, Trash2, Edit3, Loader2 } from 'lucide-react';
import { ReceptionService, AdmissionEnquiry } from '@/services/receptionService';
import { SettingsService } from '@/services/settingsService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import SharableLink from '@/components/admission/SharableLink';

export default function AdmissionEnquiryPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingEnquiry, setEditingEnquiry] = useState<AdmissionEnquiry | null>(null);
    const [sources, setSources] = useState<string[]>(["Advertisement", "Walk-in", "Referral", "Social Media", "Newspaper", "Other"]);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        source: '',
        date: new Date().toISOString().split('T')[0],
        nextFollowUpDate: '',
        status: 'PENDING'
    });

    const fetchSources = async () => {
        try {
            const settings = await SettingsService.getSettings();
            const sourceSetting = settings.find(s => s.key === "reception_enquiry_sources");
            if (sourceSetting) setSources(JSON.parse(sourceSetting.value));
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch sources:", error);
        }
    };

    const fetchEnquiries = async (branchId: string) => {
        try {
            const data = await ReceptionService.getEnquiries(branchId);
            setEnquiries(data);
        } catch (error) {
            showError('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (resolvedBranchId) {
            fetchEnquiries(resolvedBranchId);
        } else {
            setLoading(false);
        }
        fetchSources();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createEnquiry({
                ...formData,
                branchId: resolvedBranchId,
                nextFollowUpDate: formData.nextFollowUpDate || undefined,
            });
            showSuccess('Enquiry recorded successfully');
            setIsAddDialogOpen(false);
            if (resolvedBranchId) fetchEnquiries(resolvedBranchId);
            resetForm();
        } catch (error) {
            showError('Failed to save enquiry');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEnquiry) return;
        try {
            await ReceptionService.updateEnquiry(editingEnquiry.id, {
                ...formData,
                nextFollowUpDate: formData.nextFollowUpDate || undefined,
            });
            showSuccess('Enquiry updated successfully');
            setEditingEnquiry(null);
            if (resolvedBranchId) fetchEnquiries(resolvedBranchId);
            resetForm();
        } catch (error) {
            showError('Failed to update enquiry');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDeleteId(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDeleteId) return;
        setDeleting(true);
        try {
            await ReceptionService.deleteEnquiry(confirmDeleteId);
            showSuccess('Enquiry deleted successfully');
            if (resolvedBranchId) fetchEnquiries(resolvedBranchId);
        } catch (error) {
            showError('Failed to delete enquiry');
        } finally {
            setDeleting(false);
            setConfirmDeleteId(null);
        }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await ReceptionService.updateEnquiry(id, { status });
            showSuccess(`Status updated to ${status}`);
            if (resolvedBranchId) fetchEnquiries(resolvedBranchId);
        } catch (error) {
            showError('Failed to update status');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            address: '',
            description: '',
            source: '',
            date: new Date().toISOString().split('T')[0],
            nextFollowUpDate: '',
            status: 'PENDING'
        });
    };

    const startEdit = (enquiry: AdmissionEnquiry) => {
        setEditingEnquiry(enquiry);
        setFormData({
            name: enquiry.name,
            phone: enquiry.phone,
            email: enquiry.email || '',
            address: enquiry.address || '',
            description: enquiry.description || '',
            source: enquiry.source || '',
            date: enquiry.date ? new Date(enquiry.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            nextFollowUpDate: enquiry.nextFollowUpDate ? new Date(enquiry.nextFollowUpDate).toISOString().split('T')[0] : '',
            status: enquiry.status
        });
    };

    const getStatusStyle = (status: string) => {
        switch (status.toUpperCase()) {
            case 'WON': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'LOST': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'FOLLOW_UP': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        }
    };

    const filtered = (enquiries ?? []).filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm)
    );

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <RequireBranch requireSpecificBranch>
            <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
                <BranchContextBanner />
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">Admission Enquiries</h1>
                        <p className="text-muted-foreground font-medium mt-1">Track prospective student leads and follow-ups.</p>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search leads..."
                                className="pl-9 h-12 rounded-2xl bg-white border border-primary/90 shadow-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                            <DialogTrigger asChild>
                                <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                    <UserPlus className="h-5 w-5" />
                                    New Enquiry
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="text-h3 font-semibold">Record New Enquiry</DialogTitle>
                                    <DialogDescription className="font-bold">Enter prospective student or guardian details.</DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleCreate} className="space-y-6 pt-4 overflow-y-auto">
                                    <EnquiryForm formData={formData} setFormData={setFormData} sources={sources} />
                                    <DialogFooter>
                                        <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Save Enquiry</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard title="Total Enquiries" value={enquiries.length} icon={Users} color="primary" />
                    <StatCard title="Pending Follow-ups" value={(enquiries ?? []).filter(e => e.status === 'PENDING' || e.status === 'FOLLOW_UP').length} icon={Clock} color="amber" />
                    <StatCard title="Converted (Won)" value={(enquiries ?? []).filter(e => e.status === 'WON').length} icon={CheckCircle2} color="primary" />
                    <StatCard title="Dropped (Lost)" value={(enquiries ?? []).filter(e => e.status === 'LOST').length} icon={AlertCircle} color="red" />
                </div>

                {resolvedBranchId && (
                    <SharableLink branchId={resolvedBranchId} />
                )}

                <Card className="rounded-[3rem] border-border shadow-2xl overflow-hidden">
                    <CardHeader className="p-8 border-b border-border bg-muted/20">
                        <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                            <MessageSquare className="h-8 w-8 text-primary" />
                            Lead Roster
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/30 h-16">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Lead Name</TableHead>
                                    <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Contact</TableHead>
                                    <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Source</TableHead>
                                    <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Last Activity</TableHead>
                                    <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</TableHead>
                                    <TableHead className="font-semibold px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((e) => (
                                    <TableRow key={e.id} className="border-border/50 h-24 transition-all hover:bg-primary/5">
                                        <TableCell className="px-8 font-semibold uppercase leading-tight">
                                            {e.name}
                                        </TableCell>
                                        <TableCell className="px-8">
                                            <div className="flex flex-col gap-1 text-xs">
                                                <span className="font-bold flex items-center gap-1.5"><Phone className="h-3 w-3 text-primary" /> {e.phone}</span>
                                                <span className="font-medium text-muted-foreground opacity-70">{e.email || 'No Email'}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 font-semibold text-[10px] uppercase opacity-50">
                                            {e.source || 'Direct'}
                                        </TableCell>
                                        <TableCell className="px-8">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(e.date).toLocaleDateString()}</span>
                                                {e.nextFollowUpDate && (
                                                    <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-tighter">Follow up: {new Date(e.nextFollowUpDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-8 text-center">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className={`inline-flex px-3 py-1 rounded-full border border-current font-semibold text-[10px] uppercase transition-all hover:scale-105 active:scale-95 ${getStatusStyle(e.status)}`}>
                                                        {e.status}
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="rounded-xl font-bold text-xs">
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(e.id, 'PENDING')}>PENDING</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(e.id, 'FOLLOW_UP')}>FOLLOW_UP</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(e.id, 'WON')} className="text-emerald-600">WON</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleStatusUpdate(e.id, 'LOST')} className="text-destructive">LOST</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600" onClick={() => startEdit(e)}>
                                                    <Edit3 className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(e.id)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {filtered.length === 0 && (
                            <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                                <Users className="h-20 w-20 stroke-[1]" />
                                <p className="font-semibold text-h3 uppercase tracking-tighter">No admission enquiries found</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Dialog open={!!editingEnquiry} onOpenChange={(open) => { if (!open) setEditingEnquiry(null); }}>
                    <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-h3 font-semibold">Edit Enquiry</DialogTitle>
                            <DialogDescription className="font-semibold opacity-60">Update details for {editingEnquiry?.name}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleUpdate} className="space-y-6 pt-4 overflow-y-auto">
                            <EnquiryForm formData={formData} setFormData={setFormData} sources={sources} />
                            <DialogFooter>
                                <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Enquiry</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                <ConfirmDialog
                    isOpen={!!confirmDeleteId}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setConfirmDeleteId(null)}
                    title="Delete Enquiry"
                    message="Are you sure you want to delete this enquiry? This action cannot be undone."
                    confirmLabel="Delete"
                    loading={deleting}
                />
            </div>
        </RequireBranch>
    );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
    const colors: Record<string, string> = {
        primary: "bg-primary/5 border-l-primary text-primary",
        amber: "bg-amber-500/5 border-l-amber-500 text-amber-500",
        red: "bg-red-500/5 border-l-red-500 text-red-500"
    };

    return (
        <Card className={`rounded-[2.5rem] border-border/50 shadow-xl border-l-4 ${colors[color]}`}>
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-widest opacity-50">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <span className="text-h1 font-semibold">{value}</span>
                <Icon className="h-8 w-8 opacity-40 capitalize" />
            </CardContent>
        </Card>
    );
}

function EnquiryForm({ formData, setFormData, sources }: { formData: any, setFormData: any, sources: string[] }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Name</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Phone</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="+234..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Email</Label>
                    <Input
                        type="email"
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Source</Label>
                    <Select value={formData.source} onValueChange={(v) => setFormData({ ...formData, source: v })}>
                        <SelectTrigger className="h-12 rounded-xl font-bold">
                            <SelectValue placeholder="Select Lead Source" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border font-bold text-xs">
                            {sources.map(source => (
                                <SelectItem key={source} value={source}>{source}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Enquiry Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            type="date"
                            className="h-12 pl-10 rounded-xl font-bold"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Follow up Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            type="date"
                            className="h-12 pl-10 rounded-xl font-bold"
                            value={formData.nextFollowUpDate}
                            onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Description / Notes</Label>
                <Textarea
                    className="rounded-xl font-bold min-h-[100px] placeholder:opacity-30"
                    placeholder="Specific interests, requirements, etc..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="space-y-2 text-xs">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                    <SelectTrigger className="h-12 rounded-xl font-bold">
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border font-bold text-[10px]">
                        <SelectItem value="PENDING">PENDING</SelectItem>
                        <SelectItem value="FOLLOW_UP">FOLLOW_UP</SelectItem>
                        <SelectItem value="WON">WON</SelectItem>
                        <SelectItem value="LOST">LOST</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
