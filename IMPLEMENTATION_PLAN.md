# Basaeer — Consolidated Remediation & Feature Plan

**Date:** 2026-07-08
**Covers:** (A) audit remediation from `audit_report_08_07_2026.md`, plus four requested features — (B) formatted admission slip PDF with passport + attached documents, (C) bulk download of all system-generated documents, (D) discount capability across financial activities.

**Grounding facts confirmed in code:**
- Admission documents live on `OnlineAdmission` as URL fields: `passportPhoto` (+2/3/4), `birthCertificateUrl`, `testimonialUrl`, `transferCertificateUrl`, `immunizationCardUrl`, `ninUrl`, `educationalCertUrl`, `transferLetterUrl`, `medicalReportUrl`, `recommendationLetterUrl`, `schoolReportUrl`, `paymentReceiptUrl`.
- PDF tooling already present: `pdfkit`, `sharp`, `archiver`, `exceljs`. Helpers live in `reporting/reporting.service.ts` (`generatePdf`, `saveExportBuffer`, `generateReportCardFromTemplate`).
- Bulk-export scaffold already exists: `AcademicExport` model + `AcademicExportProcessor` (BullMQ WorkerHost) + `archiver` + `saveExportBuffer`. **Feature C reuses this pattern rather than inventing a new one.**
- **No `discount` field exists anywhere** — Feature D is greenfield (schema migration required).
- Approval entry points: `online-admission.service.approve()`, finance `updateVoucherStatus()`, payment approval, `createInvoice()`, event payment/application flows.

**Decisions locked with the user:**
- Discounts support **both** `PERCENTAGE` and `FIXED`.
- Discounts are **permission-gated** (`finance.discount.apply`), **capped** (configurable max % / max amount), **require a reason**, and are **audit-logged** with before/after state.

---

## PART A — Audit Remediation (sequenced by the Risk Register)

This mirrors the roadmap in `audit_report_08_07_2026.md §11`. Do the security-critical items **first and independently** of the features — they are small and unblock safe testing of everything else.

### A0 — Immediate (Day 1, ~1 day total)
1. **Purge committed secrets/data (R1, R8, D4).**
   - `git rm --cached backend/backups/*.sql .env.save backend/prisma/schema.backup.prisma`
   - Add to `.gitignore`: `backend/backups/`, `*.sql`, `.env.save`, `*.backup.prisma`.
   - Rewrite history with `git filter-repo` (or BFG) to remove the SQL dump entirely; force-push; **rotate every credential and force-reset the demo/admin passwords** the dump exposed.
2. **Redis-backed throttling (R6).** Add `@nest-lab/throttler-storage-redis`; pass `storage` to `ThrottlerModule.forRootAsync` in `app.module.ts:84` using the existing ioredis connection.
3. **bcrypt cost 8 → 12 (R3).** Central constant `BCRYPT_ROUNDS` in `common/`; replace all 13 `bcrypt.hash(x, 8)` sites; opportunistic rehash-on-login in `auth.service.validateUser`.

### A1 — Short Term (Week 1)
4. **Session lifecycle (R2/R5/R9).** In `auth/jwt.strategy.ts:validate`, look up the user and reject if missing/`!isActive`; resolve `role`/`branchId` from DB. Add short-lived access token + rotating refresh token; logout adds `jti` to a Redis blocklist; `JwtAuthGuard` checks the blocklist.
5. **Metadata-driven tenant scoping (R4 / security S7).** Replace the hardcoded `systemModels` array (`prisma/prisma.service.ts:118-150`) with a set derived from `Prisma.dmmf` (models exposing a `branchId` field). Add a unit test that **fails** if any `branchId`-bearing model is treated as a system model.
6. **CSRF hardening (R11).** Verify `X-Requested-With` server-side (interceptor) for cookie-authenticated mutations, or add a double-submit token.

### A2 — Medium Term (Month 1)
7. **Referential integrity policy (R5 database D1).** Add explicit `onDelete` to the top parent relations (Branch/Session/Student first); standardize soft-delete for tenant roots; add orphan-detection integrity tests.
8. **Observability (R10).** Correlation-ID middleware; replace the 204 `console.*` calls with the Winston logger; expose a metrics endpoint + alerts on the existing health signals.
9. **Caching + object-storage-only uploads (R14/R15).** Cache branch branding + reference data; make R2/S3 mandatory in prod and drop the local-disk fallback.
10. **Migration rollback runbook + CI migration test (R12).**

### A3 — Long Term (Quarter)
11. Enable full backend `strict`; burn down 221 `any` (R13).
12. Test coverage to a defensible bar (tenant isolation, finance, result computation, auth lifecycle) with a CI coverage floor — see `testing_report.md`.

> **Feature dependency note:** Features B–D should be built **after A0** (so no new secrets leak and throttling/tenant scoping are correct) and their new financial mutations must go through the **audit logging** added in A1/A2.

---

## PART B — Admission Slip PDF (Features 1 & 2)

**Goal:** A well-formatted, downloadable admission slip PDF. **Page 1**: slip details with the student **passport photo placed on the right side**. **Subsequent pages**: every document submitted via the admission form, **one document per page**.

### B1 — Backend: slip generator service
- **New file:** `backend/src/online-admission/admission-slip.service.ts` (keeps concern out of the already-bloated `reporting.service.ts`; may reuse its `saveExportBuffer`).
- **Method:** `generateSlip(admissionId, context): Promise<Buffer>`
  1. Load the `OnlineAdmission` (tenant-scoped) + branch branding (logo/name/colors from `BranchBrandingService`).
  2. **Page 1 layout** (pdfkit):
     - Header band: branch logo + name + "Admission Slip" + admission number + date.
     - Left column: student bio (name, DOB, gender, class applied, session, guardian, contacts), a status/reference block.
     - **Right side: passport photo** — fetch `passportPhoto` URL → normalize with `sharp` (fixed aspect box, e.g. 120×150px, JPEG) → `doc.image(buffer, x, y, { fit })`. Draw a bordered frame. Fallback placeholder if missing/unfetchable.
     - Footer: QR (reuse `qrService`) linking to the verification/pipeline record; signature lines.
  3. **Document pages** — iterate an ordered list of the document URL fields (birth cert, testimonial, transfer cert, immunization, NIN, educational cert, transfer letter, medical report, recommendation letter, school report, payment receipt), skipping empty ones. For each present document, `doc.addPage()` with a caption header ("Birth Certificate"), then embed:
     - **Images** (jpg/png/webp) → `sharp`-normalize → `doc.image(..., { fit: [pageW, pageH] })`.
     - **PDFs** → pdfkit cannot embed PDF pages natively. Use `pdf-lib` to merge: build the slip cover + image pages with pdfkit, then merge any PDF documents with `pdf-lib` (`copyPages`) into the final buffer. **Add dependency: `pdf-lib`.** Order preserved: cover first, then documents in a fixed declared sequence.
     - Unknown/unfetchable → a caption page noting "Document unavailable".
  4. Return the merged buffer.
- **Fetching remote files:** a small helper that resolves each stored URL (R2/S3 or local `/uploads`) to a Buffer, with timeout + size cap + content-type sniffing (`file-type`, already a dependency). Guard against SSRF (allowlist storage host only).

### B2 — Backend: endpoint
- **New route:** `GET /api/v1/online-admissions/:id/slip` in `online-admission.controller.ts`, guarded (`JwtAuthGuard` + `BranchGuard` + permission), streaming `application/pdf` with `Content-Disposition: attachment; filename="admission-slip-<admNo>.pdf"`.
- Optional `?inline=true` to view in-browser.

### B3 — Frontend
- Add a **"Download Slip"** action on the admission detail + pipeline rows (`frontend/src/app/dashboard/...` admissions views). Calls the endpoint via the axios client (respects branch context) and triggers a blob download. Loading + error toast states.

### B4 — Edge cases & tests
- Missing passport → framed placeholder. Zero documents → single-page slip. Corrupt image → skip with caption. Very large PDFs → enforce per-file + total-size cap, else return a 413-style message.
- Tests: unit for ordering/skip logic; integration asserting page count = 1 + N present documents; snapshot of page-1 field mapping.

**Estimate:** 3–4 days (incl. `pdf-lib` merge + sharp normalization + FE wiring).

---

## PART C — Bulk Download of Generated Documents (Feature 3)

**Goal:** Bulk-download slips **and** every system-generated document type — results/report cards, admit cards, event applications, admissions/slips, transcripts, ID cards, certificates — as a single ZIP.

### C1 — Reuse existing export scaffold
- Extend the `AcademicExport` model + `AcademicExportProcessor` pattern rather than building new infrastructure. Add new export `type` values (enum/string) for: `ADMISSION_SLIPS`, `ADMIT_CARDS`, `EVENT_APPLICATIONS`, `ID_CARDS`, `CERTIFICATES`, `RESULTS` (report cards already exist). Generalize `AcademicExport` naming or add a sibling `DocumentExport` model if you prefer to keep academics-only semantics clean — **recommend generalizing** to avoid a parallel system.

### C2 — Generic bulk generator
- **New file:** `backend/src/reporting/bulk-export.service.ts` with a registry mapping each `type` → a per-item generator (e.g. admission-slip → `AdmissionSlipService.generateSlip`, admit card → cards generator, etc.) and a selector query (by filter: session/class/section/status/ids).
- **Processor flow** (BullMQ, mirrors `academic-export.processor.ts`): resolve the target list → for each item generate its buffer → `archiver.append(buffer, { name: '<safe-filename>.pdf' })` → on finish `saveExportBuffer` to storage → set `AcademicExport.fileUrl/fileSize/status/progress`, updating `updateProgress` incrementally. Idempotent by job id; retry with backoff; `expiresAt` for cleanup.
- **Concurrency/size guards:** cap item count per job; stream to disk/temp for large archives; enforce total-size ceiling; run off the request thread (async job) so the event loop never blocks — this also closes performance finding P2.

### C3 — Endpoints
- `POST /api/v1/exports/bulk` `{ type, filters }` → enqueues a job, returns `exportId`.
- `GET /api/v1/exports/:id/status` → `{ status, progress, fileUrl? }` (pattern already exists for imports).
- Download via the returned `fileUrl` (object storage, presigned).

### C4 — Frontend
- A reusable **"Bulk Download"** button/modal on each relevant list page (admissions, results, cards/admit, events/applications, certificates): pick scope/filter → start export → poll status → download when ready. One shared `useBulkExport` hook + `BulkExportModal` component.

### C5 — Tests
- Job produces a ZIP with exactly the selected items; progress reaches 100; permission enforced; tenant scoping applied to the selector (no cross-branch items).

**Estimate:** 4–6 days (generalizing the export model + per-type generators + FE hook/modal + tests).

---

## PART D — Discounts Across Financial Activities (Feature 4)

**Goal:** During **approval** of a financial activity, an authorized approver may apply a discount (percentage or fixed), capped and audited. Applies to school fees (invoices), registration fees, admission fees, and event payments.

### D1 — Schema (migration)
Add a reusable discount shape to each financial entity (`FeeStructure`/`Invoice`, `Voucher`, `EventPayment`, and the admission fee on `OnlineAdmission`). Fields per entity:
```
discountType    DiscountType?   // enum PERCENTAGE | FIXED
discountValue   Decimal?        // 10 (%) or 5000 (amount)
discountAmount  Decimal?        // computed money value actually deducted
discountReason  String?
discountedById  String?         // approver user id
discountedAt    DateTime?
```
- New enum `DiscountType { PERCENTAGE FIXED }`.
- `netAmount = grossAmount - discountAmount` stored (or computed) so ledgers/receipts are consistent.
- Add config for caps: `maxDiscountPercent` / `maxDiscountAmount` on `Branch` settings (or a `FinanceSettings` row).
- **Forward-only migration**; backfill existing rows with null discount (no-op). Follow the A2 onDelete policy for the new `discountedBy` relation.

### D2 — Permission
- New permission `finance.discount.apply` wired into `PermissionsGuard`/access-control. Approvers without it can approve but the discount fields are rejected (403) if populated.

### D3 — Service logic (shared helper)
- **New file:** `backend/src/finance/discount.util.ts`:
  - `computeDiscount({ type, value, gross, caps }) → { discountAmount, netAmount }` with validation: value ≥ 0; PERCENTAGE ≤ 100 and ≤ `maxDiscountPercent`; FIXED ≤ gross and ≤ `maxDiscountAmount`; reason required.
  - Throws `BadRequestException` on cap breach.
- Wire into each approval entry point:
  - **Fees/Invoices:** `finance.service.createInvoice` / invoice approval — apply discount, recompute balance in `updateInvoiceBalance`.
  - **Vouchers:** `finance.service.updateVoucherStatus` (on `APPROVED`) — apply discount before GL posting so the ledger reflects `netAmount`.
  - **Admission fee:** `online-admission.service.approve()` and `verifyPayment()` — apply to the admission/registration fee.
  - **Event payments:** `events.service` payment approval.
- **Every application writes an `AuditLog`** entry (`action: 'DISCOUNT_APPLIED'`, `beforeState`/`afterState`, reason, actor) — reuse `AuditService`.

### D4 — DTO changes
- Extend the relevant approval DTOs (`ApproveOnlineAdmissionDto`, voucher-status DTO, invoice DTO, event-payment approval DTO) with optional `discountType`, `discountValue`, `discountReason`. Keep global `whitelist` validation happy (add class-validator decorators).

### D5 — Frontend
- In each **approval modal** (admissions approve, finance voucher/invoice approve, event payment approve), add an optional **Discount** sub-form: type toggle (% / fixed), value, reason. Show live computed net amount and the enforced cap. Hide the control unless the user has `finance.discount.apply`. On submit, include discount fields.
- Show discount + net on receipts/printouts and in list columns.

### D6 — Tests
- Cap enforcement (both types), permission denial, reason-required, ledger reflects net, audit entry written, idempotent re-approval doesn't double-discount. Tie into the finance test suite from `testing_report.md`.

**Estimate:** 5–7 days (schema + shared util + 4 approval integrations + permission + FE modals + tests).

---

## Sequencing & Effort Summary

| Phase | Work | Depends on | Est. |
|---|---|---|---|
| **0** | A0 security-critical (secrets purge, Redis throttle, bcrypt) | — | 1 day |
| **1** | A1 session lifecycle + tenant-scoping test + CSRF | Phase 0 | 5–6 days |
| **2** | **Feature B** admission slip PDF | Phase 0 | 3–4 days |
| **3** | **Feature D** discounts (schema + logic + FE) | Phase 0, A1 audit logging | 5–7 days |
| **4** | **Feature C** bulk download (reuses B's slip generator) | Feature B | 4–6 days |
| **5** | A2 integrity/observability/caching + A3 strict/tests | ongoing | 3–4 wks |

**New dependencies:** `pdf-lib` (PDF page merge), `@nest-lab/throttler-storage-redis` (throttle). `sharp`, `archiver`, `pdfkit`, `exceljs`, `file-type` already present.

**Cross-cutting guardrails for every new mutation:** tenant-scoped queries (Feature C selectors especially), permission checks, audit logging (Feature D), size/timeout caps on file fetching (Feature B — SSRF-safe), and all heavy generation off the request thread via BullMQ (Feature C).

---

## Open defaults I chose (flag if any are wrong)
- **"The passport"** = the primary `passportPhoto` field (the extra `passportPhoto2/3/4` are treated as additional document pages if present).
- **Document order** on the slip = a fixed declared sequence (birth cert → testimonial → transfer cert → immunization → NIN → educational cert → transfer letter → medical report → recommendation letter → school report → payment receipt); empties skipped.
- **Bulk downloads run asynchronously** (BullMQ) with status polling, not synchronous request downloads — required for large batches and to avoid event-loop stalls.
- **Discount caps** are configurable per branch (default e.g. 50% / a fixed ceiling) rather than hardcoded.
