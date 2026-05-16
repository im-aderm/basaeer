"use client";

import { useState, useEffect } from "react";
import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { RoleService, Role, RolePermission } from "@/services/roleService";
import {
    ShieldCheck,
    Plus,
    Trash2,
    Edit,
    Users,
    Key,
    Loader2,
    Search,
    Check,
    X,
    Save,
    XCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { toast } from "sonner";

const MODULES = [
    "Dashboard", "Core Administration", "Branches", "Academic Sessions",
    "Classes & Sections", "Subjects", "Student Admission", "Student Profile",
    "Student Attendance", "Examination Configuration", "Mark Entry",
    "Academic Reports", "Online Exams", "Student Accounting", "Office Accounting",
    "Human Resource", "Payroll", "Leave Management", "Library", "Hostel",
    "Transport", "Inventory", "Front Office", "Communication (SMS/Email)",
    "Events", "Reporting & Analytics", "System Settings",
];

const ACTIONS = ["CREATE", "READ", "UPDATE", "DELETE"];

export default function RolesPage() {
    const { resolvedBranchId, activeBranchId } = useAuth();
    const allCampuses = isAllCampuses(activeBranchId);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<RolePermission[]>([]);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [tab, setTab] = useState<"overview" | "permissions" | "users">("overview");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({ name: "", slug: "", description: "" });
    const [creating, setCreating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [roleUsers, setRoleUsers] = useState<any[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await RoleService.getAll(allCampuses ? undefined : resolvedBranchId);
            setRoles(data);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, [resolvedBranchId]);

    const selectRole = async (role: Role) => {
        setSelectedRole(role);
        setTab("permissions");
        setPermissionsLoading(true);
        try {
            const [perms, users] = await Promise.all([
                RoleService.getPermissions(role.id),
                RoleService.getUsers(role.id),
            ]);
            setPermissions(perms);
            setRoleUsers(users);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch role details:", error);
        } finally {
            setPermissionsLoading(false);
        }
    };

    const handleTogglePermission = async (module: string, action: string, current: boolean) => {
        if (!selectedRole) return;
        try {
            await RoleService.updatePermission(selectedRole.id, {
                module, action, isAllowed: !current,
            });
            setPermissions(prev =>
                prev.some(p => p.module === module && p.action === action)
                    ? prev.map(p => p.module === module && p.action === action ? { ...p, isAllowed: !current } : p)
                    : [...prev, { id: "", roleId: selectedRole.id, module, action, isAllowed: !current }]
            );
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to update permission:", error);
            toast.error("Failed to update permission");
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            const role = await RoleService.create({
                ...createForm,
                branchId: allCampuses ? undefined : resolvedBranchId,
            });
            setRoles(prev => [...prev, role]);
            setShowCreateModal(false);
            setCreateForm({ name: "", slug: "", description: "" });
            toast.success("Role created successfully");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to create role");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await RoleService.delete(id);
            setRoles(prev => prev.filter(r => r.id !== id));
            if (selectedRole?.id === id) {
                setSelectedRole(null);
                setTab("overview");
            }
            toast.success("Role deleted");
        } catch (error) {
            toast.error("Failed to delete role");
        }
        setShowDeleteConfirm(null);
    };

    const getPermissionStatus = (module: string, action: string) => {
        return permissions.find(p => p.module === module && p.action === action)?.isAllowed || false;
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.slug.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const overviewContent = (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-h1 font-bold tracking-tight text-primary">Roles</h1>
                    <p className="text-muted-foreground mt-1">Create and manage custom roles with granular permissions.</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                    <Plus size={18} /> Create Role
                </button>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <input
                    type="text" placeholder="Search roles..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredRoles.map(role => (
                        <button
                            key={role.id}
                            onClick={() => selectRole(role)}
                            className={clsx(
                                "text-left p-6 bg-white/75 border rounded-2xl hover:shadow-lg hover:shadow-primary/5 transition-all",
                                selectedRole?.id === role.id
                                    ? "border-primary ring-2 ring-primary/20"
                                    : "border-border"
                            )}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className="p-2.5 bg-primary/10 rounded-xl">
                                    <ShieldCheck className="w-5 h-5 text-primary" />
                                </div>
                                {role.isSystem && (
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-lg">System</span>
                                )}
                            </div>
                            <h3 className="font-bold">{role.name}</h3>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{role.description || "No description"}</p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Key size={12} /> {role._count?.permissions || 0} perms</span>
                                <span className="flex items-center gap-1"><Users size={12} /> {role._count?.users || 0} users</span>
                            </div>
                        </button>
                    ))}
                    {filteredRoles.length === 0 && (
                        <div className="col-span-full py-20 text-center text-muted-foreground">No roles found.</div>
                    )}
                </div>
            )}
        </div>
    );

    const permissionsContent = selectedRole && (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-h2 font-bold tracking-tight text-primary">{selectedRole.name}</h2>
                    <p className="text-muted-foreground text-sm">Configure module permissions for this role.</p>
                </div>
                <button
                    onClick={() => { setSelectedRole(null); setTab("overview"); }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <XCircle size={16} /> Back to roles
                </button>
            </div>

            {permissionsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="bg-white/75 border border-border rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-muted/50 border-b border-border">
                                    <th className="px-6 py-4 text-left text-sm font-bold">Module</th>
                                    {ACTIONS.map(a => (
                                        <th key={a} className="px-4 py-4 text-center text-xs font-bold text-muted-foreground uppercase">{a}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {MODULES.map(module => (
                                    <tr key={module} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4 font-semibold text-sm">{module}</td>
                                        {ACTIONS.map(action => {
                                            const allowed = getPermissionStatus(module, action);
                                            return (
                                                <td key={action} className="px-4 py-4 text-center">
                                                    <button
                                                        onClick={() => handleTogglePermission(module, action, allowed)}
                                                        className={clsx(
                                                            "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all",
                                                            allowed
                                                                ? "bg-green-500/10 text-green-600 ring-1 ring-green-600/20"
                                                                : "bg-red-500/10 text-red-600 ring-1 ring-red-600/20",
                                                            "hover:scale-110 active:scale-95"
                                                        )}
                                                    >
                                                        {allowed ? <Check size={16} /> : <X size={16} />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const usersContent = selectedRole && (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-h2 font-bold tracking-tight text-primary">{selectedRole.name} — Users</h2>
                    <p className="text-muted-foreground text-sm">{roleUsers.length} user(s) assigned this role.</p>
                </div>
                <button
                    onClick={() => { setSelectedRole(null); setTab("overview"); }}
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                    <XCircle size={16} /> Back
                </button>
            </div>

            <div className="bg-white/75 border border-border rounded-2xl overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">Email</th>
                            <th className="px-6 py-4 text-left text-sm font-bold">System Role</th>
                            <th className="px-6 py-4 text-right text-sm font-bold">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {roleUsers.map(u => (
                            <tr key={u.id} className="hover:bg-muted/30">
                                <td className="px-6 py-4 font-semibold">{u.firstName} {u.lastName}</td>
                                <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded-lg">{u.role}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={async () => {
                                            await RoleService.removeRole(u.id);
                                            setRoleUsers(prev => prev.filter(x => x.id !== u.id));
                                            toast.success("Role removed from user");
                                        }}
                                        className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 rounded-xl transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {roleUsers.length === 0 && (
                            <tr><td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No users assigned this role.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tab bar */}
            {selectedRole && (
                <div className="flex gap-2 mb-8 bg-muted/50 p-1.5 rounded-2xl w-fit border border-border/50">
                    {(["permissions", "users"] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={clsx(
                                "px-6 py-2.5 rounded-xl font-semibold text-sm transition-all capitalize",
                                tab === t ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {t === "permissions" ? <><Key size={14} className="inline mr-1.5" />Permissions</> : <><Users size={14} className="inline mr-1.5" />Users</>}
                        </button>
                    ))}
                </div>
            )}

            {tab === "overview" && overviewContent}
            {tab === "permissions" && permissionsContent}
            {tab === "users" && usersContent}

            {/* Create Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white/95 w-full max-w-lg rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 duration-200">
                        <form onSubmit={handleCreate} className="p-8 space-y-6">
                            <div>
                                <h3 className="text-2xl font-bold">Create New Role</h3>
                                <p className="text-muted-foreground text-sm mt-1">Define a new role with custom permissions.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Role Name</label>
                                <input
                                    required
                                    placeholder="e.g. Vice Principal Academics"
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={createForm.name} onChange={e => setCreateForm({ ...createForm, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Slug</label>
                                <input
                                    required
                                    placeholder="e.g. vice-principal-academics"
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={createForm.slug} onChange={e => setCreateForm({ ...createForm, slug: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold">Description</label>
                                <textarea
                                    rows={3}
                                    placeholder="What this role can do..."
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                    value={createForm.description} onChange={e => setCreateForm({ ...createForm, description: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button" onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
                                >Cancel</button>
                                <button
                                    type="submit" disabled={creating}
                                    className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 transition-all disabled:opacity-50"
                                >
                                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white/95 w-full max-w-md rounded-3xl border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold">Delete Role?</h3>
                        <p className="text-muted-foreground text-sm mt-2">This will unlink all users from this role. System roles cannot be deleted.</p>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <button onClick={() => setShowDeleteConfirm(null)} className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors">Cancel</button>
                            <button onClick={() => handleDelete(showDeleteConfirm)} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all">Delete</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}