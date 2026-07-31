import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';
import { TENANT_EXEMPT_MODELS } from './tenant-scope.constants';
import 'dotenv/config';

class ContextRequiredError extends BadRequestException {
  constructor(
    code: 'BRANCH_CONTEXT_REQUIRED' | 'SESSION_CONTEXT_REQUIRED',
    message: string,
  ) {
    super({
      code,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}

export interface TenantStore {
  branchId: string | null;
  sessionId: string | null;
  userId: string;
  isSuperAdmin?: boolean;
}

export const tenantStorage = new AsyncLocalStorage<TenantStore>();

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  readonly xprisma: ReturnType<PrismaClient['$extends']>;

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;

    const pool = new Pool({
      connectionString,
      max: parseInt(process.env.DB_POOL_SIZE || '20', 10),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const adapter = new PrismaPg(pool);

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error', 'warn'],
    } as any);

    // Captured before $extends()/the Proxy wrap below — a real, connected
    // client instance whose $transaction() actually works, used inside
    // $allOperations to pin the branch/session GUC and the operation itself
    // to the same physical connection (see the comment further down).
    const rawClient: PrismaClient = this;

    this.xprisma = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query, operation, model }: any) {
            const store = tenantStorage.getStore();
            let branchId = store?.branchId ?? null;
            let sessionId = store?.sessionId ?? null;
            const userId = store?.userId ?? '';
            const isSuperAdmin = store?.isSuperAdmin ?? false;

            // Block writes when no branch context is set
            // Exception: Branch model creates define the tenant boundary itself
            // Exception: If args.data already has branchId (set by controller), allow it
            // Exception: If args.where already has branchId (set by service/TenantHelper), allow it
            if (!branchId && model !== 'Branch') {
              const writeOps = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];
              if (writeOps.includes(operation)) {
                const dataBranchId = args.data?.branchId;
                const whereBranchId = args.where?.branchId;
                if (!dataBranchId && !whereBranchId) {
                  throw new ContextRequiredError(
                    'BRANCH_CONTEXT_REQUIRED',
                    'Branch context is required to modify data. Please select a branch first.',
                  );
                }
                // Use the branchId from the data or where payload
                branchId = dataBranchId || whereBranchId;
              }
              // Read operations without branch — return ALL data (for SA dashboard/reports)
              if (!writeOps.includes(operation)) {
                return query(args);
              }
            }

            // Block writes when no session context is set
            // Exception: System-level models that exist independently of academic sessions
            // Exception: If args.data already has sessionId, allow it
            // Exception: If args.where already has sessionId, allow it
            const systemModels = TENANT_EXEMPT_MODELS;
            if (!sessionId && !systemModels.includes(model)) {
              const writeOps = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];
              if (writeOps.includes(operation)) {
                const dataSessionId = args.data?.sessionId;
                const whereSessionId = args.where?.sessionId;
                if (!dataSessionId && !whereSessionId) {
                  throw new ContextRequiredError(
                    'SESSION_CONTEXT_REQUIRED',
                    'Session context is required to modify data. Please select a session first.',
                  );
                }
                // Use the sessionId from the data or where payload
                sessionId = dataSessionId || whereSessionId;
              }
            }

            // Apply branch and session isolation for ALL users
            // Exception: System-level models are not scoped to branch/session
            if ((branchId || sessionId) && !systemModels.includes(model)) {
              if (operation === 'create') {
                args.data = {
                  ...args.data,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'findUnique' ||
                operation === 'findFirst' ||
                operation === 'findMany' ||
                operation === 'count' ||
                operation === 'aggregate'
              ) {
                args.where = {
                  ...args.where,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'delete' ||
                operation === 'deleteMany'
              ) {
                args.where = {
                  ...args.where,
                  ...(branchId && { branchId }),
                  ...(sessionId && { sessionId }),
                };
              } else if (
                operation === 'update' ||
                operation === 'updateMany'
              ) {
                // Skip branchId/sessionId WHERE injection when the data explicitly changes them
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.data?.sessionId) {
                  args.where = {
                    ...args.where,
                    ...(sessionId && { sessionId }),
                  };
                }
              } else if (operation === 'upsert') {
                // For upsert: inject branchId/sessionId into both where AND create.data
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.create?.branchId) {
                  args.create = {
                    ...args.create,
                    ...(branchId && { branchId }),
                  };
                }
                if (!args.data?.sessionId) {
                  args.where = {
                    ...args.where,
                    ...(sessionId && { sessionId }),
                  };
                }
                if (!args.create?.sessionId) {
                  args.create = {
                    ...args.create,
                    ...(sessionId && { sessionId }),
                  };
                }
              }
            }

            // Postgres RLS policies (phase9_rls_expansion and later) key off
            // current_setting('app.current_branch_id'/'app.current_session_id').
            // Those are session-local GUCs: setting them and then running the
            // operation must happen on the SAME physical connection, which
            // Prisma only guarantees inside an interactive transaction (the
            // connection pool is otherwise free to hand out any connection
            // per call). The previous version of this code called
            // $executeRawUnsafe on the bare PrismaClient.prototype instead of
            // a connected instance, which threw on every invocation and was
            // silently swallowed — the GUC was never actually set. Wrapping
            // each standalone operation in its own short transaction fixes
            // that. Existing multi-statement `this.prisma.$transaction(async
            // tx => {...})` call sites elsewhere in the codebase are handled
            // separately below, by overriding $transaction itself on the
            // client — not by editing each of those 45+ call sites.
            if (branchId || sessionId) {
              const modelAccessor = model.charAt(0).toLowerCase() + model.slice(1);
              return rawClient.$transaction(async (tx: any) => {
                if (branchId) {
                  await tx.$executeRawUnsafe(
                    `SELECT set_config('app.current_branch_id', $1, true)`,
                    branchId,
                  );
                }
                if (sessionId) {
                  await tx.$executeRawUnsafe(
                    `SELECT set_config('app.current_session_id', $1, true)`,
                    sessionId,
                  );
                }
                return tx[modelAccessor][operation](args);
              });
            }

            return query(args);
          },
        },
      },
      client: {
        // Every existing `this.prisma.$transaction(async (tx) => {...})`
        // call site in the codebase goes through xprisma (the Proxy below
        // routes there), so overriding $transaction here — rather than
        // editing each of those 45+ call sites — makes every one of them
        // set the same branch/session GUC on its own `tx` before the
        // caller's callback runs. Without this, those blocks would stay
        // unprotected by RLS even after the fix above, since Prisma's `tx`
        // object bypasses the $allOperations query extension entirely.
        $transaction(this: any, ...args: any[]) {
          const store = tenantStorage.getStore();
          const branchId = store?.branchId ?? null;
          const sessionId = store?.sessionId ?? null;

          if (!branchId && !sessionId) {
            return rawClient.$transaction(...(args as Parameters<typeof rawClient.$transaction>));
          }

          const isArrayForm = Array.isArray(args[0]);
          if (isArrayForm) {
            // Array-style `$transaction([prisma.a.create(...), ...])` batches
            // pre-built queries that don't accept an injected setup step —
            // uncommon in this codebase (one call site) and left as-is.
            return rawClient.$transaction(...(args as Parameters<typeof rawClient.$transaction>));
          }

          const [fn, options] = args as [(tx: any) => Promise<any>, any];
          return rawClient.$transaction(async (tx: any) => {
            if (branchId) {
              await tx.$executeRawUnsafe(
                `SELECT set_config('app.current_branch_id', $1, true)`,
                branchId,
              );
            }
            if (sessionId) {
              await tx.$executeRawUnsafe(
                `SELECT set_config('app.current_session_id', $1, true)`,
                sessionId,
              );
            }
            return fn(tx);
          }, options);
        },
      },
    });

    return new Proxy(this, {
      get: (target, prop) => {
        if (
          prop === 'xprisma' ||
          prop === 'tenantStorage' ||
          prop === 'logger' ||
          prop === 'setTenantContext' ||
          prop === 'runInTenantContext' ||
          prop === 'onModuleInit' ||
          prop === 'onModuleDestroy' ||
          prop === 'constructor' ||
          typeof prop === 'symbol'
        ) {
          return Reflect.get(target, prop);
        }
        const val = Reflect.get(target.xprisma, prop);
        return typeof val === 'function' ? val.bind(target.xprisma) : val;
      },
    }) as PrismaService;
  }

  runInTenantContext<T>(branchId: string | null, sessionId: string | null, userId: string, fn: () => T): T {
    return tenantStorage.run({ branchId, sessionId, userId }, fn);
  }

  setTenantContext(branchId: string | null, sessionId: string | null, userId: string) {
    this.logger.warn(
      'setTenantContext() is deprecated. Context is now managed via TenantContextInterceptor.',
    );
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database.');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
