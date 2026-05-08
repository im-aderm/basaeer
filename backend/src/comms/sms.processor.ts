import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProvidersService } from '../providers/providers.service';

@Processor('sms')
export class SmsProcessor extends WorkerHost {
  private readonly logger = new Logger(SmsProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providersService: ProvidersService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { campaignId, recipientId, phone, message, branchId } = job.data;

    this.logger.log(`Processing SMS job for recipient ${recipientId} (${phone})`);

    try {
      const success = await this.providersService.sendSmsWithFailover(phone, message);

      if (success) {
        // Update CampaignRecipient
        await this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: { status: 'SENT' },
        });

        // Log delivery
        await this.prisma.messageDeliveryLog.create({
          data: {
            type: 'SMS',
            recipient: phone,
            status: 'DELIVERED',
            branchId,
            providerResponse: { success: true },
          },
        });

        this.logger.log(`SMS sent successfully to ${phone}`);
      } else {
        throw new Error('All SMS providers failed');
      }
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phone}`, error.stack);

      await this.prisma.campaignRecipient.update({
        where: { id: recipientId },
        data: { status: 'FAILED', deliveryLog: error.message },
      });

      await this.prisma.messageDeliveryLog.create({
        data: {
          type: 'SMS',
          recipient: phone,
          status: 'FAILED',
          branchId,
          providerResponse: { error: error.message },
        },
      });
    }
  }
}
