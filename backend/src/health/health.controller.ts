import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Public } from '../auth/public.decorator';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  services: {
    postgresql: { status: string; latencyMs?: number };
    redis: { status: string };
    bullmq: { status: string };
  };
}

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Public()
  async check(): Promise<HealthStatus> {
    const services = {
      postgresql: await this.checkPostgres(),
      redis: { status: 'unknown' },
      bullmq: { status: 'unknown' },
    };

    const allUp = Object.values(services).every((s) => s.status === 'ok' || s.status === 'unknown');
    const anyDown = Object.values(services).some((s) => s.status === 'down');

    return {
      status: allUp ? 'ok' : anyDown ? 'down' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      services,
    };
  }

  private async checkPostgres(): Promise<{ status: string; latencyMs?: number }> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latencyMs: Date.now() - start };
    } catch {
      return { status: 'down' };
    }
  }
}
