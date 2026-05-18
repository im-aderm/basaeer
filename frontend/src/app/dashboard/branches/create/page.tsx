"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BranchService } from "@/services/branchService";
import { UserService, User } from "@/services/userService";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save, Building2, MapPin, Phone, Mail, Hash, Image, Palette, UserCog, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateBranchPage() {
    const router = useRouter();
    const { refreshBranches, switchBranch } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [existingUsers, setExistingUsers] = useState<User[]>([]);
    const [adminMode, setAdminMode] = useState<"select" | "create">("select");
    const [formData, setFormData] = useState({
        name: "",
        code: "",
        address: "",
        phone: "",
        email: "",
        logoUrl: "",
        primaryColor: "#2563EB",
        adminUserId: "",
        adminEmail: "",
        adminFirstName: "",
        adminLastName: "",
        adminPassword: "",
        adminPhone: "",
    });

    useEffect(() => {
        UserService.getAll().then(setExistingUsers).catch(() => {});
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload: any = {
                name: formData.name,
                code: formData.code,
                address: formData.address,
                phone: formData.phone,
                email: formData.email,
                logoUrl: formData.logoUrl,
                primaryColor: formData.primaryColor,
            };
            if (adminMode === "select" && formData.adminUserId) {
                payload.adminUserId = formData.adminUserId;
            } else if (adminMode === "create") {
                payload.createAdminUser = {
                    email: formData.adminEmail,
                    firstName: formData.adminFirstName,
                    lastName: formData.adminLastName,
                    password: formData.adminPassword || undefined,
                    phone: formData.adminPhone || undefined,
                };
            }
            const res = await BranchService.create(payload);
            // Refresh branch list and auto-select the new branch
            await refreshBranches();
            if (res?.id) {
                await switchBranch(res.id);
            }
            toast.success(`Branch "${formData.name}" created successfully`);
            router.push("/dashboard");
        } catch (error: any) {
            const msg = error.response?.data?.message || "Check for duplicate code.";
            toast.error("Failed to create branch. " + msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/dashboard/branches"
                        className="p-2 hover:bg-card border border-transparent hover:border-border rounded-xl transition-all text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-h1 font-bold tracking-tight text-primary">Create New Branch</h1>
                        <p className="text-muted-foreground text-sm">Add a new campus and assign its administrator.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white/75 border border-border rounded-2xl shadow-sm overflow-hidden">
                <form onSubmit={handleSubmit} className="divide-y divide-border">
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Building2 size={16} className="text-primary" /> Branch Name
                                </label>
                                <input
                                    name="name" required value={formData.name} onChange={handleChange}
                                    placeholder="e.g. Lagos City Campus"
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Hash size={16} className="text-primary" /> Branch Code
                                </label>
                                <input
                                    name="code" required value={formData.code} onChange={handleChange}
                                    placeholder="e.g. LCC-01"
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Phone size={16} className="text-primary" /> Phone Number
                                </label>
                                <input
                                    name="phone" value={formData.phone} onChange={handleChange}
                                    placeholder="+234 ..."
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold flex items-center gap-2">
                                    <Mail size={16} className="text-primary" /> Official Email
                                </label>
                                <input
                                    name="email" type="email" value={formData.email} onChange={handleChange}
                                    placeholder="branch@basaer.com"
                                    className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 pt-2">
                            <label className="text-sm font-semibold flex items-center gap-2">
                                <MapPin size={16} className="text-primary" /> Physical Address
                            </label>
                            <textarea
                                name="address" rows={3} value={formData.address} onChange={handleChange}
                                placeholder="Enter the full physical address..."
                                className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                            />
                        </div>

                        <div className="pt-6 border-t border-border">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">Branch Branding</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Image size={16} className="text-primary" /> Logo URL
                                    </label>
                                    <input
                                        name="logoUrl" value={formData.logoUrl} onChange={handleChange}
                                        placeholder="https://example.com/logo.png"
                                        className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2">
                                        <Palette size={16} className="text-primary" /> Primary Color
                                    </label>
                                    <div className="flex gap-3">
                                        <input
                                            type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange}
                                            className="w-14 h-12 p-1 bg-white border border-primary/90 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            name="primaryColor" value={formData.primaryColor} onChange={handleChange}
                                            placeholder="#2563EB"
                                            className="flex-1 p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Assignment */}
                        <div className="pt-6 border-t border-border">
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                                <UserCog size={16} /> Branch Administrator
                            </h3>
                            <p className="text-xs text-muted-foreground mb-4">Assign a branch admin to manage this campus.</p>

                            <div className="flex gap-2 mb-6 bg-muted/50 p-1.5 rounded-2xl w-fit border border-border/50">
                                <button
                                    type="button" onClick={() => setAdminMode("select")}
                                    className={clsx("px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                                        adminMode === "select" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                                    )}
                                ><Users size={14} /> Select Existing</button>
                                <button
                                    type="button" onClick={() => setAdminMode("create")}
                                    className={clsx("px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2",
                                        adminMode === "create" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                                    )}
                                ><UserCog size={14} /> Create New</button>
                            </div>

                            {adminMode === "select" ? (
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold">Select Administrator</label>
                                    <select
                                        name="adminUserId"
                                        value={formData.adminUserId}
                                        onChange={handleChange as any}
                                        className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                    >
                                        <option value="">-- Choose an admin --</option>
                                        {existingUsers.map(u => (
                                            <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-[11px] text-muted-foreground">Existing users with available admin privileges.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">First Name</label>
                                        <input
                                            name="adminFirstName" required value={formData.adminFirstName} onChange={handleChange}
                                            placeholder="Admin first name"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Last Name</label>
                                        <input
                                            name="adminLastName" required value={formData.adminLastName} onChange={handleChange}
                                            placeholder="Admin last name"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Email</label>
                                        <input
                                            name="adminEmail" type="email" required value={formData.adminEmail} onChange={handleChange}
                                            placeholder="admin@branch.com"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Password</label>
                                        <input
                                            name="adminPassword" type="password" value={formData.adminPassword} onChange={handleChange}
                                            placeholder="Leave blank for auto-generated"
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                        <p className="text-[11px] text-muted-foreground">Defaults to Password123! if left blank.</p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold">Phone (optional)</label>
                                        <input
                                            name="adminPhone" value={formData.adminPhone} onChange={handleChange}
                                            placeholder="+234 ..."
                                            className="w-full p-3 bg-white border border-primary/90 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-6 bg-muted/30 flex items-center justify-end gap-3">
                        <Link
                            href="/dashboard/branches"
                            className="px-6 py-2.5 text-sm font-semibold rounded-xl border border-border hover:bg-muted transition-colors"
                        >Cancel</Link>
                        <button
                            type="submit" disabled={submitting}
                            className="flex items-center gap-2 px-8 py-2.5 text-sm font-semibold text-white bg-primary rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
                        >
                            {submitting ? (
                                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                            ) : (
                                <><Save size={18} /> Save Branch</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}