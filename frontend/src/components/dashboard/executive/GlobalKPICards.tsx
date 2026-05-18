"use client";

import { useRouter } from "next/navigation";
import { Users, Briefcase, DollarSign, Percent, Building2, TrendingUp, Target, GraduationCap, Bed } from "lucide-react";
import SparklineCard from "./widgets/SparklineCard";
import type { ExecutiveOverview } from "@/types/analytics";

interface GlobalKPICardsProps {
    data: ExecutiveOverview;
}

export default function GlobalKPICards({ data }: GlobalKPICardsProps) {
    const router = useRouter();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SparklineCard
                title="Total Students"
                value={data.totalStudents.toLocaleString()}
                icon={Users}
                color="blue"
                trend={data.studentGrowth}
                subtitle={`${data.studentGrowth > 0 ? "+" : ""}${data.studentGrowth}% vs last month`}
                onClick={() => router.push("/dashboard/students")}
            />
            <SparklineCard
                title="Total Staff"
                value={data.totalStaff.toLocaleString()}
                icon={Briefcase}
                color="green"
                subtitle={`${data.activeStaff} active`}
                onClick={() => router.push("/dashboard/employees")}
            />
            <SparklineCard
                title="Total Revenue"
                value={`₦${(data.totalRevenue / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                color="orange"
                subtitle={`${data.collectionRate}% collection rate`}
                onClick={() => router.push("/dashboard/finance")}
            />
            <SparklineCard
                title="Outstanding Fees"
                value={`₦${(data.totalOutstanding / 1000).toFixed(0)}K`}
                icon={Target}
                color="red"
                trend={data.totalOutstanding > 0 ? -5 : 0}
                onClick={() => router.push("/dashboard/finance")}
            />
            <SparklineCard
                title="Attendance Rate"
                value={`${data.attendanceRate}%`}
                icon={Percent}
                color="purple"
                subtitle={data.attendanceRate >= 85 ? "Above target" : "Below target"}
                onClick={() => router.push("/dashboard/attendance")}
            />
            <SparklineCard
                title="Active Branches"
                value={`${data.activeBranches} / ${data.totalBranches}`}
                icon={Building2}
                color="primary"
                onClick={() => router.push("/dashboard/branches")}
            />
            <SparklineCard
                title="Enrollment Growth"
                value={`${data.studentGrowth > 0 ? "+" : ""}${data.studentGrowth}%`}
                icon={TrendingUp}
                color="green"
                subtitle="Month-over-month change"
            />
            <SparklineCard
                title="Academic Avg"
                value={data.academicAverage > 0 ? `${data.academicAverage}%` : "N/A"}
                icon={GraduationCap}
                color="blue"
                subtitle="Network-wide average score"
            />
            <SparklineCard
                title="Hostel Occupancy"
                value={`${data.hostelOccupancyRate}%`}
                icon={Bed}
                color="purple"
                subtitle={data.hostelOccupancyRate > 0 ? `${data.hostelOccupancyRate}% beds filled` : "No allocations"}
                onClick={() => router.push("/dashboard/hostels")}
            />
        </div>
    );
}
