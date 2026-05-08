import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvidersService } from '../providers/providers.service';

@Processor('email')
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, recipientId, email, subject, message, branchId } = job.data;

    this.logger.log(`Processing email job for recipient ${recipientId} (${email})`);

    try {
      const success = await this.providersService.sendEmailWithFailover(email, subject, message);

      if (success) {
        // Update CampaignRecipient
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: 'SENT' },
        });

        // Log delivery
        await this.prisma.messageDeliveryLog.create({
          data: {
            type: 'EMAIL',
            recipient: email,
            status: 'DELIVERED',
            branchId,
            providerResponse: { success: true },
          },
        });

        this.logger.log(`Email sent successfully to ${email}`);
      } else {
        throw new Error('All email providers failed');
      }
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}`, error.stack);

      await this.prisma.campaignRecipient.update({
        where: { id: recipientId },
        data: { status: 'FAILED', deliveryLog: error.message },
      });

      await this.prisma.messageDeliveryLog.create({
        data: {
          type: 'EMAIL',
          recipient: email,
          status: 'FAILED',
          branchId,
          providerResponse: { error: error.message },
        },
      });
    }
  }
}
