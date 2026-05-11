import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Term } from '../generated/client/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ComputationQueueService {
  private readonly logger = new Logger(ComputationQueueService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('academic-computations') private readonly computationQueue: Queue,
  ) {}

  async queueSectionComputation(sectionId: string, sessionId: string, term: Term, userId: string, branchId: string) {
    const jobRecord = await this.prisma.computationJob.create({
      data: {
        type: 'RESULT_COMPUTATION',
        status: 'QUEUED',
        targetId: sectionId,
        targetType: 'SECTION',
        sessionId,
        term,
        userId,
        branchId,
        parameters: { sectionId, sessionId, term },
      },
    });

    const job = await this.computationQueue.add('compute-section', {
      jobRecordId: jobRecord.id,
      sectionId,
      sessionId,
      term,
      context: { userId, branchId },
    }, {
      jobId: jobRecord.id,
      removeOnComplete: 100,
      removeOnFail: 500,
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
    });

    this.logger.log(`Queued computation job ${jobRecord.id} for section ${sectionId}`);
    return { jobId: jobRecord.id };
  }

  async getJobStatus(jobId: string) {
    const jobRecord = await this.prisma.computationJob.findUnique({
      where: { id: jobId },
    });

    if (!jobRecord) {
      throw new NotFoundException(`Computation job ${jobId} not found`);
    }

    return jobRecord;
  }

  async getBranchJobs(branchId: string) {
    return this.prisma.computationJob.findMany({
      where: { branchId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
