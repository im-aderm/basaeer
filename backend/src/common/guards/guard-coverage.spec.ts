import * as fs from 'fs';
import * as path from 'path';
import { BRANCH_GUARD_EXEMPT_CONTROLLERS } from './branch-guard-exempt.constants';

/**
 * Guards the access-control contract that the Jul 2026 audit found broken in
 * five separate controllers (users, sessions, academic-sessions, live-classes,
 * academics): a controller silently missing BranchGuard, or a route silently
 * missing both @Roles() and @Public(), fails open or closed in ways nobody
 * notices until it's exploited or reported as a bug. This test turns both
 * mistakes into a build failure instead.
 *
 * It's a lightweight text-based scan (mirrors prisma/tenant-scope.spec.ts's
 * approach of parsing schema.prisma as text) rather than booting the Nest
 * app, so it runs fast and has no dependency on DI wiring being correct.
 */

const CONTROLLERS_ROOT = path.join(__dirname, '../../');

function findControllerFiles(dir: string, out: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'generated') continue;
      findControllerFiles(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.controller.ts') && !entry.name.endsWith('.spec.ts')) {
      out.push(full);
    }
  }
  return out;
}

function netBracketDelta(line: string): number {
  let depth = 0;
  for (const ch of line) {
    if (ch === '(' || ch === '{' || ch === '[') depth++;
    else if (ch === ')' || ch === '}' || ch === ']') depth--;
  }
  return depth;
}

/**
 * Splits a controller file into "decorator blocks": maximal runs of
 * consecutive @Decorator(...) lines (which may themselves span multiple
 * lines), each terminated by the first non-decorator, non-blank line that
 * follows (typically the class/method signature the decorators apply to).
 */
function extractDecoratorBlocks(source: string): string[] {
  const lines = source.split('\n');
  const blocks: string[] = [];
  let current: string[] = [];
  let depth = 0;
  let inDecorator = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (inDecorator) {
      current.push(line);
      depth += netBracketDelta(line);
      if (depth <= 0) {
        inDecorator = false;
        depth = 0;
      }
      continue;
    }

    if (/^@\w/.test(trimmed)) {
      inDecorator = true;
      current.push(line);
      depth = netBracketDelta(line);
      if (depth <= 0) {
        inDecorator = false;
        depth = 0;
      }
      continue;
    }

    if (trimmed === '') continue; // blank lines don't break a block

    // Non-decorator, non-blank line: whatever decorators we've accumulated
    // apply to this line (a class or method signature). Finalize the block.
    if (current.length) {
      blocks.push(current.join('\n'));
      current = [];
    }
  }
  if (current.length) blocks.push(current.join('\n'));
  return blocks;
}

const HTTP_VERB_DECORATOR = /@(Get|Post|Put|Patch|Delete)\(/;
const HAS_ROLE_OR_PUBLIC = /@(Roles|Public)\(/;
const USE_GUARDS = /@UseGuards\(([^]*?)\)/g;

function analyzeController(filePath: string) {
  const source = fs.readFileSync(filePath, 'utf8');
  const blocks = extractDecoratorBlocks(source);

  // Every @UseGuards(...) call anywhere in the file (class or method level).
  const guardNames = new Set<string>();
  let m: RegExpExecArray | null;
  USE_GUARDS.lastIndex = 0;
  while ((m = USE_GUARDS.exec(source)) !== null) {
    for (const token of m[1].split(',')) {
      const name = token.trim();
      if (name) guardNames.add(name);
    }
  }

  // The class-level decorator block is the one immediately preceding the
  // `class` keyword — i.e. the contiguous decorator run right above it.
  let classLevelHasRoleOrPublic = false;
  const classDeclIdx = source.split('\n').findIndex((l) => /\bclass\s+\w+/.test(l));
  if (classDeclIdx >= 0) {
    // Find the block whose accumulated lines sit directly above classDeclIdx.
    // Simplest robust way: re-derive by scanning lines upward from the class
    // declaration collecting a contiguous decorator run.
    const lines = source.split('\n');
    let i = classDeclIdx - 1;
    const classDecoratorLines: string[] = [];
    while (i >= 0) {
      const t = lines[i].trim();
      if (t === '' || /^@\w/.test(t) || classDecoratorLines.length > 0) {
        if (t === '') { i--; continue; }
        classDecoratorLines.unshift(lines[i]);
        i--;
        continue;
      }
      break;
    }
    classLevelHasRoleOrPublic = HAS_ROLE_OR_PUBLIC.test(classDecoratorLines.join('\n'));
  }

  const routeViolations: string[] = [];
  for (const block of blocks) {
    if (!HTTP_VERB_DECORATOR.test(block)) continue;
    if (HAS_ROLE_OR_PUBLIC.test(block)) continue;
    if (classLevelHasRoleOrPublic) continue;
    const verbMatch = HTTP_VERB_DECORATOR.exec(block);
    const routeMatch = /@(?:Get|Post|Put|Patch|Delete)\(([^)]*)\)/.exec(block);
    routeViolations.push(`${verbMatch?.[1]}(${routeMatch?.[1]?.trim() ?? ''})`);
  }

  return {
    hasBranchGuard: guardNames.has('BranchGuard'),
    routeViolations,
  };
}

describe('access-control guard coverage (BranchGuard + Roles/Public presence)', () => {
  const files = findControllerFiles(CONTROLLERS_ROOT).sort();

  it('finds a plausible number of controller files', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it('every controller has BranchGuard or a documented exemption', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const rel = path.relative(CONTROLLERS_ROOT, file);
      const { hasBranchGuard } = analyzeController(file);
      if (!hasBranchGuard && !(rel in BRANCH_GUARD_EXEMPT_CONTROLLERS)) {
        offenders.push(rel);
      }
    }
    // A controller here is either missing BranchGuard by mistake (the exact
    // bug found in users/sessions/academic-sessions/live-classes), or it's a
    // legitimate new exemption that needs a documented entry in
    // BRANCH_GUARD_EXEMPT_CONTROLLERS explaining why.
    expect(offenders).toEqual([]);
  });

  it('every exemption in BRANCH_GUARD_EXEMPT_CONTROLLERS still points at a real file', () => {
    const stale = Object.keys(BRANCH_GUARD_EXEMPT_CONTROLLERS).filter(
      (rel) => !fs.existsSync(path.join(CONTROLLERS_ROOT, rel)),
    );
    expect(stale).toEqual([]);
  });

  it('routes without an explicit @Roles()/@Public() decorator are tracked (snapshot)', () => {
    // RolesGuard denies-by-default when no @Roles() is present and the route
    // isn't @Public() — so a missing decorator here means the route is either
    // permanently unreachable (dead code, e.g. academics compute-status) or,
    // if RolesGuard isn't applied at all on that controller, wide open to any
    // authenticated user (e.g. academic-sessions before its fix). Either way
    // it needs a human to look at it, which is what updating this snapshot
    // forces. New entries appearing here on an unrelated change should be
    // treated as a bug, not rubber-stamped.
    const violations: Record<string, string[]> = {};
    for (const file of files) {
      const rel = path.relative(CONTROLLERS_ROOT, file);
      const { routeViolations } = analyzeController(file);
      if (routeViolations.length) violations[rel] = routeViolations;
    }
    expect(violations).toMatchSnapshot();
  });
});
