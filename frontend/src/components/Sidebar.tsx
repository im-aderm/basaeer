"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isFeatureEnabled, FEATURE_FLAGS } from "@/lib/feature-flags";
import {
    LayoutDashboard,
    Box,
    Building2,
    Home,
    UserPlus,
    Users,
    UserCheck,
    Contact,
    CreditCard,
    FileBadge,
    Briefcase,
    GraduationCap,
    Video,
    Paperclip,
    BookOpen,
    Brain,
    Globe,
    BookMarked,
    Bus,
    Clock,
    QrCode,
    Library,
    Calendar,
    MessageSquare,
    Coins,
    FileBarChart,
    Settings,
    ChevronDown,
    ChevronRight,
    Menu,
    X,
    LogOut,
    Search,
    PanelLeftClose,
    PanelLeftOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/stores/sidebarStore";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Config
// ─────────────────────────────────────────────────────────────────────────────

interface NavChild {
    title: string;
    href: string;
    roles?: string[];
    permissions?: string[];
    isBeta?: boolean;
    featureFlag?: keyof typeof FEATURE_FLAGS;
}

interface NavItem {
    title: string;
    icon: React.ElementType;
    href?: string;
    roles?: string[];
    permissions?: string[];
    isBeta?: boolean;
    featureFlag?: keyof typeof FEATURE_FLAGS;
    children?: NavChild[];
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

// Grouped for logical IA — 6 sections, ~5 items each for scanability
const groupedNavigation: NavGroup[] = [
    {
        label: "Overview",
        items: [
            { title: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
        ],
    },
    {
        label: "Student Life",
        items: [
            {
                title: "Admission",
                icon: UserPlus,
                children: [
                    { title: "Admission Options", href: "/dashboard/students/admission" },
                    { title: "Admission Management", href: "/dashboard/students/admission/manage" },
                    { title: "Online Admission", href: "/dashboard/students/online" },
                    { title: "Entrance Exams", href: "/dashboard/students/admission/exams" },
                    { title: "Interviews", href: "/dashboard/students/admission/interviews" },
                    { title: "Student Import", href: "/dashboard/students/import" },
                    { title: "Category", href: "/dashboard/students/category" },
                ],
            },
            {
                title: "Student Details",
                icon: Users,
                children: [
                    { title: "Student Overview", href: "/dashboard/students" },
                    { title: "Student List", href: "/dashboard/students/list" },
                    { title: "Login Deactivate", href: "/dashboard/students/deactivate-login" },
                    { title: "Deactivate Reason", href: "/dashboard/students/deactivate-reason" },
                ],
            },
            {
                title: "Parents",
                icon: UserCheck,
                children: [
                    { title: "Parents List", href: "/dashboard/parents" },
                    { title: "Add Parent", href: "/dashboard/parents/add" },
                    { title: "Login Deactivate", href: "/dashboard/users/deactivation" },
                ],
            },
            {
                title: "Card Management",
                icon: CreditCard,
                children: [
                    { title: "ID Card Template", href: "/dashboard/cards/id-template" },
                    { title: "Student ID Card", href: "/dashboard/cards/student-id" },
                    { title: "Employee ID Card", href: "/dashboard/cards/employee-id" },
                    { title: "Admit Card Template", href: "/dashboard/cards/admit-template" },
                    { title: "Generate Admit Card", href: "/dashboard/cards/generate-admit" },
                ],
            },
            {
                title: "Certificate",
                icon: FileBadge,
                children: [
                    { title: "Certificate Vault", href: "/dashboard/certificates/vault" },
                    { title: "Certificate Template", href: "/dashboard/certificates/template" },
                    { title: "Generate Student", href: "/dashboard/certificates/generate-student", isBeta: true },
                ],
            },
            {
                title: "Alumni",
                icon: GraduationCap,
                featureFlag: 'MODULE_ALUMNI',
                children: [
                    { title: "Manage Alumni", href: "/dashboard/alumni" },
                    { title: "Alumni Events", href: "/dashboard/alumni/events", isBeta: true },
                ],
            },
            {
                title: "My Portal",
                icon: UserCheck,
                roles: ["STUDENT"],
                children: [
                    { title: "My Results", href: "/dashboard/student/results" },
                    { title: "My Certificates", href: "/dashboard/student/certificates" },
                    { title: "My Hostel", href: "/dashboard/student/hostel" },
                ],
            },
        ],
    },
    {
        label: "Academics",
        items: [
            {
                title: "Academic",
                icon: GraduationCap,
                children: [
                    { title: "Class & Section", href: "/dashboard/academics/classes" },
                    { title: "Subject", href: "/dashboard/academics/subjects" },
                    { title: "Class Schedule", href: "/dashboard/academics/schedule-class" },
                    { title: "Teacher Schedule", href: "/dashboard/academics/schedule-teacher" },
                    { title: "Promotion", href: "/dashboard/academics/promotion" },
                ],
            },
            {
                title: "Exam Master",
                icon: Brain,
                children: [
                    { title: "Exam List", href: "/dashboard/exams" },
                    { title: "Grading Scale", href: "/dashboard/academics/exams/grading" },
                    { title: "Marks Entry", href: "/dashboard/academics/exams/marks" },
                    { title: "Exam Schedule", href: "/dashboard/exams/schedule" },
                    { title: "Report Cards", href: "/dashboard/academics/exams/reports" },
                ],
            },
            {
                title: "Tahfeez Tracker",
                icon: BookMarked,
                children: [
                    { title: "Assessments", href: "/dashboard/tahfeez/assessments" },
                    { title: "Progress", href: "/dashboard/tahfeez/progress" },
                    { title: "Reports", href: "/dashboard/tahfeez/reports" },
                ],
            },
            {
                title: "Online Exam",
                icon: Globe,
                children: [
                    { title: "Online Exam", href: "/dashboard/online-exams" },
                    { title: "Question Bank", href: "/dashboard/online-exams/questions" },
                    { title: "Question Group", href: "/dashboard/online-exams/question-group" },
                    { title: "Position Generate", href: "/dashboard/online-exams/position" },
                    { title: "Exam Result", href: "/dashboard/online-exams/result" },
                ],
            },
            {
                title: "Live Class Rooms",
                icon: Video,
                children: [
                    { title: "Live Class Rooms", href: "/dashboard/live-classes" },
                    { title: "Live Class Reports", href: "/dashboard/live-classes/reports" },
                ],
            },
            {
                title: "Homework",
                icon: BookOpen,
                children: [
                    { title: "Homework", href: "/dashboard/homework" },
                    { title: "Evaluation Report", href: "/dashboard/homework/evaluation" },
                ],
            },
            {
                title: "Attachments Book",
                icon: Paperclip,
                isBeta: true,
                children: [
                    { title: "Upload Content", href: "/dashboard/attachments/upload" },
                    { title: "Attachment Type", href: "/dashboard/attachments/type" },
                ],
            },
            {
                title: "Library",
                icon: Library,
                featureFlag: 'MODULE_LIBRARY',
                children: [
                    { title: "Library Overview", href: "/dashboard/library" },
                    { title: "Books", href: "/dashboard/library/books" },
                    { title: "Books Category", href: "/dashboard/library/category", isBeta: true },
                    { title: "Borrowing History", href: "/dashboard/library/borrowing" },
                    { title: "My Issued Book", href: "/dashboard/library/issued", isBeta: true },
                    { title: "Book Issue / Return", href: "/dashboard/library/manage", isBeta: true },
                    { title: "Reservations & Copies", href: "/dashboard/library/reservations" },
                ],
            },
            {
                title: "Events",
                icon: Calendar,
                roles: ["SUPER_ADMIN"],
                children: [
                    { title: "Overview", href: "/dashboard/events/overview" },
                    { title: "All Events", href: "/dashboard/events" },
                    { title: "Create Event", href: "/dashboard/events/create" },
                    { title: "Applications", href: "/dashboard/events/applications" },
                    { title: "Payments", href: "/dashboard/events/payments" },
                    { title: "Analytics", href: "/dashboard/events/analytics" },
                    { title: "Media Gallery", href: "/dashboard/events/gallery" },
                    { title: "Settings", href: "/dashboard/events/settings" },
                ],
            },
        ],
    },
    {
        label: "Campus Operations",
        items: [
            {
                title: "Inventory",
                icon: Box,
                children: [
                    { title: "Product", href: "/dashboard/inventory/product" },
                    { title: "Category", href: "/dashboard/inventory/category" },
                    { title: "Store", href: "/dashboard/inventory/store" },
                    { title: "Supplier", href: "/dashboard/inventory/supplier" },
                    { title: "Unit", href: "/dashboard/inventory/unit" },
                    { title: "Purchase", href: "/dashboard/inventory/purchase" },
                    { title: "Sales", href: "/dashboard/inventory/sales" },
                    { title: "Issue", href: "/dashboard/inventory/issue" },
                ],
            },
            {
                title: "Reception",
                icon: Contact,
                children: [
                    { title: "Admission Enquiry", href: "/dashboard/reception/enquiry" },
                    { title: "Postal Record", href: "/dashboard/reception/postal" },
                    { title: "Call Log", href: "/dashboard/reception/call-log" },
                    { title: "Visitor Log", href: "/dashboard/reception/visitor-log" },
                    { title: "Complaint", href: "/dashboard/reception/complaint" },
                    { title: "Config Reception", href: "/dashboard/reception/config" },
                ],
            },
            {
                title: "Transport Logistics",
                icon: Bus,
                children: [
                    { title: "Transport Overview", href: "/dashboard/transport" },
                    { title: "Routes", href: "/dashboard/transport/routes" },
                    { title: "Fleet Management", href: "/dashboard/transport/vehicles" },
                    { title: "Student Assignment", href: "/dashboard/transport/assign" },
                ],
            },
            {
                title: "Hostel Management",
                icon: Home,
                children: [
                    { title: "Hostel Overview", href: "/dashboard/hostels" },
                ],
            },
            {
                title: "Attendance",
                icon: Clock,
                children: [
                    { title: "Manage Sessions", href: "/dashboard/attendance/sessions" },
                    { title: "Student Attendance", href: "/dashboard/attendance/student" },
                    { title: "Subject Wise", href: "/dashboard/attendance/subject" },
                    { title: "Employee", href: "/dashboard/attendance/employee" },
                    { title: "Exam", href: "/dashboard/attendance/exam" },
                ],
            },
            {
                title: "QR Attendance",
                icon: QrCode,
                featureFlag: 'MODULE_QR_ATTENDANCE',
                children: [
                    { title: "Attendance", href: "/dashboard/qr-attendance" },
                    { title: "Settings", href: "/dashboard/qr-attendance/settings" },
                    { title: "Submission Settings", href: "/dashboard/qr-attendance/submissions", isBeta: true },
                    { title: "Reports", href: "/dashboard/qr-attendance/reports", isBeta: true },
                ],
            },
            {
                title: "Bulk SMS & Email",
                icon: MessageSquare,
                isBeta: true,
                featureFlag: 'MODULE_BULK_COMMS',
                children: [
                    { title: "Send SMS / Email", href: "/dashboard/bulk-comms/send" },
                    { title: "SMS / Email Report", href: "/dashboard/bulk-comms/report" },
                    { title: "SMS Template", href: "/dashboard/bulk-comms/sms-template" },
                    { title: "Email Template", href: "/dashboard/bulk-comms/email-template" },
                    { title: "Student Birthday Wishes", href: "/dashboard/bulk-comms/birthday-student" },
                    { title: "Staff Birthday Wishes", href: "/dashboard/bulk-comms/birthday-staff" },
                ],
            },
        ],
    },
    {
        label: "Finance & HR",
        items: [
            {
                title: "Financial Management",
                icon: Coins,
                children: [
                    { title: "Finance Overview", href: "/dashboard/finance" },
                    { title: "Fees Structure", href: "/dashboard/finance/fees" },
                    { title: "Invoices & Billing", href: "/dashboard/finance/invoices" },
                    { title: "Expense Tracking", href: "/dashboard/finance/expenses" },
                    { title: "Voucher Management", href: "/dashboard/finance/vouchers" },
                ],
            },
            {
                title: "Human Resource",
                icon: Users,
                children: [
                    { title: "Payroll", href: "/dashboard/hr/payroll" },
                    { title: "Attendance", href: "/dashboard/hr/attendance" },
                    { title: "Advance Salary", href: "/dashboard/hr/advance-salary" },
                    { title: "Leave", href: "/dashboard/hr/leave" },
                    { title: "Award", href: "/dashboard/hr/award" },
                ],
            },
            {
                title: "Employee",
                icon: Briefcase,
                children: [
                    { title: "Employee List", href: "/dashboard/employees" },
                    { title: "Add Department", href: "/dashboard/employees/department" },
                    { title: "Add Designation", href: "/dashboard/employees/designation" },
                    { title: "Add Employee", href: "/dashboard/employees/add" },
                    { title: "Login Deactivate", href: "/dashboard/users/deactivation" },
                ],
            },
            {
                title: "Reports",
                icon: FileBarChart,
                featureFlag: 'MODULE_REPORTS',
                children: [
                    { title: "Student Reports", href: "/dashboard/reports/students" },
                    { title: "Fees Reports", href: "/dashboard/reports/fees" },
                    { title: "Financial Reports", href: "/dashboard/reports/financial" },
                    { title: "Attendance Reports", href: "/dashboard/reports/attendance" },
                    { title: "Human Resource Reports", href: "/dashboard/reports/hr" },
                    { title: "Examination Reports", href: "/dashboard/reports/exams" },
                    { title: "Inventory Reports", href: "/dashboard/reports/inventory" },
                ],
            },
        ],
    },
    {
        label: "Administration",
        items: [
            {
                title: "Branches",
                icon: Building2,
                roles: ["SUPER_ADMIN"],
                children: [
                    { title: "All Branches", href: "/dashboard/branches" },
                    { title: "Create Branch", href: "/dashboard/branches/create" },
                ],
            },
            {
                title: "Sessions",
                icon: Calendar,
                children: [
                    { title: "All Sessions", href: "/dashboard/sessions" },
                    { title: "Create Session", href: "/dashboard/sessions/new" },
                ],
            },
            {
                title: "Settings",
                icon: Settings,
                children: [
                    { title: "General Settings", href: "/dashboard/settings/general" },
                    { title: "School Branding", href: "/dashboard/settings/branding" },
                    { title: "Role Permissions", href: "/dashboard/settings/roles" },
                    { title: "Session Settings", href: "/dashboard/settings/sessions" },
                    { title: "Translations", href: "/dashboard/settings/translations", isBeta: true },
                    { title: "Cron Job", href: "/dashboard/settings/cron", isBeta: true },
                    { title: "Modules", href: "/dashboard/settings/modules", isBeta: true },
                    { title: "System Student Field", href: "/dashboard/settings/student-fields", isBeta: true },
                    { title: "Custom Field", href: "/dashboard/settings/custom-fields", isBeta: true },
                    { title: "Backup Management", href: "/dashboard/settings/backups" },
                    { title: "System Update", href: "/dashboard/settings/update", isBeta: true },
                    { title: "User Login Log", href: "/dashboard/settings/login-log", isBeta: true },
                ],
            },
        ],
    },
];

// Back-compat flat list for canSee/auto-expand logic
const navigation: NavItem[] = groupedNavigation.flatMap(g => g.items);

// ─────────────────────────────────────────────────────────────────────────────
// Reusable NavList sub-component — eliminates desktop/mobile duplication
// ─────────────────────────────────────────────────────────────────────────────

interface NavListProps {
    pathname: string;
    openMenus: string[];
    isCollapsed?: boolean;
    canSee: (item: NavItem | NavChild) => boolean;
    toggleMenu: (title: string) => void;
    onLinkClick?: () => void;
    searchQuery?: string;
}

function NavList({ pathname, openMenus, isCollapsed = false, canSee, toggleMenu, onLinkClick, searchQuery = "" }: NavListProps) {
    const isChildActive = (item: NavItem) =>
        item.children?.some((child) => pathname.startsWith(child.href)) ?? false;

    const isBaseActive = (item: NavItem) => {
        if (item.href) return pathname === item.href;
        return isChildActive(item);
    };

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = (item: NavItem) => {
        if (!q) return true;
        if (item.title.toLowerCase().includes(q)) return true;
        return !!item.children?.some((c) => c.title.toLowerCase().includes(q) || c.href.toLowerCase().includes(q));
    };

    // Filtered groups
    const filteredGroups = groupedNavigation
        .map((g) => ({
            ...g,
            items: g.items.filter((it) => canSee(it) && matchesSearch(it)).map((it) => ({
                ...it,
                children: it.children?.filter((c) => canSee(c) && (!q || c.title.toLowerCase().includes(q) || c.href.toLowerCase().includes(q))),
            })).filter((it) => q ? (it.children && it.children.length > 0) || it.title.toLowerCase().includes(q) : true),
        }))
        .filter((g) => g.items.length > 0);

    // Collapsed: show flat icons without group headers
    if (isCollapsed) {
        return (
            <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1">
                {navigation.filter(canSee).map((item) => {
                const isOpen = openMenus.includes(item.title);
                const isActive = isBaseActive(item);
                const hasChildren = item.children && item.children.length > 0;

                return (
                    <div key={item.title} className="space-y-1">
                        {hasChildren ? (
                            <button
                                onClick={() => toggleMenu(item.title)}
                                className={cn(
                                    "w-full flex items-center group px-3 py-2.5 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-[#2563EB]/5 text-[#2563EB] font-medium"
                                        : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]",
                                    isCollapsed && "justify-center px-2"
                                )}
                                aria-expanded={isOpen}
                                aria-label={item.title}
                            >
                                <item.icon
                                    className={cn(
                                        "shrink-0 transition-transform duration-200",
                                        isActive ? "text-[#2563EB]" : "text-[#9CA3AF] group-hover:text-[#4B5563]"
                                    )}
                                    size={20}
                                    aria-hidden="true"
                                />
                                {!isCollapsed && (
                                    <>
                                        <span className="ml-3 text-sm font-medium flex-1 text-left">{item.title}</span>
                                        {isOpen
                                            ? <ChevronDown size={14} className="opacity-50" aria-hidden="true" />
                                            : <ChevronRight size={14} className="opacity-50" aria-hidden="true" />
                                        }
                                    </>
                                )}
                            </button>
                        ) : (
                            <Link
                                href={item.href || "#"}
                                onClick={onLinkClick}
                                className={cn(
                                    "flex items-center group px-3 py-2.5 rounded-xl transition-all duration-200",
                                    isActive
                                        ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20"
                                        : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]",
                                    isCollapsed && "justify-center px-2"
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <item.icon
                                    className={cn(
                                        "shrink-0 transition-transform duration-200",
                                        isActive ? "text-white" : "text-[#9CA3AF] group-hover:text-[#4B5563]"
                                    )}
                                    size={20}
                                    aria-hidden="true"
                                />
                                {!isCollapsed && (
                                    <span className="ml-3 text-sm font-medium">{item.title}</span>
                                )}
                            </Link>
                        )}

                        {/* Dropdown Children */}
                        {hasChildren && isOpen && !isCollapsed && (
                            <div className="mt-1 ml-4 pl-4 border-l border-[#E5E7EB] space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                {item.children?.filter(canSee).map((child) => (
                                    <Link
                                        key={child.href}
                                        href={child.href}
                                        onClick={onLinkClick}
                                        className={cn(
                                            "block py-2 px-3 text-sm rounded-lg transition-colors",
                                            pathname === child.href
                                                ? "text-[#2563EB] font-semibold bg-[#2563EB]/5"
                                                : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]"
                                        )}
                                        aria-current={pathname === child.href ? "page" : undefined}
                                    >
                                        {child.title}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}


    // Expanded: grouped with search
    return (
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-3 space-y-4">
            {filteredGroups.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-[12px] text-muted-foreground">No results for “{q}”</p>
                </div>
            ) : (
                filteredGroups.map((group) => (
                    <div key={group.label} className="space-y-1">
                        <p className="px-3 pt-2 pb-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/70">{group.label}</p>
                        {group.items.map((item) => {
                            const isOpen = openMenus.includes(item.title);
                            const isActive = isBaseActive(item);
                            const hasChildren = item.children && item.children.length > 0;
                            return (
                                <div key={item.title} className="space-y-1">
                                    {hasChildren ? (
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={cn(
                                                "w-full flex items-center group px-3 py-2 rounded-xl transition-all duration-200",
                                                isActive ? "bg-[#2563EB]/5 text-[#2563EB] font-medium" : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]"
                                            )}
                                            aria-expanded={isOpen}
                                        >
                                            <item.icon className={cn("shrink-0", isActive ? "text-[#2563EB]" : "text-[#9CA3AF] group-hover:text-[#4B5563]")} size={18} />
                                            <span className="ml-3 text-[13px] font-medium flex-1 text-left">{item.title}</span>
                                            {isOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                                        </button>
                                    ) : (
                                        <Link href={item.href || "#"} onClick={onLinkClick} className={cn("flex items-center group px-3 py-2 rounded-xl transition-all duration-200", isActive ? "bg-[#2563EB] text-white shadow-md shadow-blue-500/20" : "text-[#4B5563] hover:bg-[#F9FAFB] hover:text-[#111827]")}>
                                            <item.icon className={cn("shrink-0", isActive ? "text-white" : "text-[#9CA3AF] group-hover:text-[#4B5563]")} size={18} />
                                            <span className="ml-3 text-[13px] font-medium">{item.title}</span>
                                        </Link>
                                    )}
                                    {hasChildren && (isOpen || q) && (
                                        <div className="mt-1 ml-4 pl-4 border-l border-[#E5E7EB] space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                            {item.children?.filter(canSee).map((child) => (
                                                <Link key={child.href} href={child.href} onClick={onLinkClick} className={cn("block py-1.5 px-3 text-[12px] rounded-lg transition-colors", pathname === child.href ? "text-[#2563EB] font-semibold bg-[#2563EB]/5" : "text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]")}>
                                                    {child.title}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))
            )}
        </div>
    );
}

interface UserFooterProps {
    user: {
        firstName?: string;
        lastName?: string;
        role?: string;
        id?: string;
    } | null;
    compact?: boolean;
    onLinkClick?: () => void;
}

function UserFooter({ user, compact = false, onLinkClick }: UserFooterProps) {
    const { logout } = useAuth();
    return (
        <div className={cn(
            "p-4 border-t border-[#E5E7EB] shrink-0 bg-white",
            compact ? "flex justify-center" : ""
        )}>
            <div className={cn("flex items-center gap-3", compact && "justify-center")}>
                <Link
                    href="/dashboard/profile"
                    onClick={onLinkClick}
                    className={cn(
                        "flex items-center gap-3 flex-1 min-w-0",
                        compact && "justify-center"
                    )}
                >
                    <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold shrink-0">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    {!compact && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#111827] truncate">
                                {user?.firstName} {user?.lastName}
                            </p>
                            <p className="text-xs text-[#6B7280] truncate">
                                {user?.role?.replace(/_/g, ' ')}
                            </p>
                        </div>
                    )}
                </Link>
                {!compact && (
                    <button
                        onClick={logout}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                        aria-label="Sign out"
                    >
                        <LogOut size={18} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

const NAV_PERMISSIONS: Record<string, string> = {
    Dashboard: "analytics:read",
    Branches: "branches:read",
    Sessions: "sessions:read",
    Inventory: "inventory:read",
    Reception: "reception:read",
    Admission: "online-admission:read",
    "Student Details": "students:read",
    Parents: "students:read",
    Employee: "employees:read",
    "Card Management": "cards:read",
    Certificate: "certificates:read",
    "Human Resource": "employees:read",
    Academic: "academics:read",
    "Live Class Rooms": "live-classes:read",
    "Attachments Book": "attachments:read",
    Homework: "assignments:read",
    "Exam Master": "exams:read",
    "Tahfeez Tracker": "academics:read",
    "Online Exam": "online-exams:read",
    "Transport Logistics": "transport:read",
    "Hostel Management": "hostels:read",
    Attendance: "attendance:read",
    "QR Attendance": "attendance:read",
    Library: "library:read",
    Events: "events:read",
    "Bulk SMS & Email": "comms:read",
    "Financial Management": "finance:read",
    Reports: "reporting:read",
    Alumni: "stakeholder:read",
    Settings: "settings:read",
};

export function Sidebar() {
    const pathname = usePathname();
    const { user, hasPermission } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const { isCollapsed, toggle: toggleCollapsed, setCollapsed } = useSidebarStore();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Open parent menu if a child route is currently active
    // BUG FIX: openMenus is excluded from deps to avoid stale closure — we only
    // want this to run when the pathname changes, and we check the current state inline.
    useEffect(() => {
        navigation.forEach((item) => {
            if (item.children?.some((child) => pathname.startsWith(child.href))) {
                setOpenMenus((prev) =>
                    prev.includes(item.title) ? prev : [...prev, item.title]
                );
            }
        });
    }, [pathname]);

    const toggleMenu = useCallback((title: string) => {
        if (isCollapsed) setCollapsed(false);
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    }, [isCollapsed, setCollapsed]);

    const canSee = useCallback((item: NavItem | NavChild): boolean => {
        if (item.isBeta && !isFeatureEnabled('SHOW_BETA_FEATURES')) return false;
        if (item.featureFlag && !isFeatureEnabled(item.featureFlag)) return false;
        // Explicit roles gate (strict)
        if ('roles' in item && item.roles && item.roles.length > 0) {
            if (!user) return false;
            if (!item.roles.includes(user.role)) return false;
        }
        // Explicit permissions gate
        if ('permissions' in item && (item as NavItem).permissions && (item as NavItem).permissions!.length > 0) {
            if (!user) return false;
            return (item as NavItem).permissions!.every((p) => hasPermission(p));
        }
        // Implicit permission via mapping (e.g., Financial Management -> finance:read)
        const mapped = NAV_PERMISSIONS[item.title];
        if (mapped) {
            if (!user) return false;
            // SUPER_ADMIN bypass inside hasPermission
            if (!hasPermission(mapped)) return false;
        }
        return true;
    }, [user, hasPermission]);

    return (
        <>
            {/* ── Desktop Sidebar ────────────────────────────────────────────── */}
            <aside
                className={cn(
                    "hidden md:flex flex-col fixed inset-y-0 left-0 transition-all duration-300 z-50",
                    isCollapsed ? "w-20" : "w-72"
                )}
                aria-label="Main navigation"
            >
                <div className="flex flex-col h-full bg-white border-r border-[#E5E7EB] shadow-[4px_0_24px_rgba(0,0,0,0.02)] overflow-hidden select-none">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB] shrink-0 bg-white">
                        <div className={cn("flex items-center gap-3 transition-opacity duration-300", isCollapsed && "opacity-0 invisible w-0")}>
                            <img
                                src={user?.branding?.logoUrl || '/logo.png'}
                                alt={user?.branding?.name || 'Logo'}
                                className="h-9 w-9 rounded-xl object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }}
                            />
                            <span className="font-bold text-xl tracking-tight text-[#111827]">{user?.branding?.name || 'Basaer'}</span>
                        </div>
                        <button
                            onClick={toggleCollapsed}
                            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280] hover:text-[#111827]"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!isCollapsed}
                        >
                            {isCollapsed ? <PanelLeftOpen size={20} aria-hidden="true" /> : <PanelLeftClose size={20} aria-hidden="true" />}
                        </button>
                    </div>

                    {/* Search — only when expanded */}
                    {!isCollapsed && (
                        <div className="px-3 py-3 border-b border-[#E5E7EB] shrink-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    placeholder="Search menu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                                />
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <NavList
                        pathname={pathname}
                        openMenus={openMenus}
                        isCollapsed={isCollapsed}
                        canSee={canSee}
                        toggleMenu={toggleMenu}
                        searchQuery={searchQuery}
                    />

                    {/* User Footer */}
                    <UserFooter user={user} compact={isCollapsed} />
                </div>
            </aside>

            {/* ── Mobile Header ──────────────────────────────────────────────── */}
            <div className="md:hidden flex items-center justify-between h-16 px-4 bg-card border-b border-border fixed top-0 w-full z-40">
                <div className="flex items-center gap-2">
                    <img
                        src={user?.branding?.logoUrl || '/logo.png'}
                        alt={user?.branding?.name || 'Logo'}
                        className="h-7 w-7 rounded-lg object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }}
                    />
                    <span className="font-bold">{user?.branding?.name || 'Basaer'}</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 hover:bg-muted rounded-lg"
                    aria-label="Open navigation menu"
                >
                    <Menu size={24} aria-hidden="true" />
                </button>
            </div>

            {/* ── Mobile Overlay Drawer ──────────────────────────────────────── */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsMobileOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
                        {/* Header */}
                        <div className="h-16 flex items-center justify-between px-4 border-b border-[#E5E7EB] bg-white">
                            <div className="flex items-center gap-3">
                                <img
                                    src={user?.branding?.logoUrl || '/logo.png'}
                                    alt={user?.branding?.name || 'Logo'}
                                    className="h-9 w-9 rounded-xl object-cover"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png' }}
                                />
                                <span className="font-bold text-xl tracking-tight text-[#111827]">{user?.branding?.name || 'Basaer'}</span>
                            </div>
                            <button
                                onClick={() => setIsMobileOpen(false)}
                                className="p-2 hover:bg-muted rounded-lg"
                                aria-label="Close navigation menu"
                            >
                                <X size={20} aria-hidden="true" />
                            </button>
                        </div>

                        {/* Search — mobile */}
                        <div className="px-3 py-3 border-b border-[#E5E7EB] shrink-0">
                            <div className="relative">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                                <input
                                    placeholder="Search menu..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 bg-muted/30 border border-border rounded-xl text-[12px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
                                />
                            </div>
                        </div>

                        {/* Navigation — reuses the same NavList component */}
                        <NavList
                            pathname={pathname}
                            openMenus={openMenus}
                            canSee={canSee}
                            toggleMenu={toggleMenu}
                            searchQuery={searchQuery}
                            onLinkClick={() => setIsMobileOpen(false)}
                        />

                        {/* User Footer */}
                        <UserFooter user={user} onLinkClick={() => setIsMobileOpen(false)} />
                    </div>
                </div>
            )}

            {/* Desktop Spacer */}
            <div
                className={cn(
                    "hidden md:block transition-all duration-300",
                    isCollapsed ? "w-20" : "w-72"
                )}
                aria-hidden="true"
            />
        </>
    );
}
