"use client";

import { useState, useEffect } from "react";
import { PermissionService, RolePermission } from "@/services/permissionService";
import {
    ShieldCheck,
    Lock,
    Check,
    X,
    Loader2,
    RefreshCcw,
    Search,
    Filter
} from "lucide-react";
import { clsx } from "clsx";

const ROLES = [
    "SUPER_ADMIN",
    "BRANCH_ADMIN",
    "TEACHER",
    "ACCOUNTANT",
    "HR",
    "LIBRARIAN",
    "HOSTEL_ADMIN",
    "TRANSPORT_OFFICER",
    "STUDENT",
    "PARENT"
];

const ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE"];

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [selectedRole, setSelectedRole] = useState(ROLES[0]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchPermissions();
    }, [selectedRole]);

    const fetchPermissions = async () => {
        setLoading(true);
        try {
            const data = await PermissionService.getAll(selectedRole);
            setPermissions(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch permissions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (module: string, action: string, currentStatus: boolean) => {
        try {
            await PermissionService.update({
                role: selectedRole,
                module,
                action,
                isAllowed: !currentStatus
            });
            // Optimistic update or refetch
            setPermissions(prev => prev.map(p =>
                (p.module === module && p.action === action)
                    ? { ...p, isAllowed: !currentStatus }
                    : p
            ));
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to update permission:", error);
        }
    };

    const handleSeed = async () => {
        if (confirm("This will reset all permissions to default. Are you sure?")) {
            setSeeding(true);
            try {
                await PermissionService.seed();
                fetchPermissions();
            } finally {
                setSeeding(false);
            }
        }
    };

    const uniqueModules = Array.from(new Set((permissions ?? []).map(p => p.module))).sort();
    const filteredModules = uniqueModules.filter(m => m.toLowerCase().includes(searchTerm.toLowerCase()));

    const getPermissionStatus = (module: string, action: string) => {
        return permissions.find(p => p.module === module && p.action === action)?.isAllowed || false;
    };

    if (loading && permissions.length === 0) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Role Permissions</h1>
                    <p className="text-muted-foreground mt-1">Configure access levels for each user role across system modules.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-all disabled:opacity-50"
                    >
                        {seeding ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                        Sync Modules
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar - Roles */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white/75 border border-border rounded-2xl p-4 shadow-sm">
                        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-3 mb-3">Roles</h3>
                        <div className="space-y-1">
                            {ROLES.map((role) => (
                                <button
                                    key={role}
                                    onClick={() => setSelectedRole(role)}
                                    className={clsx(
                                        "w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between group",
                                        selectedRole === role
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <span>{role.replace('_', ' ')}</span>
                                    {selectedRole === role && <ShieldCheck size={16} />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content - Permissions Matrix */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-white/75 border border-border rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search modules..."
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-primary/90 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                <Filter size={14} /> Actions
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 text-left border-b border-border">
                                        <th className="px-6 py-4 text-sm font-bold">Module Name</th>
                                        {ACTIONS.map(action => (
                                            <th key={action} className="px-4 py-4 text-center text-xs font-bold text-muted-foreground">{action}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredModules.map(module => (
                                        <tr key={module} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                                    <span className="font-semibold text-sm">{module}</span>
                                                </div>
                                            </td>
                                            {ACTIONS.map(action => {
                                                const isAllowed = getPermissionStatus(module, action);
                                                const isSuperAdmin = selectedRole === "SUPER_ADMIN";

                                                return (
                                                    <td key={action} className="px-4 py-4 text-center">
                                                        <button
                                                            disabled={isSuperAdmin}
                                                            onClick={() => handleToggle(module, action, isAllowed)}
                                                            className={clsx(
                                                                "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                                                                isAllowed
                                                                    ? "bg-green-500/10 text-green-600 ring-1 ring-green-600/20"
                                                                    : "bg-red-500/10 text-red-600 ring-1 ring-red-600/20",
                                                                isSuperAdmin ? "opacity-50 cursor-not-allowed" : "hover:scale-110 active:scale-95"
                                                            )}
                                                        >
                                                            {isAllowed ? <Check size={16} /> : <X size={16} />}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                    {filteredModules.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                                                No modules found matching your search.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {selectedRole === "SUPER_ADMIN" && (
                        <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                            <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                                <Lock size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-primary">Super Admin Access</h4>
                                <p className="text-sm text-primary/70 mt-1">Super Admin has full access to all modules and actions by default. Individual permissions cannot be disabled for this role to prevent lockout.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
