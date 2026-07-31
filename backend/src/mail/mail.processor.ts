import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { MailService } from './mail.service';
import { PrismaService } from '../prisma/prisma.service';

@Processor('transactional-email')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<{
    to: string;
    subject: string;
    html: string;
    branchId?: string;
    attachments?: { filename: string; path?: string; content?: Buffer }[];
  }>): Promise<any> {
    const { to, subject, html, branchId, attachments } = job.data;

    // BullMQ processors run outside NestJS's request lifecycle, so
    // TenantContextInterceptor never runs for them — without this, every
    // Prisma call below has no ambient tenant context at all.
    return this.prisma.runInTenantContext(branchId || null, null, 'system', async () => {
      try {
        await this.mailService.sendMailDirect(to, subject, html, attachments);

        await this.prisma.messageDeliveryLog.create({
          data: {
            type: 'EMAIL',
            recipient: to,
            status: 'DELIVERED',
            branchId: branchId || null,
            providerResponse: { success: true, jobId: job.id },
          },
        });

        this.logger.log(`Email sent to ${to} | Subject: "${subject}" | Job: ${job.id}`);
        return { success: true };
      } catch (error) {
        this.logger.error(`Failed to send email to ${to} (job ${job.id})`, error.stack);

        await this.prisma.messageDeliveryLog.create({
          data: {
            type: 'EMAIL',
            recipient: to,
            status: 'FAILED',
            branchId: branchId || null,
            providerResponse: { error: error.message, jobId: job.id },
          },
        });

        throw error;
      }
    });
  }
}
