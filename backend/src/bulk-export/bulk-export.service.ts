import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { StartBulkExportDto } from './dto/start-bulk-export.dto';

/**
 * Enqueues and tracks bulk-document exports (ZIPs of per-item PDFs). Reuses the
 * AcademicExport table for job state and its own `bulk-exports` BullMQ queue so
 * generation runs off the request thread.
 */
@Injectable()
export class BulkExportService {
  private readonly logger = new Logger(BulkExportService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('bulk-exports') private readonly queue: Queue,
  ) {}

  async start(dto: StartBulkExportDto, ctx: TenantContext) {
    const branchId = ctx.branchId;
    if (!branchId) {
      throw new BadRequestException(
        'Select a branch before starting a bulk export.',
      );
    }

    const record = await this.prisma.academicExport.create({
      data: {
        type: dto.type,
        status: 'QUEUED',
        parameters: (dto.filters as any) || {},
        userId: ctx.userId,
        branchId,
        sessionId: dto.filters?.sessionId || ctx.sessionId || null,
      },
    });

    await this.queue.add(
      'process-bulk-export',
      {
        exportId: record.id,
        type: dto.type,
        filters: dto.filters || {},
        userId: ctx.userId,
        branchId,
        sessionId: dto.filters?.sessionId || ctx.sessionId || null,
      },
      { jobId: record.id, removeOnComplete: true, removeOnFail: false },
    );

    return { exportId: record.id, status: 'QUEUED' };
  }

  /** Status is branch-scoped so callers cannot poll another branch's exports. */
  async getStatus(id: string, ctx: TenantContext) {
    const record = await this.prisma.academicExport.findFirst({
      where: { id, ...(ctx.branchId ? { branchId: ctx.branchId } : {}) },
    });
    if (!record) throw new NotFoundException(`Export ${id} not found`);
    return record;
  }

  async list(ctx: TenantContext) {
    return this.prisma.academicExport.findMany({
      where: {
        ...(ctx.branchId ? { branchId: ctx.branchId } : {}),
        userId: ctx.userId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
