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
            } catch (error) {
                // If it fails, there is no valid cookie session
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Called after a successful login API response.
     * With cookies, the backend already sent the hidden access_token cookie in the response header.
     */
    const login = async (userData: User): Promise<void> => {
        // Set initial data immediately for fast UI response
        setUser(userData);

        try {
            // Await the full profile to get complete user data (roles, relations, etc.)
            const profileRes = await api.get<User>("/auth/profile");
            setUser(profileRes.data);
        } catch (error) {
            console.warn("Profile enrichment failed, using login response data");
        }

        router.push("/dashboard");
    };

    const logout = async () => {
        try {
            // Immediately flush the cookie securely at the source
            await api.post("/auth/logout");
        } catch (error) {
            console.warn("Backend logout failed softly");
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
