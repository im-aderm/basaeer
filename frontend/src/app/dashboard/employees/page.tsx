'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Search, Mail, Phone, Building2, Briefcase, Loader2 } from 'lucide-react';
import { DataTable } from '@/components/DataTable';
import Link from 'next/link';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

export default function EmployeesListPage() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees');
            setEmployees(res.data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
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
            console.error('Failed to update status', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchEmployees();
        }
    }, [user]);

    const filteredEmployees = employees.filter(emp =>
        (emp.user.firstName + ' ' + emp.user.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const columns = [
        {
            header: 'Name',
            accessor: (emp: any) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {emp.user.firstName[0]}{emp.user.lastName[0]}
                    </div>
                    <div>
                        <div className="font-bold">{emp.user.firstName} {emp.user.lastName}</div>
                        <div className="text-xs text-muted-foreground">{emp.user.role.replace('_', ' ')}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Contact',
            accessor: (emp: any) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                        <Mail size={12} className="text-muted-foreground" /> {emp.user.email}
                    </div>
                    {emp.user.phone && (
                        <div className="flex items-center gap-2 text-xs">
                            <Phone size={12} className="text-muted-foreground" /> {emp.user.phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Department',
            accessor: (emp: any) => (
                <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-muted-foreground" />
                    <span>{emp.department?.name || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Designation',
            accessor: (emp: any) => (
                <div className="flex items-center gap-2">
                    <Briefcase size={14} className="text-muted-foreground" />
                    <span>{emp.designationRef?.name || emp.designation || 'Unassigned'}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: (emp: any) => (
                <span className={`px-2 py-1 rounded-full text-xs font-bold ${emp.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                    {emp.status}
                </span>
            )
        }
    ];

    if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto h-8 w-8 text-primary" /></div>;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight italic">Employee Management</h1>
                    <p className="text-muted-foreground font-medium text-lg">Manage and monitor all staff members across the branch.</p>
                </div>
                <Link href="/dashboard/employees/add">
                    <Button className="gap-3 rounded-[1.5rem] h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                        <UserPlus size={20} /> Add New Employee
                    </Button>
                </Link>
            </div>

            <Card className="rounded-[3rem] border-border/50 shadow-2xl shadow-primary/5 overflow-hidden border-t-8 border-t-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <CardTitle className="text-xl font-black italic">Staff Directory</CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search employees..."
                            className="pl-10 rounded-xl bg-muted/30 border-none font-medium"
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
                                        "rounded-xl font-black border-2 transition-all",
                                        emp.status === 'ACTIVE' ? "text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white" : "bg-green-500 hover:bg-green-600 text-white border-green-500"
                                    )}
                                    onClick={() => handleToggleStatus(emp)}
                                >
                                    {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                                </Button>
                                <Button variant="ghost" size="sm" className="rounded-xl font-black hover:bg-muted">Details</Button>
                            </div>
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    );
}

