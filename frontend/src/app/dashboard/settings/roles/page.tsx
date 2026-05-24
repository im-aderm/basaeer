"use client";

import RequireBranch from "@/components/RequireBranch";
import BranchContextBanner from "@/components/BranchContextBanner";
import { useState, useEffect } from "react";
import { useAuth, isAllCampuses } from "@/context/AuthContext";
import { RoleService, Role, RolePermission } from "@/services/roleService";
import { UserService, User } from "@/services/userService";
import {
    ShieldCheck,
    Plus,
    Trash2,
    Edit,
    Users,
    UserPlus,
    Key,
    Loader2,
    Search,
    Check,
    X,
    Save,
    XCircle,
    RefreshCcw,
    Lock,
} from "lucide-react";
import { clsx } from "clsx";
import { useNotification } from '@/context/NotificationContext';
import ConfirmDialog from '@/components/ConfirmDialog';
import { TABLE_ROOT, TABLE_HEADER, TABLE_HEADER_CELL_NO_SORT, TABLE_BODY, TABLE_ROW, TABLE_CELL_PRIMARY, TABLE_CELL, TABLE_CELL_ACTIONS, STAT_CARD, STAT_LABEL, STAT_VALUE } from '@/lib/table-styles';

const FALLBACK_MODULES = [
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
    const { resolvedBranchId, activeBranchId, user } = useAuth();
    const { showSuccess, showError } = useNotification();
    const allCampuses = isAllCampuses(activeBranchId);
    const isSuperAdmin = user?.role === "SUPER_ADMIN";
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
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allUsersLoading, setAllUsersLoading] = useState(false);
    const [assignSearch, setAssignSearch] = useState("");
    const [assigning, setAssigning] = useState(false);
    const [modules, setModules] = useState<string[]>([]);
    const [seeding, setSeeding] = useState(false);
    const [confirmSeed, setConfirmSeed] = useState<boolean>(false);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const [data, mods] = await Promise.all([
                RoleService.getAll(allCampuses ? undefined : resolvedBranchId),
                RoleService.getModules().catch(() => [] as string[]),
            ]);
            setRoles(data);
            setModules(mods.length > 0 ? mods : FALLBACK_MODULES);
        } catch (error) {
            if (process.env.NODE_ENV === 'development') console.error("Failed to fetch roles:", error);
        } finally {
            setLoading(false);
        }
    };
    const handleSeed = async () => {
        setConfirmSeed(true);
    };

    const handleConfirmSeed = async () => {
        setSeeding(true);
        try {
            await RoleService.seedPermissions();
            showSuccess("Permissions synced successfully");
            if (selectedRole) {
                const perms = await RoleService.getPermissions(selectedRole.id);
                setPermissions(perms);
            }
        } catch {
            showError("Failed to sync permissions");
        }
        setSeeding(false);
        setConfirmSeed(false);
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
            showError("Failed to update permission");
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
            showSuccess("Role created successfully");
        } catch (error: any) {
            showError(error.response?.data?.message || "Failed to create role");
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
            showSuccess("Role deleted");
        } catch (error) {
            showError("Failed to delete role");
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
                    <h1 className="text-[20px] font-bold tracking-tight text-primary">Roles</h1>
                    <p className="text-foreground/60 mt-1 text-[12px]">Create and manage custom roles with granular permissions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSeed}
                        disabled={seeding}
                        className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl hover:bg-muted transition-all disabled:opacity-50"
                    >
                        {seeding ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
                        Sync Modules
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} /> Create Role
                    </button>
                </div>
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
                                    <span className={clsx(
                                        "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg",
                                        isSuperAdmin ? "text-muted-foreground bg-muted" : "text-primary bg-primary/10"
                                    )}>
                                        {isSuperAdmin ? "System" : "System — Read Only"}
                                    </span>
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
                    <h2 className="text-[20px] font-bold tracking-tight text-primary">{selectedRole.name}</h2>
                    <p className="text-foreground/60 text-[12px]">Configure module permissions for this role.</p>
                    {selectedRole.isSystem && !isSuperAdmin && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1"><ShieldCheck size={12} /> System role — read-only</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {(isSuperAdmin || !selectedRole.isSystem) && (
                        <button
                            onClick={() => setShowDeleteConfirm(selectedRole.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-600 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-all"
                        >
                            <Trash2 size={15} /> Delete
                        </button>
                    )}
                    <button
                        onClick={() => { setSelectedRole(null); setTab("overview"); }}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <XCircle size={16} /> Back to roles
                    </button>
                </div>
            </div>

            {selectedRole.isSystem && isSuperAdmin && (
                <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-xl text-primary shrink-0">
                        <Lock size={20} />
                    </div>
                    <div>
                        <h4 className="font-bold text-primary">System Role — Full Access</h4>
                        <p className="text-sm text-primary/70 mt-1">This is a system role. All permissions are enabled by default. You can still toggle individual permissions to restrict access if needed.</p>
                    </div>
                </div>
            )}

            {permissionsLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
                <div className="bg-white/75 border border-primary/20 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className={TABLE_ROOT}>
                            <thead>
                                <tr className={TABLE_HEADER}>
                                    <th className={TABLE_HEADER_CELL_NO_SORT}>Module</th>
                                    {ACTIONS.map(a => (
                                        <th key={a} className={`${TABLE_HEADER_CELL_NO_SORT} text-center`}>{a}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className={TABLE_BODY}>
                                {modules.map(module => (
                                    <tr key={module} className={TABLE_ROW}>
                                        <td className={TABLE_CELL_PRIMARY}>{module}</td>
                                        {ACTIONS.map(action => {
                                            const allowed = getPermissionStatus(module, action);
                                            return (
                                                        <td key={action} className="px-3 py-1.5 text-center">
                                                            {isSuperAdmin || !selectedRole?.isSystem ? (
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
                                                            ) : (
                                                                <span className={clsx(
                                                                    "inline-flex items-center justify-center w-8 h-8 rounded-lg cursor-not-allowed opacity-70",
                                                                    allowed
                                                                        ? "bg-green-500/10 text-green-600 ring-1 ring-green-600/20"
                                                                        : "bg-red-500/10 text-red-600 ring-1 ring-red-600/20"
                                                                )}>
                                                                    {allowed ? <Check size={16} /> : <X size={16} />}
                                                                </span>
                                                            )}
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
                    <h2 className="text-[20px] font-bold tracking-tight text-primary">{selectedRole.name} — Users</h2>
                    <p className="text-foreground/60 text-[12px]">{roleUsers.length} user(s) assigned this role.</p>
                    {selectedRole.isSystem && !isSuperAdmin && (
                        <p className="text-xs text-primary mt-1 flex items-center gap-1"><ShieldCheck size={12} /> System role — read-only</p>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {(isSuperAdmin || !selectedRole?.isSystem) && (
                        <button
                            onClick={async () => {
                                setAllUsersLoading(true);
                                setShowAssignModal(true);
                                try {
                                    const users = await UserService.getAll();
                                    setAllUsers(users);
                                } catch { }
                                setAllUsersLoading(false);
                            }}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 rounded-xl hover:bg-primary/20 transition-all"
                        >
                            <UserPlus size={15} /> Assign User
                        </button>
                    )}
                    <button
                        onClick={() => { setSelectedRole(null); setTab("overview"); }}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        <XCircle size={16} /> Back
                    </button>
                </div>
            </div>

            <div className="bg-white/75 border border-primary/20 rounded-2xl overflow-hidden">
                <table className={TABLE_ROOT}>
                    <thead>
                        <tr className={TABLE_HEADER}>
                            <th className={TABLE_HEADER_CELL_NO_SORT}>Name</th>
                            <th className={TABLE_HEADER_CELL_NO_SORT}>Email</th>
                            <th className={TABLE_HEADER_CELL_NO_SORT}>System Role</th>
                            <th className={`${TABLE_HEADER_CELL_NO_SORT} text-right`}>Action</th>
                        </tr>
                    </thead>
                    <tbody className={TABLE_BODY}>
                        {roleUsers.map(u => (
                            <tr key={u.id} className={TABLE_ROW}>
                                <td className={TABLE_CELL_PRIMARY}>{u.firstName} {u.lastName}</td>
                                <td className={TABLE_CELL}>{u.email}</td>
                                <td className={TABLE_CELL}>
                                    <span className="text-[12px] font-mono bg-muted px-2 py-1 rounded-lg">{u.role}</span>
                                </td>
                                <td className={TABLE_CELL_ACTIONS}>
                                    {(isSuperAdmin || !selectedRole?.isSystem) && (
                                        <button
                                            onClick={async () => {
                                                await RoleService.removeRole(u.id);
                                                setRoleUsers(prev => prev.filter(x => x.id !== u.id));
                                                showSuccess("Role removed from user");
                                            }}
                                            className="p-2 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 rounded-xl transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {roleUsers.length === 0 && (
                            <tr><td colSpan={4} className="px-3 py-8 text-center text-foreground/60 text-[12px]">No users assigned this role.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <RequireBranch requireSpecificBranch>
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BranchContextBanner />
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

            {/* Assign User Modal */}
            {showAssignModal && selectedRole && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white/95 w-full max-w-lg rounded-3xl border border-border shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-border">
                            <h3 className="text-2xl font-bold">Assign User</h3>
                            <p className="text-muted-foreground text-sm mt-1">Assign <strong>{selectedRole.name}</strong> to a user.</p>
                        </div>
                        <div className="p-6">
                            <div className="relative mb-4">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <input
                                    type="text" placeholder="Search users..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                                    value={assignSearch} onChange={e => setAssignSearch(e.target.value)}
                                />
                            </div>
                            <div className="max-h-72 overflow-y-auto space-y-1">
                                {allUsersLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
                                ) : (
                                    allUsers
                                        .filter(u => {
                                            if (assignSearch) {
                                                const q = assignSearch.toLowerCase();
                                                if (!u.firstName?.toLowerCase().includes(q) && !u.lastName?.toLowerCase().includes(q) && !u.email?.toLowerCase().includes(q)) return false;
                                            }
                                            return !roleUsers.some(ru => ru.id === u.id);
                                        })
                                        .map(u => (
                                            <button
                                                key={u.id}
                                                disabled={assigning}
                                                onClick={async () => {
                                                    setAssigning(true);
                                                    try {
                                                        await RoleService.assignRole(u.id, selectedRole.id);
                                                        setRoleUsers(prev => [...prev, u]);
                                                        setAllUsers(prev => prev.filter(x => x.id !== u.id));
                                                        showSuccess(`${u.firstName} ${u.lastName} assigned ${selectedRole.name}`);
                                                    } catch (e: any) {
                                                        showError(e.response?.data?.message || "Failed to assign role");
                                                    }
                                                    setAssigning(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all text-left"
                                            >
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                                    {u.firstName?.[0]}{u.lastName?.[0]}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{u.firstName} {u.lastName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                </div>
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-muted px-2 py-1 rounded-lg shrink-0">{u.role}</span>
                                            </button>
                                        ))
                                )}
                                {!allUsersLoading && allUsers.filter(u => !roleUsers.some(ru => ru.id === u.id)).length === 0 && (
                                    <p className="text-center py-8 text-muted-foreground text-sm">All users already have this role.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-6 border-t border-border flex justify-end">
                            <button
                                onClick={() => { setShowAssignModal(false); setAssignSearch(""); }}
                                className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
                            >Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    isOpen={!!showDeleteConfirm}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                    onCancel={() => setShowDeleteConfirm(null)}
                    title="Delete Role?"
                    message="This will unlink all users from this role. System roles cannot be deleted."
                    confirmLabel="Delete"
                />
            )}

            {/* Seed Confirmation */}
            {confirmSeed && (
                <ConfirmDialog
                    isOpen={confirmSeed}
                    onConfirm={handleConfirmSeed}
                    onCancel={() => setConfirmSeed(false)}
                    title="Sync Modules"
                    message="This will sync all system role permissions from the legacy permission set. Are you sure?"
                    confirmLabel="Sync"
                />
            )}
            </div>
        </RequireBranch>
    );
}