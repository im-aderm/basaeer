/**
 * Typed realtime event map for the Basaeer platform.
 * Every event namespace enforces typed payloads for socket events.
 */

// ── Attendance Events ─────────────────────────────────────────────────────────
export interface AttendanceMarkedPayload {
  sessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
  studentName: string;
  date: string;
}

export interface AttendanceBulkPayload {
  count: number;
  sessionId: string;
  date: string;
}

// ── Finance Events ────────────────────────────────────────────────────────────
export interface InvoiceCreatedPayload {
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  totalAmount: number;
  dueDate: string;
}

export interface PaymentRecordedPayload {
  paymentId: string;
  invoiceId: string;
  amount: number;
  method: string;
  status: string;
}

export interface InvoiceOverduePayload {
  invoiceId: string;
  invoiceNumber: string;
  studentId: string;
  totalAmount: number;
  daysOverdue: number;
}

// ── Exam / Academic Events ────────────────────────────────────────────────────
export interface ResultComputedPayload {
  sectionId: string;
  sessionId: string;
  term: string;
  studentCount: number;
}

export interface TranscriptGeneratedPayload {
  transcriptId: string;
  studentId: string;
  transcriptNo: string;
}

export interface ResultPublishedPayload {
  sectionId: string;
  sessionId: string;
  term: string;
  studentCount: number;
}

// ── HR Events ─────────────────────────────────────────────────────────────────
export interface LeaveAppliedPayload {
  leaveId: string;
  staffId: string;
  staffName: string;
  type: string;
  startDate: string;
  endDate: string;
}

export interface LeaveApprovedPayload {
  leaveId: string;
  staffId: string;
  staffName: string;
  type: string;
  approved: boolean;
}

export interface PayrollGeneratedPayload {
  month: number;
  year: number;
  staffCount: number;
  totalAmount: number;
}

// ── Transport Events ──────────────────────────────────────────────────────────
export interface TransportAssignedPayload {
  studentId: string;
  studentName: string;
  vehicleId: string;
  routeId: string;
}

export interface TransportRemovedPayload {
  studentId: string;
  vehicleId: string;
}

// ── Automation Events ─────────────────────────────────────────────────────────
export interface AutomationStartedPayload {
  jobId: string;
  jobName: string;
  type: string;
}

export interface AutomationCompletedPayload {
  jobId: string;
  jobName: string;
  type: string;
  result: string;
}

export interface AutomationFailedPayload {
  jobId: string;
  jobName: string;
  type: string;
  error: string;
}

// ── Full Event Map ────────────────────────────────────────────────────────────
export interface RealtimeEventMap {
  // Attendance
  'attendance.marked': AttendanceMarkedPayload;
  'attendance.bulk_synced': AttendanceBulkPayload;
  'attendance.session_locked': { sessionId: string };

  // Finance
  'finance.invoice_created': InvoiceCreatedPayload;
  'finance.payment_recorded': PaymentRecordedPayload;
  'finance.payment_verified': {
    paymentId: string;
    invoiceId: string;
    approved: boolean;
  };
  'finance.invoice_overdue': InvoiceOverduePayload;

  // Academic
  'academic.result_computed': ResultComputedPayload;
  'academic.transcript_generated': TranscriptGeneratedPayload;
  'academic.result_published': ResultPublishedPayload;

  // HR
  'hr.leave_applied': LeaveAppliedPayload;
  'hr.leave_approved': LeaveApprovedPayload;
  'hr.payroll_generated': PayrollGeneratedPayload;

  // Transport
  'transport.student_assigned': TransportAssignedPayload;
  'transport.student_removed': TransportRemovedPayload;

  // Automation
  'automation.started': AutomationStartedPayload;
  'automation.completed': AutomationCompletedPayload;
  'automation.failed': AutomationFailedPayload;

  // Notifications
  'notification.new': { notificationId: string; userId: string; title: string };
}
