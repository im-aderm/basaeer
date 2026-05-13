# Basaeer: Full Development & Remediation Guide
**Date:** May 13, 2026  
**Status:** Post-Audit Implementation Phase  

This guide provides a comprehensive roadmap for hardening, scaling, and finalizing the Basaeer platform for production.

---

## 🛑 Phase 1: Security Hardening & Authentication
**Goal:** Eliminate high-risk credentials and secure data entry points.

### 1.1 Secure Bulk Student Imports
*   **What to do:** Remove the hardcoded fallback password `'ChangeMe123!'`.
*   **How to do it:** 
    1.  Import `crypto` in `backend/src/students/students.service.ts`.
    2.  Generate a secure random password: `const tempPassword = crypto.randomBytes(8).toString('hex');`.
    3.  Set `mustChangePassword: true` in the `user.create` call.
    4.  Inject `CommsService` and trigger an email notification to the student with their temporary credentials.
*   **Affected Files:** `backend/src/students/students.service.ts`
*   **Outcome:** Students no longer share a predictable default password. Every student receives a unique, secure entry point.

### 1.2 Enforce Password Reset Workflow
*   **What to do:** Block all authenticated actions if `mustChangePassword` is true.
*   **How to do it:** 
    1.  Update `backend/src/auth/jwt-auth.guard.ts` (or create a dedicated `MustChangePasswordGuard`).
    2.  Check the `user.mustChangePassword` field from the database/token.
    3.  If `true` and the request is NOT to the `/auth/change-password` endpoint, throw a `403 Forbidden` with a custom error code `PASSWORD_CHANGE_REQUIRED`.
*   **Affected Files:** `backend/src/auth/jwt-auth.guard.ts`, `backend/src/auth/auth.service.ts`
*   **Outcome:** Users are physically unable to use the dashboard until they have secured their account.

### 1.3 Strict File Upload Validation
*   **What to do:** Prevent DOS via large file uploads and block malicious file types.
*   **How to do it:** 
    1.  In `StudentsController`, add `ParseFilePipe` to the `import` endpoint.
    2.  Define `MaxFileSizeValidator` (e.g., 5,242,880 bytes for 5MB).
    3.  Define `FileTypeValidator` using a regex for spreadsheets: `/(ms-excel|openxmlformats-officedocument.spreadsheetml.sheet|csv)/`.
*   **Affected Files:** `backend/src/students/students.controller.ts`, `backend/src/upload/upload.controller.ts`
*   **Outcome:** The server is protected against memory exhaustion and "unzip bomb" attacks.

---

## 📈 Phase 2: Scalability & Async Processing
**Goal:** Offload heavy tasks from the main event loop to background workers.

### 2.1 Refactor Imports to BullMQ
*   **What to do:** Move synchronous Excel parsing and DB insertion to a background worker.
*   **How to do it:** 
    1.  Create `backend/src/students/students.processor.ts` using `@Processor('student-import')`.
    2.  The `importStudents` method in the service should now push the file buffer (or S3 path) to the queue: `this.importQueue.add('process', { fileData, context })`.
    3.  Return a `jobId` to the frontend immediately.
*   **Affected Files:** `backend/src/students/students.service.ts`, `backend/src/students/students.module.ts`, `backend/src/students/students.processor.ts`
*   **Outcome:** Large school imports (1000+ students) no longer timeout or block other users from using the API.

### 2.2 Frontend Progress Tracking
*   **What to do:** Show the admin a real-time progress bar for the import.
*   **How to do it:** 
    1.  Implement a `GET /students/import/status/:jobId` endpoint.
    2.  On the frontend `import/page.tsx`, poll this endpoint using TanStack Query until the job is `completed` or `failed`.
*   **Affected Files:** `frontend/src/app/dashboard/students/import/page.tsx`, `backend/src/students/students.controller.ts`
*   **Outcome:** Improved UX for administrators handling large datasets.

---

## 🛠 Phase 3: Data Resilience (Soft Deletes)
**Goal:** Prevent accidental data loss and maintain historical audit trails.

### 3.1 Model Updates
*   **What to do:** Add `deletedAt` timestamps to all critical entities.
*   **How to do it:** 
    1.  Modify `backend/prisma/schema.prisma`.
    2.  Add `deletedAt DateTime?` to `Student`, `User`, `Invoice`, `Payment`, `Staff`.
    3.  Run `npx prisma migrate dev`.
*   **Affected Files:** `backend/prisma/schema.prisma`
*   **Outcome:** Records can be "removed" from the UI while being preserved for financial/academic audits.

### 3.2 Global Query Filter
*   **What to do:** Ensure "deleted" records are hidden by default across all services.
*   **How to do it:** 
    1.  Update `backend/src/prisma/tenant-helper.ts`.
    2.  Modify `applyIsolation` to automatically append `{ deletedAt: null }` to every query filter.
*   **Affected Files:** `backend/src/prisma/tenant-helper.ts`
*   **Outcome:** No code changes needed in individual services; the isolation layer handles data invisibility globally.

---

## 🔌 Phase 4: API Integrity & Mock Removal
**Goal:** Connect remaining UI dashboard views to live production data.

### 4.1 Real Monitoring Endpoints
*   **What to do:** Replace `MOCK_` arrays in the UI with real data from BullMQ and Provider Health logs.
*   **How to do it:** 
    1.  **Queues:** Implement `Queue.getJobCounts()` and `Queue.getMetrics()` in `SettingsService`.
    2.  **Providers:** Query the `ProviderHealthLog` table in Prisma to show actual uptime stats.
    3.  **Bulk Comms:** Query `CampaignRecipient` status to show real success/fail percentages.
*   **Affected Files:** `backend/src/settings/settings.service.ts`, `backend/src/comms/comms.service.ts`
*   **Outcome:** Administrators have an accurate, real-time view of system health.

### 4.2 UI Connector Cleanup
*   **What to do:** Delete all hardcoded mock data constants.
*   **How to do it:** 
    1.  Search for `MOCK_` in the frontend.
    2.  Replace state initializers: `const [data, setData] = useState([])`.
    3.  Use the `useQuery` hook to fetch from the newly created endpoints.
*   **Affected Files:** 
    - `frontend/src/app/dashboard/settings/queues/page.tsx`
    - `frontend/src/app/dashboard/settings/providers/page.tsx`
    - `frontend/src/app/dashboard/bulk-comms/report/page.tsx`
*   **Outcome:** Eliminates "fake" success metrics and ensures production data integrity.

---

## 🔔 Phase 5: Closing Business Logic Loops
**Goal:** Finalize the "Phase 9" TODOs and integration hooks.

### 5.1 Card & Attendance Notifications
*   **What to do:** Trigger real-time notifications to parents when events occur.
*   **How to do it:** 
    1.  In `backend/src/cards/cards.service.ts`, locate the `TODO`.
    2.  Call `this.commsService.sendNotification({ type: 'ID_CARD_READY', userId: student.parentId })`.
    3.  In `AttendanceService`, trigger a push notification/SMS when a student is marked `ABSENT`.
*   **Affected Files:** `backend/src/cards/cards.service.ts`, `backend/src/attendance/attendance.service.ts`
*   **Outcome:** Improved parent engagement and safety monitoring.

---

## ✅ Expected System State After Fixes
1.  **Security:** Zero hardcoded credentials; mandatory secure onboarding for all users.
2.  **Stability:** No "504 Gateway Timeout" errors during bulk operations.
3.  **Trust:** All dashboard metrics (queues, health, finance) represent 100% real production data.
4.  **Auditability:** Every deleted record is recoverable for legal/compliance reasons.
5.  **User Experience:** Faster UI response times and automated notifications for key life-cycle events.

---

## 🧪 Validation Plan
1.  **Security Test:** Attempt to login with `ChangeMe123!` and ensure it fails.
2.  **Load Test:** Upload a 5,000-row student Excel file and verify the system remains responsive.
3.  **Tenant Test:** Verify that a deleted student in Branch A is not visible to Branch A admins but is still present in the DB for SuperAdmins.
4.  **Notification Test:** Generate a student ID and verify a log entry in `MessageDeliveryLog`.
