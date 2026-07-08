# Testing Report — Basaeer SMS

**Date:** 2026-07-08

## Inventory

| Layer | Count | Notes |
|---|---|---|
| Backend unit/integration (`*.spec.ts`) | ~23 | Against 742 source files / 161 models / 532 endpoints |
| Frontend e2e (Playwright, `frontend/e2e/`) | 4 | `academic-hardening.spec.ts`, `critical-flows.spec.ts`, `reports.spec.ts`, `search.spec.ts` |
| Frontend unit/component | 0 | No `*.test.tsx`/`*.spec.tsx` found |
| Mutation testing | 0 | Not configured |
| Coverage gate in CI | ❌ | `ci.yml` runs tests but enforces no threshold |

## T1 — Coverage is negligible for the risk profile *(High)*
- **Evidence:** ~23 backend specs for a system handling **payments, grades, attendance, and PII**. Auth has specs (`auth.service.spec.ts`, `auth.controller.spec.ts`, `roles.guard.spec.ts`) — good — but the finance, exams/result-computation, and tenant-isolation cores are essentially unverified.
- **Impact:** Regressions in money and grade math, or in tenant scoping, ship undetected. For an "enterprise" claim this is disqualifying.
- **Fix (phase 1, order of business risk):**
  1. **Tenant isolation:** a test that fails if any `branchId`-bearing model is excluded from scoping (also closes security S7); cross-branch read/write denial tests.
  2. **Auth lifecycle:** login throttle, reset-token expiry/single-use, must-change-password gate, (new) revocation on logout.
  3. **Finance:** fee assignment, payment posting, idempotency, transactional integrity.
  4. **Result computation:** assessment → grade → position → GPA math with fixtures.
  - *(Est: 4–5 days for phase 1)*

## T2 — No coverage enforcement in CI *(Medium)*
- **Evidence:** `.github/workflows/ci.yml` runs `npm run test` but sets no `--coverage` threshold; `lint` runs with `--fix`, which can mask lint failures.
- **Fix:** Add `jest --coverage` with a ratcheting threshold (start low, forbid regressions); run lint without `--fix` in CI. *(0.5 day)*

## T3 — No test data factories / fixtures for a 161-model schema *(Medium)*
- **Impact:** Writing meaningful integration tests is prohibitively slow without seed factories, so tests won't get written.
- **Fix:** Build fixture/factory helpers (per-tenant seed builder) and a test-DB harness (the CI already provisions Postgres + Redis services). *(3–4 days)*

## T4 — Frontend has no component tests and thin e2e *(Medium)*
- **Evidence:** 4 e2e specs for 224 pages; 0 component tests.
- **Fix:** Add Playwright route-reachability + `@axe-core/playwright` a11y checks; component tests for critical forms (admission, fee payment, result entry). *(3–4 days)*

## T5 — Untested critical paths (explicit list)
1. Cross-branch access denial (IDOR) — **untested**.
2. Payment posting & refund integrity — **untested**.
3. Result publication / approval workflow (`ResultApproval`, `ResultPublication`) — **untested**.
4. Attendance scan dedup / offline sync (`AttendanceScan.isOffline`) — **untested**.
5. Session-context enforcement (the ORM-thrown `SESSION_CONTEXT_REQUIRED`) — **untested**.
6. BullMQ job idempotency & retry (automation/exports) — **untested**.
7. Password-reset token single-use + expiry — **partially** (verify).

## Recommendation
Treat testing as a release blocker for real-user onboarding. Minimum bar before production: tenant-isolation suite, finance suite, result-computation suite, auth-lifecycle suite green in CI with a coverage floor. Testing Score: **F** today; achievable **C+** within ~2 weeks of focused work.
