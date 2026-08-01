import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResultComputationService } from '../exams/result-computation.service';

@Processor('academic-computations')
export class AcademicComputationProcessor extends WorkerHost {
  private readonly logger = new Logger(AcademicComputationProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly resultComputationService: ResultComputationService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { jobRecordId, sectionId, sessionId, term, context } = job.data;

    this.logger.log(
      `Processing computation job ${jobRecordId} for section ${sectionId}`,
    );

    try {
      await this.prisma.computationJob.update({
        where: { id: jobRecordId },
        data: {
          status: 'PROCESSING',
          startedAt: new Date(),
          retryCount: job.attemptsMade,
        },
      });

      // Execute computation
      await this.resultComputationService.computeSection(
        sectionId,
        sessionId,
        term,
        context,
      );

      await this.prisma.computationJob.update({
        where: { id: jobRecordId },
        data: {
          status: 'COMPLETED',
          progress: 100,
          completedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      this.logger.error(
        `Computation ${jobRecordId} failed: ${error.message}`,
        error.stack,
      );

      const status =
        job.attemptsMade >= (job.opts.attempts || 1) - 1 ? 'FAILED' : 'QUEUED';

      await this.prisma.computationJob.update({
        where: { id: jobRecordId },
        data: {
          status,
          error: error.message,
          retryCount: job.attemptsMade + 1,
        },
      });

      throw error;
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Computation job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.error(`Computation job ${job.id} failed: ${error.message}`);
  }
}
