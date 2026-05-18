"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

type NotificationType = "success" | "error" | "info";

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
}

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

let nextId = 0;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const add = useCallback((type: NotificationType, message: string) => {
        const id = `notif-${++nextId}`;
        setNotifications(prev => [...prev, { id, type, message }]);
        if (type === "success") {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 4000);
        }
    }, []);

    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{
            showSuccess: (msg) => add("success", msg),
            showError: (msg) => add("error", msg),
            showInfo: (msg) => add("info", msg),
            dismiss,
        }}>
            {children}
            <NotificationBanner notifications={notifications} onDismiss={dismiss} />
        </NotificationContext.Provider>
    );
}

function NotificationBanner({ notifications, onDismiss }: { notifications: Notification[]; onDismiss: (id: string) => void }) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] w-full max-w-lg space-y-3 px-4">
            {notifications.map((n) => (
                <div
                    key={n.id}
                    className={`flex items-center gap-3 p-4 rounded-2xl border shadow-xl animate-in slide-in-from-top-4 duration-300 ${
                        n.type === "success"
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                            : n.type === "error"
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                    }`}
                >
                    {n.type === "success" ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : n.type === "error" ? (
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    ) : (
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0" />
                    )}
                    <p className="flex-1 text-sm font-semibold">{n.message}</p>
                    <button
                        onClick={() => onDismiss(n.id)}
                        className="p-1 hover:bg-black/5 rounded-lg transition-colors shrink-0"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}
