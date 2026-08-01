import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Term } from '../generated/client/client';

export interface ResultDeliveryJobData {
  studentId: string;
  sessionId: string;
  term: Term;
  branchId: string;
}

/**
 * Fan-out on publish: one queued job per affected student rather than one
 * job holding every studentId, so a single student's failure (missing
 * parent email, transient render error) retries in isolation instead of
 * blocking or re-doing the whole batch.
 */
@Injectable()
export class ResultDeliveryQueueService {
  private readonly logger = new Logger(ResultDeliveryQueueService.name);

  constructor(
    @InjectQueue('result-delivery') private readonly queue: Queue,
  ) {}

  async queueDeliveryForStudents(studentIds: string[], sessionId: string, term: Term, branchId: string) {
    await Promise.all(
      studentIds.map((studentId) =>
        this.queue.add(
          'deliver-result',
          { studentId, sessionId, term, branchId } as ResultDeliveryJobData,
          {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: 200,
            removeOnFail: 500,
          },
        ),
      ),
    );
    this.logger.log(
      `Queued result delivery for ${studentIds.length} student(s), session ${sessionId}, term ${term}`,
    );
  }
}
