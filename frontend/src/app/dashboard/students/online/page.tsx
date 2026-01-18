'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Eye, Trash2, UserPlus } from 'lucide-react';
import { OnlineAdmissionService, OnlineAdmission } from '@/services/onlineAdmissionService';
import { toast } from 'sonner';

export default function OnlineAdmissionsDashboard() {
    const { user } = useAuth();
    const [admissions, setAdmissions] = useState<OnlineAdmission[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAdmissions = async () => {
        if (!user?.branchId) return;
        try {
            const data = await OnlineAdmissionService.getAll(user.branchId);
            setAdmissions(data);
        } catch (error) {
            console.error('Failed to fetch admissions', error);
            toast.error('Failed to load admission applications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchAdmissions();
        }
    }, [user]);

    const handleApprove = async (id: string) => {
        try {
            await OnlineAdmissionService.approve(id);
            toast.success('Application approved successfully');
            fetchAdmissions();
        } catch (error) {
            console.error('Approval failed', error);
            toast.error('Failed to approve application');
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this application?')) {
            try {
                await OnlineAdmissionService.delete(id);
                toast.success('Application deleted');
                fetchAdmissions();
            } catch (error) {
                console.error('Delete failed', error);
                toast.error('Failed to delete application');
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-black">PENDING</Badge>;
            case 'APPROVED':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-black">APPROVED</Badge>;
            case 'REJECTED':
                return <Badge variant="destructive" className="font-black">REJECTED</Badge>;
            case 'ENROLLED':
                return <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-black">ENROLLED</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-4xl font-black tracking-tight italic">Online Admissions</h1>
                <p className="text-muted-foreground font-medium">Review and process online admission applications.</p>
            </div>

            <Card className="rounded-[2rem] shadow-2xl shadow-primary/5 border-border/50 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-black italic flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Application List
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="rounded-2xl border border-border/50 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="font-black h-14">Student Name</TableHead>
                                    <TableHead className="font-black h-14">Applied Class</TableHead>
                                    <TableHead className="font-black h-14">Guardian</TableHead>
                                    <TableHead className="font-black h-14">Status</TableHead>
                                    <TableHead className="font-black h-14">Applied Date</TableHead>
                                    <TableHead className="text-right font-black h-14 px-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {admissions.map((adm) => (
                                    <TableRow key={adm.id} className="border-border/50 hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-bold py-4">
                                            <div>
                                                <p>{adm.firstName} {adm.lastName}</p>
                                                <p className="text-xs text-muted-foreground font-medium">{adm.email || adm.phone}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-bold">{adm.desiredClass?.name || 'N/A'}</p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">{adm.guardianName}</p>
                                            <p className="text-xs text-muted-foreground">{adm.guardianPhone}</p>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(adm.status)}</TableCell>
                                        <TableCell className="text-muted-foreground font-medium">
                                            {new Date(adm.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex justify-end gap-2">
                                                {adm.status === 'PENDING' && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-10 w-10 rounded-xl text-emerald-600 hover:bg-emerald-500/10 transition-all border border-emerald-500/10"
                                                        onClick={() => handleApprove(adm.id)}
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10 transition-all border border-primary/10"
                                                    title="View Details"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-10 w-10 rounded-xl text-destructive hover:bg-destructive/10 transition-all border border-destructive/10"
                                                    onClick={() => handleDelete(adm.id)}
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {admissions.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-12 text-muted-foreground font-medium italic">
                                            No applications found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
