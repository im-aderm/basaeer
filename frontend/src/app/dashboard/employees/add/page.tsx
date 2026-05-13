'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Mail, Phone, User, ShieldCheck, Briefcase, Building2, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function AddEmployeePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    const [departments, setDepartments] = useState<any[]>([]);
    const [designations, setDesignations] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'TEACHER',
        departmentId: '',
        designationId: '',
    });

    useEffect(() => {
        if (user) {
            fetchMetaData();
        }
    }, [user]);

    const fetchMetaData = async () => {
        try {
            const [deptRes, desigRes] = await Promise.all([
                api.get('/departments'),
                api.get('/designations')
            ]);
            setDepartments(deptRes.data);
            setDesignations(desigRes.data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to fetch metadata', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post('/employees', {
                ...formData,
                branchId: user?.branchId
            });
            setSuccess(true);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error('Failed to add employee', error);
            alert('Failed to add employee. Email might already be in use.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    if (success) {
        return (
            <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95 duration-500">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-500/10 text-green-500">
                    <CheckCircle2 size={64} />
                </div>
                <div className="space-y-4">
                    <h2 className="text-h1 font-semibold tracking-tight">Employee Registered!</h2>
                    <p className="text-xl text-muted-foreground font-medium">New staff member has been added and workspace prepared.</p>
                </div>
                <div className="flex gap-4 justify-center pt-8">
                    <Button
                        onClick={() => setSuccess(false)}
                        className="h-16 px-10 rounded-[2rem] font-semibold text-lg"
                    >
                        Add Another Staff
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => router.push('/dashboard/employees')}
                        className="h-16 px-10 rounded-[2rem] font-semibold text-lg"
                    >
                        Staff Directory
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-primary/10 text-primary mb-4 transform -rotate-6">
                    <UserPlus size={40} />
                </div>
                <h1 className="text-h1 font-semibold tracking-tight">Staff Registration</h1>
                <p className="text-muted-foreground text-xl font-medium max-w-2xl mx-auto">Onboard a new employee by providing their personal and professional details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information */}
                <Card className="rounded-[3rem] p-10 lg:p-16 border-t-8 border-t-primary shadow-2xl shadow-primary/5 border-border/50">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">01</div>
                        <h2 className="text-h3 font-semibold tracking-tight">Identity & Contact</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <User size={14} className="text-primary" /> First Name
                            </label>
                            <Input
                                required
                                placeholder="Employee's first name"
                                className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <User size={14} className="text-primary" /> Last Name
                            </label>
                            <Input
                                required
                                placeholder="Employee's last name"
                                className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Mail size={14} className="text-primary" /> Professional Email
                            </label>
                            <Input
                                required
                                type="email"
                                placeholder="staff@school.com"
                                className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={14} className="text-primary" /> System Password
                            </label>
                            <Input
                                required
                                type="password"
                                placeholder="Initial login password"
                                className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Phone size={14} className="text-primary" /> Phone Number
                            </label>
                            <Input
                                placeholder="+234 ..."
                                className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Professional Placement */}
                <Card className="rounded-[3rem] p-10 lg:p-16 border-t-8 border-t-primary/40 shadow-2xl shadow-primary/5">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-xs">02</div>
                        <h2 className="text-h3 font-semibold tracking-tight">Professional Placement</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <ShieldCheck size={14} className="text-primary" /> Role
                            </label>
                            <Select onValueChange={(val) => setFormData({ ...formData, role: val })} value={formData.role}>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
                                    <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="TEACHER">Teacher</SelectItem>
                                    <SelectItem value="LIBRARIAN">Librarian</SelectItem>
                                    <SelectItem value="ACCOUNTANT">Accountant</SelectItem>
                                    <SelectItem value="STAFF">General Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Building2 size={14} className="text-primary" /> Department
                            </label>
                            <Select onValueChange={(val) => setFormData({ ...formData, departmentId: val })} value={formData.departmentId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departments.map((dept: any) => (
                                        <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                <Briefcase size={14} className="text-primary" /> Designation
                            </label>
                            <Select onValueChange={(val) => setFormData({ ...formData, designationId: val })} value={formData.designationId}>
                                <SelectTrigger className="h-14 rounded-2xl bg-muted/30 border-none font-bold text-lg">
                                    <SelectValue placeholder="Select Designation" />
                                </SelectTrigger>
                                <SelectContent>
                                    {designations.map((desig: any) => (
                                        <SelectItem key={desig.id} value={desig.id}>{desig.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </Card>

                {/* Submit button */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-10 px-4">
                    <div className="max-w-md text-center md:text-left">
                        <p className="text-sm font-semibold uppercase tracking-widest text-primary mb-1">Confirmation</p>
                        <p className="text-muted-foreground font-medium">All credentials will be sent to the employee's email automatically.</p>
                    </div>
                    <Button
                        type="submit"
                        disabled={submitting}
                        className="w-full md:w-auto px-16 py-8 rounded-[2rem] font-semibold text-h3 shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
                    >
                        {submitting ? <Loader2 className="animate-spin mr-2" /> : <UserPlus size={24} className="mr-2" />}
                        Complete Onboarding
                    </Button>
                </div>
            </form>
        </div>
    );
}
