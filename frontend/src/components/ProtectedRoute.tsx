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

        // Middleware handles basic authentication redirect to /login.
        // We only handle role-based authorization here.
        if (isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, loading, router, user, allowedRoles]);

    // If still loading profile data, show a subtle loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
            </div>
        );
    }

    // Role mismatch — render access denied message while redirect is in flight
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center p-8">
                    <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
                    <p className="text-muted-foreground">You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
