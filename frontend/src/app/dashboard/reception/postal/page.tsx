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
import { Mail, Search, Send, FileText, ArrowUpLeft, ArrowDownRight, Package, Trash2, Edit3, Loader2, Calendar } from 'lucide-react';
import { ReceptionService, PostalRecord } from '@/services/receptionService';
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function PostalRecordPage() {
    const { user, resolvedBranchId } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [records, setRecords] = useState<PostalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState<PostalRecord | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        fromTitle: '',
        toTitle: '',
        referenceNumber: '',
        address: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        type: 'RECEIVE',
    });

    const fetchRecords = async () => {
        if (!resolvedBranchId) {
            setLoading(false);
            return;
        }
        try {
            const data = await ReceptionService.getPostalRecords(resolvedBranchId);
            setRecords(data);
        } catch (error) {
            showError('Failed to load postal records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [resolvedBranchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createPostalRecord({ ...formData, branchId: resolvedBranchId });
            showSuccess('Postal record saved');
            setIsAddDialogOpen(false);
            fetchRecords();
            resetForm();
        } catch (error) {
            showError('Failed to save record');
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRecord) return;
        try {
            await ReceptionService.updatePostalRecord(editingRecord.id, formData);
            showSuccess('Postal record updated');
            setEditingRecord(null);
            fetchRecords();
            resetForm();
        } catch (error) {
            showError('Failed to update record');
        }
    };

    const handleDelete = async (id: string) => {
        setConfirmDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!confirmDelete) return;
        try {
            await ReceptionService.deletePostalRecord(confirmDelete);
            showSuccess('Record deleted successfully');
            fetchRecords();
        } catch (error) {
            showError('Failed to delete record');
        } finally {
            setConfirmDelete(null);
        }
    };

    const resetForm = () => {
        setFormData({
            fromTitle: '',
            toTitle: '',
            referenceNumber: '',
            address: '',
            description: '',
            date: new Date().toISOString().split('T')[0],
            type: 'RECEIVE',
        });
    };

    const startEdit = (record: PostalRecord) => {
        setEditingRecord(record);
        setFormData({
            fromTitle: record.fromTitle,
            toTitle: record.toTitle,
            referenceNumber: record.referenceNumber || '',
            address: record.address || '',
            description: record.description || '',
            date: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            type: record.type,
        });
    };

    const filtered = records.filter(r =>
        r.fromTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.toTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referenceNumber?.includes(searchTerm)
    );

    if (loading) {
        return (
            <RequireBranch requireSpecificBranch>
                <div className="flex h-[60vh] items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </RequireBranch>
        );
    }

    return (
            <RequireBranch requireSpecificBranch>
        <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
            <BranchContextBanner />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Postal Records</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage dispatch and receipt of physical mail/parcels.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search records..."
                            className="pl-9 h-12 rounded-2xl bg-white/50 border border-border shadow-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={(open) => { setIsAddDialogOpen(open); if (!open) resetForm(); }}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-semibold gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                                <Send className="h-5 w-5" />
                                New Record
                            </Button>
                        </DialogTrigger>
        <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-h3 font-semibold">Postal Entry</DialogTitle>
                                <DialogDescription className="font-bold">Log details of the physical mail/courier.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4 overflow-y-auto">
                                <PostalForm formData={formData} setFormData={setFormData} />
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Record Dispatch/Receipt</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border shadow-2xl overflow-hidden">
                <CardHeader className="p-8 border-b border-border bg-muted/20">
                    <CardTitle className="text-h3 font-bold tracking-tight text-primary flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        Logistics History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">From / To</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Reference</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Type</TableHead>
                                <TableHead className="font-semibold px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Date</TableHead>
                                <TableHead className="font-semibold px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((r) => (
                                <TableRow key={r.id} className="border-border/50 h-24 transition-all hover:bg-primary/5">
                                    <TableCell className="px-8 font-semibold uppercase leading-tight text-sm">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50">From: {r.fromTitle}</span>
                                            <span>To: {r.toTitle}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs uppercase opacity-60">
                                        #{r.referenceNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-8 text-center text-[10px] font-semibold">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-current font-semibold ${r.type === 'RECEIVE' ? 'bg-primary/10 text-primary' : 'bg-blue-500/10 text-blue-600'}`}>
                                            {r.type === 'RECEIVE' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpLeft className="h-3 w-3" />}
                                            {r.type}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs whitespace-nowrap opacity-60">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3 w-3 text-primary" />
                                            {new Date(r.date).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-blue-500/10 hover:text-blue-600" onClick={() => startEdit(r)}>
                                                <Edit3 className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(r.id)}>
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
            <Dialog open={!!editingRecord} onOpenChange={(open) => { if (!open) setEditingRecord(null); }}>
                <DialogContent className="rounded-[3rem] border-border/50 shadow-2xl p-6 md:p-10 max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-h3 font-semibold">Edit Postal Record</DialogTitle>
                        <DialogDescription className="font-semibold opacity-60">Update details for this entry</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleUpdate} className="space-y-6 pt-4 overflow-y-auto">
                        <PostalForm formData={formData} setFormData={setFormData} />
                        <DialogFooter>
                            <Button type="submit" className="h-12 w-full rounded-xl font-semibold uppercase tracking-wider">Update Record</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <ConfirmDialog
                isOpen={!!confirmDelete}
                onConfirm={handleConfirmDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Delete Postal Record"
                message="Are you sure you want to delete this record? This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
          </RequireBranch>
  );
}

function PostalForm({ formData, setFormData }: { formData: any, setFormData: any }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">From Title</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="Sender Name/Title"
                        value={formData.fromTitle}
                        onChange={(e) => setFormData({ ...formData, fromTitle: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">To Title</Label>
                    <Input
                        required
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="Receiver Name/Title"
                        value={formData.toTitle}
                        onChange={(e) => setFormData({ ...formData, toTitle: e.target.value })}
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Reference Number</Label>
                    <Input
                        className="h-12 rounded-xl font-bold placeholder:opacity-30"
                        placeholder="REF-123456"
                        value={formData.referenceNumber}
                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Entry Type</Label>
                    <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                        <SelectTrigger className="h-12 rounded-xl font-bold">
                            <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border font-bold text-xs">
                            <SelectItem value="RECEIVE">RECEIVED</SelectItem>
                            <SelectItem value="DISPATCH">DISPATCHED</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Date</Label>
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
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Address / Location</Label>
                <Input
                    className="h-12 rounded-xl font-bold placeholder:opacity-30"
                    placeholder="Physical address or location detail"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label className="font-semibold text-[10px] uppercase opacity-50 ml-1">Description / Content Notes</Label>
                <Textarea
                    className="rounded-xl font-bold min-h-[100px] placeholder:opacity-30"
                    placeholder="What is inside? Any special handling instructions?"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
        </div>
    );
}
