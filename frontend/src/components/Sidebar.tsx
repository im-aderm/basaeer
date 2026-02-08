"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
    LayoutDashboard,
    Box,
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
    ShieldAlert,
    Bus,
    Clock,
    QrCode,
    Library,
    Calendar,
    MessageSquare,
    Coins,
    Building2,
    FileBarChart,
    Award,
    Settings,
    ChevronDown,
    ChevronRight,
    Search,
    Menu,
    X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NavItem {
    title: string;
    icon: React.ElementType;
    href?: string;
    roles?: string[];
    children?: {
        title: string;
        href: string;
        roles?: string[];
    }[];
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
            { title: "Create Admission", href: "/dashboard/students/admission" },
            { title: "Admission Management", href: "/dashboard/students/admission/manage" },
            { title: "Online Admission", href: "/dashboard/students/online" },
            { title: "Multi Class", href: "/dashboard/students/multi-class" },
            { title: "Multiple Import", href: "/dashboard/students/import" },
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
            { title: "Generate Student", href: "/dashboard/certificates/generate-student" },
        ],
    },
    {
        title: "Human Resource",
        icon: Users,
        children: [
            { title: "Payroll", href: "/dashboard/hr/payroll" },
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
            { title: "Student", href: "/dashboard/attendance/student" },
            { title: "Subject Wise", href: "/dashboard/attendance/subject" },
            { title: "Employee", href: "/dashboard/attendance/employee" },
            { title: "Exam", href: "/dashboard/attendance/exam" },
        ],
    },
    {
        title: "QR Attendance",
        icon: QrCode,
        children: [
            { title: "Attendance", href: "/dashboard/qr-attendance" },
            { title: "Settings", href: "/dashboard/qr-attendance/settings" },
            { title: "Submission Settings", href: "/dashboard/qr-attendance/submissions" },
            { title: "Reports", href: "/dashboard/qr-attendance/reports" },
        ],
    },
    {
        title: "Library",
        icon: Library,
        children: [
            { title: "Books", href: "/dashboard/library/books" },
            { title: "Books Category", href: "/dashboard/library/category" },
            { title: "My Issued Book", href: "/dashboard/library/issued" },
            { title: "Book Issue / Return", href: "/dashboard/library/manage" },
        ],
    },
    {
        title: "Events",
        icon: Calendar,
        children: [
            { title: "Event Type", href: "/dashboard/events/type" },
            { title: "Events", href: "/dashboard/events" },
        ],
    },
    {
        title: "Bulk SMS & Email",
        icon: MessageSquare,
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
        title: "Library Management",
        icon: Library,
        children: [
            { title: "Library Overview", href: "/dashboard/library" },
            { title: "Book Catalog", href: "/dashboard/library/books" },
            { title: "Borrowing History", href: "/dashboard/library/borrowing" },
        ],
    },
    {
        title: "Reports",
        icon: FileBarChart,
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
        children: [
            { title: "Manage Alumni", href: "/dashboard/alumni" },
            { title: "Alumni Events", href: "/dashboard/alumni/events" },
        ],
    },
    {
        title: "My Portal",
        icon: UserCheck,
        roles: ["STUDENT"],
        children: [
            { title: "My Certificates", href: "/dashboard/student/certificates" },
        ],
    },
    {
        title: "Settings",
        icon: Settings,
        children: [
            { title: "General Settings", href: "/dashboard/settings/general" },
            { title: "Role Permission", href: "/dashboard/settings/permissions" },
            { title: "Session Settings", href: "/dashboard/settings/sessions" },
            { title: "Translations", href: "/dashboard/settings/translations" },
            { title: "Cron Job", href: "/dashboard/settings/cron" },
            { title: "Modules", href: "/dashboard/settings/modules" },
            { title: "System Student Field", href: "/dashboard/settings/student-fields" },
            { title: "Custom Field", href: "/dashboard/settings/custom-fields" },
            { title: "Backup Management", href: "/dashboard/settings/backups" },
            { title: "System Update", href: "/dashboard/settings/update" },
            { title: "User Login Log", href: "/dashboard/settings/login-log" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [openMenus, setOpenMenus] = useState<string[]>([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Initial state: open parent menu if child is active
    useEffect(() => {
        navigation.forEach((item) => {
            if (item.children?.some(child => pathname === child.href)) {
                if (!openMenus.includes(item.title)) {
                    setOpenMenus(prev => [...prev, item.title]);
                }
            }
        });
    }, [pathname]);

    const toggleMenu = (title: string) => {
        if (isCollapsed) setIsCollapsed(false);
        setOpenMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        );
    };

    const isChildActive = (item: NavItem) => {
        return item.children?.some(child => pathname === child.href);
    };

    const isBaseActive = (item: NavItem) => {
        if (item.href) return pathname === item.href;
        return isChildActive(item);
    };

    const canSee = (item: NavItem | { roles?: string[] }) => {
        if (!item.roles) return true;
        if (!user) return false;
        return item.roles.includes(user.role);
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col fixed inset-y-0 left-0 transition-all duration-300 z-50",
                isCollapsed ? "w-20" : "w-72"
            )}>
                <div className="flex flex-col h-full bg-card border-r border-border shadow-sm overflow-hidden select-none">
                    {/* Header */}
                    <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                        <div className={cn("flex items-center gap-3 transition-opacity duration-300", isCollapsed && "opacity-0 invisible w-0")}>
                            <div className="bg-primary/10 p-2 rounded-xl">
                                <GraduationCap className="text-primary" size={24} />
                            </div>
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                Basaeer
                            </span>
                        </div>
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
                        >
                            <Menu size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll py-4 px-3 space-y-1">
                        {navigation.filter(item => canSee(item)).map((item) => {
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
                                                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                isCollapsed && "justify-center px-2"
                                            )}
                                        >
                                            <item.icon className={cn("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} size={20} />
                                            {!isCollapsed && (
                                                <>
                                                    <span className="ml-3 text-sm font-medium flex-1 text-left">{item.title}</span>
                                                    {isOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <Link
                                            href={item.href || "#"}
                                            className={cn(
                                                "flex items-center group px-3 py-2.5 rounded-xl transition-all duration-200",
                                                isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                                isCollapsed && "justify-center px-2"
                                            )}
                                        >
                                            <item.icon className={cn("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} size={20} />
                                            {!isCollapsed && (
                                                <span className="ml-3 text-sm font-medium">{item.title}</span>
                                            )}
                                        </Link>
                                    )}

                                    {/* Dropdown Children */}
                                    {hasChildren && isOpen && !isCollapsed && (
                                        <div className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                            {item.children?.filter(child => canSee(child)).map((child) => (
                                                <Link
                                                    key={child.href}
                                                    href={child.href}
                                                    className={cn(
                                                        "block py-2 px-3 text-sm rounded-lg transition-colors",
                                                        pathname === child.href
                                                            ? "text-primary font-semibold bg-primary/5"
                                                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                    )}
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

                    {/* Footer / User Profile */}
                    <div className="p-4 border-t border-border shrink-0">
                        <div className={cn("flex items-center gap-3 transition-all duration-300", isCollapsed && "justify-center px-0")}>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-primary/20">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user?.role?.replace('_', ' ')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Header & Sidebar */}
            <div className="md:hidden flex items-center justify-between h-16 px-4 bg-card border-b border-border fixed top-0 w-full z-40">
                <div className="flex items-center gap-2">
                    <GraduationCap className="text-primary" size={24} />
                    <span className="font-bold">Basaeer</span>
                </div>
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 hover:bg-muted rounded-lg"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div className="fixed inset-0 z-[60] md:hidden">
                    <div
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in"
                        onClick={() => setIsMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 w-72 bg-card shadow-2xl animate-in slide-in-from-left duration-300">
                        <div className="absolute top-4 right-4 z-10">
                            <button onClick={() => setIsMobileOpen(false)} className="p-2 hover:bg-muted rounded-lg">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex flex-col h-full bg-card border-r border-border shadow-sm overflow-hidden select-none">
                            {/* Header */}
                            <div className="h-16 flex items-center justify-between px-4 border-b border-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="bg-primary/10 p-2 rounded-xl">
                                        <GraduationCap className="text-primary" size={24} />
                                    </div>
                                    <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                                        Basaeer
                                    </span>
                                </div>
                            </div>

                            {/* Navigation */}
                            <div className="flex-1 overflow-y-auto overflow-x-hidden sidebar-scroll py-4 px-3 space-y-1">
                                {navigation.filter(item => canSee(item)).map((item) => {
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
                                                        isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                >
                                                    <item.icon className={cn("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} size={20} />
                                                    <span className="ml-3 text-sm font-medium flex-1 text-left">{item.title}</span>
                                                    {isOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />}
                                                </button>
                                            ) : (
                                                <Link
                                                    href={item.href || "#"}
                                                    className={cn(
                                                        "flex items-center group px-3 py-2.5 rounded-xl transition-all duration-200",
                                                        isActive ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                                    )}
                                                >
                                                    <item.icon className={cn("shrink-0 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} size={20} />
                                                    <span className="ml-3 text-sm font-medium">{item.title}</span>
                                                </Link>
                                            )}

                                            {/* Dropdown Children */}
                                            {hasChildren && isOpen && (
                                                <div className="mt-1 ml-4 pl-4 border-l border-border/50 space-y-1 animate-in fade-in slide-in-from-left-2 duration-200">
                                                    {item.children?.filter(child => canSee(child)).map((child) => (
                                                        <Link
                                                            key={child.href}
                                                            href={child.href}
                                                            onClick={() => setIsMobileOpen(false)}
                                                            className={cn(
                                                                "block py-2 px-3 text-sm rounded-lg transition-colors",
                                                                pathname === child.href
                                                                    ? "text-primary font-semibold bg-primary/5"
                                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                                            )}
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

                            {/* Footer / User Profile */}
                            <div className="p-4 border-t border-border shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-primary/20">
                                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{user?.firstName} {user?.lastName}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content Spacer */}
            <div className={cn(
                "hidden md:block transition-all duration-300",
                isCollapsed ? "w-20" : "w-72"
            )} />
        </>
    );
}
