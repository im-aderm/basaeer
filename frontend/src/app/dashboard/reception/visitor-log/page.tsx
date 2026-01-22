'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { UserPlus, Search, Calendar, Clock, BookOpen, MoreHorizontal, UserCheck, ShieldCheck, Trash2, Edit3, LogOut, Loader2 } from 'lucide-react';
import { ReceptionService, VisitorLog } from '@/services/receptionService';
import { SettingsService } from '@/services/settingsService';
import { toast } from 'sonner';

export default function VisitorLogPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<VisitorLog | null>(null);
    const [purposes, setPurposes] = useState<string[]>(["Meeting", "Delivery", "Personal", "Admission", "Vendor", "Other"]);

    const [formData, setFormData] = useState({
        purpose: '',
        name: '',
        phone: '',
        idCard: '',
        numPerson: 1,
        inTime: '',
        outTime: '',
        note: '',
    });

    const fetchPurposes = async () => {
        try {
            const settings = await SettingsService.getSettings();
            const purposeSetting = settings.find(s => s.key === "reception_visitor_purposes");
            if (purposeSetting) setPurposes(JSON.parse(purposeSetting.value));
        } catch (error) {
            console.error("Failed to fetch purposes:", error);
        }
    };

    const fetchLogs = async () => {
        if (!user?.branchId) {
            setLoading(false);
            return;
        }
        try {
            const data = await ReceptionService.getVisitorLogs(user.branchId);
            setLogs(data);
        } catch (error) {
            toast.error('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchPurposes();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createVisitorLog({ ...formData, numPerson: Number(formData.numPerson), branchId: user?.branchId });
            toast.success('Visitor entry recorded');
            setIsAddDialogOpen(false);
            fetchLogs();
            resetForm();
        } catch (error) {
            toast.error('Failed to record visitor');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLog) return;
        try {
            await ReceptionService.updateVisitorLog(editingLog.id, { ...formData, numPerson: Number(formData.numPerson) });
            toast.success('Visitor entry updated');
            setEditingLog(null);
            fetchLogs();
            resetForm();
        } catch (error) {
            toast.error('Failed to update entry');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this log?')) return;
        try {
            await ReceptionService.deleteVisitorLog(id);
            toast.success('Log deleted successfully');
            fetchLogs();
        } catch (error) {
            toast.error('Failed to delete log');
        }
    };

    const handleCheckOut = async (log: VisitorLog) => {
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        try {
            await ReceptionService.updateVisitorLog(log.id, { outTime: currentTime });
            toast.success(`Visitor checked out at ${currentTime}`);
            fetchLogs();
        } catch (error) {
            toast.error('Failed to check out visitor');
        }
    };

    const resetForm = () => {
        setFormData({
            purpose: '',
            name: '',
            phone: '',
            idCard: '',
            numPerson: 1,
            inTime: '',
            outTime: '',
            note: '',
        });
    };

    const startEdit = (log: VisitorLog) => {
        setEditingLog(log);
        setFormData({
            purpose: log.purpose,
            name: log.name,
            phone: log.phone,
            idCard: log.idCard || '',
            numPerson: log.numPerson,
            inTime: log.inTime || '',
            outTime: log.outTime || '',
            note: log.note || '',
        });
    };

    const filtered = logs.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.purpose.toLowerCase().includes(searchTerm.toLowerCase())
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
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Visitor Log</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage and monitor school campus visitors.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search visitors..."
                            className="pl-9 h-12 rounded-2xl bg-white/50 border border-border shadow-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <UserPlus className="h-5 w-5" />
                                Add Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl bg-card border-border shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">Visitor Entry</DialogTitle>
                                <DialogDescription className="font-bold">Record new visitor credentials.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <VisitorForm formData={formData} setFormData={setFormData} purposes={purposes} />
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Authorize Visitor</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border shadow-2xl overflow-hidden bg-card">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <ShieldCheck className="h-8 w-8 text-primary" />
                        Campus Access Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Visitor</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Purpose</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">ID/Badge</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Timeline</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((l) => (
                                <TableRow key={l.id} className="border-border/50 h-24 transition-all hover:bg-primary/5">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight text-sm">
                                        <div className="flex flex-col">
                                            <span>{l.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50">{l.phone} ({l.numPerson} People)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-[10px] uppercase text-primary/70 italic">
                                        {l.purpose}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="inline-flex items-center gap-1.5 font-bold text-xs uppercase italic opacity-60">
                                            <ShieldCheck className="h-3 w-3" />
                                            {l.idCard || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(l.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-black italic text-muted-foreground uppercase opacity-60">
                                                {l.inTime || 'N/A'} - {l.outTime || 'IN'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            {!l.outTime && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-600"
                                                    title="Check Out"
                                                    onClick={() => handleCheckOut(l)}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600" onClick={() => startEdit(l)}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(l.id)}>
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
            <Dialog open={!!editingLog} onOpenChange={(open) => { if (!open) setEditingLog(null); }}>
                <DialogContent className="rounded-[2.5rem] max-w-2xl bg-card border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black italic uppercase">Edit Visitor Entry</DialogTitle>
                        <DialogDescription className="font-black italic opacity-60">Update details for {editingLog?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4">
                        <VisitorForm formData={formData} setFormData={setFormData} purposes={purposes} />
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Update Entry</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function VisitorForm({ formData, setFormData, purposes }: { formData: any, setFormData: any, purposes: string[] }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">Visitor Name</Label>
                    <Input
                        required
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold placeholder:opacity-30"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">Phone Number</Label>
                    <Input
                        required
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold placeholder:opacity-30"
                        placeholder="+234..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">Purpose of Visit</Label>
                    <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v })}>
                        <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                            <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border bg-card font-bold text-xs uppercase italic">
                            {purposes.map(purpose => (
                                <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">ID Card / Badge No.</Label>
                    <Input
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold placeholder:opacity-30"
                        placeholder="ID-12345"
                        value={formData.idCard}
                        onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">No. Persons</Label>
                    <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                        value={formData.numPerson}
                        onChange={(e) => setFormData({ ...formData, numPerson: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">In Time</Label>
                    <Input
                        type="time"
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold text-xs"
                        value={formData.inTime}
                        onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">Out Time</Label>
                    <Input
                        type="time"
                        className="h-12 rounded-xl bg-muted/50 border-none font-bold text-xs"
                        value={formData.outTime}
                        onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-black italic text-[10px] uppercase opacity-50 ml-1">Notes / Remarks</Label>
                <Textarea
                    className="rounded-xl bg-muted/50 border-none font-bold min-h-[80px] placeholder:opacity-30"
                    placeholder="Any specific observations..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
            </div>
        </div>
    );
}
