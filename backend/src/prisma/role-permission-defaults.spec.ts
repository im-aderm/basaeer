import { DEFAULT_ROLE_PERMISSIONS } from '../../prisma/role-permission-defaults';

/**
 * Data-quality guard for the seed that must run before PermissionsGuard is
 * exercised in production (see prisma/seed-role-permissions.ts) — a
 * duplicate or malformed entry here wouldn't break the seed (it's an
 * idempotent upsert either way) but would be a sign the generation step
 * drifted, so catch it in CI instead of noticing it in code review much
 * later.
 */
describe('DEFAULT_ROLE_PERMISSIONS', () => {
  it('has a plausible number of entries', () => {
    expect(DEFAULT_ROLE_PERMISSIONS.length).toBeGreaterThan(100);
  });

  it('has no duplicate (role, module, action) entries', () => {
    const seen = new Set<string>();
    const dupes: string[] = [];
    for (const { role, module, action } of DEFAULT_ROLE_PERMISSIONS) {
      const key = `${role}:${module}:${action}`;
      if (seen.has(key)) dupes.push(key);
      seen.add(key);
    }
    expect(dupes).toEqual([]);
  });

  it('every entry has a non-empty module and a known action', () => {
    // Four CRUD defaults, plus specific high-risk actions called out in the
    // remediation plan (finance:apply-discount, exams:lock-results,
    // exams:toggle-eligibility, users:deactivate, cards:generate).
    const knownActions = new Set([
      'create',
      'read',
      'update',
      'delete',
      'apply-discount',
      'lock-results',
      'toggle-eligibility',
      'deactivate',
      'generate',
    ]);
    const offenders = DEFAULT_ROLE_PERMISSIONS.filter(
      (p) => !p.module || !knownActions.has(p.action),
    );
    expect(offenders).toEqual([]);
  });
});
