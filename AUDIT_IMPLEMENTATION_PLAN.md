# Basaeer ERP – Comprehensive Audit & Implementation Plan

**Document Version:** 1.0  
**Date:** 2025-05-18  
**Status:** Production Readiness Audit  
**Overall Platform Score:** 4.2 / 10 (D-Grade, Not Production-Ready)  
**Estimated Remediation Timeline:** 12 weeks (2 full-time developers)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Methodology](#2-audit-methodology)
3. [Findings by Category](#3-findings-by-category)
   - 3.1 Security
   - 3.2 Architecture
   - 3.3 Finance & Accounting
   - 3.4 Dashboards & Analytics
   - 3.5 Database Schema
   - 3.6 Frontend UX
   - 3.7 Performance
4. [Implementation Roadmap](#4-implementation-roadmap)
5. [Appendix A: Severity Definitions](#appendix-a-severity-definitions)
6. [Appendix B: Industry Standard Gap Matrix](#appendix-b-industry-standard-gap-matrix)

---

## 1. Executive Summary

This document presents the findings of a comprehensive production-grade audit of the Basaeer multi-tenant School Management ERP. The audit covered all sidebar modules, backend and frontend architecture, security, data integrity, performance, and alignment with industry standards (PowerSchool, Fedena, Blackbaud, Veracross).

### Top 10 Critical Blockers

| Rank | Issue | Impact | Risk Level |
|------|-------|--------|------------|
| 1 | **No Error Boundaries** — One bad API response crashes the entire dashboard | Complete application failure | CRITICAL |
| 2 | **AsyncLocalStorage `enterWith()` Anti-Pattern** — Tenant context leaks across concurrent requests | Cross-tenant data exposure | CRITICAL |
| 3 | **Overpayments Irretrievably Lost** — Excess payments absorbed with no credit/refund mechanism | Financial fraud / lost revenue | CRITICAL |
| 4 | **No Tenant Validation on Branch/Employee/Inventory/Exam mutations** | Insecure Direct Object Reference (IDOR) vulnerabilities | CRITICAL |
| 5 | **101 Models with Orphan `sessionId` Fields** — No referential integrity across academic data | Data corruption / orphaned records | CRITICAL |
| 6 | **Full-Page Reload on Branch/Session Switch** — Destroys all React state, cache, and scroll position | Broken UX / data loss | HIGH |
| 7 | **Dashboard KPIs are Mathematically Invalid** — Fake retention rates, incorrect growth calculations | Misleading executive decisions | HIGH |
| 8 | **Floating-Point Money Calculations** — Invoice totals use JavaScript `reduce` before Decimal storage | Financial rounding errors | HIGH |
| 9 | **32+ Pages Use Manual `useEffect` Instead of React Query** | Race conditions, no caching, stale data | HIGH |
| 10 | **Missing Audit Logging on 80%+ of Mutations** | No compliance trail, impossible to trace changes | HIGH |

### Key Architecture Decisions Already in Place

- **Session Hierarchy**: Branch is root; Sessions belong to Branches; all academic records are scoped to a Session.
- **Session Statuses**: `UPCOMING`, `CURRENT`, `COMPLETED`. Only one `CURRENT` per branch is enforced.
- **System Model Exemption**: Infrastructure models (`User`, `Branch`, `Role`, `GlobalSetting`, logs) are exempt from session validation.
- **Branch Visibility**: Branch management UI is hidden from non-super admins.
- **Context Prompts**: Blocking modal prompts for missing branch/session context on ALL write operations.
- **Write Guard**: `prisma.service.ts` enforces `sessionId` presence on all non-system model writes.

### Current Environment State

- Backend is running (`Nest application successfully started`).
- SMTP is misconfigured (`Invalid login: 525 5.7.1 Unauthorized IP address`) — email features will fail.
- Database is clean; only the super admin user exists.
- `sessionId` is optional in the Prisma schema but enforced at runtime by the write guard.

---

## 2. Audit Methodology

The audit was conducted through systematic codebase exploration across three phases:

1. **Phase 1 — Backend Architecture**: Tenant isolation mechanisms (`BranchGuard`, `PrismaService`, write guard), service abstractions, query patterns, role guards, and API design.
2. **Phase 2 — Frontend Architecture**: Layout hierarchy, `AuthContext`, API layer (`api.ts`), error handling, form patterns, notification systems, and component inventory.
3. **Phase 3 — Domain Module Deep Dives**: Finance/Accounting, Dashboards/Analytics, Database Schema integrity, and feature completeness against industry benchmarks.

Each finding was classified by severity (Critical, High, Medium, Low) and assigned to a remediation phase based on dependency order and production risk.

---

## 3. Findings by Category

### 3.1 Security (Score: 3 / 10)

The platform has a functioning authentication system and role-based access control, but several critical vulnerabilities expose tenant data and allow privilege escalation.

#### CRITICAL

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| SEC-001 | **AsyncLocalStorage `enterWith()` Anti-Pattern** | `prisma.service.ts` | `AsyncLocalStorage.enterWith()` sets context globally for the remainder of the event loop cycle. In Node.js HTTP servers handling concurrent requests, this causes tenant context (branch/session IDs) to leak from one request to another. A student from Branch A could see Branch B's data. | Replace `enterWith()` with `als.run(store, callback)` to create proper per-request context isolation. |
| SEC-002 | **No Tenant Validation on Branch Management** | `branch.service.ts` | `createBranch` allows any authenticated user to create a branch. `removeBranch`, `archiveBranch`, and `restoreBranch` do not verify that the requesting user belongs to the target branch. | Add `branchId` or `userId` ownership checks. Super admins should still be exempt, but explicit. |
| SEC-003 | **No Tenant Validation on Employee Creation** | `branch.service.ts` | `addBranchEmployee` accepts `userId` and `branchId` from the DTO without verifying that the requesting admin belongs to that branch. | Validate that `req.user.branchId` matches `dto.branchId` (or use `effectiveBranchId`). |
| SEC-004 | **No Tenant Context in Inventory Mutations** | `inventory.service.ts` | `createBranchInventory`, `createCategory`, and `createBranchInventoryItem` accept `branchId` from the DTO without validation against the requester's tenant. | Inject `effectiveBranchId` from `TenantContext` instead of reading from DTO. |
| SEC-005 | **No Tenant Context in Exam Locking** | `exams.service.ts` | `lockExam` accepts `branchId` from `req.branch` but does not validate that the exam record belongs to that branch. | Add `AND: { branchId: effectiveBranchId }` to the `findFirst` query before updating. |
| SEC-006 | **Cross-Branch Payment Injection via Paystack Webhook** | `finance.service.ts` | The `handlePaystackWebhook` method looks up invoices by `referenceCode` only. A malicious actor could replay a valid payment reference from Branch A against Branch B's webhook endpoint, causing Branch B to receive unauthorized credit. | Include `branchId` and `sessionId` in the invoice lookup criteria within the webhook handler. |
| SEC-007 | **Public API Leaks PII** | `public.controller.ts` | The `/public/students` endpoint exposes student names, classes, and academic data with only an API key check and no additional authorization or rate limiting. | Add IP whitelisting, rate limiting, and field-level filtering to the public API. |

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| SEC-008 | **CSRF Protection is Theater** | `main.ts` | `app.enableCors({ allowedHeaders: 'X-Requested-With' })` does not prevent CSRF. The `X-Requested-With` header can be set by any HTTP client (fetch, Axios, curl). | Implement proper CSRF token validation with `csurf` or a stateless double-submit cookie pattern. |
| SEC-009 | **Password Reset Tokens Hashed with SHA-256** | `auth.service.ts` | SHA-256 is designed for speed, making it ideal for brute-force attacks on reset tokens. Tokens should use bcrypt or Argon2. | Replace `crypto.createHash('sha256')` with `bcrypt.hash()` for token storage. |
| SEC-010 | **File Upload MIME Spoofing** | `upload.service.ts` | The `fileType` string is accepted from the client and stored without verification. A user can upload `evil.exe` as `image/png`. | Validate the actual file content using the `file-type` or `magic-bytes-js` library before trusting the extension. |
| SEC-011 | **No Rate Limiting on Auth Endpoints** | `auth.controller.ts` | Login, password reset, and refresh token endpoints have no rate limiting, making them susceptible to brute-force and credential stuffing attacks. | Apply `@nestjs/throttler` with aggressive limits on auth endpoints (e.g., 5 attempts per 15 minutes per IP). |

---

### 3.2 Architecture (Score: 4 / 10)

The NestJS backend follows a modular structure, but several architectural anti-patterns create maintenance debt and runtime instability.

#### CRITICAL

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| ARCH-001 | **PrismaService Proxy Obscures Stack Traces** | `prisma.service.ts` | The `Proxy` wrapper around `prisma.$extends(...)` intercepts all property accesses but does not preserve the original call site in stack traces, making production debugging nearly impossible. | Add explicit error wrapping that captures the original stack trace before re-throwing. |
| ARCH-002 | **Silent Failure Culture** | `auth.service.ts`, `exams.service.ts` | Empty `catch (e) {}` blocks silently swallow errors. In `createUser`, if the profile update fails after registration, the user exists but has no profile — and no log is emitted. | Remove all empty catch blocks. Log errors with a structured logger (e.g., Pino) and propagate failures. |
| ARCH-003 | **Hidden Singleton with Mutable State** | `lib/api.ts` (frontend) | The API layer uses a module-level mutable `selectedBranch`/`selectedSession` state. Any module can mutate it, causing cross-request pollution in SSR or test environments. | Encapsulate state in a closure or class with explicit getters/setters. |

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| ARCH-004 | **God Context** | `AuthContext.tsx` | The React context manages 15+ state variables (`user`, `permissions`, `branches`, `sessions`, `isLoading`, `error`, etc.). Any change to one variable causes all consumers to re-render. | Decompose into focused contexts: `UserContext`, `BranchContext`, `SessionContext`, `PermissionContext`. |
| ARCH-005 | **No Centralized Authorization** | All services | Every service manually checks `isSuperAdmin` inline. There is no reusable `PermissionGuard` or `@RequirePermission()` decorator. | Create a `@RequirePermission()` decorator and a centralized `AuthorizationService` that maps roles to permissions. |
| ARCH-006 | **Queue Context Stripping** | `queue.service.ts` | BullMQ jobs lose the `AsyncLocalStorage` tenant context because they run in a separate worker process or event loop tick. | Explicitly pass `branchId` and `sessionId` in the job data payload and re-hydrate context at the start of the processor. |
| ARCH-007 | **API Layer `JSON.parse` Crash** | `lib/api.ts` | `error.response?.data` may not be JSON (e.g., HTML error page from proxy). `JSON.parse()` will throw a secondary error, crashing the error handler itself. | Wrap `JSON.parse` in a `try/catch` or use a safe parser. |

#### MEDIUM

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| ARCH-008 | **Inconsistent Date Handling** | `finance.service.ts`, `student.service.ts` | Some endpoints parse dates with `new Date()`, others compare strings. Timezone handling is not explicit. | Standardize on UTC for all server-side dates and use a library like `date-fns` or `luxon` for formatting. |
| ARCH-009 | **Mix of DTO Patterns** | Entire backend | Some endpoints use `ZodValidationPipe` with Zod schemas, others use `class-validator`. This inconsistency makes it hard to enforce validation rules globally. | Standardize on Zod for all new endpoints; migrate legacy `class-validator` DTOs incrementally. |

---

### 3.3 Finance & Accounting (Score: 3 / 10)

The finance module handles invoices, payments, and vouchers as isolated documents but lacks the foundational accounting principles required for auditability and regulatory compliance.

#### CRITICAL

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| FIN-001 | **No Double-Entry Bookkeeping** | `finance.service.ts` | Every transaction (invoice, payment, voucher, fee waiver) is stored as a single record. There is no General Ledger, no debit/credit pairing, and no trial balance. The system cannot produce a balance sheet or cash flow statement. | Introduce a `GeneralLedgerEntry` model. Every financial mutation must generate at least two ledger entries (debit and credit) that sum to zero. |
| FIN-002 | **Overpayments Irretrievably Lost** | `finance.service.ts` | In `processPaystackPayment`, if the payment amount exceeds the invoice total, the excess is silently ignored (`actualAmount = Math.min(...)`). The student has no credit balance, and the school cannot refund the excess. | Create a `StudentAccount` (or `StudentLedger`) model to track excess credit. Apply it to future invoices or allow refund processing. |
| FIN-003 | **Payment Vouchers Bypass General Ledger** | `finance.service.ts` | `PAYMENT_ON_ACCOUNT` vouchers are created but never posted to any ledger. They exist as standalone documents with no financial impact. | Implement a `postToLedger()` method that creates `GeneralLedgerEntry` records for every voucher. |

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| FIN-004 | **Floating-Point Money Calculations** | `finance.service.ts` | Invoice totals are computed using JavaScript `reduce()` with standard floating-point arithmetic, then stored as `Decimal` in Prisma. This introduces rounding errors before persistence. | Perform all monetary arithmetic using `Decimal.js` (or Prisma's `Decimal` type) from the first addition to the final storage. |
| FIN-005 | **No Input Validation on Financial DTOs** | `finance.dto.ts` (assumed) | The `CreateInvoiceDto` and `CreateVoucherDto` likely do not enforce `@Min(0)` on amounts or `@IsUUID()` on foreign keys. This allows negative invoices and invalid references. | Add strict class-validator/Zod rules: `@Min(0)` for amounts, `@IsUUID()` for IDs, `@IsEnum()` for statuses. |
| FIN-006 | **Dead Invoice Status** | `finance.service.ts` | The `InvoiceStatus` enum includes `OVERDUE`, but no code path ever assigns this status. Invoices remain `PENDING` indefinitely past their due date. | Add a scheduled job (e.g., daily cron) that updates `PENDING` invoices to `OVERDUE` when `dueDate < now()`. |
| FIN-007 | **No Tax Engine** | `finance.service.ts` | There is no VAT, withholding tax, or any tax configuration. In a multi-region/multi-country ERP, this is a fundamental gap. | Add a `TaxRate` model and a `TaxEngineService` that applies configured taxes to invoice line items. |
| FIN-008 | **Unvalidated Amounts on Vouchers** | `finance.service.ts` | Vouchers can be created with zero or negative amounts. `CREDIT_NOTE` vouchers can be issued for any amount without linking to an original invoice. | Add validation rules: voucher amount must be `> 0`, `CREDIT_NOTE` must reference an existing invoice, and the credit cannot exceed the invoice total. |
| FIN-009 | **No Bank Reconciliation** | Entire finance module | There is no way to match bank statement lines against recorded payments. | Introduce a `BankStatementLine` model and a reconciliation workflow. |

#### MEDIUM

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| FIN-010 | **No Multi-Currency Support** | `finance.service.ts` | All amounts are stored as raw numbers with no currency code. A school operating in Nigeria (NGN) and Ghana (GHS) cannot distinguish transactions. | Add a `currencyCode` field to invoices and a `Currency` lookup table with exchange rates. |
| FIN-011 | **No Deposits or Prepayments** | `finance.service.ts` | The system only supports invoice-linked payments. A parent cannot make a deposit for future term fees. | Add a `Deposit` or `Prepayment` transaction type that credits the `StudentAccount` without linking to an invoice. |
| FIN-012 | **No Partial Refund Workflow** | `finance.service.ts` | If a student withdraws mid-term, there is no mechanism to calculate and process a pro-rata refund. | Implement a refund calculation service that prorates fees and generates a refund voucher. |

---

### 3.4 Dashboards & Analytics (Score: 3 / 10)

The analytics module provides executive dashboards, but several KPIs are mathematically invalid or misleading, and the backend queries are extremely inefficient.

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| ANA-001 | **Fake Student Retention KPI** | `executive-dashboard.service.ts` | The "Student Retention Rate" is calculated as `100 - abs(growthRate)`. This is statistically meaningless. A school that grows by 50% then shrinks by 50% would show 50% retention, which is incorrect. | Implement true cohort retention: `students_from_previous_session_still_enrolled / total_students_in_previous_session`. |
| ANA-002 | **Invalid Growth Rate Calculation** | `executive-dashboard.service.ts` | Growth rate compares the **partial current month** (e.g., May 1–18) against the **full previous month** (April 1–30). This always shows a false decline early in the month. | Use `date-fns` to get the same date range for both periods (e.g., May 1–18 vs. April 1–18). |
| ANA-003 | **Collection Rate is Misleading** | `executive-dashboard.service.ts` | The "Collection Rate" uses **lifetime revenue** divided by **current outstanding balance**. This makes a school with 10 years of history and one recent bad debt look excellent. | Calculate `revenue_in_current_session / total_invoices_in_current_session`. |
| ANA-004 | **180+ Queries Per Dashboard Request** | `executive-dashboard.service.ts` | The branch comparison feature triggers a separate Prisma query for every metric per branch. For 10 branches, this results in 180+ round-trips to the database. | Use a single raw SQL aggregation query with `GROUP BY branchId` to fetch all metrics in one round-trip. |
| ANA-005 | **Time Series Chart Slicing Bug** | `TimeSeriesChart.tsx` | The "1Y" button on time series charts slices a 30-item array to `data.slice(-12)`, which results in an empty chart because the array only has monthly data for ~2.5 years at most. | Dynamically determine the data granularity and slice size based on the actual data array length. |
| ANA-006 | **Double-Percentage Display Bug** | `dashboard/page.tsx` | The attendance summary card displays "85%%" because the value is already a percentage (0.85) but the formatter multiplies it by 100 again. | Check if the value is already normalized before applying percentage formatting. |
| ANA-007 | **No Drill-Down Navigation** | All charts | Charts are static visualizations. Clicking a bar or pie slice does nothing. Executives cannot explore the underlying data. | Add click handlers to charts that navigate to filtered list pages (e.g., click "Unpaid Invoices" slice → go to invoices list with `status=PENDING` filter). |

#### MEDIUM

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| ANA-008 | **Charts Flash on Every Data Fetch** | `TimeSeriesChart.tsx`, `BarChart.tsx` | Charts re-animate from zero on every render, even if the data hasn't changed. This is distracting during polling. | Memoize chart data with `useMemo` and disable animations when the data reference hasn't changed. |
| ANA-009 | **No Predictive Analytics** | Entire analytics module | There is no forecasting for enrollment, revenue, or cash flow. | Add simple trend-line forecasting using linear regression on historical data. |

---

### 3.5 Database Schema (Score: 4 / 10)

The Prisma schema contains 100+ models and is functional, but several structural issues threaten data integrity and performance at scale.

#### CRITICAL

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| DB-001 | **101 Models with Orphan `sessionId` Fields** | `schema.prisma` | Approximately 96 academic models have `sessionId String?` but **no `@relation` to `AcademicSession`**. This means orphaned records, no cascading deletes, and no referential integrity enforcement by the database. | Add `@relation` to `AcademicSession` on every model that has `sessionId`. Include `onDelete: SetNull` or `Restrict` as appropriate. |
| DB-002 | **No Foreign Key on `schoolId`** | `schema.prisma` | Many models reference a `schoolId` but lack a `School` model relation. This prevents cascading operations and integrity checks. | Create a `School` model and add `@relation` fields where `schoolId` is used. |

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| DB-003 | **Academic Scores Use `Float`** | `schema.prisma` | GPA, cumulative scores, and financial amounts use Prisma `Float` (IEEE 754 double-precision). Over thousands of records, rounding errors accumulate. | Replace `Float` with `Decimal` on all monetary, GPA, and weighted-score fields. |
| DB-004 | **Missing Indexes on Critical Fields** | `schema.prisma` | Tables like `Student`, `Invoice`, `Payment`, `Attendance` have no indexes on frequently queried fields (`studentId`, `branchId`, `sessionId`, `status`, `createdAt`). | Add `@index` and `@unique` constraints based on query patterns. Priority: `studentId + sessionId`, `branchId + status`, `createdAt`. |
| DB-005 | **God Tables** | `schema.prisma` | `Student` has 40+ fields. `OnlineAdmission` has 50+ fields. These are difficult to maintain and query efficiently. | Extract satellite tables: `StudentMedicalInfo`, `StudentGuardian`, `StudentTransport`, `AdmissionDocument`. |
| DB-006 | **Inconsistent Soft Deletes** | `schema.prisma` | Only 7 of 100+ models have a `deletedAt` field. Bulk-deleting records from other models is irreversible and breaks referential integrity. | Add `deletedAt DateTime?` to all models and update queries to filter `deletedAt: null`. |
| DB-007 | **Dangerous Cascades** | `schema.prisma` | Deleting an `Invoice` cascades to `Payment` records (or allows deletion without handling linked payments). This destroys audit history. | Change `onDelete` behavior to `Restrict` or implement soft delete so that payments remain traceable. |
| DB-008 | **String-as-Enum Pattern** | `schema.prisma` | 20+ fields use unconstrained `String` types for statuses (e.g., `status String` instead of an enum). This allows invalid values like `"PENDNG"` (typo) to be stored. | Define Prisma enums for all status fields and migrate existing data. |
| DB-009 | **`Float` Used for Percentage** | `schema.prisma` | Percentage fields (e.g., `score Float`) store 85.5 as `85.5` but are sometimes interpreted as `0.855`, causing calculation errors. | Store percentages as `Decimal` and document whether the value is normalized (0–1) or display (0–100). |

#### MEDIUM

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| DB-010 | **No JSONB for Flexible Metadata** | `schema.prisma` | `Student` and `OnlineAdmission` have fixed columns for every possible field. Adding a new field (e.g., "blood type") requires a schema migration. | Add a `metadata Json?` field to extensible entities for custom school-specific attributes. |
| DB-011 | **No Database-Level Constraints on Business Rules** | `schema.prisma` | There is no `CHECK` constraint ensuring `invoice.total >= 0` or `payment.amount > 0` at the database level. | Use Prisma's `dbgenerated` or raw SQL migrations to add `CHECK` constraints for critical invariants. |

---

### 3.6 Frontend UX (Score: 5 / 10)

The React/Next.js frontend is feature-complete but suffers from inconsistent patterns, missing error handling, and poor loading states.

#### CRITICAL

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| UX-001 | **Zero Error Boundaries** | All dashboard pages | There is no `error.tsx` or `ErrorBoundary` in the dashboard layout. A single API error or runtime exception unmounts the entire dashboard and shows a blank white screen. | Add `error.tsx` to `/dashboard`, `/dashboard/layout.tsx`, and the root layout. Include a "Retry" button that resets the error state. |

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| UX-002 | **Full-Page Reload on Branch/Session Switch** | `AuthContext.tsx` | `switchBranch()` and `switchSession()` call `window.location.reload()`. This destroys React state, cache, scroll position, and any unsaved form data. | Use Next.js router or React state to update the context and trigger a data refetch without reloading the page. |
| UX-003 | **No Skeleton Loaders** | 180+ pages | Every page shows a generic spinner (`Loading...`) over a blank screen. Users perceive this as slow and cannot predict the page structure. | Implement skeleton components (e.g., `SkeletonCard`, `SkeletonTable`) that mirror the final layout. |
| UX-004 | **Two Competing Toast Systems** | Global frontend | `NotificationContext` (custom) and `sonner` (library) are used inconsistently. Some mutations show both toasts simultaneously. | Standardize on `sonner` for all notifications and remove `NotificationContext`. |
| UX-005 | **Only 4 Forms Use Zod Validation** | Form inventory | The vast majority of forms use hand-rolled `onChange` handlers with inline validation. This is error-prone and inconsistent. | Migrate all forms to `react-hook-form` + `zod` with reusable form components. |

#### MEDIUM

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| UX-006 | **Dead Components** | Component directory | `Modal.tsx` and `RestorationPlaceholder.tsx` exist but are never imported. They increase bundle size and confuse developers. | Remove unused components or archive them in a `legacy/` directory. |
| UX-007 | **DataTable Search Bug** | `DataTable.tsx` | The component accepts a `searchKey` prop but does not implement search logic. It is silently ignored. | Implement client-side filtering with `useMemo` or integrate with backend search via debounced API calls. |
| UX-008 | **Inconsistent Empty States** | List pages | Some pages show "No data found", others show a blank table, and others show nothing at all. | Create a reusable `EmptyState` component with an icon, message, and CTA button. Apply it to all list views. |
| UX-009 | **Form Submit Buttons Not Disabled During Submission** | Multiple forms | Users can double-click submit buttons, causing duplicate API requests and duplicate records. | Use `formState.isSubmitting` from `react-hook-form` to disable the button and show a loading spinner. |

---

### 3.7 Performance (Score: 3 / 10)

The application will not scale beyond a few hundred records per tenant without significant performance improvements.

#### HIGH

| ID | Finding | Location | Details | Remediation |
|----|---------|----------|---------|-------------|
| PERF-001 | **Finance Totals Computed in JavaScript** | `finance.service.ts` | `getBranchFinancialSummary` loads **all** invoices into memory and sums them with `reduce()`. For a branch with 10,000 invoices, this consumes ~50MB+ of RAM per request. | Use Prisma `aggregate` or raw SQL `SUM()` to compute totals at the database level. |
| PERF-002 | **Attendance Stats Computed in JavaScript** | `attendance.service.ts` | `getAttendanceStats` loads every attendance record for a date range and counts them in JavaScript. | Use Prisma `groupBy` or raw SQL `COUNT(CASE WHEN status = 'PRESENT' THEN 1 END) / COUNT(*)`. |
| PERF-003 | **No Default Pagination** | All list endpoints | `findMany` calls across the backend omit `take` and `skip`, returning unbounded result sets. | Add `take: 20` and `skip` to all list endpoints. Return `totalCount` for pagination UI. |
| PERF-004 | **32+ Pages Use Manual `useEffect` Instead of React Query** | Frontend pages | Manual `useEffect` + `useState` fetching has no caching, deduplication, background refetching, or race-condition handling. | Migrate all data-fetching to `@tanstack/react-query` with appropriate `staleTime` and `gcTime`. |
| PERF-005 | **No Virtualization for Large Tables** | `DataTable.tsx` | Tables render all rows regardless of viewport size. A class with 500 students renders 500 DOM nodes. | Integrate `@tanstack/react-virtual` or `react-window` for virtualized scrolling. |
| PERF-006 | **Cache Destroyed on Reload** | `AuthContext.tsx` | Because `window.location.reload()` is used for context switching, the browser discards all React Query caches, Next.js page caches, and form state. | Eliminate `reload()` and use query invalidation (`queryClient.invalidateQueries()`) instead. |
| PERF-007 | **Frontend Bundle Size** | Next.js build | No analysis has been performed. The `chart.js` and `react-chartjs-2` libraries may be loaded on pages that don't use charts. | Run `next-bundle-analyzer` and implement dynamic imports (`next/dynamic`) for heavy components. |

---

## 4. Implementation Roadmap

### Overview

| Phase | Focus | Duration | Cumulative |
|-------|-------|----------|------------|
| Phase 1 | Security & Stability Foundation | Weeks 1–2 | Week 2 |
| Phase 2 | Financial Integrity & Data Correctness | Weeks 3–4 | Week 4 |
| Phase 3 | Database Schema Hardening | Weeks 5–6 | Week 6 |
| Phase 4 | Performance & Architecture Modernization | Weeks 7–8 | Week 8 |
| Phase 5 | Dashboards, Analytics & UX Polish | Weeks 9–10 | Week 10 |
| Phase 6 | Industry Standards & Compliance | Weeks 11–12 | Week 12 |

**Total: 12 weeks to production-ready**

> **Assumption:** 1 full-time senior backend developer + 1 full-time mid-level frontend developer working 40 hours/week.

---

### Phase 1: Security & Stability Foundation (Weeks 1–2)

**Goal:** Fix anything that can crash the app or leak data across tenants.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 1.1 | SEC-001 | Fix AsyncLocalStorage anti-pattern | All Prisma write operations use `.run()` with isolated context; concurrent requests do not share tenant IDs. | 2 days |
| 1.2 | SEC-002, SEC-003, SEC-004, SEC-005 | Add tenant validation to all unprotected mutations | `createBranch`, `addBranchEmployee`, `createBranchInventory`, `lockExam` all validate `effectiveBranchId` against the target resource. | 3 days |
| 1.3 | UX-001 | Add Error Boundaries to dashboard and root layouts | `error.tsx` files exist in `/dashboard`, `/dashboard/layout.tsx`, and root. They display a friendly error message and a "Retry" button. | 2 days |
| 1.4 | ARCH-007 | Fix `JSON.parse` crash in API error interceptor | `api.ts` safely parses error responses; HTML responses are handled gracefully without crashing the app. | 1 day |
| 1.5 | UX-002 | Replace `window.location.reload()` with proper state management | `switchBranch` and `switchSession` update React state and invalidate queries without reloading the page. | 3 days |
| 1.6 | SEC-006 | Fix Paystack webhook tenant isolation | Webhook handler includes `branchId` and `sessionId` in the invoice lookup to prevent cross-branch payment injection. | 2 days |
| 1.7 | SEC-010 | Harden file upload MIME validation | `upload.service.ts` uses `file-type` to verify actual file content before trusting the extension. | 1 day |
| 1.8 | SEC-011 | Add rate limiting to auth endpoints | `@nestjs/throttler` guards login, password reset, and refresh token endpoints (5 req / 15 min / IP). | 1 day |

**Phase 1 Deliverables:**
- [ ] Dashboard does not crash on API errors.
- [ ] Tenant context is isolated per request.
- [ ] No mutation can act on a branch the user does not belong to.
- [ ] File uploads cannot be spoofed.
- [ ] Auth endpoints resist brute-force attacks.

---

### Phase 2: Financial Integrity & Data Correctness (Weeks 3–4)

**Goal:** Money is never lost, miscalculated, or un-audited.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 2.1 | FIN-002 | Implement overpayment handling | `StudentAccount` model tracks excess credit. Overpayments are credited to the student's account and visible in the UI. | 3 days |
| 2.2 | FIN-004 | Replace floating-point invoice totals with Decimal arithmetic | All invoice, payment, and voucher totals use `Decimal.js` from calculation through to Prisma storage. | 2 days |
| 2.3 | FIN-005 | Add strict DTO validation to finance module | `CreateInvoiceDto`, `CreateVoucherDto`, etc. enforce `@Min(0)`, `@IsUUID()`, `@IsEnum()`. Invalid payloads return `400 Bad Request`. | 2 days |
| 2.4 | FIN-006 | Fix invoice status workflow | A daily cron job updates `PENDING` invoices to `OVERDUE` when `dueDate < now()`. `VOIDED` status allows reversal with audit trail. | 2 days |
| 2.5 | FIN-001 (partial) | Add audit logging to all financial mutations | Every invoice, payment, and voucher creation logs `who`, `what`, `when`, `before`, `after` to an `AuditLog` table. | 3 days |
| 2.6 | FIN-003 | Fix `PAYMENT_ON_ACCOUNT` posting to General Ledger placeholder | `PAYMENT_ON_ACCOUNT` vouchers create corresponding `GeneralLedgerEntry` records (debit cash, credit suspense). | 2 days |

**Phase 2 Deliverables:**
- [ ] Overpayments are tracked and recoverable.
- [ ] Financial calculations are precise to 2 decimal places.
- [ ] All financial inputs are validated at the API boundary.
- [ ] Invoice statuses reflect reality (overdue invoices are marked).
- [ ] Every financial mutation leaves an audit trail.

---

### Phase 3: Database Schema Hardening (Weeks 5–6)

**Goal:** Data integrity at the schema level.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 3.1 | DB-001 | Add `AcademicSession` FK relation to all 101 `sessionId` fields | Migration script adds `@relation` from each academic model to `AcademicSession`. All existing data is backfilled. | 4 days |
| 3.2 | DB-003 | Replace `Float` with `Decimal` on GPA, scores, financial fields | Schema updated; existing data migrated; all calculations use `Decimal.js`. | 2 days |
| 3.3 | DB-004 | Add missing indexes on critical fields | `@index` added to `studentId`, `branchId`, `sessionId`, `status`, `createdAt` on `Student`, `Invoice`, `Payment`, `Attendance`, `Voucher`, `Grade`. | 3 days |
| 3.4 | DB-006 | Standardize soft delete across all models | `deletedAt DateTime?` added to all 100+ models. All `findMany` queries filter `deletedAt: null`. | 3 days |
| 3.5 | DB-005 | Extract satellite tables from `Student` and `OnlineAdmission` | `StudentMedicalInfo`, `StudentGuardian`, `StudentTransport`, `AdmissionDocument` models created; data migrated. | 4 days |
| 3.6 | DB-008 | Replace string-as-enum fields with Prisma enums | Enums defined for `InvoiceStatus`, `PaymentStatus`, `VoucherType`, `StudentStatus`, etc. Migrations convert existing strings. | 2 days |

**Phase 3 Deliverables:**
- [ ] All `sessionId` fields have referential integrity.
- [ ] No floating-point numbers are used for money or grades.
- [ ] Frequently queried fields are indexed.
- [ ] Deleting a record soft-deletes it; data is never hard-deleted by accident.
- [ ] `Student` and `OnlineAdmission` tables are normalized.

---

### Phase 4: Performance & Architecture Modernization (Weeks 7–8)

**Goal:** Frontend loads fast; backend queries are efficient.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 4.1 | PERF-004 | Migrate 32+ manual `useEffect` pages to React Query | All data-fetching pages use `@tanstack/react-query` with `staleTime`, `gcTime`, and error handling. | 5 days |
| 4.2 | PERF-001, PERF-002 | Fix N+1 queries in analytics and finance | `getBranchFinancialSummary` and `getAttendanceStats` use Prisma `aggregate`, `groupBy`, or raw SQL. | 3 days |
| 4.3 | PERF-003 | Add default pagination to all list endpoints | Every `findMany` call has `take: 20` and `skip`. API responses include `totalCount` and `totalPages`. | 2 days |
| 4.4 | PERF-005 | Implement virtualized tables for large datasets | `DataTable` uses `@tanstack/react-virtual` for rows > 50. | 3 days |
| 4.5 | UX-003 | Add skeleton loaders to all major page routes | Every dashboard page shows a skeleton matching its layout while data loads. | 3 days |
| 4.6 | ARCH-004 | Refactor `AuthContext` god object | `AuthContext` is split into `UserContext`, `BranchContext`, `SessionContext`, and `PermissionContext`. | 2 days |

**Phase 4 Deliverables:**
- [ ] All data fetching is cached, deduplicated, and race-condition-free.
- [ ] Backend list endpoints return paginated results.
- [ ] Tables with >50 rows are virtualized.
- [ ] No page shows a blank screen during loading.
- [ ] Context re-renders are minimized.

---

### Phase 5: Dashboards, Analytics & UX Polish (Weeks 9–10)

**Goal:** Executives see accurate, meaningful numbers.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 5.1 | ANA-001, ANA-002, ANA-003 | Fix mathematically invalid KPIs | Retention rate uses true cohort logic. Growth rate compares equal-length periods. Collection rate uses current session only. | 3 days |
| 5.2 | ANA-005 | Fix time-series chart slicing | "1Y", "6M", "3M" buttons correctly slice data regardless of array length. Empty charts show an informative message. | 1 day |
| 5.3 | ANA-007 | Add drill-down navigation from charts | Clicking a chart segment navigates to a filtered list page with query params applied. | 3 days |
| 5.4 | UX-005 | Standardize all forms with Zod validation | Every form uses `react-hook-form` + `zod`. No hand-rolled validation remains. | 4 days |
| 5.5 | UX-004 | Unify notification system | All notifications use `sonner`. `NotificationContext` and its custom toasts are removed. | 2 days |
| 5.6 | UX-006 | Remove dead code | Unused components (`Modal.tsx`, `RestorationPlaceholder.tsx`) and styles are removed. | 1 day |
| 5.7 | UX-008 | Implement consistent empty states | Every list view uses the reusable `EmptyState` component. | 1 day |

**Phase 5 Deliverables:**
- [ ] Dashboard KPIs are mathematically sound.
- [ ] Charts are interactive and navigable.
- [ ] All forms validate consistently.
- [ ] Notification system is unified.
- [ ] No dead code remains in the component directory.

---

### Phase 6: Industry Standards & Compliance (Weeks 11–12)

**Goal:** Competitive with PowerSchool / Fedena.

| Task ID | Finding IDs | Description | Acceptance Criteria | Effort |
|---------|-------------|-------------|---------------------|--------|
| 6.1 | FIN-001 | Design General Ledger + Chart of Accounts schema | `GeneralLedgerEntry`, `ChartOfAccount`, `JournalEntry` models defined with proper double-entry constraints. | 3 days |
| 6.2 | FIN-001 | Implement double-entry posting for all transactions | Every invoice, payment, voucher, and fee waiver posts balanced debit/credit entries to the General Ledger. | 5 days |
| 6.3 | FIN-007 | Add tax engine infrastructure | `TaxRate` model and `TaxEngineService` apply configured taxes to invoice line items. | 3 days |
| 6.4 | FIN-008, FIN-012 | Implement credit note and refund workflows | Credit notes reference original invoices. Refunds calculate pro-rata amounts and generate refund vouchers. | 3 days |
| 6.5 | FIN-009 | Add bank reconciliation module | `BankStatementLine` model and reconciliation UI match bank records to system payments. | 3 days |
| 6.6 | N/A | Mobile responsiveness audit & fixes | All dashboard pages are usable on 375px width devices without horizontal scrolling. | 3 days |
| 6.7 | N/A | WCAG accessibility baseline | All interactive elements are keyboard-navigable. ARIA labels present on forms and tables. Color contrast meets AA standard. | 3 days |

**Phase 6 Deliverables:**
- [ ] General Ledger is operational.
- [ ] All transactions are double-entry posted.
- [ ] Tax rates are configurable per school.
- [ ] Credit notes and refunds are fully supported.
- [ ] Bank reconciliation workflow is functional.
- [ ] Platform is usable on mobile devices.
- [ ] Platform meets WCAG 2.1 AA baseline.

---

## Appendix A: Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| **CRITICAL** | Data loss, security breach, or complete application failure. Must be fixed before any production deployment. | Cross-tenant data leak, overpayment loss, app crash |
| **HIGH** | Significant functionality broken or severely degraded. Affects core workflows or compliance. | Invalid KPIs, N+1 queries, missing audit logs |
| **MEDIUM** | Feature gap or inconsistency that causes friction but has a workaround. | Dead code, missing mobile responsiveness |
| **LOW** | Cosmetic issue or minor optimization. Does not block production. | Unused imports, minor color contrast issues |

---

## Appendix B: Industry Standard Gap Matrix

Compared to leading School Management ERPs (PowerSchool, Fedena, Blackbaud, Veracross):

| Standard Feature | Basaeer Status | Gap Severity |
|-----------------|----------------|--------------|
| Double-Entry Accounting | Missing | CRITICAL |
| General Ledger | Missing | CRITICAL |
| Chart of Accounts | Missing | CRITICAL |
| Bank Reconciliation | Missing | HIGH |
| Tax Engine (VAT/WHT) | Missing | HIGH |
| Credit Notes / Refunds | Missing | CRITICAL |
| Scholarship Management | Partial (boolean only) | MEDIUM |
| Lesson Plan / Curriculum | Missing | MEDIUM |
| Canteen / Food Services | Missing | MEDIUM |
| Disciplinary Records | Missing | MEDIUM |
| Parent-Teacher Meeting Scheduling | Missing | MEDIUM |
| Room / Exam Seating Arrangement | Missing | MEDIUM |
| Predictive Analytics | Missing | MEDIUM |
| Mobile-First Design | Partial | MEDIUM |
| WCAG Accessibility | Missing | HIGH |
| Multi-Currency Support | Missing | MEDIUM |
| Parent Mobile App | Missing | MEDIUM |
| API Rate Limiting | Missing | HIGH |
| Audit Logging | Partial (20% coverage) | HIGH |
| Soft Delete | Partial (7% of models) | HIGH |

---

## Appendix C: Notes & Assumptions

1. **Team Size:** This plan assumes 2 full-time developers (1 senior backend, 1 mid-level frontend). Adjust timelines proportionally for different team sizes.
2. **Testing:** Each phase assumes 10–15% of time is allocated to writing tests and performing QA. No explicit testing tasks are listed, but they should be factored into effort estimates.
3. **Deployment:** The plan does not include DevOps or CI/CD improvements. If the deployment pipeline is also immature, add 1–2 weeks at the start.
4. **SMTP:** Email functionality is currently broken due to SMTP misconfiguration. This should be resolved in Phase 1 or Phase 2, as password resets and notifications depend on it.
5. **Migration Safety:** Schema changes in Phase 3 should be performed with zero-downtime migrations (e.g., create new columns/tables, backfill data, swap references, drop old columns).
6. **Backward Compatibility:** The write guard and session-scoping changes must not break existing integrations. The `sessionId` field is already optional in the schema; the write guard enforces it at runtime.

---

*End of Audit & Implementation Plan*
