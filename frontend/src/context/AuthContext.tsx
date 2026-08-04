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
const SESSION_KEY = "basaer-active-session";
const ALL_CAMPUSES = "__all__";

export function isAllCampuses(branchId: string | null | undefined): boolean {
    return branchId === ALL_CAMPUSES;
}

interface AcademicSession {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: "UPCOMING" | "CURRENT" | "COMPLETED";
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    activeBranchId: string | null;
    activeSessionId: string | null;
    resolvedBranchId: string | undefined;
    resolvedSessionId: string | undefined;
    isAllCampusesMode: boolean;
    isAllSessionsMode: boolean;
    availableBranches: AuthBranch[];
    availableSessions: AcademicSession[];
    refreshKey: number;
    switchBranch: (branchId: string | null) => Promise<void>;
    switchSession: (sessionId: string | null) => Promise<void>;
    refreshSessions: () => Promise<void>;
    refreshBranches: () => Promise<void>;
    login: (userData: User) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    activeBranchId: null,
    activeSessionId: null,
    resolvedBranchId: undefined,
    resolvedSessionId: undefined,
    isAllCampusesMode: false,
    isAllSessionsMode: false,
    availableBranches: [],
    availableSessions: [],
    refreshKey: 0,
    switchBranch: async () => {},
    switchSession: async () => {},
    refreshSessions: async () => {},
    refreshBranches: async () => {},
    login: async () => {},
    logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableBranches, setAvailableBranches] = useState<AuthBranch[]>([]);
    const [availableSessions, setAvailableSessions] = useState<AcademicSession[]>([]);
    const [activeBranchId, setActiveBranchId] = useState<string | null>(null);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const router = useRouter();

    // Load branches for SUPER_ADMIN and default to All Campuses when none saved.
    // Also handles validating a saved branch against the fresh list.
    const loadBranchesForSuperAdmin = useCallback(async (): Promise<AuthBranch[]> => {
        try {
            const branches = await api.get("/branches");
            const branchList = branches.data || [];
            setAvailableBranches(branchList);

            const savedBranch = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
            const branchIds = new Set(branchList.map((b: AuthBranch) => b.id));

            if (savedBranch && savedBranch !== ALL_CAMPUSES && !branchIds.has(savedBranch)) {
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(SESSION_KEY);
                setActiveBranchId(ALL_CAMPUSES);
                setActiveSessionId(null);
                setApiBranchContext(null);
            } else if (!savedBranch || savedBranch === ALL_CAMPUSES) {
                setActiveBranchId(ALL_CAMPUSES);
                setApiBranchContext(null);
            } else {
                setActiveBranchId(savedBranch);
                setApiBranchContext(savedBranch);
            }
            return branchList;
        } catch {
            return [];
        }
    }, []);

    // Restore saved branch and session on mount
    useEffect(() => {
        const savedBranch = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
        const savedSession = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
        if (savedBranch) {
            setActiveBranchId(savedBranch);
            if (savedBranch !== ALL_CAMPUSES) {
                setApiBranchContext(savedBranch);
            }
        }
        if (savedSession) {
            setActiveSessionId(savedSession);
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

    // Persist activeSessionId to localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (activeSessionId) {
                localStorage.setItem(SESSION_KEY, activeSessionId);
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    }, [activeSessionId]);

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
                if (res.data.role === "SUPER_ADMIN") {
                    await loadBranchesForSuperAdmin();
                } else if (res.data.branchId) {
                    setAvailableBranches([{
                        id: res.data.branchId,
                        name: res.data.branding?.name || 'My Branch',
                        code: '',
                    }]);
                }
            } catch (error) {
                try { await api.post("/auth/logout"); } catch {}
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkAuth();
    }, []);

    // Fetch sessions whenever activeBranchId is resolved
    useEffect(() => {
        if (!user) return;
        const branchId = user.role === "SUPER_ADMIN" ? activeBranchId : user.branchId;
        if (!branchId || branchId === ALL_CAMPUSES) {
            setAvailableSessions([]);
            return;
        }
        const fetchSessions = async () => {
            try {
                const sessions = await api.get(`/academic-sessions?branchId=${branchId}`);
                setAvailableSessions(sessions.data || []);
            } catch {
                setAvailableSessions([]);
            }
        };
        fetchSessions();
    }, [activeBranchId, user]);

    const switchBranch = useCallback(async (branchId: string | null) => {
        if (branchId && branchId !== ALL_CAMPUSES) {
            try {
                await api.post("/auth/select-branch", { branchId });
            } catch (error) {
                console.error("Failed to set branch context", error);
            }
            // Fetch sessions for the new branch
            try {
                const sessions = await api.get(`/academic-sessions?branchId=${branchId}`);
                setAvailableSessions(sessions.data || []);
            } catch {
                setAvailableSessions([]);
            }
        } else {
            setAvailableSessions([]);
        }
        // Clear session when branch changes
        setActiveSessionId(null);
        const effectiveId = branchId || ALL_CAMPUSES;
        setActiveBranchId(effectiveId);
        setApiBranchContext(branchId); // null for All Campuses — no branchId in API calls
        setRefreshKey((k) => k + 1);
    }, []);

    const switchSession = useCallback(async (sessionId: string | null) => {
        if (sessionId) {
            try {
                await api.post("/auth/select-session", { sessionId });
            } catch (error) {
                console.error("Failed to set session context", error);
            }
        }
        setActiveSessionId(sessionId);
        setRefreshKey((k) => k + 1);
    }, []);

    const refreshSessions = useCallback(async () => {
        if (!user) return;
        const branchId = user.role === "SUPER_ADMIN" ? activeBranchId : user.branchId;
        if (!branchId || branchId === ALL_CAMPUSES) {
            setAvailableSessions([]);
            return;
        }
        try {
            const sessions = await api.get(`/academic-sessions?branchId=${branchId}`);
            setAvailableSessions(sessions.data || []);
        } catch {
            setAvailableSessions([]);
        }
    }, [activeBranchId, user]);

    const refreshBranches = useCallback(async () => {
        try {
            const branches = await api.get("/branches");
            setAvailableBranches(branches.data || []);
        } catch {
            // keep existing list on failure
        }
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
            if (res.data.role === "SUPER_ADMIN") {
                await loadBranchesForSuperAdmin();
            }
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

    const resolvedSessionId = activeSessionId || undefined;

    const isAllCampusesMode = user?.role === "SUPER_ADMIN" && activeBranchId === ALL_CAMPUSES;
    const isAllSessionsMode = !activeSessionId;

    const contextValue = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        loading,
        activeBranchId,
        activeSessionId,
        resolvedBranchId,
        resolvedSessionId,
        isAllCampusesMode,
        isAllSessionsMode,
        availableBranches,
        availableSessions,
        refreshKey,
        switchBranch,
        switchSession,
        refreshSessions,
        refreshBranches,
        login,
        logout,
    }), [user, loading, activeBranchId, activeSessionId, resolvedBranchId, resolvedSessionId, isAllCampusesMode, isAllSessionsMode, availableBranches, availableSessions, refreshKey, switchBranch, switchSession, refreshSessions, refreshBranches]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);

// Focused selectors to prevent cascading re-renders from the god context
export function useCurrentUser() {
    const { user, isAuthenticated, loading, login, logout } = useAuth();
    return useMemo(() => ({ user, isAuthenticated, loading, login, logout }), [user, isAuthenticated, loading, login, logout]);
}

export function useBranchSelection() {
    const { activeBranchId, resolvedBranchId, isAllCampusesMode, availableBranches, switchBranch } = useAuth();
    return useMemo(() => ({ activeBranchId, resolvedBranchId, isAllCampusesMode, availableBranches, switchBranch }), [activeBranchId, resolvedBranchId, isAllCampusesMode, availableBranches, switchBranch]);
}

export function useSessionSelection() {
    const { activeSessionId, resolvedSessionId, isAllSessionsMode, availableSessions, switchSession, refreshSessions } = useAuth();
    return useMemo(() => ({ activeSessionId, resolvedSessionId, isAllSessionsMode, availableSessions, switchSession, refreshSessions }), [activeSessionId, resolvedSessionId, isAllSessionsMode, availableSessions, switchSession, refreshSessions]);
}

export function useContextRefreshKey() {
    const { refreshKey } = useAuth();
    return refreshKey;
}
