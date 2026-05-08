import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Term } from '../generated/client/client';

@Injectable()
export class ComputationQueueService {
  private readonly logger = new Logger(ComputationQueueService.name);

  constructor(
    @InjectQueue('academic-computations') private readonly computationQueue: Queue,
  ) {}

  async queueSectionComputation(sectionId: string, sessionId: string, term: Term, userId: string, branchId: string) {
    const job = await this.computationQueue.add('compute-section', {
      sectionId,
      sessionId,
      term,
      context: { userId, branchId },
    }, {
      removeOnComplete: 100,
      removeOnFail: 500,
    });

    this.logger.log(`Queued computation job ${job.id} for section ${sectionId}`);
    return { jobId: job.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.computationQueue.getJob(jobId);
    if (!job) return null;

    return {
      id: job.id,
      status: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}
