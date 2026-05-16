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
    X
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Navigation Config
// ─────────────────────────────────────────────────────────────────────────────

interface NavChild {
    title: string;
    href: string;
    roles?: string[];
    isBeta?: boolean;
    featureFlag?: keyof typeof FEATURE_FLAGS;
}

interface NavItem {
    title: string;
    icon: React.ElementType;
    href?: string;
    roles?: string[];
    isBeta?: boolean;
    featureFlag?: keyof typeof FEATURE_FLAGS;
    children?: NavChild[];
}

const navigation: NavItem[] = [
    {
        title: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
    },
    {
        title: "Branches",
        icon: Building2,
        children: [
            { title: "All Branches", href: "/dashboard/branches" },
            { title: "Create Branch", href: "/dashboard/branches/create" },
        ],
    },
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
        title: "Admission",
        icon: UserPlus,
        children: [
            { title: "Admission Options", href: "/dashboard/students/admission" },
            { title: "Admission Management", href: "/dashboard/students/admission/manage" },
            { title: "Online Admission", href: "/dashboard/students/online" },
            { title: "Entrance Exams", href: "/dashboard/students/admission/exams" },
            { title: "Interviews", href: "/dashboard/students/admission/interviews" },
            { title: "Admission ZIP Import", href: "/dashboard/students/admission-import" },
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
        title: "Live Class Rooms",
        icon: Video,
        children: [
            { title: "Live Class Rooms", href: "/dashboard/live-classes" },
            { title: "Live Class Reports", href: "/dashboard/live-classes/reports" },
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
        title: "Homework",
        icon: BookOpen,
        children: [
            { title: "Homework", href: "/dashboard/homework" },
            { title: "Evaluation Report", href: "/dashboard/homework/evaluation" },
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
        // Single consolidated Library group — BUG FIX: removed the duplicate "Library Management" entry
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
        ],
    },
    {
        title: "Events",
        icon: Calendar,
        children: [
            // { title: "Event Type", href: "/dashboard/events/type" },
            { title: "Events", href: "/dashboard/events" },
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
            { title: "My Certificates", href: "/dashboard/student/certificates" },
            { title: "My Hostel", href: "/dashboard/student/hostel" },
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
];

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
}

function NavList({ pathname, openMenus, isCollapsed = false, canSee, toggleMenu, onLinkClick }: NavListProps) {
    const isChildActive = (item: NavItem) =>
        item.children?.some((child) => pathname.startsWith(child.href)) ?? false;

    const isBaseActive = (item: NavItem) => {
        if (item.href) return pathname === item.href;
        return isChildActive(item);
    };

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

interface UserFooterProps {
    user: {
        firstName?: string;
        lastName?: string;
        role?: string;
    } | null;
    compact?: boolean;
}

function UserFooter({ user, compact = false }: UserFooterProps) {
    return (
        <div className={cn(
            "p-4 border-t border-[#E5E7EB] shrink-0 bg-white",
            compact ? "flex justify-center" : ""
        )}>
            <div className={cn("flex items-center gap-3", compact && "justify-center")}>
                <div className="w-10 h-10 rounded-xl bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB] font-bold shrink-0" aria-hidden="true">
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
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Sidebar Component
// ─────────────────────────────────────────────────────────────────────────────

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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
        if (isCollapsed) setIsCollapsed(false);
        setOpenMenus((prev) =>
            prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
        );
    }, [isCollapsed]);

    const canSee = useCallback((item: NavItem | NavChild): boolean => {
        if (item.isBeta && !isFeatureEnabled('SHOW_BETA_FEATURES')) return false;
        if (item.featureFlag && !isFeatureEnabled(item.featureFlag)) return false;
        if (!('roles' in item) || !item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    }, [user]);

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
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#6B7280] hover:text-[#111827]"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                            aria-expanded={!isCollapsed}
                        >
                            <Menu size={20} aria-hidden="true" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <NavList
                        pathname={pathname}
                        openMenus={openMenus}
                        isCollapsed={isCollapsed}
                        canSee={canSee}
                        toggleMenu={toggleMenu}
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

                        {/* Navigation — reuses the same NavList component */}
                        <NavList
                            pathname={pathname}
                            openMenus={openMenus}
                            canSee={canSee}
                            toggleMenu={toggleMenu}
                            onLinkClick={() => setIsMobileOpen(false)}
                        />

                        {/* User Footer */}
                        <UserFooter user={user} />
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
