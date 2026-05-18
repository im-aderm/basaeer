'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import { UserService, User } from '@/services/userService';
import { useNotification } from '@/context/NotificationContext';

export default function LoginDeactivationPage() {
    const { user: currentUser } = useAuth();
    const { showSuccess, showError } = useNotification();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = async (roleFilter?: string) => {
        try {
            setLoading(true);
            const data = await UserService.getAll({
                branchId: currentUser?.branchId || undefined,
                role: roleFilter
            });
            setUsers(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch users:', error);
            showError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser) {
            fetchUsers();
        }
    }, [currentUser]);

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            await UserService.toggleStatus(userId, !currentStatus);
            showSuccess(`User login ${!currentStatus ? 'activated' : 'deactivated'}`);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
        } catch (error) {
            showError('Failed to update user status');
        }
    };

    const filteredUsers = (users ?? []).filter(u =>
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-8 max-w-6xl mx-auto">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Login Management</h1>
                    <p className="text-muted-foreground font-medium mt-1">Deactivate or activate user logins across the system.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        className="pl-11 h-12 rounded-2xl border-border/50 bg-background/50 font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="rounded-[2.5rem] border-border/50 shadow-2xl overflow-hidden border-t-8 border-t-destructive/20 bg-background/50 backdrop-blur-xl">
                <CardHeader className="p-8 pb-4">
                    <CardTitle className="text-h3 font-semibold flex items-center gap-2 text-destructive">
                        <UserX className="h-6 w-6" />
                        User Access Control
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0 px-8 pb-8">
                    <div className="rounded-[2rem] border border-border/50 overflow-hidden bg-background shadow-inner">
                        <Table>
                            <TableHeader className="bg-muted/50 h-16">
                                <TableRow className="border-border/50 hover:bg-transparent">
                                    <TableHead className="font-semibold px-8 h-16">User Details</TableHead>
                                    <TableHead className="font-semibold px-8 h-16 text-center">Role</TableHead>
                                    <TableHead className="font-semibold px-8 h-16 text-center">Status</TableHead>
                                    <TableHead className="font-semibold px-8 h-16 text-right">Access Toggle</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((u) => (
                                    <TableRow key={u.id} className="border-border/50 h-20 transition-all hover:bg-muted/30">
                                        <TableCell className="px-8">
                                            <div>
                                                <p className="font-semibold text-lg leading-tight">{u.firstName} {u.lastName}</p>
                                                <p className="text-sm font-medium text-muted-foreground">{u.email}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="font-semibold tracking-tighter text-[10px] rounded-lg border-primary/20 bg-primary/5 text-primary px-3 py-1">
                                                {u.role.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center px-8">
                                            {u.isActive ? (
                                                <div className="flex items-center justify-center gap-2 text-emerald-600">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span className="text-xs font-semibold tracking-widest">ACTIVE</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-destructive">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <span className="text-xs font-semibold tracking-widest">SUSPENDED</span>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex justify-end items-center gap-4">
                                                <span className={`text-[10px] font-semibold tracking-widest ${u.isActive ? 'text-muted-foreground' : 'text-destructive underline decoration-2 underline-offset-4'}`}>
                                                    {u.isActive ? 'AUTHORIZED' : 'DENIED'}
                                                </span>
                                                <Switch
                                                    checked={u.isActive}
                                                    onCheckedChange={() => handleToggleStatus(u.id, u.isActive)}
                                                    className="data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-destructive"
                                                    disabled={u.id === currentUser?.id}
                                                />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-40 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                                                <UserX className="h-12 w-12 opacity-20" />
                                                <p className="font-semibold">No users found matching your search</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}
