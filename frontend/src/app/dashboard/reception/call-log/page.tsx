'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
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
import { PhoneOutgoing, Search, Calendar, PhoneCall, MoreHorizontal, History, Trash2, Edit3, Loader2 } from 'lucide-react';
import { ReceptionService, CallLog } from '@/services/receptionService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function CallLogPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [logs, setLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<CallLog | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        nextFollowUpDate: '',
        callType: 'INCOMING',
    });

    const fetchLogs = async () => {
        if (!resolvedBranchId) {
            setLoading(false);
            return;
        }
        try {
            const data = await ReceptionService.getCallLogs(resolvedBranchId);
            setLogs(data);
        } catch (error) {
            showError('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createCallLog({
                ...formData,
                branchId: resolvedBranchId,
                nextFollowUpDate: formData.nextFollowUpDate || undefined,
            });
            showSuccess('Call log saved');
            setIsAddDialogOpen(false);
            fetchLogs();
            resetForm();
        } catch (error) {
            showError('Failed to save log');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLog) return;
        try {
            await ReceptionService.updateCallLog(editingLog.id, {
                ...formData,
                nextFollowUpDate: formData.nextFollowUpDate || undefined,
            });
            showSuccess('Call log updated');
            setEditingLog(null);
            fetchLogs();
            resetForm();
        } catch (error) {
            showError('Failed to update log');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await ReceptionService.deleteCallLog(confirmDelete);
            showSuccess('Log deleted successfully');
            fetchLogs();
        } catch (error) {
            showError('Failed to delete log');
        } finally {
            setConfirmDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            nextFollowUpDate: '',
            callType: 'INCOMING',
        });
    };

    const startEdit = (log: CallLog) => {
        setEditingLog(log);
        setFormData({
            name: log.name,
            phone: log.phone,
            description: log.description || '',
            date: log.date ? new Date(log.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            nextFollowUpDate: log.nextFollowUpDate ? new Date(log.nextFollowUpDate).toISOString().split('T')[0] : '',
            callType: log.callType,
        });
    };

    const filtered = logs.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
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
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Call Logs</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track all incoming and outgoing telephonic interactions.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 h-12 rounded-2xl bg-white/50 border border-border shadow-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <PhoneCall className="h-5 w-5" />
                                Record Call
                            </Button>
                        </DialogTrigger>
        <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold">Call Interaction</DialogTitle>
                                <DialogDescription className="font-bold">Log details of the phone conversation.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4 overflow-y-auto">
                                <CallLogForm formData={formData} setFormData={setFormData} />
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Save Call Log</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border shadow-2xl overflow-hidden">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <History className="h-8 w-8 text-primary" />
                        Call History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Entity Name</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Phone</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Type</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Interaction Date</TableHead>
                                <TableHead className="font-semibold px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((l) => (
                                <TableRow key={l.id} className="border-border/50 h-24 transition-all hover:bg-primary/5">
                                    <TableCell className="px-8 font-semibold uppercase leading-tight text-sm">
                                        {l.name}
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs uppercase opacity-60">
                                        {l.phone}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold text-[10px] uppercase ${l.callType === 'INCOMING' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                                            {l.callType === 'INCOMING' ? <PhoneCall className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
                                            {l.callType}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs whitespace-nowrap">
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(l.date).toLocaleDateString()}</span>
                                            {l.nextFollowUpDate && (
                                                <span className="text-[10px] font-semibold text-primary uppercase tracking-tighter">Follow up: {new Date(l.nextFollowUpDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
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
                <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Edit Call Log</DialogTitle>
                        <DialogDescription className="font-semibold opacity-60">Update details for {editingLog?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4 overflow-y-auto">
                        <CallLogForm formData={formData} setFormData={setFormData} />
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Call Log</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Call Log"
                message="Are you sure you want to delete this log? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
          </RequireBranch>
  );
}

function CallLogForm({ formData, setFormData }: { formData: any, setFormData: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Caller / Recipient</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Phone Number</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="+234..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Call Type</Label>
                    <Select value={formData.callType} onValueChange={(v) => setFormData({ ...formData, callType: v })}>
                        <SelectTrigger className="h-12 rounded-xl font-bold">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border font-bold text-xs">
                            <SelectItem value="INCOMING">INCOMING</SelectItem>
                            <SelectItem value="OUTGOING">OUTGOING</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Call Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            type="date"
                            className="h-12 pl-10 rounded-xl font-bold text-xs"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Next Follow-up</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground opacity-50" />
                        <Input
                            type="date"
                            className="h-12 pl-10 rounded-xl font-bold text-xs"
                            value={formData.nextFollowUpDate}
                            onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                        />
                    </div>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Interaction Notes</Label>
                <Textarea
                    className="rounded-xl font-bold min-h-[100px] placeholder:opacity-30"
                    placeholder="Discussed admission procedure, fees, etc..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
        </div>
    );
}
