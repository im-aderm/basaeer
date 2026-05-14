"use client";

import { useAuth } from "@/context/AuthContext";
import { DashboardData } from "@/types/dashboard";
import {
  Users, Briefcase, DollarSign, Calendar, TrendingUp, GraduationCap,
  School, BookOpen, CreditCard, Clock, Bus
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { StatCardWidget } from "@/components/dashboard/widgets/StatCardWidget";

export function RoleDashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  const { user } = useAuth();
  const role = user?.role;

  if (role === "SUPER_ADMIN" || role === "BRANCH_ADMIN") {
    return <AdminDashboard data={data} loading={loading} isSuperAdmin={role === "SUPER_ADMIN"} />;
  }
  if (role === "TEACHER" || role === "HOD" || role === "PRINCIPAL") {
    return <TeacherDashboard data={data} loading={loading} />;
  }
  if (role === "ACCOUNTANT") {
    return <FinanceDashboard data={data} loading={loading} />;
  }
  if (role === "HR") {
    return <HRDashboard data={data} loading={loading} />;
  }
  if (role === "STUDENT") return <StudentDashboard />;
  if (role === "PARENT") return <ParentDashboard />;

  return <MinimalDashboard data={data} loading={loading} />;
}

function AdminDashboard({ data, loading, isSuperAdmin }: { data: DashboardData | null; loading: boolean; isSuperAdmin: boolean }) {
  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground bg-muted px-3 py-1 rounded-full">
          <School className="w-3.5 h-3.5" /> All Branches · Unified
        </span>
      )}
      <DashboardGrid>
        <StatCardWidget title="Total Students" value={data?.academic?.totalStudents} icon={Users} color="blue" loading={loading} />
        <StatCardWidget title="Active Staff" value={data?.hr?.activeStaff} icon={Briefcase} color="green" loading={loading} />
        <StatCardWidget title="Revenue" value={data?.finance?.totalRevenue} icon={DollarSign} color="orange" loading={loading} formatter={(v) => `₦${Number(v).toLocaleString()}`} />
        <StatCardWidget title="Attendance" value={data?.attendance?.todayRate} icon={Calendar} color="purple" loading={loading} formatter={(v) => `${v}%`} />
      </DashboardGrid>
    </div>
  );
}

function TeacherDashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen size={28} /></div>
        <h2 className="text-h3">Academic Overview</h2>
      </div>
      <DashboardGrid cols={3}>
        <StatCardWidget title="Total Students" value={data?.academic?.totalStudents} icon={Users} color="blue" loading={loading} />
        <StatCardWidget title="Active Classes" value={data?.academic?.activeClasses} icon={BookOpen} color="green" loading={loading} />
        <StatCardWidget title="Attendance Today" value={data?.attendance?.todayRate} icon={Calendar} color="purple" loading={loading} formatter={(v) => `${v}%`} />
      </DashboardGrid>
    </div>
  );
}

function FinanceDashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><CreditCard size={28} /></div>
        <h2 className="text-h3">Financial Overview</h2>
      </div>
      <DashboardGrid cols={3}>
        <StatCardWidget title="Total Revenue" value={data?.finance?.totalRevenue} icon={DollarSign} color="green" loading={loading} formatter={(v) => `₦${Number(v).toLocaleString()}`} />
        <StatCardWidget title="Outstanding" value={data?.finance?.totalOutstanding} icon={TrendingUp} color="red" loading={loading} formatter={(v) => `₦${Number(v).toLocaleString()}`} />
        <StatCardWidget title="Collection Rate" value={data?.finance?.collectionRate} icon={Calendar} color="blue" loading={loading} formatter={(v) => `${v}%`} />
      </DashboardGrid>
    </div>
  );
}

function HRDashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Briefcase size={28} /></div>
        <h2 className="text-h3">HR Overview</h2>
      </div>
      <DashboardGrid cols={3}>
        <StatCardWidget title="Total Staff" value={data?.hr?.totalStaff} icon={Users} color="blue" loading={loading} />
        <StatCardWidget title="Active" value={data?.hr?.activeStaff} icon={Briefcase} color="green" loading={loading} />
        <StatCardWidget title="Departments" value={data?.hr?.byDepartment?.length} icon={TrendingUp} color="purple" loading={loading} />
      </DashboardGrid>
    </div>
  );
}

function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><GraduationCap size={28} /></div>
        <h2 className="text-h3">My Portal</h2>
      </div>
      <DashboardGrid cols={3}>
        <QuickLinkCard title="My Grades" description="View your academic performance" href="/dashboard/student/certificates" icon={BookOpen} color="blue" />
        <QuickLinkCard title="Attendance" description="Check your attendance records" href="/dashboard/attendance/student" icon={Calendar} color="green" />
        <QuickLinkCard title="Homework" description="View pending assignments" href="/dashboard/student/homework" icon={Clock} color="purple" />
      </DashboardGrid>
    </div>
  );
}

function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users size={28} /></div>
        <h2 className="text-h3">My Children</h2>
      </div>
      <DashboardGrid cols={2}>
        <QuickLinkCard title="Academic Progress" description="View grades and report cards" href="/dashboard/parent/student" icon={BookOpen} color="blue" />
        <QuickLinkCard title="Financials" description="Fee balances and payment history" href="/dashboard/parent/student" icon={DollarSign} color="green" />
        <QuickLinkCard title="Attendance" description="Monitor attendance records" href="/dashboard/attendance/student" icon={Calendar} color="purple" />
        <QuickLinkCard title="Communication" description="Message teachers" href="/dashboard/parent/communication" icon={Briefcase} color="orange" />
      </DashboardGrid>
    </div>
  );
}

function MinimalDashboard({ data, loading }: { data: DashboardData | null; loading: boolean }) {
  return (
    <DashboardGrid cols={3}>
      <StatCardWidget title="Students" value={data?.academic?.totalStudents} icon={Users} color="blue" loading={loading} />
      <StatCardWidget title="Staff" value={data?.hr?.activeStaff} icon={Briefcase} color="green" loading={loading} />
      <StatCardWidget title="Classes" value={data?.academic?.activeClasses} icon={BookOpen} color="purple" loading={loading} />
    </DashboardGrid>
  );
}

function QuickLinkCard({ title, description, href, icon: Icon, color }: {
  title: string; description: string; href: string; icon: React.ElementType; color: string;
}) {
  const borderColor = color === "blue" ? "border-b-blue-500/20" : color === "green" ? "border-b-green-500/20" : color === "purple" ? "border-b-purple-500/20" : "border-b-orange-500/20";
  const textColor = color === "blue" ? "text-blue-500" : color === "green" ? "text-green-500" : color === "purple" ? "text-purple-500" : "text-orange-500";

  return (
    <Card className={`rounded-[3rem] p-8 border-border/50 shadow-xl bg-card/50 backdrop-blur-sm border-b-8 ${borderColor}`}>
      <h3 className="text-h3 mb-3 flex items-center gap-3"><Icon className={`${textColor} w-5 h-5`} /> {title}</h3>
      <p className="text-body text-muted-foreground mb-6">{description}</p>
      <a href={href} className={`inline-flex items-center gap-2 text-btn ${textColor} hover:gap-4 transition-all`}>
        Open <TrendingUp size={16} />
      </a>
    </Card>
  );
}
