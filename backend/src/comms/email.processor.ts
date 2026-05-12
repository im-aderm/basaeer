import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvidersService } from '../providers/providers.service';

const MAX_RETRIES = 3;
const RETRY_DELAYS_MS = [60_000, 300_000, 900_000];

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);
  private processedJobs = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const {
      campaignId,
      recipientId,
      email,
      subject,
      message,
      branchId,
      userId,
    } = job.data;
    const idempotencyKey = `email:${recipientId}:${job.name}:${job.timestamp || Date.now()}`;

    if (this.processedJobs.has(idempotencyKey)) {
      this.logger.warn(
        `Duplicate email job detected: ${idempotencyKey}, skipping`,
      );
      return { skipped: true, reason: 'duplicate' };
    }
    this.processedJobs.add(idempotencyKey);

    if (this.processedJobs.size > 10_000) {
      this.processedJobs.clear();
    }

    this.logger.log(`Processing email job for ${recipientId || email}`);

    try {
      await this.recordQueueMetric('email');

      if (campaignId) {
        await this.prisma.campaign.update({
          where: { id: campaignId },
          data: { status: 'IN_PROGRESS' },
        });
      }

      const success = await this.providersService.sendEmailWithFailover(
        email,
        subject,
        message,
      );

      if (success) {
        if (recipientId) {
          await this.prisma.campaignRecipient.update({
            where: { id: recipientId },
            data: { status: 'SENT' },
          });
        }

        await this.prisma.messageDeliveryLog.create({
          data: {
            type: 'EMAIL',
            recipient: email,
            status: 'DELIVERED',
            branchId,
            providerResponse: { success: true, jobId: job.id },
          },
        });

        if (campaignId) {
          await this.checkCampaignCompletion(campaignId);
        }

        this.logger.log(`Email sent successfully to ${email}`);
        return { success: true };
      }

      throw new Error('All email providers failed');
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error.stack);

      const retryCount = (job.opts.attempts || 0) + 1;

      await this.prisma.messageRetryEvent.create({
        data: {
          messageId: job.id || '',
          retryCount,
          error: error.message,
          nextRetryAt:
            retryCount < MAX_RETRIES
              ? new Date(
                  Date.now() + RETRY_DELAYS_MS[retryCount - 1] ||
                    RETRY_DELAYS_MS[RETRY_DELAYS_MS.length - 1],
                )
              : null,
          status: retryCount < MAX_RETRIES ? 'PENDING' : 'FAILED',
          branchId,
        },
      });

      if (recipientId) {
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: 'FAILED', deliveryLog: error.message },
        });
      }

      await this.prisma.messageDeliveryLog.create({
        data: {
          type: 'EMAIL',
          recipient: email,
          status: 'FAILED',
          branchId,
          providerResponse: { error: error.message, jobId: job.id },
        },
      });

      if (campaignId) {
        await this.checkCampaignCompletion(campaignId);
      }

      if (retryCount < MAX_RETRIES) {
        throw error;
      }

      return { success: false, retriesExhausted: true };
    }
  }

  private async checkCampaignCompletion(campaignId: string) {
    const recipients = await this.prisma.campaignRecipient.findMany({
      where: { campaignId },
    });

    const allProcessed = recipients.every(
      (r) => r.status === 'SENT' || r.status === 'FAILED',
    );
    const anyFailed = recipients.some((r) => r.status === 'FAILED');

    if (allProcessed) {
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { status: anyFailed ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED' },
      });
    }
  }

  private async recordQueueMetric(queueName: string) {
    try {
      const existing = await this.prisma.queueMetric.findFirst({
        where: { queueName },
        orderBy: { createdAt: 'desc' },
      });

      await this.prisma.queueMetric.create({
        data: {
          queueName,
          waitingCount: Math.max(0, (existing?.waitingCount || 1) - 1),
          activeCount: (existing?.activeCount || 0) + 1,
          completedCount: (existing?.completedCount || 0) + 1,
          failedCount: existing?.failedCount || 0,
          delayedCount: existing?.delayedCount || 0,
        },
      });
    } catch {
      this.logger.warn('Failed to record queue metric');
    }
  }
}
