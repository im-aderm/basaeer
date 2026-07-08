# Performance & Scalability Report — Basaeer SMS

**Date:** 2026-07-08 · **Target claim:** "millions of users." **Verdict:** current design scales to ~10k comfortably on one instance; **100k+ requires the fixes below** before it is viable.

## Backend

### P1 — Redis provisioned but caching effectively unused *(High)*
- **Evidence:** Only 3 files reference `CacheModule`/`cacheManager` across the backend. Branch branding is fetched on **every login** (`auth.service.ts:52-53`) uncached; dashboards/analytics hit Postgres cold.
- **Impact:** Every read is a DB round-trip. At scale the DB becomes the bottleneck for data that changes rarely (branding, reference tables, grading scales, class/section lists).
- **Fix:** Cache hot, slow-changing reads (branding, dashboards, reference data) with TTL + explicit invalidation on write. *(3–4 days)*

### P2 — In-request heavy document generation *(Medium/High)*
- **Evidence:** Dependencies `pdfkit`, `exceljs`, `archiver`, `sharp` are used for transcripts, broadsheets, ID cards, exports. Several code paths appear to generate these synchronously within the request lifecycle.
- **Impact:** CPU-bound PDF/Excel/zip work on the main event loop stalls concurrent requests; large exports risk request timeouts (client timeout is 15s — `lib/api.ts:35`).
- **Fix:** Route all report/export generation through BullMQ workers uniformly; return a job id; deliver via `AcademicExport`/download link (the schema already models `AcademicExport`). *(3–5 days)*

### P3 — N+1 / unbounded queries *(Medium — needs profiling)*
- Service loops issuing per-row Prisma calls and list endpoints without enforced pagination are likely (finance, analytics, broadsheet). Not exhaustively traced.
- **Fix:** Enforce pagination defaults; `include`/`select` batching; enable Prisma query logging in staging to catch N+1. *(3–5 days)*

## Frontend

### P4 — Bundle & render profile unmeasured *(Medium)*
- Large dependency set (recharts, swiper, framer-motion, html5-qrcode, three Radix-heavy trees). No bundle analysis run here.
- **Fix:** `@next/bundle-analyzer`; code-split heavy dashboard widgets; lazy-load charts/QR scanner; verify `react-window` virtualization is applied to large tables (`react-window` is a dependency — confirm usage on big lists). *(2–3 days)*

## Database
- See `database_report.md` D5 — index/query-plan validation against real data is the key perf lever. The tenant extension adds `branchId`/`sessionId` to most `where` clauses, so composite indexes leading with those columns are essential.

## Scalability by Tier

| Users | Viable today? | Blockers |
|---|---|---|
| **10,000** | ⚠️ Mostly | Single instance OK; watch report generation (P2) and cold reads (P1). |
| **100,000** | ❌ | In-memory throttler (security S4) breaks multi-instance; local-disk upload fallback (`main.ts:73-84`) breaks statelessness; no caching (P1); no DB read replicas. |
| **1,000,000** | ❌ | All of the above + no connection-pool strategy (PgBouncer), no read/write split, no queue autoscaling, no CDN for static/report assets, no horizontal DB partitioning by branch. |

### Statefulness blockers to horizontal scaling
1. **In-memory throttler** — `app.module.ts:84` (fix: Redis storage).
2. **Local-disk upload fallback** — `main.ts:73-84` serves `public/uploads` from one instance's disk; R2/S3 exists but the fallback undermines it (fix: object-storage-only in prod).
3. **In-process cache** — nonexistent, so no shared-cache issue yet, but adopt Redis cache (P1) rather than per-instance memory.
4. **Socket.io** already uses the Redis adapter — good, this one is handled.

## Priority Actions
1. Redis-backed throttling (also security). *(2 hrs)*
2. Object-storage-only uploads in prod; drop local fallback. *(1 day)*
3. Adopt Redis caching for hot reads. *(3–4 days)*
4. Move all report/export generation to BullMQ. *(3–5 days)*
5. Query-plan + pagination + N+1 audit with seeded data. *(3–5 days)*
6. Add PgBouncer + read replicas before 100k. *(planning item)*
