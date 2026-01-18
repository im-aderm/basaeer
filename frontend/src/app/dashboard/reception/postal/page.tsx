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
import { Mail, Search, Send, FileText, ArrowUpLeft, ArrowDownRight, Package } from 'lucide-react';
import { ReceptionService, PostalRecord } from '@/services/receptionService';
import { toast } from 'sonner';

export default function PostalRecordPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<PostalRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        fromTitle: '',
        toTitle: '',
        referenceNumber: '',
        address: '',
        description: '',
        type: 'RECEIVE',
    });

    const fetchRecords = async () => {
        if (!user?.branchId) return;
        try {
            const data = await ReceptionService.getPostalRecords(user.branchId);
            setRecords(data);
        } catch (error) {
            toast.error('Failed to load postal records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createPostalRecord({ ...formData, branchId: user?.branchId });
            toast.success('Postal record saved');
            setIsAddDialogOpen(false);
            fetchRecords();
            setFormData({ fromTitle: '', toTitle: '', referenceNumber: '', address: '', description: '', type: 'RECEIVE' });
        } catch (error) {
            toast.error('Failed to save record');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Postal Records</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage dispatch and receipt of physical mail/parcels.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search records..."
                            className="pl-9 h-12 rounded-2xl bg-muted/50 border-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <Send className="h-5 w-5" />
                                New Record
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">Postal Entry</DialogTitle>
                                <DialogDescription className="font-bold">Log details of the physical mail/courier.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">From Title</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.fromTitle}
                                            onChange={(e) => setFormData({ ...formData, fromTitle: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">To Title</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.toTitle}
                                            onChange={(e) => setFormData({ ...formData, toTitle: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Ref Number</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.referenceNumber}
                                            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Type</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, type: v })} defaultValue="RECEIVE">
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="RECEIVE">Received</SelectItem>
                                                <SelectItem value="DISPATCH">Dispatched</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Address / Note</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Record Dispatch/Receipt</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <Package className="h-8 w-8 text-primary" />
                        Logistics History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">From / To</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Reference</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Type</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Date</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {records.filter(r => r.fromTitle.toLowerCase().includes(searchTerm.toLowerCase())).map((r) => (
                                <TableRow key={r.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase">From: {r.fromTitle}</span>
                                            <span className="text-sm">To: {r.toTitle}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs">
                                        #{r.referenceNumber || 'N/A'}
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase ${r.type === 'RECEIVE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                                            {r.type === 'RECEIVE' ? <ArrowDownRight className="h-3 w-3" /> : <ArrowUpLeft className="h-3 w-3" />}
                                            {r.type}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs opacity-60">
                                        {new Date(r.date).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right px-8 font-medium text-xs italic opacity-60 max-w-xs truncate">
                                        {r.address || r.description || 'N/A'}
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
