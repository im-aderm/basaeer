"use client";

import { Users, Briefcase, DollarSign, Percent, Building2, TrendingUp, Target, GraduationCap, Bed } from "lucide-react";
import SparklineCard from "./widgets/SparklineCard";
import type { ExecutiveOverview } from "@/types/analytics";

interface GlobalKPICardsProps {
    data: ExecutiveOverview;
}

export default function GlobalKPICards({ data }: GlobalKPICardsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <SparklineCard
                title="Total Students"
                value={data.totalStudents.toLocaleString()}
                icon={Users}
                color="blue"
                trend={data.studentGrowth}
                subtitle={`${data.studentGrowth > 0 ? "+" : ""}${data.studentGrowth}% vs last month`}
            />
            <SparklineCard
                title="Total Staff"
                value={data.totalStaff.toLocaleString()}
                icon={Briefcase}
                color="green"
                subtitle={`${data.activeStaff} active`}
            />
            <SparklineCard
                title="Total Revenue"
                value={`₦${(data.totalRevenue / 1000000).toFixed(1)}M`}
                icon={DollarSign}
                color="orange"
                subtitle={`${data.collectionRate}% collection rate`}
            />
            <SparklineCard
                title="Outstanding Fees"
                value={`₦${(data.totalOutstanding / 1000).toFixed(0)}K`}
                icon={Target}
                color="red"
                trend={data.totalOutstanding > 0 ? -5 : 0}
            />
            <SparklineCard
                title="Attendance Rate"
                value={`${data.attendanceRate}%`}
                icon={Percent}
                color="purple"
                subtitle={data.attendanceRate >= 85 ? "Above target" : "Below target"}
            />
            <SparklineCard
                title="Active Branches"
                value={`${data.activeBranches} / ${data.totalBranches}`}
                icon={Building2}
                color="primary"
            />
            <SparklineCard
                title="Student Retention"
                value={`${Math.max(0, 100 - Math.abs(data.studentGrowth))}%`}
                icon={TrendingUp}
                color="green"
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
            />
        </div>
    );
}
