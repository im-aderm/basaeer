"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        // Not authenticated — redirect to login
        if (!isAuthenticated) {
            router.push("/login");
            return;
        }

        // Authenticated but role is not permitted — redirect to dashboard root
        if (allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router, user, allowedRoles]);

    // Show spinner while auth state is being resolved
    if (loading) {
        return (
            <div
                className="flex items-center justify-center min-h-screen"
                role="status"
                aria-label="Verifying authentication"
            >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    // Not authenticated — render nothing (redirect is in flight)
    if (!isAuthenticated) {
        return null;
    }

    // Role mismatch — render nothing (redirect is in flight)
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to access this page.</p>
                    <p className="text-sm text-muted-foreground mt-1">Redirecting to dashboard...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
