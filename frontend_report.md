# Frontend Report — Basaeer SMS

**Date:** 2026-07-08 · **Stack:** Next.js 16.1 (App Router, `output: standalone`), React 19.2, TypeScript `strict:true`, Radix UI, TanStack Query + Table, react-hook-form + zod, zustand, framer-motion, socket.io-client, recharts, sonner.
**Surface:** 224 `page.tsx` (193 under `/dashboard`), plus public marketing routes (`about`, `admission`, `academics`, `alumni`, `campuses`, `careers`, `contact`, `events`, `gallery`, `news`, `portal`, `student-life`).

> **Scope note:** A 224-page surface cannot be individually reachability-tested in a static pass. This report covers the shared infrastructure (auth, API client, routing gate, state) where systemic issues live, plus a prioritized follow-up checklist for per-page QA.

## Strengths

- **Modern, coherent stack** with server components + App Router; `strict: true` in `tsconfig.json`.
- **Correct token handling:** auth token is an httpOnly cookie only; `localStorage` holds just `activeBranchId`/`activeSessionId` (`context/AuthContext.tsx:119-149`), not the JWT. Middleware gates routes off the cookie (`middleware.ts:4`). This avoids the classic XSS-token-theft trap.
- **Centralized axios client** with `withCredentials`, a 15s timeout, response-envelope unwrapping, and toast-based error surfacing (`lib/api.ts`).
- **Data layer:** TanStack Query for server state + zustand for client state is a sound separation. react-hook-form + zod gives typed, validated forms.
- **Image domains** are allowlisted in `next.config.ts` (no wildcard remote images).

## Findings

### F1 — Global mutable branch context is a wrong-tenant data race *(High)*
- **Evidence:** `lib/api.ts:14` `let _activeBranchId` is a module-level mutable, set by `setApiBranchContext` and injected into every request via the interceptor (`:42-53`).
- **Impact:** Under React 19 concurrent rendering or rapid branch switching, in-flight requests can read a `_activeBranchId` that changed mid-flight, causing data to be fetched/written against the **wrong branch**. For a multi-tenant school system this is a correctness and privacy issue, not just a UX bug.
- **Fix:** Thread branch id through the TanStack Query key and per-request config rather than a global; invalidate queries on branch change. *(2 days)*

### F2 — Error contract coupled to backend copy *(Medium)*
- **Evidence:** `lib/api.ts:92-122` matches `"Branch context is required"` / `"Session context is required"` substrings to drive the context-error modal.
- **Impact:** Any backend message reword silently breaks the guided "select a branch/session" flow.
- **Fix:** Rely solely on structured `data.code`; share the enum via `packages/shared-types`. *(0.5 day)*

### F3 — Route reachability / dead-page audit not automated *(Medium)*
- **Evidence:** 224 pages, 193 under `/dashboard`. No automated link/route crawl; only 4 Playwright e2e specs exist (`e2e/`).
- **Impact:** Dead routes, unreachable pages, and broken navigation cannot be caught before release.
- **Fix:** Add a route-manifest test (Next exposes the route tree) asserting every dashboard route renders without crash for a seeded admin, plus a link crawler in e2e. *(2–3 days)*

### F4 — Empty/loading/error-state coverage unverified *(Medium)*
- The stack supports it (Query `isLoading`/`isError`, sonner toasts) but consistent empty/skeleton/error states across 193 dashboard pages were not verified.
- **Fix:** Standardize a `<QueryBoundary>` wrapper (loading skeleton + error retry + empty state) and lint for its use on data pages. *(3–4 days)*

### F5 — Accessibility & responsiveness not validated *(Medium)*
- Radix primitives give good a11y defaults, but keyboard traps, focus order, color contrast, and mobile breakpoints across custom components were not audited.
- **Fix:** Add `axe`/`@axe-core/playwright` to e2e; manual keyboard + mobile pass on the top 20 flows. *(3 days)*

### F6 — Client-side `console.*` noise *(Low)*
- Part of the 204 `console.*` calls repo-wide land in the browser bundle (some gated by `NODE_ENV==='development'` as in `lib/api.ts:124`, but not all).
- **Fix:** Strip non-dev console logs via compiler option; route real errors to a client error sink. *(0.5 day)*

## Per-Page QA Follow-up Checklist (recommended, not yet done)
For each of the 193 dashboard routes, verify: reachable from nav; loads with seeded data; loading skeleton; empty state; error state; form validation matches backend DTO; mutations invalidate the right queries; responsive at 360/768/1280px; keyboard navigable; no console errors. Automate as much as possible via Playwright + a seeded tenant.

## Summary
The frontend is the strongest-graded area architecturally (modern stack, correct auth-token handling). The one genuinely serious issue is the **global mutable branch singleton (F1)** in a multi-tenant app; the rest are QA-maturity gaps (route/empty-state/a11y coverage) rather than defects proven present.
