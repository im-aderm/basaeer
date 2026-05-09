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
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => void;
}

// ── Context ────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    login: async () => { },
    logout: () => { },
});

// ── Provider ───────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // On mount: validate the session via API utilizing the automatic httpOnly cookie
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const storedToken = localStorage.getItem("access_token");
                setToken(storedToken);

                const res = await api.get<User>("/auth/profile");
                setUser(res.data);
            } catch (error) {
                // If it fails, there is no valid cookie session
                setUser(null);
                setToken(null);
                localStorage.removeItem("access_token");
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    /**
     * Called after a successful login API response.
     */
    const login = async (userData: User, accessToken: string): Promise<void> => {
        // Set initial data immediately for fast UI response
        setUser(userData);
        setToken(accessToken);
        localStorage.setItem("access_token", accessToken);

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
            setToken(null);
            localStorage.removeItem("access_token");
            router.push("/login");
        }
    };

    const contextValue = useMemo(() => ({
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        logout
    }), [user, token, loading]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
