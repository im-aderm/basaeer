# Database Report — Basaeer SMS (PostgreSQL 16)

**Date:** 2026-07-08 · **Schema:** `backend/prisma/schema.prisma` — 161 models, 317 relations, 308 `@@index`/`@@unique`, 25 `onDelete`, 19 migrations.

## Schema Design

- **Scale & normalization:** 161 models is large but consistent with the feature surface (academics, exams, finance, HR/payroll, library, transport, hostels, inventory, admissions, alumni, live classes, messaging). Naming is consistent PascalCase models / camelCase fields. Enums are used heavily (e.g. `AcademicExamStatus`), which is good for integrity.
- **Indexing:** 308 index/unique declarations — a healthy ratio. **Not validated against real query plans;** recommend capturing `pg_stat_statements` from a seeded prod-like DB and checking the top-20 slow queries for missing composite indexes (especially `(branchId, sessionId, …)` used by the tenant extension).

## D1 — Referential-integrity policy is largely undefined *(High)*
- **Evidence:** 317 relations but only **25** `onDelete` clauses.
- **Root cause:** Most FKs rely on Prisma defaults — `Restrict` for required relations, `SetNull` for optional.
- **Impact:** Deleting a `Branch`, `AcademicSession`, or `Student` will either hard-fail (Restrict) or silently null children (SetNull) unpredictably across 161 models. For a system that *soft-deletes* branches (`20260617000000_add_branch_deleted_at` migration exists) this is inconsistent — some paths soft-delete, others rely on undefined cascade behavior.
- **Recommendation:** Define an explicit delete policy per parent relation. For a tenant root like `Branch`, prefer soft-delete everywhere (already partially adopted) and forbid hard delete; for child records choose `Cascade`/`Restrict` deliberately. Add orphan-detection integrity tests.
- **Fix time:** 3–4 days.

## D2 — `set_config` RLS hooks without RLS policies *(Medium)*
- **Evidence:** `prisma.service.ts:243-262` sets `app.current_branch_id`/`app.current_session_id`; no `CREATE POLICY`/`ALTER TABLE … ENABLE ROW LEVEL SECURITY` in `prisma/migrations`.
- **Impact:** DB-level tenant defense is scaffolded but inert; isolation rests entirely on the application extension (see security S7/S8).
- **Recommendation:** Implement RLS on tenant tables keyed to `current_setting('app.current_branch_id')`, or remove the calls.
- **Fix time:** 3 days (implement) / 1 hr (remove).

## D3 — Migrations are forward-only with no rollback path *(Medium)*
- **Evidence:** 0 `down.sql` across 19 migrations (`prisma/migrations/`).
- **Impact:** Standard for Prisma, but there is no documented/tested rollback. A bad migration in prod has no rehearsed recovery.
- **Recommendation:** Add a rollback runbook to `DEPLOY.md`; test each migration against a restored prod snapshot in CI; take a pre-migrate backup automatically.
- **Fix time:** 2 days.

## D4 — Committed schema backup & SQL dump *(Medium — overlaps security S1)*
- **Evidence:** `backend/prisma/schema.backup.prisma` and `backend/backups/backup-2026-05-16T15-28-41-567Z.sql` are git-tracked.
- **Impact:** The SQL dump leaks real rows + password hashes (see security report S1); the backup schema is duplication/rot.
- **Recommendation:** Purge both from history; gitignore `backups/` and `*.backup.prisma`.
- **Fix time:** 0.5 day.

## D5 — N+1 and pagination risk *(Medium — needs query profiling)*
- **Observation:** The tenant extension injects filters correctly, but service-level loops issuing per-item Prisma calls were not exhaustively traced. Several list/report services (finance, analytics, broadsheet/transcript generation) are candidates for N+1 and unbounded result sets.
- **Recommendation:** Enforce mandatory `take`/`skip` pagination defaults on all list endpoints; use `include`/`select` batching; add `prisma` query logging in staging to catch N+1.
- **Fix time:** 3–5 days (audit + fixes).

## Transactions
- `$transaction` is used in critical create paths (e.g. `students.service.ts:101` wraps student creation + counter). Good. **Recommendation:** Audit finance/payment and result-computation flows to ensure multi-row money/grade mutations are transactional and idempotent (see testing report — these are untested).

## Data Integrity — Action Items
1. Define cascade/restrict policy across all 317 relations (D1). *(High)*
2. Implement or remove RLS (D2). *(Medium)*
3. Rollback runbook + CI migration testing (D3). *(Medium)*
4. Purge committed dumps (D4). *(High, quick)*
5. Query-plan + N+1 + pagination audit with real data (D5). *(Medium)*
