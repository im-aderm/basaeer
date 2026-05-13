"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/AuthContext";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private refCount = 0;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(): Socket | null {
    this.refCount++;
    if (!this.socket) {
      this.socket = io(`${SOCKET_URL}/realtime`, {
        withCredentials: true,
        transports: ["websocket"],
      });
    }
    return this.socket;
  }

  disconnect(): void {
    this.refCount--;
    if (this.refCount <= 0) {
      this.socket?.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const useRealtime = () => {
    const { isAuthenticated } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const manager = SocketManager.getInstance();

    useEffect(() => {
        if (!isAuthenticated) {
            manager.disconnect();
            socketRef.current = null;
            return;
        }

        socketRef.current = manager.connect();

        return () => {
            manager.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated]);

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