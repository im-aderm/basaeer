"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────────────────

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

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    branchId?: string;
    phone?: string;
    isActive?: boolean;
    student?: StudentProfile;
    staff?: StaffProfile;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string, userData: User) => Promise<void>;
    logout: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAuthenticated: false,
    loading: true,
    login: async () => { },
    logout: () => { },
});

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On mount: check for existing token and validate it
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await api.get<User>("/auth/profile");
                    setUser(res.data);
                } catch (error) {
                    // Token is invalid or expired — clear it
                    // The 401 interceptor in api.ts also handles this,
                    // but we catch here too for a clean state reset.
                    console.warn("Auth check failed — clearing token");
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    /**
     * Called after a successful login API response.
     * Awaits the full profile fetch before navigating to ensure
     * fresh data is available on the dashboard — eliminating the race condition.
     */
    const login = async (token: string, userData: User): Promise<void> => {
        localStorage.setItem("token", token);
        // Set initial data immediately for fast UI response
        setUser(userData);

        try {
            // Await the full profile to get complete user data (roles, relations, etc.)
            const profileRes = await api.get<User>("/auth/profile");
            setUser(profileRes.data);
        } catch (error) {
            // Profile fetch failed, but we still have the login response data — proceed
            console.warn("Profile enrichment failed, using login response data");
        }

        router.push("/dashboard");
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
