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
import { PhoneOutgoing, Search, Calendar, PhoneCall, MoreHorizontal, History } from 'lucide-react';
import { ReceptionService, CallLog } from '@/services/receptionService';
import { toast } from 'sonner';

export default function CallLogPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<CallLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        description: '',
        nextFollowUpDate: '',
        callType: 'INCOMING',
    });

    const fetchLogs = async () => {
        if (!user?.branchId) return;
        try {
            const data = await ReceptionService.getCallLogs(user.branchId);
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
            await ReceptionService.createCallLog({ ...formData, branchId: user?.branchId });
            toast.success('Call log saved');
            setIsAddDialogOpen(false);
            fetchLogs();
            setFormData({ name: '', phone: '', description: '', nextFollowUpDate: '', callType: 'INCOMING' });
        } catch (error) {
            toast.error('Failed to save log');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Call Logs</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track all incoming and outgoing telephonic interactions.</p>
                </div>

                <div className="flex gap-4">
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            className="pl-9 h-12 rounded-2xl bg-muted/50 border-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <PhoneCall className="h-5 w-5" />
                                Record Call
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">Call Interaction</DialogTitle>
                                <DialogDescription className="font-bold">Log details of the phone conversation.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Caller/Recipient</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone No.</Label>
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
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Call Type</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, callType: v })} defaultValue="INCOMING">
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="INCOMING">Incoming</SelectItem>
                                                <SelectItem value="OUTGOING">Outgoing</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Next Follow-up</Label>
                                        <Input
                                            type="date"
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Notes</Label>
                                    <Input
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        placeholder="Discussed admission procedure..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Save Call Log</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <History className="h-8 w-8 text-primary" />
                        Call History
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Entity Name</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Phone</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Type</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Interaction Date</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.filter(l => l.name.toLowerCase().includes(searchTerm.toLowerCase())).map((l) => (
                                <TableRow key={l.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        {l.name}
                                    </TableCell>
                                    <TableCell className="px-8 font-bold text-xs">
                                        {l.phone}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-[10px] uppercase ${l.callType === 'INCOMING' ? 'bg-blue-500/10 text-blue-600' : 'bg-purple-500/10 text-purple-600'}`}>
                                            {l.callType === 'INCOMING' ? <PhoneCall className="h-3 w-3" /> : <PhoneOutgoing className="h-3 w-3" />}
                                            {l.callType}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(l.date).toLocaleDateString()}</span>
                                            {l.nextFollowUpDate && (
                                                <span className="text-[10px] font-black italic text-amber-600 uppercase tracking-tighter">Follow up: {new Date(l.nextFollowUpDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right px-8 font-medium text-xs opacity-60 italic">
                                        {l.description || 'No notes recorded'}
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
