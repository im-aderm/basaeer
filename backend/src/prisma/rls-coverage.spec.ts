import * as fs from 'fs';
import * as path from 'path';

/**
 * Guards Postgres RLS coverage the same way tenant-scope.spec.ts guards the
 * JS-level tenant-isolation extension: every model with a REQUIRED
 * (non-nullable) branchId column should have a matching
 * `ALTER TABLE "X" ENABLE ROW LEVEL SECURITY` statement in one of the RLS
 * migrations, or be explicitly documented as deliberately excluded.
 *
 * Models with an OPTIONAL branchId (global row + optional per-branch
 * override, e.g. GlobalSetting, EmailTemplate, Role) are excluded here on
 * purpose — a naive `branchId = current_setting(...)` policy would hide
 * every global (NULL branchId) row from branch-scoped requests, so those
 * need a deliberately different policy shape as a separate follow-up, not a
 * blanket one applied by this test.
 */
describe('Postgres RLS coverage (required-branchId models)', () => {
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const requiredBranchIdModels: string[] = [];
  {
    const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\n\}/g;
    let m: RegExpExecArray | null;
    while ((m = modelRegex.exec(schema)) !== null) {
      const [, name, body] = m;
      const branchIdLine = body
        .split('\n')
        .find((l) => /^\s*branchId\s+String\b/.test(l));
      if (branchIdLine && !/branchId\s+String\?/.test(branchIdLine)) {
        requiredBranchIdModels.push(name);
      }
    }
  }

  const migrationsDir = path.join(__dirname, '../../prisma/migrations');
  const rlsProtectedTables = new Set<string>();
  for (const dir of fs.readdirSync(migrationsDir)) {
    const sqlPath = path.join(migrationsDir, dir, 'migration.sql');
    if (!fs.existsSync(sqlPath)) continue;
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const re = /ALTER TABLE "(\w+)" ENABLE ROW LEVEL SECURITY/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sql)) !== null) {
      rlsProtectedTables.add(m[1]);
    }
  }

  it('parses a plausible number of required-branchId models', () => {
    expect(requiredBranchIdModels.length).toBeGreaterThan(50);
  });

  it('finds a plausible number of RLS-protected tables across migrations', () => {
    expect(rlsProtectedTables.size).toBeGreaterThan(90);
  });

  it('every required-branchId model has an RLS policy (or is a reviewed exception)', () => {
    // Reviewed, deliberate exceptions: models with a required branchId that
    // still don't get a strict RLS policy, and why. Adding to this list is
    // a conscious, reviewed act — same intent as TENANT_EXEMPT_MODELS.
    const reviewedExceptions = new Set<string>([]);

    const offenders = requiredBranchIdModels.filter(
      (name) => !rlsProtectedTables.has(name) && !reviewedExceptions.has(name),
    );
    expect(offenders).toEqual([]);
  });
});
