'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Mail, Phone, Building2, Briefcase, Loader2, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import Link from 'next/link';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function EmployeesListPage() {
    const { user, resolvedBranchId } = useAuth();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
            setError(null);
        } catch (error) {
            setError("Could not load employee data");
            toast.error('Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (emp: any) => {
        const nextStatus = emp.status === 'ACTIVE' ? 'TERMINATED' : 'ACTIVE';
        try {
            await api.patch(`/employees/${emp.id}/status`, { status: nextStatus });
            fetchEmployees();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to update status', error);
        }
    };

    useEffect(() => {
        if (user) fetchEmployees();
    }, [user]);

    const filteredEmployees = (employees ?? []).filter(emp =>
        (emp.user.firstName + ' ' + emp.user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Name',
            accessor: (emp: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-xs">
                        {emp.user.firstName[0]}{emp.user.lastName[0]}
                    </div>
                    <div>
                        <div className="text-body font-medium">{emp.user.firstName} {emp.user.lastName}</div>
                        <div className="text-secondary">{emp.user.role.replace('_', ' ')}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            accessor: (emp: any) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-secondary">
                        <Mail size={12} /> {emp.user.email}
                    </div>
                    {emp.user.phone && (
                        <div className="flex items-center gap-2 text-secondary">
                            <Phone size={12} /> {emp.user.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Department',
            accessor: (emp: any) => (
                <div className="flex items-center gap-2 text-table-cell">
                    <Building2 size={14} className="text-muted-foreground" />
                    <span>{emp.department?.name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Designation',
            accessor: (emp: any) => (
                <div className="flex items-center gap-2 text-table-cell">
                    <Briefcase size={14} className="text-muted-foreground" />
                    <span>{emp.designationRef?.name || emp.designation || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (emp: any) => (
                <span className={`px-2 py-1 rounded-full text-label font-medium ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {emp.status}
                </span>
            )
        }
    ];

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    if (error) return (
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <p className="text-lg font-semibold text-destructive">{error}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Employee Management</h1>
                    <p className="text-body text-muted-foreground mt-1">Manage and monitor all staff members across the branch.</p>
                </div>
                <Link href="/dashboard/employees/add">
                    <Button className="gap-2 rounded-2xl h-11 px-6 font-medium shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                        <UserPlus size={18} /> Add New Employee
                    </Button>
                </Link>
            </div>

            <Card className="rounded-2xl border-border/50 shadow-lg overflow-hidden border-t-4 border-t-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <CardTitle className="text-h3">Staff Directory</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search employees..."
                            className="pl-10 rounded-xl bg-muted/30 border-none text-body"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={filteredEmployees}
                        actions={(emp) => (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={emp.status === 'ACTIVE' ? 'outline' : 'default'}
                                    size="sm"
                                    className={cn(
                                        "rounded-lg font-medium border transition-all text-btn",
                                        emp.status === 'ACTIVE' ? "text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                                    )}
                                    onClick={() => handleToggleStatus(emp)}
                                >
                                    {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-lg font-medium hover:bg-muted text-btn">Details</Button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
