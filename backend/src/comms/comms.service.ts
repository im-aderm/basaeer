import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { TenantContext } from '../auth/branch.guard';
import { TenantHelper } from '../prisma/tenant-helper';
import { BranchBrandingService } from '../branches/branch-branding.service';
import { CommsRecipientGroup } from '@basaer/shared-types';

const QUEUE_JOB_OPTS = {
  attempts: 3,
  backoff: {
    type: 'exponential' as const,
    delay: 5000,
  },
  removeOnComplete: 100,
  removeOnFail: 200,
};

@Injectable()
export class CommsService {
  private readonly logger = new Logger(CommsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('email') private readonly emailQueue: Queue,
    @InjectQueue('sms') private readonly smsQueue: Queue,
    private readonly brandingService: BranchBrandingService,
  ) {}

  async sendSms(dto: {
    phone: string;
    message: string;
    userId?: string;
    branchId: string | null;
  }) {
    let smsSenderId: string | undefined;
    if (dto.branchId) {
      const branding = await this.brandingService.getBranding(dto.branchId);
      smsSenderId = branding.smsSenderId;
    }

    const job = await this.smsQueue.add(
      'send-sms',
      {
        phone: dto.phone,
        message: dto.message,
        userId: dto.userId,
        branchId: dto.branchId,
        smsSenderId,
      },
      QUEUE_JOB_OPTS,
    );

    await this.logQueueJob(
      'sms',
      job.id || 'unknown',
      'send-sms',
      'QUEUED',
      dto.branchId,
      { phone: dto.phone },
    );
    this.logger.debug(`SMS job ${job.id} queued for ${dto.phone}`);
    return { jobId: job.id };
  }

  async sendEmail(dto: {
    email: string;
    subject: string;
    message: string;
    userId?: string;
    branchId: string | null;
  }) {
    const job = await this.emailQueue.add(
      'send-email',
      {
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
        userId: dto.userId,
        branchId: dto.branchId,
      },
      QUEUE_JOB_OPTS,
    );

    await this.logQueueJob(
      'email',
      job.id || 'unknown',
      'send-email',
      'QUEUED',
      dto.branchId,
      { email: dto.email },
    );
    this.logger.debug(`Email job ${job.id} queued for ${dto.email}`);
    return { jobId: job.id };
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

    const recipients = await this.getRecipients(
      dto.recipientGroup,
      dto.branchId,
    );

    for (const recipient of recipients) {
      if (!recipient.email) continue;

      const campaignRecipient = await this.prisma.campaignRecipient.create({
        data: {
          campaignId: campaign.id,
          userId: recipient.id,
          status: 'PENDING',
          branchId: dto.branchId,
        },
      });

      const job = await this.emailQueue.add(
        'send-email',
        {
          campaignId: campaign.id,
          recipientId: campaignRecipient.id,
          userId: recipient.id,
          email: recipient.email,
          subject: dto.subject,
          message: dto.message,
          branchId: dto.branchId,
        },
        QUEUE_JOB_OPTS,
      );

      await this.logQueueJob(
        'email',
        job.id || 'unknown',
        'send-email',
        'QUEUED',
        dto.branchId,
        { email: recipient.email },
      );
    }

    this.logger.log(
      `Bulk email campaign ${campaign.id} created with ${recipients.length} recipients`,
    );
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

    const recipients = await this.getRecipients(
      dto.recipientGroup,
      dto.branchId,
    );

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

      const job = await this.smsQueue.add(
        'send-sms',
        {
          campaignId: campaign.id,
          recipientId: campaignRecipient.id,
          userId: recipient.id,
          phone: recipient.phone,
          message: dto.message,
          branchId: dto.branchId,
        },
        QUEUE_JOB_OPTS,
      );

      await this.logQueueJob(
        'sms',
        job.id || 'unknown',
        'send-sms',
        'QUEUED',
        dto.branchId,
        { phone: recipient.phone },
      );
    }

    this.logger.log(
      `Bulk SMS campaign ${campaign.id} created with ${recipients.length} recipients`,
    );
    return {
      campaignId: campaign.id,
      recipientCount: recipients.length,
    };
  }

  async getCampaigns(branchId: string | null) {
    return this.prisma.campaign.findMany({
      where: { branchId: branchId || undefined },
      include: {
        _count: { select: { recipients: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCampaignDetails(campaignId: string, context: TenantContext) {
    const campaign = await this.prisma.campaign.findFirst({
      where: TenantHelper.applyIsolation({ id: campaignId }, context),
      include: {
        recipients: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  private async getRecipients(group: string, branchId: string | null) {
    const where: any = {
      branchId: branchId || undefined,
      isActive: true,
    };

    // The frontend's recipient-group selector and this switch previously
    // used unrelated value sets (ALL_STUDENTS/ALL_STAFF/PARENTS/ALUMNI vs
    // students/staff/all-by-default) — every campaign silently broadcast
    // to the whole branch regardless of what was actually selected. Both
    // sides now import CommsRecipientGroup from @basaer/shared-types, and
    // an unrecognized value is a hard error instead of a silent fallback.
    switch (group) {
      case CommsRecipientGroup.STUDENTS:
        return this.prisma.user.findMany({
          where: { ...where, role: 'STUDENT' },
          select: { id: true, email: true, phone: true },
        });
      case CommsRecipientGroup.PARENTS:
        return this.prisma.user.findMany({
          where: { ...where, role: 'PARENT' },
          select: { id: true, email: true, phone: true },
        });
      case CommsRecipientGroup.STAFF:
        return this.prisma.user.findMany({
          where: {
            ...where,
            role: {
              in: ['TEACHER', 'PRINCIPAL', 'HR', 'ACCOUNTANT', 'LIBRARIAN'],
            },
          },
          select: { id: true, email: true, phone: true },
        });
      case CommsRecipientGroup.ALUMNI: {
        const alumni = await this.prisma.alumni.findMany({
          where: { branchId: branchId || undefined },
          select: {
            student: {
              select: { user: { select: { id: true, email: true, phone: true, isActive: true } } },
            },
          },
        });
        return alumni
          .map((a) => a.student?.user)
          .filter((u): u is { id: string; email: string; phone: string | null; isActive: boolean } => !!u && u.isActive);
      }
      case CommsRecipientGroup.ALL:
        return this.prisma.user.findMany({
          where,
          select: { id: true, email: true, phone: true },
        });
      default:
        throw new BadRequestException(
          `Unknown recipient group "${group}". Expected one of: ${Object.values(CommsRecipientGroup).join(', ')}.`,
        );
    }
  }

  private async logQueueJob(
    queueName: string,
    jobId: string,
    name: string,
    status: string,
    branchId: string | null,
    data?: any,
  ) {
    try {
      await this.prisma.queueJobLog.create({
        data: {
          jobId,
          queueName,
          name,
          status,
          branchId,
          data: data || undefined,
        },
      });
    } catch (err) {
      this.logger.warn(`Failed to log queue job: ${err.message}`);
    }
  }
}
