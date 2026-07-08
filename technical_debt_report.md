# Technical Debt Report — Basaeer SMS

**Date:** 2026-07-08

## Quantitative Snapshot

| Metric | Value | Assessment |
|---|---|---|
| Backend `: any` occurrences (excl. generated/spec) | 221 | High — erodes the value of TypeScript |
| `console.*` calls (app code) | 204 | Should route through Winston |
| `TODO/FIXME/HACK/XXX` markers | 1 | Low — clean, or under-annotated |
| Backend tsconfig `strict` | Partial | Has `strictNullChecks`+`noImplicitAny`, not full `strict` |
| Frontend tsconfig `strict` | ✅ true | Good |
| Largest single file | `prisma/prisma.service.ts` (~900 lines) | God object |
| Committed artifacts that shouldn't be | 3 | SQL dump, `.env.save`, `schema.backup.prisma` |
| CI lint mode | `--fix` | Masks failures instead of failing |

## Debt Items (prioritized)

### TD1 — `PrismaService` god object w/ hardcoded model list *(High)*
`prisma.service.ts` owns tenant policy, a 130-name `systemModels` array (`:118-150`), business validation, RLS `set_config`, and connection lifecycle. Any new model omitted from the list can leak cross-branch (security S7). **Fix:** metadata-derive scoping from `Prisma.dmmf`; split responsibilities. *(3–4 days)*

### TD2 — 221 `any` in backend *(Medium)*
E.g. `auth.service.ts:24` `validateUser(...): Promise<any>`, `login(user: any)`, `register(data: any)`. Defeats type safety on the security-critical path. **Fix:** introduce real DTO/return types; enable full `strict`; ratchet down. *(1–2 weeks incremental)*

### TD3 — 204 `console.*` calls *(Low, mechanical)*
Bypasses structured Winston logging (`main.ts:23-52`) and can leak to prod stdout/browser. **Fix:** replace with injected logger; strip client console in build. *(1 day)*

### TD4 — Committed generated/backup artifacts *(High, quick)*
`backend/backups/*.sql` (real data — security S1), `.env.save`, `backend/prisma/schema.backup.prisma`. **Fix:** purge from history, gitignore. *(0.5 day)*

### TD5 — Stringly-typed FE↔BE error contract *(Medium)*
`frontend/src/lib/api.ts:92-122` substring-matches backend messages. **Fix:** shared error-code enum in `packages/shared-types`. *(0.5 day)*

### TD6 — Duplicated auth-cookie logic *(Low)*
Repeated 3× in `auth.controller.ts` (`:75,167,189`). **Fix:** `setAuthCookie()` helper. *(1 hr)*

### TD7 — Dead RLS scaffolding *(Low/Medium)*
`set_config` calls with no RLS policies (`prisma.service.ts:243-262`). **Fix:** implement or delete. *(1 hr–3 days)*

### TD8 — Business logic in ORM layer *(Medium)*
Session-required enforcement thrown from the Prisma extension (`:151-165`). **Fix:** move to a guard. *(1 day)*

### TD9 — CI lint uses `--fix` *(Low)*
`ci.yml` → `npm run lint --workspaces`, and backend `lint` script is `eslint … --fix`. Auto-fixing in CI can hide violations and produce non-deterministic results. **Fix:** CI lint should be check-only (`--max-warnings 0`, no `--fix`). *(1 hr)*

### TD10 — Frontend global mutable singleton *(Medium)*
`_activeBranchId` (`lib/api.ts:14`) — architectural debt + correctness risk (frontend F1). *(2 days)*

## Refactoring Priority List
1. Purge committed secrets/dumps (TD4). *(quick, Critical-adjacent)*
2. Metadata-derive tenant scoping / break up PrismaService (TD1). *(High)*
3. Replace console with logger (TD3) + CI lint check-only (TD9). *(quick)*
4. Shared error-code enum (TD5) + move session enforcement out of ORM (TD8).
5. Enable full `strict`, burn down `any` (TD2). *(long-running)*
6. FE branch-context refactor (TD10).

## Technical Debt Index (qualitative): **Moderate-High**
The debt is concentrated and mostly mechanical to service, not diffuse rot. The two structurally significant items (TD1 PrismaService, TD10 FE singleton) are also correctness/security risks and should be prioritized above cosmetic debt.
