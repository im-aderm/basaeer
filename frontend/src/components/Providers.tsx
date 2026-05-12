"use client";

import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
    return (
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
    );
}
