"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtimeEvent } from "@/hooks/useRealtime";
import { useNotification } from "@/context/NotificationContext";
import api from "@/lib/api";
import { Bell, CreditCard, UserPlus, Bus, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

export function RealtimeNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showInfo } = useNotification();

  // Persisted notification history (Notification/NotificationPreference),
  // fetched once on mount and appended to in realtime — previously this
  // component was purely in-memory: nothing was fetched on load and
  // "mark as read" never touched the backend, so history vanished on
  // every refresh despite a real, working API already existing for it.
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await api.get<Notification[]>("/notifications");
        setNotifications(response.data);
      } catch {
        // Leave the list empty rather than fabricating placeholder rows.
      }
    };
    fetchNotifications();
  }, []);

  // NotificationsService.createNotification (used by automation.worker.ts's
  // birthday/fee-reminder/attendance-alert dispatchers, among others) pushes
  // this exact event to the recipient over the same realtime channel.
  useRealtimeEvent("notification", (data: Notification) => {
    setNotifications((prev) =>
      prev.some((n) => n.id === data.id) ? prev : [data, ...prev].slice(0, 50),
    );
    showInfo(`${data.title}: ${data.message}`);
  });

  // Live, ephemeral business-event pings — these aren't persisted
  // Notification rows, so they surface as a toast only, not in the history
  // list below (which reflects only what the backend actually stored).
  const pingOnly = useCallback((title: string, message: string) => {
    showInfo(`${title}: ${message}`);
  }, [showInfo]);

  useRealtimeEvent("finance.invoice_created", (data) => {
    pingOnly("Invoice Created", `Invoice ${data.invoiceNumber} generated for student.`);
  });

  useRealtimeEvent("finance.payment_recorded", (data) => {
    pingOnly("Payment Received", `₦${data.amount} payment recorded via ${data.method}.`);
  });

  useRealtimeEvent("finance.payment_verified", (data) => {
    pingOnly(data.approved ? "Payment Approved" : "Payment Rejected", data.approved ? "Payment has been verified." : "Payment was rejected.");
  });

  useRealtimeEvent("hr.leave_applied", (data) => {
    pingOnly("Leave Request", `${data.staffName} requested ${data.type} leave.`);
  });

  useRealtimeEvent("hr.leave_approved", (data) => {
    pingOnly(data.approved ? "Leave Approved" : "Leave Rejected", `${data.staffName}'s ${data.type} leave was ${data.approved ? "approved" : "rejected"}.`);
  });

  useRealtimeEvent("hr.payroll_generated", (data) => {
    pingOnly("Payroll Generated", `Payroll for ${data.month}/${data.year}: ${data.staffCount} staff, ₦${data.totalAmount.toLocaleString()}.`);
  });

  useRealtimeEvent("transport.student_assigned", (data) => {
    pingOnly("Transport Assigned", `${data.studentName} assigned to vehicle route.`);
  });

  useRealtimeEvent("transport.student_removed", () => {
    pingOnly("Transport Removed", `Student removed from transport assignment.`);
  });

  useRealtimeEvent("attendance.marked", (data) => {
    pingOnly("Attendance Marked", `${data.studentName} marked ${data.status}.`);
  });

  const markAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    try {
      await api.patch(`/notifications/${id}/read`);
    } catch {
      // Best-effort — a failed read-receipt isn't worth surfacing to the user.
    }
  };

  const markAllRead = async () => {
    const unread = notifications.filter((n) => !n.isRead);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await Promise.allSettled(unread.map((n) => api.patch(`/notifications/${n.id}/read`)));
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-11 z-50 w-96 rounded-lg border bg-surface-bright shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="text-sm font-semibold">Notifications</h3>
            <button
              onClick={markAllRead}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="mb-2 h-8 w-8 opacity-20" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.isRead && markAsRead(n.id)}
                  className={`flex w-full items-start gap-3 border-b px-4 py-3 text-left text-sm transition-colors hover:bg-muted/30 ${n.isRead ? "opacity-60" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.type.startsWith("FINANCE") || n.type.startsWith("FEE") ? (
                      <CreditCard className="h-4 w-4 text-primary" />
                    ) : n.type.startsWith("HR") ? (
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    ) : n.type.startsWith("TRANSPORT") ? (
                      <Bus className="h-4 w-4 text-primary" />
                    ) : n.type.startsWith("ATTENDANCE") ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
