'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, Calendar, Clock, BookOpen, MoreHorizontal, UserCheck, ShieldCheck } from 'lucide-react';
import { ReceptionService, VisitorLog } from '@/services/receptionService';
import { toast } from 'sonner';

export default function VisitorLogPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<VisitorLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

    const fetchLogs = async () => {
        if (!user?.branchId) return;
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
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createVisitorLog({ ...formData, numPerson: Number(formData.numPerson), branchId: user?.branchId });
            toast.success('Visitor entry recorded');
            setIsAddDialogOpen(false);
            fetchLogs();
            setFormData({ purpose: '', name: '', phone: '', idCard: '', numPerson: 1, inTime: '', outTime: '', note: '' });
        } catch (error) {
            toast.error('Failed to record visitor');
        }
    };

    const filtered = logs.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Visitor Log</h1>
                    <p className="text-muted-foreground font-medium mt-1">Manage and monitor school campus visitors.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search visitors..."
                            className="pl-9 h-12 rounded-2xl bg-muted/50 border-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <UserPlus className="h-5 w-5" />
                                Add Entry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">Visitor Entry</DialogTitle>
                                <DialogDescription className="font-bold">Record new visitor credentials.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Visitor Name</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone Number</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Purpose of Visit</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            placeholder="Meeting Principal, Query, etc."
                                            value={formData.purpose}
                                            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">ID Card No.</Label>
                                        <Input
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.idCard}
                                            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">No. Persons</Label>
                                        <Input
                                            type="number"
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.numPerson}
                                            onChange={(e) => setFormData({ ...formData, numPerson: parseInt(e.target.value) })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">In Time</Label>
                                        <Input
                                            type="time"
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.inTime}
                                            onChange={(e) => setFormData({ ...formData, inTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Out Time</Label>
                                        <Input
                                            type="time"
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.outTime}
                                            onChange={(e) => setFormData({ ...formData, outTime: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Authorize Visitor</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
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
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((l) => (
                                <TableRow key={l.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        <div className="flex flex-col">
                                            <span>{l.name}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground opacity-50">{l.phone} ({l.numPerson} People)</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-[10px] uppercase text-primary/70">
                                        {l.purpose}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="inline-flex items-center gap-1.5 font-bold text-xs">
                                            <ShieldCheck className="h-3 w-3 text-muted-foreground" />
                                            {l.idCard || 'N/A'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(l.date).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-black italic text-muted-foreground uppercase opacity-60">Entry: {l.inTime || 'N/A'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8">
                                        <div className={`inline-flex px-3 py-1 rounded-full border font-black text-[10px] uppercase ${l.outTime ? 'bg-muted text-muted-foreground' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm'}`}>
                                            {l.outTime ? 'Exited' : 'Still On Campus'}
                                        </div>
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
