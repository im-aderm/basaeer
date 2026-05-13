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

            if (userId) {
              if (operation === 'create') {
                args.data = {
                  ...args.data,
                  createdByUserId: userId,
                  updatedByUserId: userId,
                };
              } else if (
                operation === 'update' ||
                operation === 'upsert'
              ) {
                args.data = {
                  ...args.data,
                  updatedByUserId: userId,
                };
              }
            }

            if (branchId && !isSuperAdmin) {
              if (operation === 'create') {
                args.data = {
                  ...args.data,
                  branchId,
                };
              } else if (
                operation === 'findUnique' ||
                operation === 'findFirst' ||
                operation === 'findMany' ||
                operation === 'update' ||
                operation === 'updateMany' ||
                operation === 'delete' ||
                operation === 'deleteMany' ||
                operation === 'upsert' ||
                operation === 'count' ||
                operation === 'aggregate'
              ) {
                args.where = {
                  ...args.where,
                  branchId,
                };
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

  setTenantContext(
    branchId: string | null,
    userId: string,
    isSuperAdmin?: boolean,
  ) {
    tenantStorage.enterWith({ branchId, userId, isSuperAdmin });
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
