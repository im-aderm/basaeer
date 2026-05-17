"use client";

import { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import api, { setApiBranchContext } from "@/lib/api";

export interface StudentProfile {
    id: string;
    classId?: string;
    sectionId?: string;
}

export interface StaffProfile {
    id: string;
    departmentId?: string;
    designationId?: string;
}

export interface Branding {
    name: string;
    logoUrl: string | null;
    primaryColor: string;
    address: string;
    phone: string;
    email: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    branchId?: string;
    phone?: string;
    isActive?: boolean;
    mustChangePassword?: boolean;
    branding?: Branding | null;
    student?: StudentProfile;
    staff?: StaffProfile;
}

export interface AuthBranch {
    id: string;
    name: string;
    code: string;
}

const STORAGE_KEY = "basaer-active-branch";
const ALL_CAMPUSES = "__all__";

export function isAllCampuses(branchId: string | null | undefined): boolean {
    return branchId === ALL_CAMPUSES;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    activeBranchId: string | null;
    resolvedBranchId: string | undefined;
    isAllCampusesMode: boolean;
    availableBranches: AuthBranch[];
    switchBranch: (branchId: string | null) => Promise<void>;
    login: (userData: User) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    activeBranchId: null,
    resolvedBranchId: undefined,
    isAllCampusesMode: false,
    availableBranches: [],
    switchBranch: async () => {},
    login: async () => {},
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableBranches, setAvailableBranches] = useState<AuthBranch[]>([]);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
    const router = useRouter();

    // Restore saved branch on mount
    useEffect(() => {
        const saved = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
            setActiveBranchId(saved);
            // "__all__" is a sentinel — don't inject it into API calls
            if (saved !== ALL_CAMPUSES) {
                setApiBranchContext(saved);
            }
        }
    }, []);

    // Persist activeBranchId to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (activeBranchId) {
                localStorage.setItem(STORAGE_KEY, activeBranchId);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        }
    }, [activeBranchId]);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get<User>("/auth/profile");
                setUser(res.data);

                // Non-SA users always use their own branch
                if (res.data.branchId && res.data.role !== "SUPER_ADMIN") {
                    setActiveBranchId(res.data.branchId);
                    setApiBranchContext(res.data.branchId);
                }

                if (res.data.mustChangePassword) {
                    router.push("/dashboard/change-password");
                    return;
                }
                try {
                    const branches = await api.get("/branches");
                    setAvailableBranches(branches.data || []);
                } catch {}
            } catch (error) {
                try { await api.post("/auth/logout"); } catch {}
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    const switchBranch = useCallback(async (branchId: string | null) => {
        if (branchId && branchId !== ALL_CAMPUSES) {
            try {
                await api.post("/auth/select-branch", { branchId });
            } catch (error) {
                console.error("Failed to set branch context", error);
            }
        }
        const effectiveId = branchId || ALL_CAMPUSES;
        setActiveBranchId(effectiveId);
        setApiBranchContext(branchId); // null for All Campuses — no branchId in API calls
        window.location.reload();
    }, []);

    const login = async (userData: User): Promise<void> => {
        setUser(userData);
        try {
            const res = await api.get<User>("/auth/profile");
            if (res.data.mustChangePassword) {
                setUser(res.data);
                router.push("/dashboard/change-password");
                return;
            }
            setUser(res.data);
        } catch {}
        router.push("/dashboard");
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.warn("Backend logout failed softly");
        } finally {
            setUser(null);
            setActiveBranchId(null);
            localStorage.removeItem(STORAGE_KEY);
            router.push("/login");
        }
    };

    // resolvedBranchId is undefined for "All Campuses" mode — backend returns ALL data
    const resolvedBranchId = activeBranchId && activeBranchId !== ALL_CAMPUSES
        ? activeBranchId
        : (user?.branchId || undefined);

    const isAllCampusesMode = user?.role === "SUPER_ADMIN" && activeBranchId === ALL_CAMPUSES;

    const contextValue = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        loading,
        activeBranchId,
        resolvedBranchId,
        isAllCampusesMode,
        availableBranches,
        switchBranch,
        login,
        logout,
    }), [user, loading, activeBranchId, resolvedBranchId, isAllCampusesMode, availableBranches]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
