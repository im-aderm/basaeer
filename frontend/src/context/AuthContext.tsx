"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
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

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User) => Promise<void>;
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

    // On mount: validate the session via API utilizing the automatic httpOnly cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await api.get<User>("/auth/profile");
                setUser(res.data);
                if (res.data.mustChangePassword) {
                    router.push("/dashboard/change-password");
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const login = async (userData: User): Promise<void> => {
        setUser(userData);

        if (userData.mustChangePassword) {
            window.location.href = "/dashboard/change-password";
        } else {
            window.location.href = "/dashboard";
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.warn("Backend logout failed softly");
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    const contextValue = useMemo(() => ({
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout
    }), [user, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
