# Event Management Module — Implementation Report

This report documents the design, implementation, security measures, and verification of the Event Management Module for the Basaeer ERP and Marketing Website.

---

## 1. Database Schema & Prisma Models

The PostgreSQL schema (`backend/prisma/schema.prisma`) was updated with the following models to support comprehensive event management, scheduling, packages, media galleries, and public registration.

### `CampusEvent`
The central model for events, extended with rich marketing and management properties:
*   `id`: `String @id @default(uuid())`
*   `title`: `String`
*   `slug`: `String @unique @default(uuid())` (auto-generated URL slug)
*   `shortDescription`: `String?`
*   `fullDescription`: `String?`
*   `objectives`: `String[] @default([])`
*   `rulesAndDiscipline`: `String?`
*   `requirements`: `String[] @default([])`
*   `mealsAndHospitality`: `String?`
*   `whyChooseThisEvent`: `String[] @default([])`
*   `startDate` / `endDate`: `DateTime`
*   `applicationDeadline`: `DateTime?` (for public registrations)
*   `location`: `String?`
*   `category`: `String` (e.g. `CAMP`, `SEMINAR`, `CONFERENCE`)
*   `isPublic`: `Boolean @default(true)`
*   `allowRSVP`: `Boolean @default(true)`
*   `branchId`: `String` (references `Branch`)
*   `status`: `String @default("DRAFT")` (`DRAFT`, `ACTIVE`, `COMPLETED`, `CANCELLED`)
*   `active`: `Boolean @default(true)`
*   `featuredImage`: `String?`
*   `brochurePdf`: `String?`
*   `capacity`: `Int?`
*   `registrationOpen`: `Boolean @default(true)`
*   `applicationFormEnabled`: `Boolean @default(true)`
*   `paymentRequired`: `Boolean @default(false)`
*   `seoMetadata`: `Json?` (for titles, descriptions, and keywords)

### `EventPackage`
Tracks pricing and features for different options (e.g., Boarding vs. Day student):
*   `id`: `String @id @default(uuid())`
*   `eventId`: `String` (references `CampusEvent`)
*   `title`: `String`
*   `ageRange`: `String?`
*   `timing`: `String?` (e.g., "8:00 AM - 4:00 PM")
*   `fee`: `Decimal @db.Decimal(12, 2)` (ERP financial precision)
*   `boardingType`: `String` (`DAY`, `BOARDING`)
*   `availableSlots`: `Int?`
*   `description`: `String?`

### `EventSchedule`
Structured program events:
*   `id`: `String @id @default(uuid())`
*   `eventId`: `String` (references `CampusEvent`)
*   `day`: `String` (e.g., "Monday", "Daily")
*   `period`: `String?` (e.g., "Morning", "Evening")
*   `startTime` / `endTime`: `String` (formatted as "HH:MM")
*   `activity`: `String`

### `EventGallery`
Media management for marketing highlights:
*   `id`: `String @id @default(uuid())`
*   `eventId`: `String` (references `CampusEvent`)
*   `imageUrl`: `String`
*   `isCover`: `Boolean`
*   `order`: `Int`
*   `caption`: `String?`

### `EventApplication`
Tracks registrations submitted via the public application portal:
*   `id`: `String @id @default(uuid())`
*   `eventId`: `String`
*   `packageId`: `String`
*   `branchId`: `String`
*   `fullName`: `String`
*   `gender`: `String`
*   `dateOfBirth`: `DateTime`
*   `age`: `Int`
*   `parentName` / `parentPhone` / `parentEmail`: `String`
*   `address` / `state` / `localGovernment`: `String`
*   `memorizationLevel`: `String?`
*   `school`: `String?`
*   `islamicBackground`: `String?`
*   `previousParticipation`: `String?`
*   `medicalConditions` / `allergies`: `String?`
*   `emergencyContact`: `String`
*   `accommodationPreference`: `String?`
*   `passportPhotoUrl` / `birthCertificateUrl` / `ninUrl` / `schoolIdUrl` / `medicalReportUrl`: `String?` (Uploaded secure documents)
*   `proofOfPaymentUrl`: `String?` (Manual bank transfer slip)
*   `status`: `String @default("PENDING")` (`PENDING`, `UNDER_REVIEW`, `APPROVED`, `REJECTED`, `WAITLISTED`)
*   `paymentStatus`: `String @default("PENDING")` (`PENDING`, `VERIFIED`, `REJECTED`)

---

## 2. API Endpoints

### Public Endpoints (Unauthenticated, Rate-limited)
*   `GET /api/events/public`: Fetches all `ACTIVE` and `isPublic` events.
*   `GET /api/events/public/:slug`: Fetches detailed event configuration by URL slug (packages, schedules, gallery).
*   `POST /api/events/public/:slug/apply`: Submits registration. Rate-limited to prevent abuse.

### Admin Endpoints (JWT-Guarded & Role-isolated)
*   `GET /api/events`: List events (filtered by tenant branch).
*   `POST /api/events`: Create a new event with inline packages, schedules, and gallery images.
*   `GET /api/events/:id`: Fetch single event configuration.
*   `PATCH /api/events/:id`: Update event and its related packages/schedules.
*   `DELETE /api/events/:id`: Remove event (cascades).
*   `GET /api/events/applications`: List applications with status/branch filters.
*   `PATCH /api/events/applications/:id/status`: Update application status (approve, reject, waitlist) with audit logging.
*   `POST /api/events/applications/:id/verify-payment`: Manually verify bank transfer receipts, updating payment status.
*   `GET /api/events/analytics/overview`: Aggregated analytics including total sales, registration trends, and demographic breakdowns.

---

## 3. Security, Hardening, and Isolation

1.  **Multi-Tenant Branch Isolation**:
    *   Admin routes strictly apply `TenantHelper.applyIsolation` to ensure branch admins can only see, create, and update events and applications belonging to their assigned branch.
    *   Super admins bypass this filter, enabling cross-branch operations.
2.  **MIME-Type Derived Upload Security**:
    *   The `UploadService` was refactored in `backend/src/upload/upload.service.ts` to close extensions spoofing vulnerability. It ignores the extension in `file.originalname` and derives the extension parameter strictly from a server-verified MIME-type map.
3.  **Spam Rate-Limiting**:
    *   The public application registration endpoint uses NestJS `@Throttle({ default: { limit: 5, ttl: 60000 } })` to block automated registration scripts and bot registrations.

---

## 4. Verification & Testing

*   **Automated Tests**: Unit tests in `backend/src/events/events.service.spec.ts` verify the branch-level tenant isolation logic for both super admins and branch admins. All Jest test suites pass.
*   **Database Seeding**: The seed script was extended to populate a complete dataset for **"Dauhatul-Qur’an Camp 2026"** (including packages, daily schedules, and metadata), confirming the schema is fully operational.
*   **Monorepo Compilations**: The NestJS backend builds successfully. A compilation error in the existing Admissions component (`AdmissionDetailDialog` import mismatch) was resolved to restore monorepo build sanity.

---

## 5. Next Steps & Recommendations

1.  **Notification Webhooks**: Integrate NestJS event handlers or email triggers (e.g. NodeMailer) to automatically dispatch emails to parents when applications are `APPROVED` or payments are `VERIFIED`.
2.  **SMS Integration**: Implement SMS notifications (e.g. Twilio) for emergency updates and registration status slips.
3.  **Harden Captcha Check**: In the public registration controller, swap the placeholder CAPTCHA validation check with a Google reCAPTCHA or hCaptcha verification once keys are set up in environmental variables.
