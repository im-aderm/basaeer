import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;

    // VPS Optimized PostgreSQL Pool
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

    // ── Prisma Middleware: RLS (8.4) + Audit Trail (8.9) ──
    (this as any).$use(async (params: any, next: any) => {
      const branchId = (this as any).__branchId;
      const userId = (this as any).__userId;

      // Inject createdByUserId / updatedByUserId for audit trail (8.9)
      if (userId && (params.action === 'create' || params.action === 'update')) {
        if (params.action === 'create') {
          params.args.data = {
            ...params.args.data,
            createdByUserId: userId,
            updatedByUserId: userId,
          };
        }
        if (params.action === 'update') {
          params.args.data = {
            ...params.args.data,
            updatedByUserId: userId,
          };
        }
      }

      const result = await next(params);

      return result;
    });
  }

  /**
   * Set the tenant context for RLS and audit trail.
   * Call this at the start of every request.
   */
  async setTenantContext(branchId: string | null, userId: string) {
    (this as any).__branchId = branchId;
    (this as any).__userId = userId;

    // Set PostgreSQL session variable for RLS (8.4)
    if (branchId) {
      try {
        await this.$executeRawUnsafe(
          `SELECT set_config('app.current_branch_id', $1, true)`,
          [branchId],
        );
      } catch (err) {
        this.logger.warn('Failed to set RLS session variable:', err);
      }
    }
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
