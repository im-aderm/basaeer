"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const useRealtime = () => {
    const { token, isAuthenticated } = useAuth();
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        if (!isAuthenticated || !token) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            return;
        }

        if (!socketRef.current) {
            socketRef.current = io(`${SOCKET_URL}/realtime`, {
                auth: {
                    token: token,
                },
                transports: ["websocket"],
            });

            socketRef.current.on("connect", () => {
                console.log("Realtime socket connected");
            });

            socketRef.current.on("connect_error", (err) => {
                console.error("Realtime socket connection error:", err.message);
            });
        }

        return () => {
            // We don't necessarily want to disconnect on every re-render
            // but if the component unmounts we might.
            // However, usually we want a single global socket.
        };
    }, [isAuthenticated, token]);

    const emit = (event: string, data: any) => {
        socketRef.current?.emit(event, data);
    };

    const on = (event: string, callback: (data: any) => void) => {
        socketRef.current?.on(event, callback);
        return () => {
            socketRef.current?.off(event, callback);
        };
    };

    return { socket: socketRef.current, emit, on };
};

/**
 * Hook to listen to a specific realtime event
 */
export const useRealtimeEvent = (event: string, callback: (data: any) => void) => {
    const { on, socket } = useRealtime();

    useEffect(() => {
        if (!socket) return;

        const unsubscribe = on(event, callback);
        return () => {
            unsubscribe();
        };
    }, [event, callback, socket, on]);
};
