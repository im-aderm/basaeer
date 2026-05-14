"use client";

import { useCallback, useRef } from "react";
import { useRealtimeEvent } from "./useRealtime";

/**
 * Hook that triggers a refresh callback whenever a real-time
 * dashboard event is received (payment, attendance, new student, etc.)
 */
export function useRealtimeDashboard(onRefresh: () => void) {
  const onRefreshStable = useRef(onRefresh);
  onRefreshStable.current = onRefresh;

  const handler = useCallback(() => {
    onRefreshStable.current();
  }, []);

  useRealtimeEvent("dashboard.refresh", handler);
}
