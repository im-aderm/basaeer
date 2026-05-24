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
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

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

    if (!staff) return <div className="p-4 text-center text-red-500 font-bold text-[14px]">Staff member not found</div>;

    const canManageHR = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.BRANCH_ADMIN || currentUser?.role === UserRole.HR;

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
            {/* Header & Breadcrumb */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.back()} className="rounded-2xl hover:bg-muted/50">
                    <ArrowLeft size={18} />
                </Button>
                <div>
                    <h1 className="text-[20px] font-bold tracking-tight text-primary flex items-center gap-3">
                        Staff Profile Hub
                    </h1>
                    <p className="text-[12px] text-foreground/60 font-medium">Comprehensive oversight for {staff.user.firstName} {staff.user.lastName}</p>
                </div>
            </div>

            {/* Top Info Card */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 rounded-2xl border-none shadow-2xl bg-gradient-to-br from-primary to-primary/80 text-white overflow-hidden relative">
                    <CardContent className="p-6 flex flex-col items-center text-center space-y-4 relative z-10">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-[20px] font-semibold">
                            {staff.user.firstName[0]}{staff.user.lastName[0]}
                        </div>
                        <div>
                            <h2 className="text-[16px] font-semibold">{staff.user.firstName} {staff.user.lastName}</h2>
                            <p className="text-primary-foreground/70 font-bold uppercase tracking-widest text-[10px] mt-1">
                                {staff.designationRef?.name || staff.designation || "Staff"}
                            </p>
                        </div>
                        <div className="w-full pt-4 border-t border-white/10 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-primary-foreground/60 font-medium">Status</span>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-semibold">{staff.status}</span>
                            </div>
                        </div>
                    </CardContent>
                    {/* Decor */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
                </Card>

                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`${STAT_CARD} group hover:scale-[1.02] transition-all`}>
                        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 w-fit mb-4">
                            <Mail size={20} />
                        </div>
                        <p className={STAT_LABEL}>Email Address</p>
                        <p className={`${STAT_VALUE} text-sm truncate`}>{staff.user.email}</p>
                    </Card>
                    <Card className={`${STAT_CARD} group hover:scale-[1.02] transition-all`}>
                        <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                            <Building2 size={20} />
                        </div>
                        <p className={STAT_LABEL}>Department</p>
                        <p className={`${STAT_VALUE} text-sm`}>{staff.department?.name || "No Dept"}</p>
                    </Card>
                    <Card className={`${STAT_CARD} group hover:scale-[1.02] transition-all`}>
                        <div className="p-3 rounded-xl bg-primary/10 text-primary w-fit mb-4">
                            <Calendar size={20} />
                        </div>
                        <p className={STAT_LABEL}>Joined Date</p>
                        <p className={`${STAT_VALUE} text-sm`}>{new Date(staff.createdAt).toLocaleDateString()}</p>
                    </Card>
                </div>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="bg-muted/50 p-1.5 rounded-2xl gap-2 border border-primary/20 w-fit mx-auto lg:mx-0">
                    <TabsTrigger value="profile" className="rounded-xl px-4 py-2 font-semibold text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-lg">
                        <User size={16} className="mr-2" /> Personal
                    </TabsTrigger>
                    {canManageHR && (
                        <>
                            <TabsTrigger value="salary" className="rounded-xl px-4 py-2 font-semibold text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <DollarSign size={16} className="mr-2" /> Salary & Payroll
                            </TabsTrigger>
                            <TabsTrigger value="leaves" className="rounded-xl px-4 py-2 font-semibold text-[12px] data-[state=active]:bg-card data-[state=active]:shadow-lg">
                                <Clock size={16} className="mr-2" /> Leaves & Attendance
                            </TabsTrigger>
                        </>
                    )}
                </TabsList>

                {/* Profile Tab */}
                <TabsContent value="profile" className="animate-in slide-in-from-bottom-4 duration-500">
                    <Card className="rounded-2xl border-primary/20 shadow-2xl overflow-hidden">
                        <CardHeader className="p-6 border-b border-primary/20 bg-muted/10">
                            <CardTitle className="text-[14px] font-semibold">Employee Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 pt-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Briefcase size={18} /></div>
                                        <div>
                                            <p className="text-[12px] text-foreground/60">Main Designation</p>
                                            <p className="font-semibold text-[14px]">{staff.designationRef?.name || staff.designation || "N/A"}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-start">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Phone size={18} /></div>
                                        <div>
                                            <p className="text-[12px] text-foreground/60">Phone Number</p>
                                            <p className="font-semibold text-[14px]">{staff.user.phone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>

                                <Card className="rounded-2xl bg-primary/5 border border-primary/10 p-6 space-y-4">
                                    <h3 className="text-[14px] font-semibold flex items-center gap-2 text-primary">
                                        <Award size={18} /> Recognition & Awards
                                    </h3>
                                    <div className="space-y-3">
                                        {staff.awards?.length > 0 ? staff.awards.map((a: any) => (
                                            <div key={a.id} className="p-3 rounded-xl bg-white border border-border flex items-center justify-between">
                                                <p className="font-semibold text-[12px]">{a.title}</p>
                                                <span className="text-[10px] font-semibold text-foreground/60">{new Date(a.date).toLocaleDateString()}</span>
                                            </div>
                                        )) : (
                                            <p className="text-[12px] text-amber-700/60 font-medium">No official awards recorded yet.</p>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Salary Tab */}
                <TabsContent value="salary" className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Configurer */}
                        <Card className="lg:col-span-1 rounded-2xl border-primary/20 shadow-2xl p-6 border-t-4 border-t-primary">
                            <h3 className="text-[14px] font-semibold mb-6 flex items-center gap-3">
                                <DollarSign className="text-primary" /> Salary Template
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[12px] text-foreground/60 ml-2">Basic Salary (₦)</label>
                                    <Input
                                        type="number"
                                        className="h-10 rounded-xl font-medium bg-muted/30 border-none text-[14px]"
                                        value={template.basicSalary}
                                        onChange={e => {
                                            const val = Number(e.target.value);
                                            setTemplate({ ...template, basicSalary: val, netSalary: val });
                                        }}
                                    />
                                </div>
                                <div className="p-4 rounded-2xl bg-primary/5 text-primary border border-primary/10">
                                    <p className="text-[12px] text-primary/60 mb-1">Calculated Net Pay</p>
                                    <p className="text-[18px] font-semibold">₦{template.netSalary?.toLocaleString()}</p>
                                </div>
                                <Button
                                    className="w-full h-10 rounded-xl font-semibold tracking-wide shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all text-[12px]"
                                    onClick={handleSaveTemplate}
                                    disabled={saving}
                                >
                                    {saving ? <Loader2 className="animate-spin" /> : <><Save className="mr-2" /> Update Template</>}
                                </Button>
                            </div>
                        </Card>

                        {/* History */}
                        <Card className="lg:col-span-2 rounded-2xl border-primary/20 shadow-2xl overflow-hidden">
                            <CardHeader className="p-6 border-b border-primary/20 bg-muted/10">
                                <CardTitle className="text-[14px] font-semibold">Payroll History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <table className={TABLE_ROOT}>
                                    <thead className={TABLE_HEADER}>
                                        <tr>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Period</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Amount</th>
                                            <th className={TABLE_HEADER_CELL_NO_SORT}>Status</th>
                                            <th className={`${TABLE_HEADER_CELL_NO_SORT} text-right`}>Reference</th>
                                        </tr>
                                    </thead>
                                    <tbody className={TABLE_BODY}>
                                        {payrollHistory.map(entry => (
                                            <tr key={entry.id} className={TABLE_ROW}>
                                                <td className={TABLE_CELL_PRIMARY}>Month {entry.month}, {entry.year}</td>
                                                <td className={TABLE_CELL}>₦{entry.amountPaid.toLocaleString()}</td>
                                                <td className={TABLE_CELL}>
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-semibold uppercase ${entry.status === 'PAID' ? "bg-green-500/10 text-green-600 border border-green-500/20" : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                                        }`}>
                                                        {entry.status}
                                                    </span>
                                                </td>
                                                <td className={TABLE_CELL_ACTIONS}>
                                                    <Button variant="ghost" size="sm" className="rounded-lg font-semibold text-[10px]">
                                                        <FileText className="mr-1" size={12} /> Slip
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                        {payrollHistory.length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="px-3 py-12 text-center text-foreground/60 font-medium text-[12px]">
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
                    <Card className="rounded-2xl border-primary/20 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-[14px] font-semibold flex items-center gap-3">
                                <Clock className="text-primary" /> Leave Records
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className={`${STAT_CARD}`}>
                                <p className={STAT_LABEL}>Annual Limit</p>
                                <p className={STAT_VALUE}>15 Days</p>
                            </div>
                            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 shadow-sm">
                                <p className={`${STAT_LABEL} text-primary/60`}>Taken</p>
                                <p className={`${STAT_VALUE}`}>0 Days</p>
                            </div>
                        </div>
                        <div className="py-12 text-center space-y-3 bg-muted/10 rounded-2xl border-2 border-dashed border-primary/20">
                            <Clock size={36} className="mx-auto text-foreground/30" />
                            <p className="text-foreground/60 font-medium text-[12px]">No leave applications found for this cycle.</p>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
