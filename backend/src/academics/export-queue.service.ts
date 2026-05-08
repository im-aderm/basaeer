import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { StartExportDto } from './dto/export.dto';

@Injectable()
export class ExportQueueService {
  private readonly logger = new Logger(ExportQueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('academic-exports') private readonly exportQueue: Queue,
  ) {}

  async startExport(dto: StartExportDto, userId: string, branchId: string) {
    const academicExport = await this.prisma.academicExport.create({
      data: {
        type: dto.type,
        status: 'QUEUED',
        parameters: dto.parameters || {},
        userId,
        branchId,
      },
    });

    await this.exportQueue.add('process-export', {
      exportId: academicExport.id,
      type: dto.type,
      parameters: dto.parameters,
      userId,
      branchId,
    }, {
      jobId: academicExport.id,
      removeOnComplete: true,
      removeOnFail: false,
    });

    return {
      exportId: academicExport.id,
      status: 'QUEUED',
    };
  }

  async getExportStatus(id: string) {
    const academicExport = await this.prisma.academicExport.findUnique({
      where: { id },
    });

    if (!academicExport) {
      throw new NotFoundException(`Export job ${id} not found`);
    }

    return academicExport;
  }

  async getBranchExports(branchId: string, userId?: string) {
    return this.prisma.academicExport.findMany({
      where: {
        branchId,
        ...(userId && { userId }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async cancelExport(id: string) {
    const job = await this.exportQueue.getJob(id);
    if (job) {
      await job.remove();
    }

    return this.prisma.academicExport.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  async deleteExport(id: string) {
    return this.prisma.academicExport.delete({
      where: { id },
    });
  }
}
