import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommsService {
  private readonly logger = new Logger(CommsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('sms') private readonly smsQueue: Queue,
  ) {}

  async sendSms(dto: {
    phone: string;
    message: string;
    userId?: string;
    branchId: string | null;
  }) {
    await this.smsQueue.add('send-sms', {
      phone: dto.phone,
      message: dto.message,
      userId: dto.userId,
      branchId: dto.branchId,
    });
  }

  async sendEmail(dto: {
    email: string;
    subject: string;
    message: string;
    userId?: string;
    branchId: string | null;
  }) {
    await this.emailQueue.add('send-email', {
      email: dto.email,
      subject: dto.subject,
      message: dto.message,
      userId: dto.userId,
      branchId: dto.branchId,
    });
  }

  async createBulkEmailCampaign(dto: {
    subject: string;
    message: string;
    recipientGroup: string;
    branchId: string | null;
  }) {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: `Bulk Email: ${dto.subject}`,
        type: 'EMAIL',
        status: 'PENDING',
        branchId: dto.branchId,
      },
    });

    const recipients = await this.getRecipients(dto.recipientGroup, dto.branchId);

    for (const recipient of recipients) {
      const campaignRecipient = await this.prisma.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          userId: recipient.id,
          status: 'PENDING',
          branchId: dto.branchId,
        },
      });

      await this.emailQueue.add('send-email', {
        campaignId: campaign.id,
        recipientId: campaignRecipient.id,
        userId: recipient.id,
        email: recipient.email,
        subject: dto.subject,
        message: dto.message,
        branchId: dto.branchId,
      });
    }

    return {
      campaignId: campaign.id,
      recipientCount: recipients.length,
    };
  }

  async createBulkSmsCampaign(dto: {
    message: string;
    recipientGroup: string;
    branchId: string | null;
  }) {
    const campaign = await this.prisma.campaign.create({
      data: {
        name: `Bulk SMS: ${dto.message.substring(0, 20)}...`,
        type: 'SMS',
        status: 'PENDING',
        branchId: dto.branchId,
      },
    });

    const recipients = await this.getRecipients(dto.recipientGroup, dto.branchId);

    for (const recipient of recipients) {
      if (!recipient.phone) continue;

      const campaignRecipient = await this.prisma.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          userId: recipient.id,
          status: 'PENDING',
          branchId: dto.branchId,
        },
      });

      await this.smsQueue.add('send-sms', {
        campaignId: campaign.id,
        recipientId: campaignRecipient.id,
        userId: recipient.id,
        phone: recipient.phone,
        message: dto.message,
        branchId: dto.branchId,
      });
    }

    return {
      campaignId: campaign.id,
      recipientCount: recipients.length,
    };
  }

  async getCampaigns(branchId: string | null) {
    return this.prisma.campaign.findMany({
      where: {
        branchId: branchId || undefined,
      },
      include: {
        _count: {
          select: { recipients: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  private async getRecipients(group: string, branchId: string | null) {
    // Basic implementation: fetch all users in the branch for now
    // In a real app, this would filter by role or other criteria based on 'group'
    return this.prisma.user.findMany({
      where: {
        branchId: branchId || undefined,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });
  }
}
