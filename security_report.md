# Security Report — Basaeer SMS

**Date:** 2026-07-08 · **Standard:** OWASP Top 10 (2021) mapping · CVSS 3.1 vectors are indicative.

Every finding: File · Evidence · Root Cause · Impact · Severity · Remediation · Fix Time.

---

## S1 — Real database dump with password hashes committed to git *(Critical)*

- **File:** `backend/backups/backup-2026-05-16T15-28-41-567Z.sql` (9,865 lines)
- **Evidence:** `COPY public."User" (id, email, password, …)` rows include live bcrypt hashes, e.g. `super.admin@basaeer.com … $2b$08$Jm3gg37...` and `branch.admin@basaeer.com`, `teacher@basaeer.com`. The dump also contains every table's data (`COPY public."AuditLog"`, `"AttendanceScan"` with `ipAddress`, etc.).
- **Root cause:** Backups written into a repo-tracked directory; no `backups/`/`*.sql` gitignore entry.
- **Impact:** Anyone with repo (or fork/clone/CI-artifact) access obtains password hashes for privileged accounts and a full snapshot of PII. Hashes are bcrypt-cost-8 → offline-crackable. **OWASP A02 (Cryptographic Failures) / A01.**
- **CVSS:** ~9.1 (AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N) if repo is not strictly private; treat as Critical regardless.
- **Remediation:** Purge from history (`git filter-repo`/BFG), force-rotate all affected passwords, invalidate the hashes, add `backend/backups/` and `*.sql` to `.gitignore`, move backups to encrypted off-repo storage.
- **Fix time:** 0.5 day.

## S2 — No session revocation; JWT trusted without DB re-validation *(High)*

- **File:** `backend/src/auth/jwt.strategy.ts:30-39`; logout `backend/src/auth/auth.controller.ts:91-99`.
- **Evidence:** `validate(payload)` returns `{ id, email, role, branchId, … }` straight from the token — no user lookup. Logout only `clearCookie`; the JWT remains valid until expiry.
- **Root cause:** Pure-stateless JWT with a 7-day lifetime and no revocation store.
- **Impact:** Deactivating, deleting, demoting, or reassigning a user has **no effect for up to 7 days**. A stolen/leaked token cannot be revoked. **OWASP A07 (Auth Failures).**
- **CVSS:** ~7.5.
- **Remediation:** In `validate`, fetch the user and reject if missing/`!isActive`; resolve `role`/`branchId` from DB. Add short-lived access tokens + refresh rotation and a Redis revocation/blocklist keyed by jti; logout adds jti to blocklist.
- **Fix time:** 3–4 days.

## S3 — Weak bcrypt cost factor (8) *(High)*

- **Files:** `backend/src/auth/auth.service.ts:85,156,173,219` + 9 further `bcrypt.hash(x, 8)` sites (13 total).
- **Root cause:** Hardcoded cost 8.
- **Impact:** ~4× faster offline cracking vs cost 10, ~16× vs 12. Compounds S1. **A02.**
- **Remediation:** Central constant `BCRYPT_ROUNDS=12`; opportunistically rehash on successful login when a hash's cost < target.
- **Fix time:** 2 hrs (+ opportunistic rehash 0.5 day).

## S4 — Rate limiting stored in process memory *(High)*

- **File:** `backend/src/app.module.ts:84` — `ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }])` with no `storage`.
- **Root cause:** Default `ThrottlerStorage` is per-process memory.
- **Impact:** With N API instances behind Nginx, an attacker gets N× the limit and counters reset on redeploy. The `@Throttle({limit:5})` on `/auth/login` (`auth.controller.ts:49`) and `{limit:3}` on password reset become ineffective at scale — **brute-force / credential-stuffing exposure. A07 / A04.**
- **Remediation:** Use a Redis throttler storage (`@nest-lab/throttler-storage-redis` or ioredis-backed). Redis is already a dependency.
- **Fix time:** 2 hrs.

## S5 — No refresh tokens; long-lived access cookie *(Medium)*

- **Files:** `auth.service.ts:33-57`; cookie `maxAge: 7*24*60*60*1000` (`auth.controller.ts:79`).
- **Impact:** A single long-lived credential; theft window = 7 days; no rotation. **A07.**
- **Remediation:** ~15-min access + rotating refresh (httpOnly, `sameSite`, path-scoped). Pairs with S2.
- **Fix time:** included in S2.

## S6 — Stale authorization claims in token *(Medium)*

- **File:** `jwt.strategy.ts:30-39`, `auth.service.ts:34-41`.
- **Impact:** `role` and `branchId` are frozen at login. Privilege changes/branch moves don't apply until re-login — both an over-privilege and an under-privilege bug. **A01.**
- **Remediation:** Resolve authorization context from DB per request (or on refresh).
- **Fix time:** folded into S2.

## S7 — Multi-tenant isolation depends on a hand-maintained allowlist *(High)*

- **File:** `backend/src/prisma/prisma.service.ts:118-150` (literal array of ~130 model names) and `:169` gate `!systemModels.includes(model)`.
- **Root cause:** Tenant scoping is applied to models *not* in a `systemModels` exclusion set, but the scoping/branch logic is coordinated through hardcoded name lists rather than schema metadata.
- **Impact:** Add a new branch-scoped model and forget to wire it correctly, and its queries can execute unscoped → **cross-branch data exposure (IDOR-at-scale). A01.** This is a bug generator, not just a one-off.
- **Remediation:** Derive scoped models programmatically from `Prisma.dmmf` (models having a `branchId` field); add a unit test that fails if any `branchId`-bearing model is treated as a system model.
- **Fix time:** 2 days.

## S8 — RLS scaffolding without policies *(Medium, defense-in-depth gap)*

- **File:** `prisma.service.ts:243-262` sets `app.current_branch_id`/`app.current_session_id` via `set_config`.
- **Evidence:** No `CREATE POLICY`/`ENABLE ROW LEVEL SECURITY` found in `prisma/migrations`.
- **Impact:** The `set_config` calls suggest DB-enforced RLS is intended but not deployed; the app relies solely on the Prisma-extension layer (S7). False sense of layered defense.
- **Remediation:** Either implement RLS policies keyed on those settings, or remove the dead `set_config` calls to avoid confusion.
- **Fix time:** 3 days (RLS) or 1 hr (removal).

## S9 — CSRF mitigations are advisory *(Medium)*

- **Evidence:** Auth cookie `sameSite:'lax'` (`auth.controller.ts:78`); FE sets `X-Requested-With` (`frontend/src/lib/api.ts:37`) but the backend never verifies it.
- **Impact:** SameSite=Lax blocks cross-site *top-level GET-triggered* CSRF but permits some cross-origin request vectors; state-changing POST/PATCH with cookie auth are not defended by a token. **A01.**
- **Remediation:** Verify `X-Requested-With` server-side for cookie-authenticated mutations, or add a double-submit CSRF token. Consider `sameSite:'strict'`.
- **Fix time:** 1 day.

## S10 — Secret topology leaked via committed template *(Medium)*

- **File:** `.env.save` (repo root, git-tracked).
- **Evidence:** Enumerates `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ENCRYPTION_SECRET`, `BOOTSTRAP_SECRET`, `SEED_ADMIN_PASSWORD`, SMTP creds — values are placeholders (`change-me…`) but names, hostnames (`smtp-relay.brevo.com`), and architecture are disclosed.
- **Remediation:** Remove from repo + history; keep only `.env.example` (already present).
- **Fix time:** 1 hr.

---

## OWASP Top 10 Coverage Summary

| OWASP 2021 | Status | Notes |
|---|---|---|
| A01 Broken Access Control | ⚠️ | Tenant guard is good but list-driven (S7); stale claims (S6); CSRF (S9) |
| A02 Cryptographic Failures | ❌ | Committed hashes (S1), bcrypt-8 (S3) |
| A03 Injection | ✅ (mostly) | Prisma parameterizes; only `$executeRawUnsafe` use is `set_config` with bound params (`prisma.service.ts:245`). No string-concatenated SQL found in app code. |
| A04 Insecure Design | ⚠️ | Session lifecycle (S2/S5); in-memory throttle (S4) |
| A05 Security Misconfiguration | ⚠️ | Good Helmet/CSP/HSTS; Swagger correctly off in prod; but secrets hygiene (S1/S10) |
| A06 Vulnerable Components | ➖ | CI runs `npm audit --audit-level=high`; not re-run here — verify current advisories |
| A07 Auth Failures | ❌ | S2/S4/S5/S6 |
| A08 Data Integrity Failures | ⚠️ | Weak delete rules (see database_report R5) |
| A09 Logging/Monitoring | ⚠️ | Winston + audit log exist; no tracing/alerting (see production report) |
| A10 SSRF | ➖ | `googleapis`/axios integrations present; no user-controlled URL fetch surfaced in this pass — flag for targeted review of `integrations/` and `live-classes/`. |

**Positives credited:** hashed+expiring reset tokens (`auth.service.ts:191-206`), enumeration-safe forgot-password, constant-time bootstrap compare (`auth.controller.ts:114-118`), global DTO whitelist validation (`main.ts:127-135`), httpOnly cookie (token not in localStorage), DB/Redis localhost-bound in compose.
