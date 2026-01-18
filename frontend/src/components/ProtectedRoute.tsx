"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
    const { user, loading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }

        if (!loading && isAuthenticated && allowedRoles && user && !allowedRoles.includes(user.role)) {
            // Redirect to unauthorized or dashboard if role doesn't match
            // For now, push to dashboard (or maybe root?)
            // router.push("/unauthorized"); 
            // But if we are wrapping dashboard, maybe we just don't render?
        }
    }, [isAuthenticated, loading, router, user, allowedRoles]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Unauthorized</h1>
                    <p className="text-muted-foreground">You do not have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
