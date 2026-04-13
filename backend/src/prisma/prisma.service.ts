import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/client/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const connectionString = `${process.env.DATABASE_URL}`;

    const pool = new Pool({ 
      connectionString,
      ssl: connectionString.includes('sslmode=no-verify') ? { rejectUnauthorized: false } : undefined
    });
    const adapter = new PrismaPg(pool);
    super({ adapter } as any);
  }

  async onModuleInit() {
    console.log('PrismaService: Connecting to database...');
    try {
      await this.$connect();
      console.log('PrismaService: Successfully connected to database.');
    } catch (error) {
      console.error('PrismaService: Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
