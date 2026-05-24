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
import { UserPlus, Search, Calendar, Clock, BookOpen, MoreHorizontal, UserCheck, ShieldCheck, Trash2, Edit3, LogOut, Loader2 } from 'lucide-react';
import { ReceptionService, VisitorLog } from '@/services/receptionService';
import { SettingsService } from '@/services/settingsService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS } from '@/lib/table-styles';

export default function VisitorLogPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingLog, setEditingLog] = useState<VisitorLog | null>(null);
    const [purposes, setPurposes] = useState<string[]>(["Meeting", "Delivery", "Personal", "Admission", "Vendor", "Other"]);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
    const [confirmCheckout, setConfirmCheckout] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        purpose: '',
        name: '',
        phone: '',
        idCard: '',
        numPerson: 1,
        date: new Date().toISOString().split('T')[0],
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
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch purposes:", error);
        }
    };

    const fetchLogs = async () => {
        if (!resolvedBranchId) {
            setLoading(false);
            return;
        }
        try {
            const data = await ReceptionService.getVisitorLogs(resolvedBranchId);
            setLogs(data);
        } catch (error) {
            showError('Failed to load logs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
        fetchPurposes();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createVisitorLog({ ...formData, numPerson: Number(formData.numPerson), branchId: resolvedBranchId });
            showSuccess('Visitor entry recorded');
            setIsAddDialogOpen(false);
            fetchLogs();
            resetForm();
        } catch (error) {
            showError('Failed to record visitor');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingLog) return;
        try {
            await ReceptionService.updateVisitorLog(editingLog.id, { ...formData, numPerson: Number(formData.numPerson) });
            showSuccess('Visitor entry updated');
            setEditingLog(null);
            fetchLogs();
            resetForm();
        } catch (error) {
            showError('Failed to update entry');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await ReceptionService.deleteVisitorLog(confirmDelete);
            showSuccess('Log deleted successfully');
            fetchLogs();
        } catch (error) {
            showError('Failed to delete log');
        } finally {
            setConfirmDelete(null);
        }
    };

    const handleCheckOut = async (log: VisitorLog) => {
        setConfirmCheckout(log.id);
    };

    const handleConfirmCheckout = async () => {
        if (!confirmCheckout) return;
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        try {
            await ReceptionService.updateVisitorLog(confirmCheckout, { outTime: currentTime });
            showSuccess(`Visitor checked out at ${currentTime}`);
            fetchLogs();
        } catch (error) {
            showError('Failed to check out visitor');
        } finally {
            setConfirmCheckout(null);
        }
    };

    const resetForm = () => {
        setFormData({
            purpose: '',
            name: '',
            phone: '',
            idCard: '',
            numPerson: 1,
            date: new Date().toISOString().split('T')[0],
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
            date: log.date ? new Date(log.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            inTime: log.inTime || '',
            outTime: log.outTime || '',
            note: log.note || '',
        });
    };

    const filtered = (logs ?? []).filter(l =>
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
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Visitor Log</h1>
                    <p className="text-foreground/60 font-medium mt-1">Manage and monitor school campus visitors.</p>
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
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <UserPlus className="h-5 w-5" />
                                Add Entry
                            </Button>
                        </DialogTrigger>
        <DialogContent className="rounded-2xl border-primary/20 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-[12px] font-semibold">Visitor Entry</DialogTitle>
                                <DialogDescription className="font-bold">Record new visitor credentials.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4 overflow-y-auto">
                                <VisitorForm formData={formData} setFormData={setFormData} purposes={purposes} />
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Authorize Visitor</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden">
                <CardHeader className="px-3 py-2 border-b border-primary/20 bg-muted/20">
                    <CardTitle className="text-[12px] font-semibold tracking-tight text-primary flex items-center gap-3">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Campus Access Log
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table className={TABLE_ROOT}>
                        <TableHeader className={TABLE_HEADER}>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Visitor</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Purpose</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>ID/Badge</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT}>Timeline</TableHead>
                                <TableHead className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className={TABLE_BODY}>
                            {filtered.map((l) => (
                                <TableRow key={l.id} className={TABLE_ROW}>
                                    <TableCell className={TABLE_CELL_PRIMARY}>
                                        <div className="flex flex-col">
                                            <span>{l.name}</span>
                                            <span className="text-[10px] font-bold text-foreground/60">{l.phone} ({l.numPerson} People)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        {l.purpose}
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <div className="inline-flex items-center gap-1.5 font-bold text-[12px] uppercase">
                                            <ShieldCheck className="h-3 w-3" />
                                            {l.idCard || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL}>
                                        <div className="flex flex-col gap-1">
                                            <span className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(l.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-semibold text-foreground/60 uppercase">
                                                {l.inTime || 'N/A'} - {l.outTime || 'IN'}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className={TABLE_CELL_ACTIONS}>
                                        <div className="flex justify-end gap-2">
                                            {!l.outTime && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
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
                <DialogContent className="rounded-2xl border-primary/20 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-[12px] font-semibold">Edit Visitor Entry</DialogTitle>
                        <DialogDescription className="font-semibold opacity-60">Update details for {editingLog?.name}</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4 overflow-y-auto">
                        <VisitorForm formData={formData} setFormData={setFormData} purposes={purposes} />
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Entry</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Visitor Log"
                message="Are you sure you want to delete this log? This action cannot be undone."
                confirmLabel="Delete"
            />

            <ConfirmDialog
                isOpen={!!confirmCheckout}
                onConfirm={handleConfirmCheckout}
                onCancel={() => setConfirmCheckout(null)}
                title="Check Out Visitor"
                message="Are you sure you want to check out this visitor?"
                confirmLabel="Check Out"
            />
        </div>
          </RequireBranch>
  );
}

function VisitorForm({ formData, setFormData, purposes }: { formData: any, setFormData: any, purposes: string[] }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Visitor Name</Label>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Purpose of Visit</Label>
                    <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v })}>
                        <SelectTrigger className="h-12 rounded-xl font-bold">
                            <SelectValue placeholder="Select Purpose" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border font-bold text-xs">
                            {purposes.map(purpose => (
                                <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">ID Card / Badge No.</Label>
                    <Input
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="ID-12345"
                        value={formData.idCard}
                        onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">No. Persons</Label>
                    <Input
                        type="number"
                        min="1"
                        className="h-12 rounded-xl font-bold"
                        value={formData.numPerson}
                        onChange={(e) => setFormData({ ...formData, numPerson: parseInt(e.target.value) || 1 })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Visit Date</Label>
                    <Input
                        type="date"
                        className="h-12 rounded-xl font-bold text-xs"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">In Time</Label>
                    <Input
                        type="time"
                        className="h-12 rounded-xl font-bold text-xs"
                        value={formData.inTime}
                        onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Out Time</Label>
                    <Input
                        type="time"
                        className="h-12 rounded-xl font-bold text-xs"
                        value={formData.outTime}
                        onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Notes / Remarks</Label>
                <Textarea
                    className="rounded-xl font-bold min-h-[80px] placeholder:opacity-30"
                    placeholder="Any specific observations..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                />
            </div>
        </div>
    );
}
