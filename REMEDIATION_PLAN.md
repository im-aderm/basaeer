# BASAER — COMPREHENSIVE MULTI-PHASED REMEDIATION PLAN

**Approach:** Each phase must be fully completed and approved before moving to the next.
**Convention:** Every code change includes exact file path and line references from the audit.
**Testing:** Each phase includes a verification checklist that must pass before approval.

---

# ═══════════════════════════════════════════

# PHASE 1 — CRITICAL SECURITY FIXES

# ═══════════════════════════════════════════

# Estimated effort: 4-6 hours

# Risk level: BLOCKS PRODUCTION

# ═══════════════════════════════════════════

## 1.1 Remove Hardcoded Secret Fallbacks

### 1.1.1 JWT Secret Fallback

**File:** `backend/src/auth/auth.module.ts` ~line 18
**Current:** `secret: configService.get<string>('JWT_SECRET') || 'default-jwt-secret-change-me'`
**Action:** Replace with `configService.getOrThrow('JWT_SECRET')`

### 1.1.2 QR Signing Secret Fallback

**File:** `backend/src/attendance/qr.service.ts` ~line 12
**Current:** Fallback to `'basaer-qr-default-secret-2026'`
**Action:** Use `configService.getOrThrow('QR_SIGNING_SECRET')` and add `QR_SIGNING_SECRET` to env validation.

### 1.1.3 Paystack Placeholder Secret

**File:** `backend/src/finance/payments.service.ts` ~line 16
**Current:** `process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder'`
**Action:** Throw error if `PAYSTACK_SECRET_KEY` is missing. Add to env validation.

### 1.1.4 Encryption Salt Random Fallback

**File:** `backend/src/live-classes/encryption.service.ts` ~lines 20-23
**Current:** Falls back to `crypto.randomBytes(32).toString('hex')` if `ENCRYPTION_SALT` is missing
**Action:** Use `configService.getOrThrow('ENCRYPTION_SALT')`

### 1.1.5 Docker Compose Default Secrets

**File:** `docker-compose.yml` lines 51-56
**Current:** Fallback secrets like `your-secret-key-change-in-production`
**Action:** Remove all defaults. Use `${JWT_SECRET:?JWT_SECRET is required}` pattern to force failure if missing.

### 1.1.6 Add Missing Env Variables to Validation

**File:** `backend/src/config/env.validation.ts`
**Action:** Add validation for: `ENCRYPTION_SECRET`, `ENCRYPTION_SALT`, `PAYSTACK_SECRET_KEY`, `QR_SIGNING_SECRET`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

---

## 1.2 Fix Command Injection in Backup Service

**File:** `backend/src/settings/backup.service.ts` ~line 31

**Current (DANGEROUS):**

```typescript
await execPromise(`pg_dump "${dbUrl}" > "${filepath}"`);
```

**Action:** Replace with safe argument passing:

```typescript
import { execFile } from "child_process";
import { promisify } from "util";
const execFilePromise = promisify(execFile);

// Parse DATABASE_URL into components
const url = new URL(process.env.DATABASE_URL);
await execFilePromise(
  "pg_dump",
  [
    "-h",
    url.hostname,
    "-p",
    url.port || "5432",
    "-U",
    url.username,
    "-d",
    url.pathname.slice(1),
    "-f",
    filepath,
  ],
  {
    env: { ...process.env, PGPASSWORD: url.password },
  },
);
```

---

## 1.3 Fix Path Traversal in Backup Service

**File:** `backend/src/settings/backup.service.ts` ~lines 65-79

**Current (VULNERABLE):**

```typescript
async deleteBackup(filename: string) {
  const filepath = path.join(this.backupDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}
```

**Action:** Add path traversal protection to both `downloadBackup` and `deleteBackup`:

```typescript
private validatePath(filename: string): string {
  const resolvedPath = path.resolve(this.backupDir, filename);
  const resolvedBase = path.resolve(this.backupDir);
  if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
    throw new BadRequestException('Invalid file path');
  }
  return resolvedPath;
}

async deleteBackup(filename: string) {
  const filepath = this.validatePath(filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}
```

Apply the same `validatePath` check to `downloadBackup`.

---

## 1.4 Fix Mass Assignment — Add DTOs

### 1.4.1 Auth Register Endpoint

**File:** `backend/src/auth/auth.controller.ts` ~line 108
**Current:** `async register(@Body() data: any)`
**Action:** Create `backend/src/auth/dto/register-user.dto.ts`:

```typescript
import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  MinLength,
} from "class-validator";
import { UserRole } from "@prisma/client";

export class RegisterUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
  @IsString() firstName: string;
  @IsString() lastName: string;
  @IsOptional() @IsString() phone?: string;
  @IsEnum(UserRole) role: UserRole;
  @IsOptional() @IsString() branchId?: string;
}
```

Update controller: `async register(@Body() dto: RegisterUserDto)`

### 1.4.2 CreateStudentDto

**File:** `backend/src/students/dto/create-student.dto.ts`
**Action:** Add validation decorators to ALL fields:

```typescript
@IsEmail() email: string;
@IsString() @MinLength(2) firstName: string;
@IsString() @MinLength(2) lastName: string;
@IsString() branchId: string;
@IsOptional() @IsString() classId?: string;
@IsOptional() @IsString() sectionId?: string;
@IsOptional() @IsDateString() dob?: string;
@IsOptional() @IsString() phone?: string;
@IsOptional() @IsString() parentId?: string;
@IsOptional() @IsString() password?: string;
```

### 1.4.3 RecordPaymentDto

**File:** `backend/src/finance/dto/record-payment.dto.ts`
**Action:** Add validation decorators:

```typescript
@IsUUID() invoiceId: string;
@IsNumber() @Min(0.01) amount: number;
@IsEnum(PaymentMethod) method: PaymentMethod;
@IsOptional() @IsString() transactionId?: string;
@IsOptional() @IsString() proofUrl?: string;
@IsOptional() @IsString() notes?: string;
// Remove branchId — should come from tenant context
```

### 1.4.4 Finance Voucher Endpoint

**File:** `backend/src/finance/finance.controller.ts` ~line 177
**Current:** `createVoucher(@Body() dto: any`
**Action:** Replace `any` with `CreateVoucherDto` (already exists at `backend/src/finance/dto/voucher.dto.ts`)

### 1.4.5 Employee Awards

**File:** `backend/src/employees/employees.controller.ts` ~line 220
**Current:** `createAward(@Body() data: any)`
**Action:** Create a proper `CreateAwardDto` and type the parameter

### 1.4.6 Assignments Controller

**File:** `backend/src/assignments/assignments.controller.ts` lines 41, 92, 112
**Current:** `@Body() data: any` on multiple methods
**Action:** Create proper DTOs for assignment creation and update

---

## 1.5 Fix Paystack Webhook Signature Verification

**File:** `backend/src/finance/payments.service.ts` ~lines 76-78

**Current (BROKEN):**

```typescript
const hash = crypto
  .createHmac("sha512", this.paystackSecretKey)
  .update(JSON.stringify(payload))
  .digest("hex");
```

**Action:** Use raw body from `RawBodyRequest`:

```typescript
async handlePaystackWebhook(signature: string, rawBody: string) {
  const hash = crypto
    .createHmac('sha512', this.paystackSecretKey)
    .update(rawBody)
    .digest('hex');

  if (hash !== signature) {
    throw new UnauthorizedException('Invalid signature');
  }
}
```

Update `payments.controller.ts` to pass `req.rawBody` instead of `req.body`.

Also update `finance-payment.controller.ts` similarly.

---

## 1.6 Restrict WebSocket CORS

**File:** `backend/src/realtime/realtime.gateway.ts` ~line 15

**Current:** `cors: true`
**Action:** Read allowed origins from config:

```typescript
import { ConfigService } from '@nestjs/config';

// In gateway options:
cors: {
  origin: this.configService.get('FRONTEND_URL') || 'http://localhost:3000',
  credentials: true,
},
```

Or inject the same CORS origin list used in `main.ts`.

---

## 1.7 Add Authentication to Upload Endpoints

**File:** `backend/src/upload/upload.controller.ts` ~lines 28, 76

**Current:** Both endpoints marked `@Public()`
**Action:**

- Remove `@Public()` from `POST /upload/payment-proof` (requires authentication)
- Keep `@Public()` on `POST /upload/admission-document` but add rate limiting:

```typescript
@Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 uploads per minute
@Post('admission-document')
@Public()
async uploadAdmissionDocument(...) { ... }
```

---

## 1.8 Fix Bootstrap Token Timing Attack

**File:** `backend/src/auth/auth.controller.ts` ~line 96

**Current:** `if (!body.bootstrapToken || body.bootstrapToken !== expectedToken)`
**Action:**

```typescript
import * as crypto from "crypto";

const expected = Buffer.from(expectedToken, "utf8");
const provided = Buffer.from(body.bootstrapToken || "", "utf8");
if (
  expected.length !== provided.length ||
  !crypto.timingSafeEqual(expected, provided)
) {
  throw new ForbiddenException("Invalid bootstrap token");
}
```

---

## PHASE 1 VERIFICATION CHECKLIST

Before requesting approval, verify ALL of the following:

- [ ] Application starts without `JWT_SECRET` env var (should crash with clear error)
- [ ] Application starts without `ENCRYPTION_SALT` env var (should crash)
- [ ] Application starts without `PAYSTACK_SECRET_KEY` env var (should crash)
- [ ] `POST /auth/register` with `{"role": "SUPER_ADMIN"}` in body is rejected or role is ignored
- [ ] `POST /auth/register` with extra fields not in DTO is rejected (`forbidNonWhitelisted`)
- [ ] `POST /students` with empty body returns 400 Bad Request
- [ ] `GET /settings/backups/download/../../etc/passwd` returns 400
- [ ] `DELETE /settings/backups/../../app/.env` returns 400
- [ ] WebSocket connection from `http://evil.com` is rejected
- [ ] `POST /upload/payment-proof` without auth cookie returns 401
- [ ] `POST /upload/admission-document` rate limited after 5 requests/minute
- [ ] Bootstrap token comparison cannot be timing-attacked
- [ ] All existing tests still pass (`npm run test --workspaces`)

**Notify me when Phase 1 is complete and verified. I will review and approve before you proceed to Phase 2.**

---

# ═══════════════════════════════════════════

# PHASE 2 — AUTH & DATA INTEGRITY FIXES

# ═══════════════════════════════════════════

# Estimated effort: 6-8 hours

# Prerequisites: Phase 1 complete and approved

# ═══════════════════════════════════════════

## 2.1 Fix Online Exam Start (userId vs studentId)

**File:** `backend/src/online-exams/online-exams.controller.ts` ~line 140

**Current:** `getExamForStudent(id, ctx.userId)` passes User ID
**Action:** Look up student by userId first:

```typescript
@Get(':id/start')
async startExam(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
  const student = await this.examsService.prisma.student.findUnique({
    where: { userId: ctx.userId },
  });
  if (!student) throw new NotFoundException('Student not found');
  return this.examsService.getExamForStudent(id, student.id);
}
```

---

## 2.2 Fix Online Admission Public Endpoint Context

**File:** `backend/src/online-admission/online-admission.controller.ts` ~lines 38-48

**Current:** `@Public()` + `@GetTenantContext()` — context is undefined for unauthenticated users
**Action:** Make the controller read `branchId` from the DTO (which is required for public submissions):

```typescript
@Public()
@Post()
async create(@Body() createDto: CreateOnlineAdmissionDto) {
  // Validate branchId exists in DTO since there's no auth context
  if (!createDto.branchId) {
    throw new BadRequestException('branchId is required');
  }
  return this.onlineAdmissionService.create(createDto);
}
```

---

## 2.3 Implement Forced Password Change

**Files to modify:**

1. `backend/prisma/schema.prisma` — Add `mustChangePassword Boolean @default(false)` to `User` model
2. `backend/src/auth/auth.service.ts` — Set `mustChangePassword: true` when creating users with default passwords
3. `backend/src/auth/auth.service.ts` — Check `mustChangePassword` in login response
4. `backend/src/auth/auth.controller.ts` — Add `POST /auth/change-password` endpoint for first-time password change
5. `frontend/src/context/AuthContext.tsx` — Check `mustChangePassword` flag and redirect to change password page
6. `frontend/src/app/dashboard/change-password/page.tsx` — Create change password page

**Migration required:** Run `npx prisma migrate dev --name add-must-change-password`

---

## 2.4 Replace Hardcoded Default Passwords

**Files to fix:**

- `backend/src/students/students.service.ts` lines ~55, ~260: Replace `'student123'` with env var `SEED_DEFAULT_PASSWORD` and set `mustChangePassword: true`
- `backend/src/online-admission/online-admission.service.ts` lines ~232, ~256: Replace `'parent123'` and `'student123'` similarly
- `backend/src/employees/employees.service.ts` line ~37: Replace `'staff123'` similarly

---

## 2.5 Fix ProtectedRoute Auth Bypass

**File:** `frontend/src/components/ProtectedRoute.tsx` ~lines 27-48

**Current:** Allows unauthenticated users through when `allowedRoles` is not provided.
**Action:**

```tsx
if (loading) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Spinner />
    </div>
  );
}

if (!isAuthenticated) {
  redirect("/login");
  return null;
}

if (allowedRoles && !allowedRoles.includes(user?.role)) {
  return <AccessDenied />;
}

return <>{children}</>;
```

---

## 2.6 Fix localStorage Token Duplication

**File:** `frontend/src/context/AuthContext.tsx` ~lines 66-91

**Current:** Stores token in both localStorage AND httpOnly cookie
**Action:** Remove `localStorage.setItem("access_token", accessToken)` from login. Remove `localStorage.removeItem("access_token")` from logout. Remove the `token` field from `AuthContextType` if not used elsewhere. Keep only httpOnly cookie auth.

**File:** `frontend/src/middleware.ts` ~line 4
**Current:** Checks `request.cookies.get('access_token')?.value`
**Action:** This is already correct (checking the httpOnly cookie). No change needed here.

---

## 2.9 Add Branch Isolation to Missing Services

**Files to fix:**

### Employees Awards

**File:** `backend/src/employees/employees.service.ts` ~line 160
**Current:** `async createAward(data: any)` — no branch check
**Action:** Accept branchId from tenant context, validate staff belongs to branch:

```typescript
async createAward(data: CreateAwardDto, branchId: string) {
  const staff = await this.prisma.staff.findUnique({ where: { id: data.staffId } });
  if (!staff || (staff as any).branchId !== branchId) {
    throw new ForbiddenException('Staff does not belong to your branch');
  }
  return this.prisma.staffAward.create({ data: { ...data, branchId } });
}
```

### Employees Advance Salary

**File:** `backend/src/employees/employees.service.ts` ~line 186
**Action:** Add similar branchId validation and injection

---

## 2.10 Add Webhook URL Validation (SSRF Prevention)

**File:** `backend/src/integrations/integrations.service.ts` ~lines 73-84, 125

**Action:** Add URL validation before registering or delivering webhooks:

```typescript
private validateWebhookUrl(url: string): void {
  const parsed = new URL(url);
  const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '169.254.169.254', '::1'];
  if (blockedHosts.includes(parsed.hostname) || parsed.hostname.endsWith('.internal')) {
    throw new BadRequestException('Webhook URL cannot point to internal addresses');
  }
  if (!['https:', 'http:'].includes(parsed.protocol)) {
    throw new BadRequestException('Webhook URL must use HTTP or HTTPS');
  }
}
```

Call this in both `registerWebhook` and `deliverWebhook`.

---

## 2.11 Remove Console.log of PII

**Files to fix:**

- `backend/src/app.controller.ts` line 52: Remove `console.log(\`[Newsletter] New subscription: ${body.email}\`)`. Replace with NestJS Logger at `debug` level, or remove entirely.
- `backend/src/app.controller.ts` lines 27-38: Remove standalone Redis instance creation. Use BullMQ's existing Redis connection or inject a Redis service.
- `frontend/src/services/onlineAdmissionService.ts` line 169: Remove `console.log("Submitting admission payload:", ...)`
- `frontend/src/app/dashboard/students/deactivate-login/page.tsx` lines 29, 34: Remove console.log statements

---

## PHASE 2 VERIFICATION CHECKLIST

- [ ] Online exam start works for students (userId → studentId lookup succeeds)
- [ ] Online admission submission works without auth (branchId from DTO)
- [ ] New users created with default password see "change password" prompt on first login
- [ ] `POST /auth/change-password` works and clears `mustChangePassword` flag
- [ ] ProtectedRoute redirects unauthenticated users to /login
- [ ] localStorage no longer contains `access_token` after login
- [ ] Staff award creation validates branch ownership
- [ ] Webhook registration rejects `http://localhost:3001/api/anything`
- [ ] Webhook registration rejects `http://169.254.169.254/latest/meta-data/`
- [ ] No user emails or PII appear in server logs
- [ ] All existing tests still pass

**Notify me when Phase 2 is complete and verified.**

---

# ═══════════════════════════════════════════

# PHASE 3 — BROKEN INTEGRATIONS FIX

# ═══════════════════════════════════════════

# Estimated effort: 6-8 hours

# Prerequisites: Phase 2 complete and approved

# ═══════════════════════════════════════════

## 3.1 Fix Hostel Service API Contracts (5 broken URLs)

**File:** `frontend/src/services/hostelService.ts`

| Method                   | Current URL                      | Fix                                                    |
| ------------------------ | -------------------------------- | ------------------------------------------------------ |
| `getVacancies`           | `GET /hostels/vacancies`         | Create backend endpoint or map to `GET /hostels/stats` |
| `getLeaves`              | `GET /hostels/leaves`            | Change to `GET /hostels/leaves/branch`                 |
| `updateLeave`            | `PATCH /hostels/leaves/:id`      | Change to `PATCH /hostels/leaves/:id/status`           |
| `getMaintenanceRequests` | `GET /hostels/maintenance`       | Change to `GET /hostels/maintenance/branch`            |
| `updateMaintenance`      | `PATCH /hostels/maintenance/:id` | Create backend endpoint or map to existing             |
| `getMyDetails`           | `GET /hostels/my-details`        | Create backend endpoint or map to existing             |
| `releaseBed`             | `PATCH /hostels/release/:id`     | Change to `POST /hostels/release/:allocationId`        |

---

## 3.2 Fix Library Service API Contracts

**File:** `frontend/src/services/libraryService.ts`

| Method              | Current URL                        | Fix                                                |
| ------------------- | ---------------------------------- | -------------------------------------------------- |
| `returnBook`        | `PATCH /library/return/:id`        | Change to `POST /library/return/:recordId`         |
| `getStudentHistory` | `GET /library/history/student/:id` | Map to `GET /library/borrow-records?studentId=:id` |

---

## 3.3 Fix Exam Service API Contract

**File:** `frontend/src/services/academicService.ts`

| Method     | Current URL      | Fix                                   |
| ---------- | ---------------- | ------------------------------------- |
| `examById` | `GET /exams/:id` | Change to `GET /exams/management/:id` |

---

## 3.4 Fix Reporting Service API Contracts

**File:** `frontend/src/services/reportingService.ts`

| Method                 | Current URL                                     | Fix                                                                          |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| PDF performance export | `GET /reporting/export/student-performance/pdf` | Change to `GET /reporting/export/performance` with `Accept: application/pdf` |
| Fees PDF               | `GET /reporting/export/fees/pdf`                | Change to `GET /reporting/export/finance` with `Accept: application/pdf`     |
| All other export paths | Various wrong paths                             | Create corresponding backend endpoints or map to existing                    |

For missing backend export endpoints (inventory, HR, fees/excel, etc.), either:

- **Option A:** Remove the frontend buttons until backend is ready
- **Option B:** Create stub endpoints that return 501 Not Implemented

---

## 3.5 Fix Inventory Service API Contracts

**File:** `frontend/src/services/inventoryService.ts`

| Method        | Current URL                        | Fix                                             |
| ------------- | ---------------------------------- | ----------------------------------------------- |
| `getIssues`   | `GET /inventory/issues?branchId=x` | Create backend `GET /inventory/issues` endpoint |
| `returnIssue` | `POST /inventory/issue/return/:id` | Create backend endpoint                         |

---

## 3.6 Fix Settings Backup Download

**File:** `frontend/src/services/settingsService.ts` ~line 46

**Current:** `window.open(\`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/backups/download/${filename}\`, '\_blank')`

**Action:**

1. Fix fallback URL to `http://localhost:3001/api` (correct port)
2. Use authenticated download instead of `window.open()`:

```typescript
downloadBackup: async (filename: string) => {
  const response = await api.get(`/settings/backups/download/${filename}`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
},
```

---

## 3.7 Fix OnlineAdmissionService Data Mapping

**File:** `frontend/src/services/onlineAdmissionService.ts` ~lines 151-167

**Issues:**

1. `lastNameName` typo (should be `lastName`)
2. `guardianType` destructured out but never remapped
3. `siblings` destructured out but never sent
4. `phoneNumber` destructured out but may be needed

**Action:** Fix the field mapping and add proper data transformation.

---

## 3.8 Fix FinanceAnalytics Fabricated Data

**File:** `frontend/src/components/FinanceAnalytics.tsx` ~lines 42-46

**Current:** Hardcoded 40/35/25% payment method split
**Action:** Either:

- Add a `GET /finance/stats/payment-methods` backend endpoint
- Or remove the payment method breakdown chart and show a "data unavailable" placeholder
- **Never** display fabricated data as real

---

## 3.9 Fix PaymentStep Hardcoded Bank Details

**File:** `frontend/src/components/admission/steps/PaymentStep.tsx` ~lines 153-177

**Current:** Hardcoded ₦5,000, Zenith Bank, account `1234567890`
**Action:** Fetch payment details from `OnlineAdmissionService.getPublicInitData(branchId)` and render dynamically. Remove hardcoded values.

---

## 3.10 Fix StudentIDCard Hardcoded Values

**File:** `frontend/src/components/StudentIDCard.tsx` ~lines 50-51, 81, 115-116

**Current:** Hardcoded "Class A", "Alpha", "AUG 2026", fake address, fake phone
**Action:** Replace with dynamic data from the student object. Use branch settings for address and phone. Remove fallback fake values or show "N/A" instead.

---

## 3.11 Fix MultiStepAdmissionForm Validation

**File:** `frontend/src/components/admission/MultiStepAdmissionForm.tsx` ~lines 127-133

**Current:** Next button advances without validation
**Action:** Each step's form should expose `isValid` state. Disable Next button or show warning when current step has validation errors.

---

## PHASE 3 VERIFICATION CHECKLIST

- [ ] Hostel service: all 7 URLs return successful responses (either 200 or 501)
- [ ] Library return book works (correct method and URL)
- [ ] Exam detail page loads (correct URL)
- [ ] Reporting export buttons work or show "not available" message
- [ ] Settings backup download works with auth cookie
- [ ] Online admission form submits correctly mapped data (no typo, no dropped fields)
- [ ] Finance analytics shows real data or honest "unavailable" placeholder
- [ ] Payment step shows real bank details from API
- [ ] Student ID card shows real data, no fake values
- [ ] Admission form cannot advance steps with invalid data
- [ ] All existing tests still pass

**Notify me when Phase 3 is complete and verified.**

---

# ═══════════════════════════════════════════

# PHASE 4 — FAKE DATA REMOVAL & MISSING FEATURES

# ═══════════════════════════════════════════

# Estimated effort: 6-8 hours

# Prerequisites: Phase 3 complete and approved

# ═══════════════════════════════════════════

## 4.1 Replace Login Log Page Mock Data

**File:** `frontend/src/app/dashboard/settings/login-log/page.tsx`

**Current:** Uses `mockLogs` array with 5 fake entries. Date filter is `const matchesDate = true`.
**Action:**

- Create backend endpoint `GET /audit/logs` that returns real audit logs filtered by date and type
- Wire the frontend to fetch real data from this endpoint
- Remove all `mockLogs` data and the fake date filter
- If no data, show "No login logs found" empty state

---

## 4.2 Replace Custom Fields Page Local State

**File:** `frontend/src/app/dashboard/settings/custom-fields/page.tsx`

**Current:** All CRUD operations manipulate local state, never persisting
**Action:**

- Create backend CRUD endpoints `/settings/custom-fields`
- Wire frontend to use real API calls
- Or: If this feature is not yet priority, replace with a "Coming Soon" placeholder

---

## 4.3 Replace Student Fields Page Simulated Save

**File:** `frontend/src/app/dashboard/settings/student-fields/page.tsx`

**Current:** `setTimeout(() => { setIsSaving(false); toast.success(...) }, 1000)` — no real API call
**Action:**

- Wire to real `PUT /settings/student-fields` endpoint
- Remove `setTimeout` simulation
- Or: Replace with placeholder if not priority

---

## 4.4 Replace System Update Page Simulation

**File:** `frontend/src/app/dashboard/settings/update/page.tsx`

**Current:** Entire page is simulated — `setTimeout` for checking updates, `setInterval` for progress bar
**Action:**

- Either: Create a real version check endpoint and wire to it
- Or: Remove this page entirely and remove from sidebar (this is safer for a first release)
- **Never** ship a page that fakes system updates

---

## 4.5 Remove Stray HTML Files

**Files:**

- `frontend/src/app/stitch_home.html`
- `frontend/src/app/stitch_tahfeez.html`

**Action:** Delete both files.

---

## 4.6 Remove Fake Dashboard Activity

**File:** `frontend/src/app/dashboard/students/page.tsx` ~lines 172-178

**Current:** Hardcoded 4 activity items
**Action:** Either fetch real recent activity from an API, or show "No recent activity" empty state.

---

## 4.7 Fix Finance Payment Method Label

**File:** `backend/src/finance/finance-payment.controller.ts` ~line 100

**Current:** `method: 'FLUTTERWAVE'` for Paystack payments
**Action:** Change to `method: 'PAYSTACK'` (or use the correct PaymentMethod enum value)

---

## 4.8 Remove or Replace Placeholder Pages — Decision Required

**YOU NEED TO DECIDE:** For each of these 7 placeholder pages, choose one:

- **Option A:** Remove from sidebar (5 min each)
- **Option B:** Implement the page (1-5 days each)

| Page                          | Recommendation                                                    |
| ----------------------------- | ----------------------------------------------------------------- |
| Library → My Issued Books     | Remove from sidebar if library module is disabled by feature flag |
| Library → Book Issue & Return | Remove from sidebar if library module is disabled by feature flag |
| Library → Book Categories     | Remove from sidebar if library module is disabled by feature flag |
| Certificates → Bulk Generate  | Remove from sidebar for now                                       |
| Alumni → Events               | Remove from sidebar if alumni module is disabled by feature flag  |
| Attachments → Upload          | Remove from sidebar for now                                       |
| Attachments → Categories      | Remove from sidebar for now                                       |

**I recommend Option A (remove from sidebar) for all 7 pages.** The feature flags already hide most of these in production. We can add them back when the modules are complete.

---

## 4.9 Feature Flag Alignment

**File:** `frontend/src/lib/feature-flags.ts`

**Current:** 6 module flags defined but never checked in sidebar. Sidebar uses `isBeta` differently.
**Action:** Decide which feature flags should be enabled in production. Wire module-level flags into the sidebar filtering logic. Remove `isBeta` flag system if it duplicates module flags.

---

## 4.10 Consolidate Duplicate Paystack Services

**Files:**

- `backend/src/finance/paystack.service.ts` (original)
- `backend/src/finance/payments.service.ts` (duplicate)

**Action:** Determine which is the primary service. Merge webhook handling into the primary. Remove the duplicate. Update all references.

---

## PHASE 4 VERIFICATION CHECKLIST

- [ ] Login Log page shows real audit data or "No data" empty state
- [ ] Custom Fields page either uses real API or shows "Coming Soon"
- [ ] Student Fields save actually persists data
- [ ] System Update page either uses real API or is removed from sidebar
- [ ] No stray HTML files in app directory
- [ ] Student dashboard shows real activity or empty state (not fake)
- [ ] Paystack payments record correct method (`PAYSTACK` not `FLUTTERWAVE`)
- [ ] All placeholder pages are either implemented or removed from sidebar
- [ ] Feature flags are consistently applied
- [ ] No duplicate Paystack service
- [ ] All existing tests still pass

**Notify me when Phase 4 is complete and verified.**

---

# ═══════════════════════════════════════════

# PHASE 5 — DATABASE SCHEMA MIGRATIONS

# ═══════════════════════════════════════════

# Estimated effort: 8-12 hours

# Prerequisites: Phase 4 complete and approved

# WARNING: This phase involves database migrations.

# Take a full backup before running any migration.

# ═══════════════════════════════════════════

## 5.1 Convert Float Money Fields to Decimal

**Prisma schema changes:**

```prisma
// Change all Float money fields to Decimal:
FeeStructure.amount        Float → Decimal @db.Decimal(10,2)
Invoice.totalAmount         Float → Decimal @db.Decimal(12,2)
Invoice.balance             Float → Decimal @db.Decimal(12,2)
InvoiceItem.amount          Float → Decimal @db.Decimal(10,2)
Payment.amount              Float → Decimal @db.Decimal(12,2)
LibraryFine.amount          Float → Decimal @10,2)
SalaryTemplate.basicSalary  Float → Decimal @db.Decimal(12,2)
SalaryTemplate.netSalary    Float → Decimal @db.Decimal(12,2)
Payroll.amountPaid          Float → Decimal @db.Decimal(12,2)
AdvanceSalary.amount       Float → Decimal @db.Decimal(12,2)
InventoryProduct.costPrice  Float → Decimal @db.Decimal(10,2)
InventoryProduct.sellingPrice Float → Decimal @db.Decimal(10,2)
InventoryPurchase.unitPrice Float → Decimal @db.Decimal(10,2)
InventoryPurchase.totalPrice Float → Decimal @db.Decimal(12,2)
InventorySale.unitPrice    Float → Decimal @db.Decimal(10,2)
InventorySale.totalPrice   Float → Decimal @db.Decimal(12,2)
Voucher.amount             Float → Decimal @db.Decimal(12,2)
AssessmentRecord.asgn1     Float → Decimal @db.Decimal(5,2)
AssessmentRecord.asgn2     Float → Decimal @db.Decimal(5,2)
AssessmentRecord.test1     Float → Decimal @db.Decimal(5,2)
AssessmentRecord.test2     Float → Decimal @db.Decimal(5,2)
AssessmentRecord.examScore Float → Decimal @db.Decimal(5,2)
AssessmentRecord.total     Float → Decimal @db.Decimal(5,2)
OnlineExamAttempt.score    Float → Decimal @db.Decimal(5,2)
Question.marks             Float → Decimal @db.Decimal(5,2)
ProviderBalanceSnapshot.balance Float → Decimal @db.Decimal(12,2)
```

**Backend changes:** Anywhere these fields are used in calculations, replace `parseFloat` / number arithmetic with Prisma's Decimal methods or `decimal.js`.

**Migration:** `npx prisma migrate dev --name convert-float-to-decimal`

⚠️ **This is a destructive migration. Test on staging first. Decimal and Float are not always compatible in PostgreSQL.**

---

## 5.2 Add branchId to Missing Models

Add `branchId String` and `branch Branch @relation(fields: [branchId], references: [id])` to these models:

```
SalaryTemplate, Payroll, LeaveRequest, StaffAward, AdvanceSalary,
BorrowRecord, LibraryFine, HostelAllocation, HostelLeave,
TransportAssignment, TransportAttendance, Submission,
BookCopy, BookReservation, MaintenanceRequest,
HostelMaintenanceTicket
```

For each model:

1. Add `branchId String` field
2. Add `branch` relation
3. Add `@@index([branchId])`
4. Add the relation to the `Branch` model

**Migration:** `npx prisma migrate dev --name add-branchid-to-models`

⚠️ **This requires a data migration to populate branchId for existing records.** For each model, derive branchId from related records (e.g., BorrowRecord.branchId = Book.branchId).

---

## 5.3 Add Phase 7 Models to Branch Relations

The following models have `branchId` but are NOT in the Branch model's relation list:

```
Exam, ExamType, AssessmentComponent, ResultApproval, ResultPublication,
GPARecord, StudentRanking, Broadsheet, Transcript, AcademicRemark,
SubjectPosition, TahfeezAssessment, TahfeezMemorizationProgress
```

**Action:** Add these as relation fields in the `Branch` model and ensure `branch Branch @relation(...)` exists on each model.

---

## 5.4 Convert String Status Fields to Enums

Create Prisma enums for the most critical status fields:

```prisma
enum StaffStatus {
  ACTIVE INACTIVE ON_LEAVE SUSPENDED TERMINATED
}

enum BorrowStatus {
  BORROWED RETURNED OVERDUE LOST
}

enum MaintenanceStatus {
  OPEN IN_PROGRESS RESOLVED CLOSED
}

enum HostelLeaveStatus {
  PENDING APPROVED REJECTED CANCELLED
}

enum PayrollStatus {
  UNPAID PAID PROCESSING CANCELLED
}

enum SubmissionStatus {
  SUBMITTED GRADED LATE DRAFT
}

enum OnlineAdmissionStatus {
  PENDING APPROVED REJECTED ENROLLED CANCELLED
}
```

Apply these to the corresponding model fields.

---

## 5.5 Add MustChangePassword Field to User

Already covered in Phase 2.2, but the migration must be coordinated with this phase.

---

## 5.6 Add Missing Database Indexes

```prisma
// Notification
@@index([userId, isRead, createdAt])

// Invoice
@@index([branchId, status])
@@index([branchId, dueDate])

// Payment
@@index([branchId, status])

// LeaveRequest
@@index([status])

// Message
@@index([conversationId, createdAt])

// Student
@@index([parentId])
@@index([branchId, classId])

// User
@@index([role, isActive])
@@index([email, isActive])

// Exam
@@index([sessionId, status])

// AuditLog
@@index([module])
@@index([targetType, targetId])
```

---

## PHASE 5 VERIFICATION CHECKLIST

- [ ] All Float → Decimal migrations applied successfully on staging
- [ ] All branchId migrations applied, existing records populated
- [ ] Phase 7 models visible in Branch relations
- [ ] New enum types created and applied
- [ ] `mustChangePassword` field added to User model
- [ ] All indexes created
- [ ] Application starts without errors
- [ ] All existing tests still pass
- [ ] Sample data verified: 0.1 + 0.2 = 0.3 (not 0.30000000000000004)

**⚠️ This phase requires my intervention for: database backup, running migrations on staging, and verifying data integrity. Notify me before running any migration.**

---

# ═══════════════════════════════════════════

# PHASE 6 — CODE QUALITY & ARCHITECTURE

# ═══════════════════════════════════════════

# Estimated effort: 12-16 hours

# Prerequisites: Phase 5 complete and approved

# ═══════════════════════════════════════════

## 6.1 Implement Permission System Enforcement

**Current state:** `RolePermission` table seeded but never checked.
**Action:** Create a `PermissionsGuard`:

```typescript
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string[]>(
      "permissions",
      context.getHandler(),
    );
    if (!requiredPermission) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const permissions = await this.prisma.rolePermission.findMany({
      where: { role: user.role, isAllowed: true },
    });

    return requiredPermission.every((p) =>
      permissions.some((perm) => `${perm.module}:${perm.action}` === p),
    );
  }
}
```

Add `@Permissions('student:delete')` decorator to relevant endpoints.

---

## 6.2 Create Shared Types Package

**Current state:** `packages/shared-types/` exists but is unused.

**Action:**

1. Define shared DTOs and response types in `packages/shared-types/src/`
2. Export API response interfaces, enum types, and validation schemas
3. Import in both `backend` and `frontend`
4. Add build step to workspace root `package.json`

---

## 6.3 Migrate Controllers from `@Req() req` to `@GetTenantContext()`

**Files with deprecated pattern (17 methods):**

- `integrations.controller.ts` (6 methods)
- `alumni.controller.ts` (5 methods)
- `public-api.controller.ts` (2 methods)
- `users/preferences/preferences.controller.ts` (2 methods)

**Action:** Replace `@Req() req: any` with `@GetTenantContext() context: TenantContext` and `@CurrentUser() user: JwtPayload` decorators.

---

## 6.4 Fix FinanceAnalytics Live Data Integration

Already covered in Phase 3.8, but if the backend endpoint doesn't exist yet:

- Create `GET /finance/stats/payment-methods` returning actual distribution
- Wire frontend to fetch real data
- Remove fabricated 40/35/25% split

---

## 6.5 Remove Console.log from Production Code

**Backend (~8 instances):** Replace with NestJS `Logger` service
**Frontend (~90 instances):**

- Remove debug logs (`console.log`)
- Keep `console.error` in catch blocks but gate behind `process.env.NODE_ENV === 'development'`
- Remove PII-leaking logs (emails, admission data, student data)

---

## 6.6 Fix Socket Connection Leak

**File:** `frontend/src/hooks/useRealtime.ts`

**Current:** Empty cleanup function, new socket on every component mount
**Action:** Implement a singleton socket manager:

```typescript
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private refCount = 0;

  static getInstance() { ... }
  connect(token: string) { if (!this.socket) this.socket = io(...); this.refCount++; }
  disconnect() { this.refCount--; if (this.refCount <= 0) { this.socket?.disconnect(); this.socket = null; } }
  on(event, handler) { this.socket?.on(event, handler); }
  off(event, handler) { this.socket?.off(event, handler); }
}
```

---

## 6.7 Fix Blob URL Memory Leaks

**File:** `frontend/src/services/reportingService.ts`

**Action:** Wrap all 8 export methods with:

```typescript
const url = window.URL.createObjectURL(new Blob([response.data]));
const link = document.createElement("a");
link.href = url;
link.setAttribute("download", filename);
document.body.appendChild(link);
link.click();
link.remove();
window.URL.revokeObjectURL(url); // <-- Add this
```

---

## 6.8 Add CORS Environment Configuration

**File:** `backend/src/main.ts` ~lines 68-80

**Current:** `http://localhost:3000` always included
**Action:** Only include `localhost` in development mode:

```typescript
const allowedOrigins = [
  ...(process.env.NODE_ENV === "development" ? ["http://localhost:3000"] : []),
  ...(process.env.CORS_ALLOWED_ORIGINS
    ? process.env.CORS_ALLOWED_ORIGINS.split(",")
    : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];
```

---

## 6.9 Add API Versioning

**File:** `backend/src/main.ts`

**Action:** Add versioning prefix:

```typescript
app.setGlobalPrefix("api/v1", {
  exclude: ["health"],
});
```

This requires updating ALL frontend API calls. The frontend `api.ts` base URL should change to `/api/v1`.

---

## PHASE 6 VERIFICATION CHECKLIST

- [ ] `@Permissions` guard blocks unauthorized access
- [ ] All controllers use `@GetTenantContext()` instead of `@Req() req`
- [ ] Shared types package builds and is importable
- [ ] No `console.log` in backend production code (use Logger)
- [ ] No PII in frontend console output
- [ ] Socket connections properly disconnect on component unmount
- [ ] Blob URLs revoked after download
- [ ] CORS excludes localhost in production
- [ ] API versioning prefix `/api/v1` works
- [ ] All existing tests still pass

**Notify me when Phase 6 is complete and verified.**

---

# ═══════════════════════════════════════════

# PHASE 7 — PRODUCTION HARDENING

# ═══════════════════════════════════════════

# Estimated effort: 12-16 hours

# Prerequisites: Phase 6 complete and approved

# ═══════════════════════════════════════════

## 7.1 Configure HTTPS in Nginx

**File:** `nginx/conf.d/default.conf`

**Action:** Add SSL configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name basaerschools.com.ng;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Redirect HTTP to HTTPS
    # ...
}

server {
    listen 80;
    server_name basaerschools.com.ng;
    return 301 https://$server_name$request_uri;
}
```

Add `Strict-Transport-Security` header.
Set up Let's Encrypt or CloudFlare SSL.

---

## 7.2 Configure Nginx Rate Limiting

**File:** `nginx/nginx.conf`

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;

server {
    location /api/auth/login {
        limit_req zone=auth burst=3 nodelay;
    }
    location /api/ {
        limit_req zone=api burst=20 nodelay;
    }
}
```

---

## 7.3 Add CSP Improvements

**File:** `backend/src/main.ts`

**Current:** `scriptSrc: ["'self'", "'unsafe-inline'"]` and `connectSrc: ["'self'", 'https:', 'http:']`
**Action:** Tighten CSP:

```typescript
scriptSrc: ["'self'"],  // Remove unsafe-inline, use nonce-based
styleSrc: ["'self'", "'unsafe-inline'"],  // Keep for Tailwind
connectSrc: ["'self'", process.env.FRONTEND_URL],  // Restrict to known origins
imgSrc: ["'self'", "data:", "https://lh3.googleusercontent.com", process.env.R2_PUBLIC_DOMAIN],
```

---

## 7.4 Fix CI Pipeline

**File:** `.github/workflows/ci.yml`

**Action:**

1. Remove `continue-on-error: true` from lint steps (lines 38, 59)
2. Add `npm run test:e2e` for backend E2E tests
3. Add Playwright E2E test step for frontend
4. Add `npm audit --audit-level=high` for security scanning
5. Add coverage thresholds

---

## 7.5 Add Structured Logging

**Action:**

1. Install and configure `nest-winston` or `pino` for JSON structured logging
2. Replace all `console.log`/`console.error` with injected Logger
3. Add request ID middleware for log correlation
4. Add log levels configuration via env var

---

## 7.6 Add Monitoring & Health Checks

**Action:**

1. Expose `/health/detailed` endpoint with DB, Redis, and disk status
2. Add Prometheus metrics endpoint (`/metrics`)
3. Set up alerting rules for error rate spikes
4. Add APM integration (Sentry, DataDog, or New Relic)

---

## 7.7 Add Container Resource Limits

**File:** `docker-compose.yml`

**Action:** Add resource limits to each service:

```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 2G
        cpus: "1"
      reservations:
        memory: 512M
        cpus: "0.25"
```

---

## 7.8 Add Missing Tests

### Priority Tests to Add:

1. **Auth controller tests** — login, register, forgot/reset password, bootstrap
2. **Auth guard tests** — RolesGuard, BranchGuard, JwtAuthGuard
3. **Tenant isolation tests** — verify every module respects branchId
4. **Upload security tests** — file type enforcement, size limits, path traversal
5. **Payment webhook tests** — signature verification, duplicate handling
6. **Finance CRUD tests** — invoice creation, payment recording, balance calculation
7. **Frontend E2E critical flows** — student enrollment → invoice → payment, exam taking

---

## 7.9 Accessibility Fixes

1. Add visible focus indicators to all interactive elements
2. Add `aria-live` regions for dynamic content (notifications, search results)
3. Add `scope` attributes to data table headers
4. Ensure all images have meaningful `alt` text
5. Verify color contrast meets WCAG AA (minimum 4.5:1 ratio)
6. Add skip-to-content link

---

## 7.10 Remove Dead Code

1. Delete `packages/shared-types/` (unused) — or connect it in Phase 6
2. Delete `backend/src/app.service.ts` (returns only "Hello API")
3. Delete `backend/src/app.controller.ts` newsletter endpoint (no-op)
4. Delete `frontend/src/app/stitch_home.html`
5. Delete `frontend/src/app/stitch_tahfeez.html`
6. Delete standalone Redis instance in `app.controller.ts` constructor
7. Remove `backend/dist/` from git tracking (add to .gitignore)
8. Remove commented-out sidebar items in `frontend/src/components/Sidebar.tsx`

---

## PHASE 7 VERIFICATION CHECKLIST

- [ ] HTTPS configured and working on production domain
- [ ] Nginx rate limiting active (test with `ab` or `wrk`)
- [ ] CSP does not break any frontend functionality
- [ ] CI pipeline fails on lint errors
- [ ] CI pipeline runs E2E tests
- [ ] `npm audit --audit-level=high` passes
- [ ] JSON structured logging works
- [ ] `/health/detailed` returns DB and Redis status
- [ ] Container resource limits enforced
- [ ] All accessibility fixes verified with axe-core or Lighthouse
- [ ] Dead code removed
- [ ] All existing tests still pass

**Notify me when Phase 7 is complete and verified.**

---

# ═══════════════════════════════════════════

# PHASE 8 — LONG-TERM ARCHITECTURE (OPTIONAL)

# ═══════════════════════════════════════════

# These are recommended improvements that can be

# scheduled after the system is production-stable.

# ═══════════════════════════════════════════

## 8.1 Create Finance Module Frontend

Entire Finance CRUD (fee categories, fee structures, invoices, payments, vouchers) has no frontend service. Create `financeService.ts` and corresponding dashboard pages.

## 8.2 Create Transport Module Frontend

Entire Transport CRUD has no frontend service. Create `transportService.ts` and corresponding dashboard pages.

## 8.3 Implement AssessmentScore Junction Table

Replace hardcoded `asgn1`, `asgn2`, `test1`, `test2`, `examScore` columns in `AssessmentRecord` with a dynamic `AssessmentScore` junction table linking to `AssessmentComponent`.

## 8.4 Add PostgreSQL Row-Level Security

Implement database-level RLS policies for branch isolation, providing defense-in-depth beyond application-level filtering.

## 8.5 Add Redis Response Caching

Implement response caching for frequently-accessed, rarely-changing data (branches, sessions, settings, permissions).

## 8.6 Implement Cursor-Based Pagination

Replace offset/limit pagination with cursor-based pagination for all list endpoints.

## 8.7 Add Database Partitioning

Partition the `Attendance` table by `branchId` and `date` for high-volume deployments.

## 8.8 Add Full-Text Search

Implement `pg_trgm` indexes for student name search, book search, and user search.

## 8.9 Add Audit Trail

Add `createdById` and `updatedById` fields to all models for full audit trail capability.

## 8.10 Add Soft Delete

Add `deletedAt DateTime?` to core models (Student, Class, Section, Subject, Department, Staff, Book) and implement repository-level soft delete filtering.

---

# SUMMARY TIMELINE

| Phase | Focus                        | Est. Hours | Blockers                  |
| ----- | ---------------------------- | ---------- | ------------------------- |
| **1** | Critical Security            | 4-6h       | Must complete first       |
| **2** | Auth & Data Integrity        | 6-8h       | Depends on Phase 1        |
| **3** | Broken Integrations          | 6-8h       | Depends on Phase 2        |
| **4** | Fake Data & Missing Features | 6-8h       | Needs user decisions      |
| **5** | Database Schema Migrations   | 8-12h      | Requires backup + staging |
| **6** | Code Quality & Architecture  | 12-16h     | Depends on Phase 5        |
| **7** | Production Hardening         | 12-16h     | Depends on Phase 6        |
| **8** | Long-Term Architecture       | 40+h       | Optional, ongoing         |

**Total estimated effort for Phases 1-7: ~60-80 hours**

---

# DECISION POINTS REQUIRING YOUR INPUT

Please answer the following before we start Phase 1:

1. **Phase 4 placeholder pages:** Should I remove them from the sidebar, or do you want me to implement them?
2. **Phase 5 database migrations:** Do you have a staging database to test on? I need access to run migrations safely.
3. **Feature flags:** Which modules should be enabled in production? (Alumni, Reports, Library, QR Attendance, Bulk Comms, Advanced Settings)
4. **Finance module frontend:** Is there an existing design/wireframe, or should I create basic CRUD pages?
5. **Transport module frontend:** Same as above — is there a design, or should I create basic pages?
6. **API versioning:** Should the `/api/v1` prefix be added now (Phase 6) or deferred?

Once you answer these and approve, I will begin Phase 1.
