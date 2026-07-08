# API Report — Basaeer SMS

**Date:** 2026-07-08 · **Surface:** 63 controllers, ~532 HTTP endpoints under global prefix `api/v1` (`main.ts:135`), plus WebSocket gateways under `realtime/`.

> **Scope note:** With 532 endpoints, this report samples representative controllers and reports systemic patterns rather than enumerating every route. A machine-generated inventory should be produced from the Swagger document (`SwaggerModule.createDocument`, `main.ts:166`) and committed as a build artifact.

## Global Conventions (Strengths)

- **Versioned prefix:** all routes under `/api/v1`, `health` excluded (`main.ts:135`) — clean, orchestrator-friendly.
- **Standard response envelope:** `ResponseTransformInterceptor` wraps responses as `{ success, data }`, unwrapped client-side (`frontend/src/lib/api.ts:57-68`). Consistent.
- **Global validation:** `whitelist: true, forbidNonWhitelisted: true, transform: true` (`main.ts:127-135`) — unknown fields are rejected, DTOs enforced. Strong default.
- **Swagger** configured with bearer + cookie auth (`main.ts:160-166`), correctly **disabled in production** (`main.ts:169-171`).
- **Auth stack:** `JwtAuthGuard` + `RolesGuard` + `BranchGuard` (+ `PermissionsGuard`, `MustChangePasswordGuard` globally) — layered authZ.

## Findings

### API1 — No published contract in production *(Medium)*
Swagger UI is off in prod (correct for exposure) but no OpenAPI JSON is emitted as an artifact. Consumers (mobile, integrations, `public-api/`) have no authoritative schema.
**Fix:** Emit `swagger.json` at build time; publish to an internal location. *(2 hrs)*

### API2 — Stringly-typed error contract *(Medium)*
The frontend detects tenant-context failures by substring-matching messages like `"Branch context is required"` (`frontend/src/lib/api.ts:92-122`) alongside a structured `data.code` path. Two parallel mechanisms; the string path breaks on any copy change.
**Fix:** Emit only typed `code`s from a shared enum in `packages/shared-types`; delete the string-matching branch. *(1 day)*

### API3 — Inconsistent throttle configuration *(Low/Medium)*
Global 100/min (`app.module.ts:84`) plus ad-hoc per-route `@Throttle` (auth 5/min & 3/min; events module defines its own `ThrottlerModule.forRoot`; attachments 10/min). No consistent policy, and all of it is in-memory (see security S4).
**Fix:** Centralize a tiered throttle policy on Redis storage. *(2 hrs w/ S4)*

### API4 — BranchGuard infers `branchId` from multiple request locations *(Medium)*
`branch.guard.ts:45-54` reads the requested branch from `params`/`query`/`body` and a route-path heuristic (`request.route?.path?.includes('/branches/')`). The heuristic is fragile; endpoints that carry a branch id under a different param name bypass the explicit cross-branch check and rely solely on the Prisma extension. It works today because the extension is the real enforcement, but the guard gives a false impression of independent protection.
**Fix:** Make tenant enforcement single-sourced (Prisma extension) and treat the guard purely as context population, or standardize the branch param name. *(1 day)*

### API5 — Endpoint/consumer reconciliation not automated *(Medium)*
Frontend calls go through a single axios instance (`frontend/src/lib/api.ts`) and per-domain service files (`frontend/src/services/*.ts`). There is no automated check that every FE call maps to an existing BE route or that every BE route has a consumer. Orphaned endpoints and FE calls to renamed routes will only fail at runtime.
**Fix:** Generate a typed client from the OpenAPI doc (e.g. `openapi-typescript`) so route drift becomes a compile error. *(2–3 days)*

## Endpoint Inventory Template (to be auto-generated)

| Method | Route | Purpose | Auth | Roles/Perms | Status | FE Consumer | Documented |
|---|---|---|---|---|---|---|---|
| POST | /api/v1/auth/login | Login, set cookie | Public (throttled 5/min) | — | ✅ | `AuthContext` | ✅ |
| POST | /api/v1/auth/bootstrap | Create first super admin | Secret token | — | ✅ | setup only | ✅ |
| POST | /api/v1/auth/register | Create user | JWT+Roles | SUPER_ADMIN | ✅ | admin UI | ✅ |
| GET | /api/v1/auth/profile | Current profile | JWT+Branch | any | ✅ | `AuthContext` | ✅ |
| POST | /api/v1/auth/select-branch | SA branch context | JWT+Branch | SUPER_ADMIN | ✅ | branch switcher | ✅ |
| POST | /api/v1/students | Create student | JWT+Branch | admin/staff | ✅ | students UI | ✅ |
| … | *(527 more)* | *auto-generate from Swagger* | | | | | |

**Action:** Commit a script that walks the Swagger document and renders the full table into `api_report.md` on each build.

## Summary
The API layer is well-structured and consistently guarded/validated — the systemic risks are **contract governance** (no prod OpenAPI artifact, stringly-typed errors, no FE↔BE drift check) and the **in-memory throttling** shared with the security report. No evidence of raw-SQL injection or missing global validation was found.
