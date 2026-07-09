import * as fs from 'fs';
import * as path from 'path';
import { TENANT_EXEMPT_MODELS } from './tenant-scope.constants';

/**
 * Guards the multi-tenant isolation contract enforced by the Prisma extension
 * in prisma.service.ts. The extension automatically injects branchId/sessionId
 * into queries for every model that is NOT in TENANT_EXEMPT_MODELS. These tests
 * fail if the schema and that list drift apart in a way that would break tenant
 * isolation or throw at runtime — turning a silent, security-relevant mistake
 * into a red CI build.
 */
describe('tenant isolation contract (TENANT_EXEMPT_MODELS vs schema)', () => {
  // Parse schema.prisma into { modelName -> Set<fieldName> } without depending
  // on generated client internals (which vary by generator/version).
  const schemaPath = path.join(__dirname, '../../prisma/schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  const models: Record<string, Set<string>> = {};
  {
    const modelRegex = /model\s+(\w+)\s*\{([\s\S]*?)\}/g;
    let m: RegExpExecArray | null;
    while ((m = modelRegex.exec(schema)) !== null) {
      const [, name, body] = m;
      const fields = new Set<string>();
      for (const line of body.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('@@')) continue;
        const fieldMatch = /^(\w+)\s+/.exec(trimmed);
        if (fieldMatch) fields.add(fieldMatch[1]);
      }
      models[name] = fields;
    }
  }

  const allModelNames = Object.keys(models);
  const hasBranchId = (model: string) => models[model]?.has('branchId') ?? false;

  it('parses a plausible number of models from the schema', () => {
    // Sanity check the parser itself so the other assertions are meaningful.
    expect(allModelNames.length).toBeGreaterThan(100);
  });

  it('every non-exempt model has a branchId field (else auto-injection would throw)', () => {
    const exempt = new Set(TENANT_EXEMPT_MODELS);
    const offenders = allModelNames.filter(
      (name) => !exempt.has(name) && !hasBranchId(name),
    );
    // A non-exempt model without branchId means the extension would add
    // `where: { branchId }` to a column that doesn't exist -> Prisma throws.
    expect(offenders).toEqual([]);
  });

  it('every name in TENANT_EXEMPT_MODELS is a real model in the schema', () => {
    const stale = TENANT_EXEMPT_MODELS.filter((name) => !models[name]);
    // Catches models renamed/removed in the schema but left stale in the list.
    expect(stale).toEqual([]);
  });

  it('tenant tables scoped manually (exempt but have branchId) are documented', () => {
    // These models carry a branchId but are excluded from automatic scoping,
    // so they rely on the service layer to isolate them. Any change here is a
    // deliberate isolation decision and must be reviewed — the snapshot forces
    // that review. If this fails, a tenant model was added to/removed from the
    // exempt list; confirm the service layer scopes it, then update the list.
    const manuallyScoped = TENANT_EXEMPT_MODELS.filter(hasBranchId).sort();
    expect(manuallyScoped).toMatchSnapshot();
  });
});
