# Architecture Report — Basaeer SMS

**Date:** 2026-07-08 · **Style:** Modular monolith (NestJS) + Next.js App Router frontend + shared-types package.

## System Overview

```
┌─────────────┐   HTTPS    ┌──────────┐   /api/v1    ┌──────────────────────────┐
│ Next.js 16  │ ─────────▶ │  Nginx   │ ───────────▶ │ NestJS Modular Monolith  │
│ (frontend)  │  cookie    │ reverse  │              │  63 controllers / 532 EP │
│ 224 pages   │  auth      │  proxy   │              └───────────┬──────────────┘
└─────────────┘            └──────────┘                          │
       │ socket.io-client                                        │
       └──────────────── WebSocket (realtime/) ──────────────────┤
                                                                  ▼
             ┌──────────────┐   ┌──────────┐   ┌───────────────────────────────┐
             │ PostgreSQL 16│   │  Redis   │   │ BullMQ workers (automation,   │
             │ 161 models   │   │ throttle*│   │ exports, notifications, live) │
             └──────────────┘   │ socket   │   └───────────────────────────────┘
                                │ adapter  │   * throttle currently in-memory, not Redis
                                └──────────┘
```

## Strengths

1. **Clean feature-module boundaries.** One directory per domain (`students/`, `finance/`, `exams/`, `attendance/`, `library/`, `transport/`, `hostels/`, `inventory/`, …), each with controller/service/module/dto — idiomatic NestJS. Feature ownership is legible.
2. **Centralized multi-tenant enforcement.** `prisma/prisma.service.ts` uses a Prisma `$extends` query hook + `AsyncLocalStorage` to auto-inject `branchId`/`sessionId` into `where`/`data` for reads, writes, upserts, and deletes (`prisma.service.ts:169-268`). This is the correct place to enforce tenant isolation — far better than per-service filtering that individual developers forget.
3. **Global cross-cutting concerns wired once:** `APP_GUARD` for throttling (`app.module.ts:154`), global `ValidationPipe` with `whitelist`+`forbidNonWhitelisted` (`main.ts:127`), global exception filter, response-transform, tenant-context, and logging interceptors (`main.ts:60-66`).
4. **Realtime & jobs are first-class:** socket.io with a Redis adapter for multi-instance fan-out, BullMQ for async work, `@nestjs/schedule` for cron.
5. **Shared types package** (`packages/shared-types`) consumed by both FE and BE — good contract intent.

## Weaknesses & Anti-Patterns

### A1 — God object: `PrismaService` *(High)*
`prisma/prisma.service.ts` is ~900 lines and owns the entire tenant policy inline, including a **hardcoded ~130-name `systemModels` array** (`:118-150`). Business rules ("session context required") are embedded in the ORM layer (`:151-165`). This concentrates unrelated responsibilities (connection lifecycle, tenant policy, business validation, RLS `set_config`) in one class.
**Fix:** Extract tenant policy into a dedicated Prisma extension module; derive scoped-model set from `Prisma.dmmf` metadata; move "session required" enforcement to a guard/interceptor. *(3–4 days)*

### A2 — Business logic leakage into the data layer *(Medium)*
The ORM throwing `SESSION_CONTEXT_REQUIRED` (`prisma.service.ts:157`) forces the frontend to substring-match error messages (`frontend/src/lib/api.ts:92-122`). The data layer should not encode UX flow. **Fix:** Enforce context in a NestJS guard; return a typed error code from a shared enum.

### A3 — Frontend global mutable singleton *(Medium)*
`_activeBranchId` (`frontend/src/lib/api.ts:14`) is module-global mutable state injected into every request. Under React 19 concurrent rendering / rapid branch switching this is a **wrong-tenant data race**. **Fix:** Carry branch context through the query key / request config explicitly (TanStack Query is already used), not a mutable global.

### A4 — Duplicated cookie orchestration *(Low)*
Identical `response.cookie('access_token', …, {httpOnly, secure, sameSite, maxAge})` is repeated in `login`, `select-branch`, `select-session` (`auth.controller.ts:75,167,189`). **Fix:** One `setAuthCookie(res, token)` helper.

### A5 — Dead defense-in-depth *(Low/Medium)*
`set_config('app.current_branch_id', …)` (`prisma.service.ts:243`) implies Postgres RLS, but no RLS policies exist in migrations. Either implement or remove (see security S8).

### A6 — Coupling to generated client path *(Low)*
Imports from `../generated/client/client` (`auth.service.ts:9`, `branch.guard.ts:8`) hardwire the Prisma output path across the codebase; a Prisma config change ripples widely. Acceptable but centralize via a barrel.

## Dependency Direction & Coupling
- Direction is generally correct: controllers → services → PrismaService. No circular-import evidence surfaced in spot checks, but a full `madge`/`dpdm` circular-dependency scan is recommended (not run here).
- `AuthService` depends on `UsersService`, `MailService`, `AuditService`, `BranchBrandingService`, `PrismaService` — reasonable, though `getFullProfile`/`updateProfile` reach into Prisma directly *and* through `UsersService`, a minor consistency smell.

## Microservice / Scale Readiness
The modular monolith is the right choice for this stage. It is **not yet cleanly extractable** because (a) tenant policy lives in a shared PrismaService, (b) the frontend assumes a single API origin with a global branch singleton, and (c) throttling/cache are process-local. Fix the statefulness issues (see performance report) before considering service extraction; there is no need to split services at current scale.

## Recommendations (priority order)
1. De-monolith `PrismaService`; metadata-derive tenant scoping (also closes security S7). *(High)*
2. Move context-required enforcement out of the ORM. *(Medium)*
3. Eliminate the frontend global branch singleton. *(Medium)*
4. Run `madge --circular` and `dpdm` in CI. *(Low)*
5. Introduce a shared error-code enum in `packages/shared-types`. *(Low)*
