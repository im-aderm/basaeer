"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Briefcase,
    Building2,
    Mail,
    Phone,
    Calendar,
    Award,
    DollarSign,
    Clock,
    FileText,
    Plus,
    Save,
    Loader2,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from "lucide-react";
import { StaffService } from "@/services/staffService";
import { HRService, SalaryTemplate, PayrollEntry, LeaveRequest } from "@/services/hrService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { UserRole } from "@/types/enums";

export default function EmployeeProfileHub() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [payrollHistory, setPayrollHistory] = useState<PayrollEntry[]>([]);

    // Salary Template State
    const [template, setTemplate] = useState<Partial<SalaryTemplate>>({
        basicSalary: 0,
        netSalary: 0
    });

    useEffect(() => {
        if (id) {
            fetchStaffData();
        }
    }, [id]);

    const fetchStaffData = async () => {
        try {
            const data = await StaffService.getStaffMember(id as string);
            setStaff(data);
            if (data.salaryTemplate) {
                setTemplate(data.salaryTemplate);
            }
            const history = await HRService.getStaffPayrollHistory(id as string);
            setPayrollHistory(history);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch staff data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTemplate = async () => {
        setSaving(true);
        try {
            await HRService.upsertSalaryTemplate({ ...template, staffId: id as string });
            fetchStaffData();
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to save template:", error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!staff) return <div className="p-8 text-center text-red-500 font-bold">Staff member not found</div>;

    const canManageHR = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.BRANCH_ADMIN || currentUser?.role === UserRole.HR;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl hover:bg-muted/50">
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary flex items-center gap-3">
                        Staff Profile Hub
                    </h1>
                    <p className="text-muted-foreground font-medium">Comprehensive oversight for {staff.user.firstName} {staff.user.lastName}</p>
                </div>
            </div>

            {/* Top Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1 rounded-[3rem] border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
                    <CardContent className="p-10 flex flex-col items-center text-center space-y-6 relative z-10">
                        <div className="w-24 h-24 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center text-h1 font-semibold">
                            {staff.user.firstName[0]}{staff.user.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-h3 font-semibold">{staff.user.firstName} {staff.user.lastName}</h2>
                            <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px] mt-1">
                                {staff.designationRef?.name || staff.designation || "Staff"}
                            </p>
                        </div>
                        <div className="w-full pt-6 border-t border-white/10 space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-primary-foreground/60 font-medium">Status</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-semibold">{staff.status}</span>
                            </div>
                        </div>
                    </CardContent>
                    {/* Decor */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </Card>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all">
                        <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 w-fit mb-6">
                            <Mail size={24} />
                        </div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-1">Email Address</p>
                        <p className="font-bold text-sm truncate">{staff.user.email}</p>
                    </Card>
                    <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all">
                        <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 w-fit mb-6">
                            <Building2 size={24} />
                        </div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-1">Department</p>
                        <p className="font-bold text-sm">{staff.department?.name || "No Dept"}</p>
                    </Card>
                    <Card className="rounded-[2.5rem] border-border/50 shadow-xl p-8 group hover:scale-[1.02] transition-all">
                        <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 w-fit mb-6">
                            <Calendar size={24} />
                        </div>
                        <p className="text-xs font-semibold uppercase text-muted-foreground tracking-widest mb-1">Joined Date</p>
                        <p className="font-bold text-sm">{new Date(staff.createdAt).toLocaleDateString()}</p>
                    </Card>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="profile" className="space-y-8">
                <TabsList className="bg-muted/50 p-2 rounded-[2rem] gap-2 border border-border w-fit mx-auto lg:mx-0">
                    <TabsTrigger value="profile" className="rounded-2xl px-8 py-3 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:shadow-lg">
                        <User size={18} className="mr-2" /> Personal
                    </TabsTrigger>
                    {canManageHR && (
                        <>
                            <TabsTrigger value="salary" className="rounded-2xl px-8 py-3 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <DollarSign size={18} className="mr-2" /> Salary & Payroll
                            </TabsTrigger>
                            <TabsTrigger value="leaves" className="rounded-2xl px-8 py-3 font-semibold text-sm data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Clock size={18} className="mr-2" /> Leaves & Attendance
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl overflow-hidden">
                        <CardHeader className="p-10 border-b border-border bg-muted/10">
                            <CardTitle className="text-h3 font-semibold">Employee Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-12">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Briefcase size={20} /></div>
                                        <div>
                                            <p className="text-label text-muted-foreground">Main Designation</p>
                                            <p className="font-bold text-lg">{staff.designationRef?.name || staff.designation || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-6 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Phone size={20} /></div>
                                        <div>
                                            <p className="text-label text-muted-foreground">Phone Number</p>
                                            <p className="font-bold text-lg">{staff.user.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <Card className="rounded-[2.5rem] bg-amber-500/5 border border-amber-500/10 p-8 space-y-6">
                                    <h3 className="text-lg font-semibold flex items-center gap-2 text-amber-600">
                                        <Award size={20} /> Recognition & Awards
                                    </h3>
                                    <div className="space-y-4">
                                        {staff.awards?.length > 0 ? staff.awards.map((a: any) => (
                                            <div key={a.id} className="p-4 rounded-2xl bg-white border border-border flex items-center justify-between">
                                                <p className="font-bold text-sm">{a.title}</p>
                                                <span className="text-[10px] font-semibold text-muted-foreground">{new Date(a.date).toLocaleDateString()}</span>
                                            </div>
                                        )) : (
                                            <p className="text-sm text-amber-700/60 font-medium">No official awards recorded yet.</p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Salary Tab */}
                <TabsContent value="salary" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Configurer */}
                        <Card className="lg:col-span-1 rounded-[3rem] border-border/50 shadow-2xl p-10 border-t-8 border-t-primary">
                            <h3 className="text-h3 font-semibold mb-8 flex items-center gap-3">
                                <DollarSign className="text-primary" /> Salary Template
                            </h3>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-label text-muted-foreground ml-2">Basic Salary (₦)</label>
                                    <Input
                                        type="number"
                                        className="h-14 rounded-2xl font-bold bg-muted/30 border-none"
                                        value={template.basicSalary}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            setTemplate({ ...template, basicSalary: val, netSalary: val });
                                        }}
                                    />
                                </div>
                                <div className="p-6 rounded-[2rem] bg-primary/5 text-primary border border-primary/10">
                                    <p className="text-label text-primary/60 mb-1">Calculated Net Pay</p>
                                    <p className="text-h1 font-semibold">₦{template.netSalary?.toLocaleString()}</p>
                                </div>
                                <Button
                                    className="w-full h-14 rounded-2xl font-semibold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                                    onClick={handleSaveTemplate}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Update Template</>}
                                </Button>
                            </div>
                        </Card>

                        {/* History */}
                        <Card className="lg:col-span-2 rounded-[3rem] border-border/50 shadow-2xl overflow-hidden">
                            <CardHeader className="p-10 border-b border-border bg-muted/10">
                                <CardTitle className="text-h3 font-semibold">Payroll History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className="w-full">
                                    <thead className="bg-muted/30 border-b border-border text-label text-muted-foreground">
                                        <tr>
                                            <th className="px-10 py-6 text-left">Period</th>
                                            <th className="px-10 py-6 text-left">Amount</th>
                                            <th className="px-10 py-6 text-left">Status</th>
                                            <th className="px-10 py-6 text-right">Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50 font-medium">
                                        {payrollHistory.map(entry => (
                                            <tr key={entry.id} className="hover:bg-muted/5 transition-colors">
                                                <td className="px-10 py-6 font-bold">Month {entry.month}, {entry.year}</td>
                                                <td className="px-10 py-6 font-semibold">₦{entry.amountPaid.toLocaleString()}</td>
                                                <td className="px-10 py-6">
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase ${entry.status === 'PAID' ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className="px-10 py-6 text-right">
                                                    <Button variant="ghost" size="sm" className="rounded-xl font-semibold text-[10px]">
                                                        <FileText className="mr-1" size={12} /> Slip
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {payrollHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-10 py-20 text-center text-muted-foreground font-bold">
                                                    No payroll records found for this employee.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Leaves Tab */}
                <TabsContent value="leaves" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-[3rem] border-border/50 shadow-2xl p-10">
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-h3 font-semibold flex items-center gap-3">
                                <Clock className="text-primary" /> Leave Records
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            <div className="p-8 rounded-[2.5rem] bg-muted/30 border border-border shadow-sm">
                                <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-widest mb-1">Annual Limit</p>
                                <p className="text-h1 font-semibold">15 Days</p>
                            </div>
                            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 shadow-sm">
                                <p className="text-[10px] font-semibold uppercase text-primary/60 tracking-widest mb-1">Taken</p>
                                <p className="text-h1 font-semibold text-primary">0 Days</p>
                            </div>
                        </div>
                        <div className="py-20 text-center space-y-4 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border">
                            <Clock size={48} className="mx-auto text-muted-foreground/30" />
                            <p className="text-muted-foreground font-bold">No leave applications found for this cycle.</p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
