# Basaeer School Management System — Master Audit Report

**Date:** 2026-07-08
**Scope:** Full-stack forensic audit (backend NestJS/Prisma/PostgreSQL/Redis/BullMQ + Next.js frontend)
**Codebase size:** ~742 TypeScript/TSX source files, 63 backend controllers, ~532 HTTP endpoints, 161 Prisma models, 19 migrations, 224 frontend pages.
**Method:** Static analysis, source reading, configuration review, git-tracked artifact inspection. No live pentest was run against a deployed instance; exploitability is assessed from code.

> **How to read this report.** Every finding cites `file:line`, root cause, impact, severity, and a fix estimate. Severities: **Critical** (exploitable now / data-loss / legal exposure), **High**, **Medium**, **Low**. The nine companion reports (`security_report.md`, `architecture_report.md`, `performance_report.md`, `technical_debt_report.md`, `database_report.md`, `api_report.md`, `frontend_report.md`, `testing_report.md`, `production_readiness_report.md`) expand each domain.

---

## 1. Executive Summary

Basaeer is a large, feature-rich, multi-tenant (multi-branch) school management platform. The engineering is, in most areas, above the quality bar typical of this class of product: a global Prisma extension enforces branch/session tenant isolation centrally, Helmet + CSP + HSTS are configured, throttling is applied to auth routes, password-reset tokens are hashed at rest, the bootstrap endpoint uses constant-time token comparison, and a graceful-shutdown path exists. This is not a toy.

However, the system is **not production-ready for a platform handling millions of users and sensitive minors' data**, and it is decidedly not "enterprise-ready." The blocking issues are concentrated in a handful of areas:

1. **A full PostgreSQL database dump containing real user rows and bcrypt password hashes is committed to git** (`backend/backups/backup-2026-05-16T15-28-41-567Z.sql`). This is the single most serious finding.
2. **The session/auth model has no server-side revocation and no token re-validation.** A JWT is trusted for its entire 7-day life with no check that the user still exists, is still active, or still holds the role encoded in the token. Deactivating or firing a user does not lock them out. Logout is cosmetic.
3. **Rate limiting is stored in-process memory, not Redis.** The moment the API scales past one instance (a stated goal — "millions of users"), throttling — including the brute-force protection on `/auth/login` — becomes ineffective.
4. **Password hashing cost factor is 8** everywhere (13 call sites), well below the modern floor of 10–12.
5. **Testing is negligible for the risk profile:** ~23 backend spec files and 4 frontend e2e specs against 742 source files. Financial, grading, and tenant-isolation logic is essentially unverified by automated tests.

None of these are architecturally deep; most are days, not months, of work. The tenant-isolation design in particular is sound in intent. The gap between this codebase and "enterprise-ready" is primarily **operational maturity** (secrets hygiene, session lifecycle, observability, test coverage) rather than a rewrite.

**Bottom line:** Development-ready today; **not** safe to onboard real students, parents, or payments until the Critical and High items in the Risk Register are closed.

---

## 2. Overall Scorecard

| Dimension | Grade | Notes |
|---|---|---|
| **Security** | **D** | Committed DB dump w/ hashes, no session revocation, bcrypt rounds=8. Good bones (CSP, hashed reset tokens, tenant guard) drag it up from F. |
| **Architecture** | **B-** | Clean modular NestJS, centralized tenant isolation. Dragged down by a monolithic Prisma service, magic string model list, and global mutable branch context on the frontend. |
| **Code Quality** | **C+** | 221 `any` in backend, 204 `console.*` calls, `strict` not fully on in backend tsconfig, but consistent structure and DTO validation. |
| **Performance** | **C** | Redis present but caching used in only 3 files; in-memory throttler; no obvious pagination discipline audit-wide; sync-ish report generation. |
| **Scalability** | **C-** | Stateless JWT is good, but in-memory throttler + local-disk upload fallback + in-process cache block clean horizontal scaling. |
| **Maintainability** | **B-** | Good module boundaries; hurt by dead/duplicate config, `any` usage, and a 900+ line Prisma service. |
| **Testing** | **F** | ~23 backend specs / 4 e2e for a 742-file, finance-and-grades system. Critical paths unverified. |
| **UI/UX** | **B** | Modern stack (Next 16, Radix, TanStack Query, react-hook-form+zod). Not deeply exercised in this static pass. |
| **Production Readiness** | **D+** | Docker/CI/health checks exist; blocked by secrets, session model, observability, and tests. |

**Overall Grade: C- / D+** — Strong feature surface and better-than-average structure, undermined by a small number of Critical security and operational gaps.

---

## 3. Architecture Findings (see `architecture_report.md`)

- **Strength:** Feature-per-module NestJS layout (`students/`, `finance/`, `exams/`, `attendance/`, …), global guards wired via `APP_GUARD`, and a genuinely centralized multi-tenant enforcement layer in `prisma/prisma.service.ts` using a Prisma `$extends` query hook + AsyncLocalStorage. Tenant `branchId`/`sessionId` is auto-injected into `where`/`data` for ~130 models. This is the right pattern.
- **God object:** `prisma/prisma.service.ts` carries the entire tenant-isolation policy inline, including a **hardcoded string array of ~130 model names** (`prisma.service.ts:118-150`) that must be kept in sync by hand with `schema.prisma`. Any new model that should be tenant-scoped but is omitted from this list silently leaks across branches. This is a latent cross-tenant data-exposure bug generator.
- **Frontend global mutable state:** `frontend/src/lib/api.ts:14` holds `_activeBranchId` as a module-level mutable singleton driving which branch every request targets. Combined with React concurrency this is a race-condition surface (wrong-branch reads/writes) — see `frontend_report.md`.
- **Session-context "required" throws are business logic embedded in the data layer** (`prisma.service.ts:151-165`), which couples the ORM to UX flow and produces 400s that the frontend must pattern-match by string (`frontend/src/lib/api.ts:92-122`) — brittle contract.

---

## 4. Security Findings (see `security_report.md`)

Top items (full CVSS-style write-ups in the security report):

| # | Finding | Severity | Evidence |
|---|---|---|---|
| S1 | **Real DB dump w/ password hashes + admin emails committed to git** | **Critical** | `backend/backups/backup-2026-05-16T15-28-41-567Z.sql:8xxx` (`COPY public."User"` with bcrypt `$2b$08$...` hashes) |
| S2 | **No session revocation / no JWT re-validation against DB** | **High** | `auth/jwt.strategy.ts:30-39` returns the decoded payload verbatim; no `isActive`/existence/role check. Logout only clears the cookie (`auth.controller.ts:91-99`). |
| S3 | **bcrypt cost factor 8** (13 sites) | **High** | `auth/auth.service.ts:85,156,173,219` and 9 others |
| S4 | **Rate limiter is in-memory, not Redis** | **High** | `app.module.ts:84` `ThrottlerModule.forRoot` with no `storage`; brute-force protection breaks on >1 instance |
| S5 | **No refresh-token rotation; 7-day access token in a long-lived cookie** | **Medium** | `auth.service.ts:33-57`, `auth.controller.ts:79` (`maxAge: 7d`) |
| S6 | **Role/branch changes require re-login to take effect** (token carries stale `role`/`branchId`) | **Medium** | `jwt.strategy.ts:30-39`; `auth.service.ts:34-41` |
| S7 | **Tenant scoping depends on a hand-maintained model allowlist** — omissions leak cross-branch | **High** | `prisma/prisma.service.ts:118-150` |
| S8 | **CSRF posture relies on SameSite=Lax + a non-enforced `X-Requested-With` header** | **Medium** | cookie `sameSite:'lax'` (`auth.controller.ts:78`); backend never verifies the header set at `frontend/src/lib/api.ts:37` |
| S9 | **`.env.save` template committed** (placeholder values, but leaks infra topology, service hostnames, and every secret's name) | **Low/Medium** | tracked at repo root |

**Positives worth crediting:** hashed + expiring reset tokens (`auth.service.ts:191-206`), non-enumerating forgot-password response, constant-time bootstrap comparison (`auth.controller.ts:114-118`), Helmet CSP/HSTS (`main.ts:88-112`), `whitelist`+`forbidNonWhitelisted` global validation (`main.ts:127-135`), httpOnly cookie auth (token is **not** persisted in `localStorage`; only branch/session IDs are — `AuthContext.tsx:119`), DB/Redis bound to `127.0.0.1` in `docker-compose.yml:12,42`.

---

## 5. Database Findings (see `database_report.md`)

- **161 models, 317 relations, but only 25 `onDelete` rules declared.** The vast majority of foreign keys fall back to Prisma defaults (`Restrict`/`SetNull`), meaning deleting a `Branch`, `AcademicSession`, or `Student` will either hard-fail or silently orphan child rows depending on optionality. No deliberate cascade strategy is visible. **High** risk to data integrity.
- **Migrations are forward-only** (0 `down.sql` files across 19 migrations). Prisma's default, but there is no documented rollback/runbook — a deployment-safety gap.
- **Indexing is reasonable** (308 `@@index`/`@@unique`) but was not validated against actual query shapes; N+1 risk is present wherever services loop Prisma calls (not exhaustively audited — flagged for query-plan review).
- `AsyncLocalStorage`-scoped `SET set_config('app.current_branch_id', …)` (`prisma.service.ts:243-262`) implies Postgres **Row-Level Security** is intended, but the migrations don't show RLS policies being created — the `set_config` calls are dead defense-in-depth unless RLS policies exist server-side. Verify.

---

## 6. API Findings (see `api_report.md`)

- ~532 endpoints across 63 controllers. Swagger is configured but **disabled in production** (`main.ts:169-171`) — good for exposure, but it means there is no living API contract for consumers in prod.
- Response envelope is standardized via `ResponseTransformInterceptor` and unwrapped on the client (`frontend/src/lib/api.ts:57-68`) — good.
- **Contract is stringly-typed in places:** the frontend detects tenant-context errors by substring-matching backend messages (`api.ts:92-122`). Any wording change silently breaks the UX flow.
- Full endpoint inventory and orphan/consumer analysis in the API report (sampled, not exhaustive per-endpoint given 532 routes).

---

## 7. Frontend Findings (see `frontend_report.md`)

- Modern, coherent stack: Next 16 (App Router, `output: standalone`), React 19, Radix UI, TanStack Query + Table, react-hook-form + zod, zustand, socket.io-client. `strict: true` in `frontend/tsconfig.json`.
- **Global mutable branch context** (`api.ts:14`) is the main architectural smell — a wrong-branch data race under concurrent navigation.
- Auth token handled correctly as httpOnly cookie; middleware gate reads it (`middleware.ts:4`).
- 224 pages / 193 dashboard routes — large surface, not individually reachability-tested in this static pass; automated route-reachability and empty/error-state coverage is a recommended follow-up.

---

## 8. Performance & Scalability Findings (see `performance_report.md`)

- **Redis is provisioned but caching is used in only 3 files** — the cache layer is essentially unused; every dashboard/report hits Postgres cold.
- **In-memory throttler** (`app.module.ts:84`) — correctness *and* performance issue at scale.
- **Local-disk upload fallback** served via `useStaticAssets` (`main.ts:73-84`) is not horizontally scalable (files land on one instance's disk); R2/S3 is configured but the local fallback undermines statelessness.
- Report/PDF/Excel generation (pdfkit, exceljs, archiver) appears to run in-request in places — should be BullMQ jobs uniformly.

**Scaling verdict:** 10k users likely fine on one beefy instance; **100k+ requires** Redis-backed throttling, cache adoption, object-storage-only uploads, and DB read replicas — none of which are in place today.

---

## 9. Production Readiness (see `production_readiness_report.md`)

**Verdict: Staging-ready, not Production-ready.** Docker Compose, an Nginx reverse proxy, a CI pipeline (build + lint + `npm audit --audit-level=high` + tests), health checks with PG/Redis/BullMQ probes, and structured Winston logging all exist. Blockers: committed secrets/dump, session-revocation model, near-zero test coverage, no refresh tokens, no centralized observability/tracing/alerting, and no documented DR/rollback.

---

## 10. Risk Register

| ID | Category | Issue | Severity | Prob. | Impact | Recommendation |
|----|----------|-------|----------|-------|--------|----------------|
| R1 | Security/Data | Real DB dump w/ password hashes committed to git | Critical | High | Critical | Purge from history (git filter-repo/BFG), rotate ALL user passwords, invalidate hashes, add `*.sql` + `backups/` to `.gitignore` |
| R2 | AuthN/Session | No token revocation / no DB re-validation; logout cosmetic | High | High | High | Add short-lived access + refresh rotation; check `isActive`/existence/role in `JwtStrategy.validate`; maintain a revocation list in Redis |
| R3 | Crypto | bcrypt cost 8 | High | High | Medium | Raise to 12; rehash-on-login |
| R4 | Multi-tenant | Tenant scoping via hand-maintained model list | High | Medium | Critical | Derive scoped models from schema metadata (presence of `branchId`) instead of a literal array; add a test that fails when a `branchId` model is unlisted |
| R5 | Data Integrity | 317 relations, 25 onDelete rules | High | Medium | High | Define explicit cascade/restrict policy per relation; add FK/orphan integrity tests |
| R6 | Scalability | In-memory throttler | High | High | High | Switch to `@nest-lab/throttler-storage-redis` (or ioredis storage) |
| R7 | Testing | ~23 specs / 742 files; finance & grading untested | High | High | High | Cover auth, tenant isolation, fee/payment, result computation first |
| R8 | Config | `.env.save` template committed | Medium | High | Medium | Remove from repo & history; keep only `.env.example` |
| R9 | Session UX | Role/branch changes need re-login | Medium | High | Medium | Resolve role/branch from DB per-request, not from JWT |
| R10 | Observability | No tracing/correlation IDs/alerting; 204 `console.*` | Medium | High | Medium | Adopt correlation IDs + centralized log/metric sink; replace console with Winston |
| R11 | CSRF | SameSite=Lax + unverified custom header | Medium | Medium | Medium | Add double-submit CSRF token or verify `X-Requested-With` server-side for cookie-auth mutations |
| R12 | DB Ops | Forward-only migrations, no rollback runbook | Medium | Medium | High | Document rollback; test migrations on a prod-like snapshot in CI |
| R13 | Code Quality | 221 `any` in backend; backend `strict` incomplete | Medium | High | Low | Enable full `strict`; burn down `any` |
| R14 | Perf | Redis cache unused (3 files) | Medium | High | Medium | Cache branch branding, dashboards, reference data with TTL + explicit invalidation |
| R15 | Perf/Scale | Local-disk upload fallback breaks statelessness | Medium | Medium | Medium | Make object storage mandatory in prod; remove local fallback |

---

## 11. Remediation Roadmap

### Immediate (24 hours) — stop the bleeding
- **R1:** Purge `backend/backups/*.sql` from git history, rotate every password/secret it exposed, gitignore backups. *(Est: 0.5 day)*
- **R8:** Remove `.env.save` from repo and history. *(Est: 1 hr)*
- **R6:** Point `ThrottlerModule` at Redis storage. *(Est: 2 hrs)*
- **R3:** Bump bcrypt to 12. *(Est: 1 hr)*

### Short Term (7 days)
- **R2/R9:** Implement refresh-token rotation + per-request DB validation of `isActive`/role; make logout revoke via Redis blocklist. *(Est: 3–4 days)*
- **R4:** Replace the literal model list with schema-metadata-derived scoping + a guard test. *(Est: 2 days)*
- **R7 (phase 1):** Tests for auth, tenant isolation, fee/payment, result computation. *(Est: 4–5 days)*
- **R11:** CSRF token or server-side custom-header enforcement. *(Est: 1 day)*

### Medium Term (30 days)
- **R5:** Full onDelete/cascade policy + integrity tests. *(Est: 3–4 days)*
- **R10:** Correlation IDs, structured request logging, metrics + alerting; replace `console.*`. *(Est: 5 days)*
- **R14/R15:** Adopt Redis caching for hot reads; enforce object-storage-only uploads. *(Est: 4 days)*
- **R12:** Migration rollback runbook + CI migration test on prod-like snapshot. *(Est: 2 days)*

### Long Term (90 days)
- **R13:** Enable full `strict`, burn down `any`, complexity refactor of the Prisma service. *(Est: 2–3 wks)*
- Testing to a defensible coverage bar (unit + integration + e2e on critical journeys), DR/backup automation, read-replica + connection-pooling strategy for 100k+ users.

---

## 12. Top 20 Critical Issues

1. Committed DB dump with real password hashes & admin emails (R1).
2. No JWT revocation / no per-request user validation — fired users keep access 7 days (R2).
3. Logout does not invalidate the token server-side (R2).
4. Tenant isolation depends on a manually-maintained 130-name string list; omission = cross-branch leak (R4).
5. In-memory rate limiter — brute-force protection void at scale (R6).
6. bcrypt cost factor 8 (R3).
7. `.env.save` committed, leaking full secret topology (R8).
8. 317 relations with only 25 delete rules — orphan/hard-fail risk on deletes (R5).
9. Role/branch changes ignored until re-login (stale JWT claims) (R9).
10. No refresh token; 7-day cookie is the whole session (R2).
11. Near-zero automated test coverage on finance/grading/auth (R7).
12. `set_config` RLS hooks present but no RLS policies in migrations — false sense of defense-in-depth (Sec).
13. CSRF mitigations are advisory only (SameSite=Lax + unverified header) (R11).
14. Redis cache essentially unused — every read is cold DB (R14).
15. Local-disk upload fallback breaks horizontal scaling & durability (R15).
16. In-request PDF/Excel/zip generation risks event-loop stalls (Perf).
17. No centralized tracing/correlation IDs/alerting (R10).
18. Forward-only migrations, no rollback runbook (R12).
19. Frontend global mutable `_activeBranchId` → wrong-branch data race (Frontend).
20. Swagger disabled in prod with no alternative published contract (API).

## 13. Top 20 Quick Wins (<1 day each)

1. Gitignore + purge `backups/` and `.env.save`.
2. bcrypt 8→12.
3. Redis-backed throttler.
4. `JwtStrategy.validate` → look up user, reject if inactive.
5. Add a unit test asserting every `branchId` model is in the scoping set.
6. Replace `console.*` with the Winston logger (204 sites, mechanical).
7. Enable full `strict` in backend tsconfig.
8. Verify `X-Requested-With` server-side for state-changing cookie-auth routes.
9. Shorten access-token cookie to ~1h once refresh exists.
10. Add `helmet` `frameguard`/referrer-policy explicit config review.
11. Add DB health/`readiness` split for orchestrators.
12. Fail CI on lint errors (currently `--fix` masks them).
13. Add explicit `onDelete` to the top-10 parent relations (Branch/Session/Student).
14. Cache `branch-branding` (already fetched on every login) with TTL.
15. Add pagination assertions/defaults to list endpoints lacking them.
16. Remove the 1 committed SQL backup from the Docker build context.
17. Add correlation-ID middleware (one interceptor).
18. Publish Swagger JSON as a build artifact even when UI is off in prod.
19. Add `sameSite:'strict'` for the auth cookie where UX allows.
20. Document rollback steps in `DEPLOY.md`.

## 14. Top 20 Technical Debt Items

1. 900+ line `prisma.service.ts` god object with inline policy (`prisma.service.ts`).
2. Hardcoded 130-model tenant list (`prisma.service.ts:118-150`).
3. 221 `any` in backend `src`.
4. 204 `console.*` calls in app code.
5. Backend tsconfig not fully `strict`.
6. Stringly-typed error contract between FE and BE (`api.ts:92-122`).
7. Global mutable branch singleton on FE (`api.ts:14`).
8. Business logic (session-required) embedded in ORM layer.
9. Duplicate cookie-set logic across 4 controller methods.
10. `set_config` RLS scaffolding with no policies.
11. No shared error-code enum shared via `packages/shared-types`.
12. Forward-only migrations, no rollback tooling.
13. Local vs object-storage dual upload path.
14. Inconsistent throttle configs per-module vs global.
15. Sparse cache usage despite Redis dependency.
16. `validateUser` returns `any` (`auth.service.ts:24`).
17. Seed default passwords in env template (`.env.save`).
18. Backup SQL and `schema.backup.prisma` tracked in repo.
19. 224 FE pages with unclear reachability/ownership.
20. Missing test infra (mocks/fixtures/factories) for a 161-model schema.

## 15. Appendices & Evidence

- **Auth:** `backend/src/auth/{auth.service.ts, auth.controller.ts, jwt.strategy.ts, branch.guard.ts}`
- **Tenant isolation:** `backend/src/prisma/prisma.service.ts:90-268`
- **Bootstrap/CORS/Helmet:** `backend/src/main.ts`
- **Throttling:** `backend/src/app.module.ts:59,84,154`
- **Committed data dump:** `backend/backups/backup-2026-05-16T15-28-41-567Z.sql`
- **FE API client:** `frontend/src/lib/api.ts`
- **Schema:** `backend/prisma/schema.prisma` (161 models, 317 relations, 25 onDelete, 308 index/unique)
- **CI:** `.github/workflows/ci.yml`
- **Infra:** `docker-compose.yml`, `nginx/conf.d/`

*Companion domain reports accompany this document. Findings are evidence-driven; endpoint- and page-level enumeration was sampled where the 532-endpoint / 224-page surface exceeded exhaustive per-item review in a single pass — those areas are explicitly flagged for follow-up rather than asserted as clean.*
