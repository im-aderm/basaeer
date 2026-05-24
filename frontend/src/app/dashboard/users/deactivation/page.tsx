'use client';

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Search, ShieldAlert, ShieldCheck, UserX } from 'lucide-react';
import { UserService, User } from '@/services/userService';
import { useNotification } from '@/context/NotificationContext';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL, TABLE_CELL_PRIMARY, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

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

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <RequireBranch requireSpecificBranch>
        <div className="space-y-8 max-w-6xl mx-auto">
            <BranchContextBanner />
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Login Management</h1>
                    <p className="text-foreground/60 font-medium mt-1">Deactivate or activate user logins across the system.</p>
                </div>
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/60" />
                    <Input
                        placeholder="Search users..."
                        className="pl-11 h-10 rounded-xl border-primary/20 bg-background/50 font-medium text-[12px]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden border-t-4 border-t-destructive/20 bg-background/50 backdrop-blur-xl">
                <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-[14px] font-semibold flex items-center gap-2 text-destructive">
                        <UserX className="h-5 w-5" />
                        User Access Control
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead className={TABLE_HEADER}>
                                <tr>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>User Details</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Role</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-center"}>Status</th>
                                    <th className={TABLE_HEADER_CELL_NO_SORT + " text-right"}>Access Toggle</th>
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {filteredUsers.map((u) => (
                                    <tr key={u.id} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>
                                            <div>
                                                <p className="font-semibold text-[12px] leading-tight">{u.firstName} {u.lastName}</p>
                                                <p className="text-[10px] font-medium text-foreground/60">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            <Badge variant="outline" className="font-semibold tracking-tighter text-[10px] rounded-lg border-primary/20 bg-primary/5 text-primary px-3 py-1">
                                                {u.role.replace('_', ' ')}
                                            </Badge>
                                        </td>
                                        <td className={TABLE_CELL + " text-center"}>
                                            {u.isActive ? (
                                                <div className="flex items-center justify-center gap-2 text-emerald-600">
                                                    <ShieldCheck className="h-4 w-4" />
                                                    <span className="text-[10px] font-semibold tracking-widest">ACTIVE</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-2 text-destructive">
                                                    <ShieldAlert className="h-4 w-4" />
                                                    <span className="text-[10px] font-semibold tracking-widest">SUSPENDED</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className={TABLE_CELL_ACTIONS}>
                                            <div className="flex justify-end items-center gap-4">
                                                <span className={`text-[10px] font-semibold tracking-widest ${u.isActive ? 'text-foreground/60' : 'text-destructive underline decoration-2 underline-offset-4'}`}>
                                                    {u.isActive ? 'AUTHORIZED' : 'DENIED'}
                                                </span>
                                                <Switch
                                                    checked={u.isActive}
                                                    onCheckedChange={() => handleToggleStatus(u.id, u.isActive)}
                                                    className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-destructive"
                                                    disabled={u.id === currentUser?.id}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2 text-foreground/60">
                                                <UserX className="h-12 w-12 opacity-20" />
                                                <p className="font-semibold text-[12px]">No users found matching your search</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
        </RequireBranch>
    );
}
