"use client";

import React, { createContext, useContext, useCallback } from "react";
import { toast } from "sonner";

type NotificationType = "success" | "error" | "info";

interface NotificationContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
    dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification() {
    const ctx = useContext(NotificationContext);
    if (!ctx) throw new Error("useNotification must be used within NotificationProvider");
    return ctx;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const showSuccess = useCallback((message: string) => {
        toast.success(message);
    }, []);

    const showError = useCallback((message: string) => {
        toast.error(message);
    }, []);

    const showInfo = useCallback((message: string) => {
        toast(message);
    }, []);

    const dismiss = useCallback((id: string) => {
        toast.dismiss(id);
    }, []);

    return (
        <NotificationContext.Provider value={{ showSuccess, showError, showInfo, dismiss }}>
            {children}
        </NotificationContext.Provider>
    );
}
