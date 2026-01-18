'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Users, UserPlus, Phone, Calendar, Search, Filter, MessageSquare, MoreHorizontal, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { ReceptionService, AdmissionEnquiry } from '@/services/receptionService';
import { toast } from 'sonner';

export default function AdmissionEnquiryPage() {
    const { user } = useAuth();
    const [enquiries, setEnquiries] = useState<AdmissionEnquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        description: '',
        source: '',
        nextFollowUpDate: '',
    });

    const fetchEnquiries = async () => {
        if (!user?.branchId) return;
        try {
            const data = await ReceptionService.getEnquiries(user.branchId);
            setEnquiries(data);
        } catch (error) {
            toast.error('Failed to load enquiries');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnquiries();
    }, [user?.branchId]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await ReceptionService.createEnquiry({ ...formData, branchId: user?.branchId });
            toast.success('Enquiry recorded successfully');
            setIsAddDialogOpen(false);
            fetchEnquiries();
            setFormData({ name: '', phone: '', email: '', address: '', description: '', source: '', nextFollowUpDate: '' });
        } catch (error) {
            toast.error('Failed to save enquiry');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status.toUpperCase()) {
            case 'WON': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'LOST': return 'bg-destructive/10 text-destructive border-destructive/20';
            case 'FOLLOW_UP': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            default: return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
        }
    };

    const filtered = enquiries.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.phone.includes(searchTerm)
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic uppercase">Admission Enquiries</h1>
                    <p className="text-muted-foreground font-medium mt-1">Track prospective student leads and follow-ups.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search leads..."
                            className="pl-9 h-12 rounded-2xl bg-muted/50 border-none font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-12 px-6 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20">
                                <UserPlus className="h-5 w-5" />
                                New Enquiry
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-[2.5rem] max-w-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black italic uppercase">Record New Enquiry</DialogTitle>
                                <DialogDescription className="font-bold">Enter prospective student or guardian details.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleCreate} className="space-y-6 pt-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Name</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Phone</Label>
                                        <Input
                                            required
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            placeholder="+234..."
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Email (Optional)</Label>
                                        <Input
                                            type="email"
                                            className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Source</Label>
                                        <Select onValueChange={(v) => setFormData({ ...formData, source: v })}>
                                            <SelectTrigger className="h-12 rounded-xl bg-muted/50 border-none font-bold">
                                                <SelectValue placeholder="Select Lead Source" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="Walk-in">Walk-in</SelectItem>
                                                <SelectItem value="Social Media">Social Media</SelectItem>
                                                <SelectItem value="Referral">Referral</SelectItem>
                                                <SelectItem value="Advertisement">Advertisement</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Description / Notes</Label>
                                    <Textarea
                                        className="rounded-xl bg-muted/50 border-none font-bold min-h-[100px]"
                                        placeholder="Specific interests, siblings, etc."
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-black italic text-xs uppercase opacity-50 ml-1">Follow up Date</Label>
                                    <Input
                                        type="date"
                                        className="h-12 rounded-xl bg-muted/50 border-none font-bold"
                                        value={formData.nextFollowUpDate}
                                        onChange={(e) => setFormData({ ...formData, nextFollowUpDate: e.target.value })}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="h-12 w-full rounded-xl font-black uppercase italic tracking-wider">Save Enquiry</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-primary/5 border-l-4 border-l-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Total Enquiries</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{enquiries.length}</span>
                        <Users className="h-8 w-8 text-primary/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-amber-500/5 border-l-4 border-l-amber-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Pending Follow-ups</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{enquiries.filter(e => e.status === 'PENDING').length}</span>
                        <Clock className="h-8 w-8 text-amber-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-emerald-500/5 border-l-4 border-l-emerald-500">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Converted (Won)</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{enquiries.filter(e => e.status === 'WON').length}</span>
                        <CheckCircle2 className="h-8 w-8 text-emerald-500/40" />
                    </CardContent>
                </Card>
                <Card className="rounded-[2.5rem] border-border/50 shadow-xl bg-muted/30 border-l-4 border-l-muted-foreground">
                    <CardHeader className="pb-2"><CardTitle className="text-xs font-black uppercase tracking-widest italic opacity-50">Dropped (Lost)</CardTitle></CardHeader>
                    <CardContent className="flex items-center gap-4">
                        <span className="text-4xl font-black italic">{enquiries.filter(e => e.status === 'LOST').length}</span>
                        <AlertCircle className="h-8 w-8 text-muted-foreground/40" />
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden bg-background">
                <CardHeader className="p-8 border-b border-border/50">
                    <CardTitle className="text-2xl font-black italic flex items-center gap-3">
                        <MessageSquare className="h-8 w-8 text-primary" />
                        Lead Roster
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/30 h-16">
                            <TableRow className="border-border/50 hover:bg-transparent">
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Lead Name</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Contact</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Source</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground">Last Activity</TableHead>
                                <TableHead className="font-black px-8 uppercase tracking-widest text-[10px] text-muted-foreground text-center">Status</TableHead>
                                <TableHead className="font-black px-8 h-16 text-right uppercase tracking-widest text-[10px] text-muted-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.map((e) => (
                                <TableRow key={e.id} className="border-border/50 h-24 transition-all hover:bg-muted/20">
                                    <TableCell className="px-8 font-black italic uppercase leading-tight">
                                        {e.name}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold flex items-center gap-1.5 text-xs"><Phone className="h-3 w-3 text-primary" /> {e.phone}</span>
                                            <span className="text-[10px] font-medium text-muted-foreground">{e.email || 'No Email'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 font-black text-[10px] uppercase opacity-50 italic">
                                        {e.source || 'Direct'}
                                    </TableCell>
                                    <TableCell className="px-8">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-xs flex items-center gap-1.5"><Calendar className="h-3 w-3 text-primary" /> {new Date(e.date).toLocaleDateString()}</span>
                                            {e.nextFollowUpDate && (
                                                <span className="text-[10px] font-black italic text-amber-600 uppercase tracking-tighter">Follow up: {new Date(e.nextFollowUpDate).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-8 text-center">
                                        <div className={`inline-flex px-3 py-1 rounded-full border font-black text-[10px] uppercase ${getStatusStyle(e.status)}`}>
                                            {e.status}
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
                    {filtered.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center gap-4 opacity-20">
                            <Users className="h-20 w-20 stroke-[1]" />
                            <p className="font-black italic text-2xl uppercase tracking-tighter">No admission enquiries found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
