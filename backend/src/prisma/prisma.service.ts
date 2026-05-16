import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { AsyncLocalStorage } from 'async_hooks';
import 'dotenv/config';

interface TenantStore {
  branchId: string | null;
  userId: string;
  isSuperAdmin?: boolean;
}

const tenantStorage = new AsyncLocalStorage<TenantStore>();

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

    this.xprisma = this.$extends({
      query: {
        $allModels: {
          async $allOperations({ args, query, operation, model }: any) {
            const store = tenantStorage.getStore();
            const branchId = store?.branchId ?? null;
            const userId = store?.userId ?? '';
            const isSuperAdmin = store?.isSuperAdmin ?? false;

            // Block writes when no branch context is set
            // Exception: Branch model creates define the tenant boundary itself
            if (!branchId && model !== 'Branch') {
              const writeOps = ['create', 'update', 'updateMany', 'delete', 'deleteMany', 'upsert'];
              if (writeOps.includes(operation)) {
                throw new Error('Branch context is required to modify data. Please select a branch.');
              }
              // Read operations without branch — return ALL data (for SA dashboard/reports)
              return query(args);
            }

            // Apply branch isolation for ALL users
            // Exception: Branch model is the tenant boundary source, don't inject branchId
            if (branchId && model !== 'Branch') {
              if (operation === 'create') {
                args.data = {
                  ...args.data,
                  branchId,
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
                  branchId,
                };
              } else if (
                operation === 'delete' ||
                operation === 'deleteMany'
              ) {
                args.where = {
                  ...args.where,
                  branchId,
                };
              } else if (
                operation === 'update' ||
                operation === 'updateMany'
              ) {
                // Skip branchId WHERE injection when the data explicitly changes branchId
                // (e.g. SUPER_ADMIN reassigning a user to a new branch)
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    branchId,
                  };
                }
              } else if (operation === 'upsert') {
                // For upsert: inject branchId into both where AND create.data
                if (!args.data?.branchId) {
                  args.where = {
                    ...args.where,
                    branchId,
                  };
                }
                if (!args.create?.branchId) {
                  args.create = {
                    ...args.create,
                    branchId,
                  };
                }
              }
            }

            if (branchId) {
              try {
                await (PrismaClient.prototype as any).$executeRawUnsafe?.(
                  `SELECT set_config('app.current_branch_id', $1, true)`,
                  [branchId],
                );
              } catch (_err) {
                // ignore
              }
            }

            return query(args);
          },
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

  setTenantContext(branchId: string | null, userId: string) {
    tenantStorage.enterWith({ branchId, userId });
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
