import { Controller, Get, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';
import Redis from 'ioredis';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  services: {
    postgresql: { status: string; latencyMs?: number };
    redis: { status: string; latencyMs?: number };
    bullmq: { status: string };
  };
}

interface DetailedHealthStatus extends HealthStatus {
  version: string;
  environment: string;
  memory: {
    usageMb: number;
    heapMb: number;
    maxHeapMb: number;
  };
  disk: {
    free: string;
    total: string;
    usagePercent: number;
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();
  private readonly logger = new Logger(HealthController.name);
  private redis: Redis | null = null;

  constructor(private readonly prisma: PrismaService) {
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
    const redisPassword = process.env.REDIS_PASSWORD;
    try {
      this.redis = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
      });
    } catch {
      this.logger.warn('Redis health check client not available');
    }
  }

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Check' })
  @Get()
  @Public()
  async check(): Promise<HealthStatus> {
    const [pg, rd, bq] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
      { status: 'unknown' },
    ]);

    const services = {
      postgresql: pg,
      redis: rd,
      bullmq: bq,
    };

    const allUp = Object.values(services).every(
      (s) => s.status === 'ok' || s.status === 'unknown',
    );
    const anyDown = Object.values(services).some((s) => s.status === 'down');

    return {
      status: allUp ? 'ok' : anyDown ? 'down' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
    };
  }

  @Get('detailed')
  @Public()
  async detailed(): Promise<DetailedHealthStatus> {
    const base = await this.check();
    const mem = process.memoryUsage();
    const disk = this.checkDisk();

    return {
      ...base,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        usageMb: Math.round(mem.rss / 1024 / 1024),
        heapMb: Math.round(mem.heapUsed / 1024 / 1024),
        maxHeapMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
      disk,
    };
  }

  private async checkPostgres(): Promise<{
    status: string;
    latencyMs?: number;
  }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down' };
    }
  }

  private async checkRedis(): Promise<{
    status: string;
    latencyMs?: number;
  }> {
    if (!this.redis) return { status: 'unknown' };
    const start = Date.now();
    try {
      await this.redis.ping();
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down' };
    }
  }

  private checkDisk(): { free: string; total: string; usagePercent: number } {
    try {
      const stats = fs.statfsSync('/');
      const free = stats.bfree * stats.bsize;
      const total = stats.blocks * stats.bsize;
      return {
        free: this.formatBytes(free),
        total: this.formatBytes(total),
        usagePercent: Math.round(((total - free) / total) * 100),
      };
    } catch {
      return { free: 'unknown', total: 'unknown', usagePercent: 0 };
    }
  }

  private formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = 0;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    return `${value.toFixed(1)} ${units[unitIndex]}`;
  }
}
