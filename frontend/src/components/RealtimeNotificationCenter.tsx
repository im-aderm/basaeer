"use client";

import { useEffect, useState, useCallback } from "react";
import { useRealtimeEvent } from "@/hooks/useRealtime";
import { useNotification } from "@/context/NotificationContext";
import { Bell, CreditCard, UserPlus, Bus, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";

interface Notification {
  id: string;
  event: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export function RealtimeNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showInfo } = useNotification();

  const addNotification = useCallback((event: string, title: string, message: string) => {
    const notification: Notification = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      event,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications((prev) => [notification, ...prev].slice(0, 50));
    showInfo(`${title}: ${message}`);
  }, [showInfo]);

  useRealtimeEvent("finance.invoice_created", (data) => {
    addNotification("finance.invoice_created", "Invoice Created", `Invoice ${data.invoiceNumber} generated for student.`);
  });

  useRealtimeEvent("finance.payment_recorded", (data) => {
    addNotification("finance.payment_recorded", "Payment Received", `₦${data.amount} payment recorded via ${data.method}.`);
  });

  useRealtimeEvent("finance.payment_verified", (data) => {
    addNotification("finance.payment_verified", data.approved ? "Payment Approved" : "Payment Rejected", data.approved ? "Payment has been verified." : "Payment was rejected.");
  });

  useRealtimeEvent("hr.leave_applied", (data) => {
    addNotification("hr.leave_applied", "Leave Request", `${data.staffName} requested ${data.type} leave.`);
  });

  useRealtimeEvent("hr.leave_approved", (data) => {
    addNotification("hr.leave_approved", data.approved ? "Leave Approved" : "Leave Rejected", `${data.staffName}'s ${data.type} leave was ${data.approved ? "approved" : "rejected"}.`);
  });

  useRealtimeEvent("hr.payroll_generated", (data) => {
    addNotification("hr.payroll_generated", "Payroll Generated", `Payroll for ${data.month}/${data.year}: ${data.staffCount} staff, ₦${data.totalAmount.toLocaleString()}.`);
  });

  useRealtimeEvent("transport.student_assigned", (data) => {
    addNotification("transport.student_assigned", "Transport Assigned", `${data.studentName} assigned to vehicle route.`);
  });

  useRealtimeEvent("transport.student_removed", (data) => {
    addNotification("transport.student_removed", "Transport Removed", `Student removed from transport assignment.`);
  });

  useRealtimeEvent("attendance.marked", (data) => {
    addNotification("attendance.marked", "Attendance Marked", `${data.studentName} marked ${data.status}.`);
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

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
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }}
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
                <div
                  key={n.id}
                  className={`flex items-start gap-3 border-b px-4 py-3 text-sm transition-colors hover:bg-muted/30 ${n.read ? "opacity-60" : ""}`}
                >
                  <div className="mt-0.5 shrink-0">
                    {n.event.startsWith("finance") ? (
                      <CreditCard className="h-4 w-4 text-primary" />
                    ) : n.event.startsWith("hr") ? (
                      <UserPlus className="h-4 w-4 text-blue-600" />
                    ) : n.event.startsWith("transport") ? (
                      <Bus className="h-4 w-4 text-primary" />
                    ) : n.event.startsWith("attendance") ? (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    ) : (
                      <FileText className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
