import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { CommsService } from '../comms/comms.service';
import { NotificationsService } from '../notifications/notifications.service';
import * as cronParser from 'cron-parser';

interface ScheduledJobRecord {
  id: string;
  name: string;
  cron: string;
  lastRun: Date | null;
  nextRun: Date | null;
  status: string;
  lastResult: string | null;
  errorCount: number;
  isEnabled: boolean;
  branchId: string | null;
}

@Injectable()
export class AutomationRunnerService {
  private readonly logger = new Logger(AutomationRunnerService.name);
  private readonly lockExpiryMs = 60_000;
  private activeLocks = new Map<string, Date>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly commsService: CommsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async runJobs() {
    const now = new Date();

    const jobs = await this.prisma.scheduledJob.findMany({
      where: {
        isEnabled: true,
        status: 'IDLE',
        OR: [{ nextRun: null }, { nextRun: { lte: now } }],
      },
    });

    for (const job of jobs) {
      if (this.isLocked(job.id)) {
        this.logger.debug(`Skipping job ${job.name} - already locked`);
        continue;
      }
      await this.processJob(job as ScheduledJobRecord);
    }
  }

  private isLocked(jobId: string): boolean {
    const lock = this.activeLocks.get(jobId);
    if (!lock) return false;
    if (Date.now() - lock.getTime() > this.lockExpiryMs) {
      this.activeLocks.delete(jobId);
      return false;
    }
    return true;
  }

  private async processJob(job: ScheduledJobRecord) {
    this.activeLocks.set(job.id, new Date());
    this.logger.log(`Processing job: ${job.name}`);

    const jobType = job.name.toUpperCase().replace(/\s+/g, '_');

    await this.prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', lastRun: new Date() },
    });

    try {
      const result = await this.executeJobAction(job, jobType);
      const interval = cronParser.parseExpression(job.cron);
      const nextRun = interval.next().toDate();

      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: 'IDLE',
          nextRun,
          lastResult: 'SUCCESS',
          errorCount: 0,
        },
      });

      await this.logAutomationExecution(job, jobType, 'SUCCESS', result);
      this.logger.log(`Job ${job.name} completed successfully`);
    } catch (error) {
      this.logger.error(`Error processing job ${job.name}: ${error.message}`, error.stack);

      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: 'IDLE',
          errorCount: { increment: 1 },
          lastResult: `FAILED: ${error.message}`,
        },
      });

      await this.logAutomationExecution(job, jobType, 'FAILED', error.message);
    }

    this.activeLocks.delete(job.id);
  }

  private async executeJobAction(job: ScheduledJobRecord, jobType: string): Promise<string> {
    switch (jobType) {
      case 'BIRTHDAY_WISH':
      case 'SEND_BIRTHDAY_WISHES':
        return this.executeBirthdayWishJob(job);

      case 'FEE_REMINDER':
      case 'SEND_FEE_REMINDERS':
        return this.executeFeeReminderJob(job);

      case 'ATTENDANCE_ALERT':
      case 'SEND_ATTENDANCE_ALERTS':
        return this.executeAttendanceAlertJob(job);

      case 'BULK_SMS':
        return this.executeBulkSmsJob(job);

      case 'BULK_EMAIL':
        return this.executeBulkEmailJob(job);

      default:
        this.logger.warn(`Unknown job type: ${jobType}, attempting generic SMS/Email dispatch`);
        return this.executeGenericJob(job);
    }
  }

  private async executeBirthdayWishJob(job: ScheduledJobRecord): Promise<string> {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    const students = await this.prisma.$queryRaw<any[]>`
      SELECT id, "firstName", "lastName", email, phone, "branchId"
      FROM "Student"
      WHERE EXTRACT(MONTH FROM "dateOfBirth") = ${month}
      AND EXTRACT(DAY FROM "dateOfBirth") = ${day}
    `;

    let sentCount = 0;
    for (const person of students) {
      const name = `${person.firstName} ${person.lastName}`;
      if (person.phone) {
        await this.commsService.sendSms({
          phone: person.phone,
          message: `Happy Birthday, ${name}! From all of us at Basaeer College.`,
          branchId: job.branchId,
        });
        sentCount++;
      }
      if (person.email) {
        await this.commsService.sendEmail({
          email: person.email,
          subject: 'Happy Birthday from Basaeer College!',
          message: `<p>Dear ${name},</p><p>Wishing you a wonderful birthday!</p><p>- Basaeer College</p>`,
          branchId: job.branchId,
        });
        sentCount++;
      }
    }
    return `Dispatched ${sentCount} birthday messages to ${students.length} recipients`;
  }

  private async executeFeeReminderJob(job: ScheduledJobRecord): Promise<string> {
    const config = await this.prisma.automationConfig.findFirst({
      where: { branchId: job.branchId || '', type: 'FEE_REMINDER', isEnabled: true },
    });

    const dueDateLimit = new Date();
    dueDateLimit.setDate(dueDateLimit.getDate() + (config?.triggerDays || 0));

    const pendingInvoices = await this.prisma.invoice.findMany({
      where: {
        branchId: job.branchId || undefined,
        status: 'UNPAID',
        dueDate: { lte: dueDateLimit },
      },
      include: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { id: true, email: true, phone: true } },
          },
        },
      },
    });

    let sentCount = 0;
    for (const invoice of pendingInvoices) {
      const studentName = `${invoice.student.firstName} ${invoice.student.lastName}`;
      const amountFormatted = new Intl.NumberFormat('en-NG', {
        style: 'currency', currency: 'NGN',
      }).format(invoice.totalAmount);
      const msg = `Dear parent/guardian of ${studentName}, fee reminder: ${amountFormatted} due. - Basaeer College`;

      const parent = invoice.student.user;
      if (parent?.phone) {
        await this.commsService.sendSms({
          phone: parent.phone, message: msg, userId: parent.id, branchId: job.branchId,
        });
        sentCount++;
      }
      if (parent?.email) {
        await this.commsService.sendEmail({
          email: parent.email, subject: `Fee Reminder - ${studentName}`,
          message: `<p>${msg}</p>`, userId: parent.id, branchId: job.branchId,
        });
        sentCount++;
      }
    }
    return `Dispatched ${sentCount} fee reminders for ${pendingInvoices.length} invoices`;
  }

  private async executeAttendanceAlertJob(job: ScheduledJobRecord): Promise<string> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const absentRecords = await this.prisma.attendance.findMany({
      where: {
        branchId: job.branchId || undefined,
        date: yesterday,
        status: 'ABSENT',
      },
      distinct: ['studentId'],
      select: {
        student: {
          select: {
            firstName: true,
            lastName: true,
            user: { select: { id: true, email: true, phone: true } },
          },
        },
      },
    });

    let sentCount = 0;
    for (const record of absentRecords) {
      const student = record.student;
      const name = `${student.firstName} ${student.lastName}`;
      const msg = `${name} was absent yesterday. Please contact the school. - Basaeer`;

      if (student.user?.phone) {
        await this.commsService.sendSms({
          phone: student.user.phone, message: msg, userId: student.user.id, branchId: job.branchId,
        });
        sentCount++;
      }
      if (student.user?.email) {
        await this.commsService.sendEmail({
          email: student.user.email, subject: `Absence Alert - ${name}`,
          message: `<p>${msg}</p>`, userId: student.user.id, branchId: job.branchId,
        });
        sentCount++;
      }
    }
    return `Dispatched ${sentCount} attendance alerts for ${absentRecords.length} absent students`;
  }

  private async executeBulkSmsJob(job: ScheduledJobRecord): Promise<string> {
    const config = await this.prisma.automationConfig.findFirst({
      where: { branchId: job.branchId || '', type: 'BULK_SMS', isEnabled: true },
    });
    if (!config?.template) return 'No template configured';

    const users = await this.prisma.user.findMany({
      where: { branchId: job.branchId || undefined, isActive: true, phone: { not: '' } },
      select: { id: true, phone: true },
    });

    for (const user of users) {
      if (user.phone) {
        await this.commsService.sendSms({
          phone: user.phone, message: config.template, userId: user.id, branchId: job.branchId,
        });
      }
    }
    return `Bulk SMS dispatched to ${users.length} recipients`;
  }

  private async executeBulkEmailJob(job: ScheduledJobRecord): Promise<string> {
    const config = await this.prisma.automationConfig.findFirst({
      where: { branchId: job.branchId || '', type: 'BULK_EMAIL', isEnabled: true },
    });
    if (!config?.template) return 'No template configured';

    const users = await this.prisma.user.findMany({
      where: { branchId: job.branchId || undefined, isActive: true, email: { not: '' } },
      select: { id: true, email: true },
    });

    for (const user of users) {
      if (user.email) {
        await this.commsService.sendEmail({
          email: user.email,
          subject: 'Bulk Notification - Basaeer College',
          message: `<p>${config.template}</p>`,
          userId: user.id,
          branchId: job.branchId,
        });
      }
    }
    return `Bulk email dispatched to ${users.length} recipients`;
  }

  private async executeGenericJob(job: ScheduledJobRecord): Promise<string> {
    const config = await this.prisma.automationConfig.findFirst({
      where: { branchId: job.branchId || '' },
    });

    if (config?.template) {
      const users = await this.prisma.user.findMany({
        where: { branchId: job.branchId || undefined, isActive: true },
        select: { id: true, email: true, phone: true },
      });

      let sentCount = 0;
      for (const user of users) {
        if (user.phone) {
          await this.commsService.sendSms({
            phone: user.phone, message: config.template, userId: user.id, branchId: job.branchId,
          });
          sentCount++;
        }
        if (user.email) {
          await this.commsService.sendEmail({
            email: user.email, subject: job.name,
            message: `<p>${config.template}</p>`, userId: user.id, branchId: job.branchId,
          });
          sentCount++;
        }
      }
      return `Generic job dispatched ${sentCount} messages`;
    }

    return `Job ${job.name} executed (no communication template configured)`;
  }

  private async logAutomationExecution(
    job: ScheduledJobRecord,
    jobType: string,
    status: string,
    result: string,
  ) {
    try {
      const config = await this.prisma.automationConfig.findFirst({
        where: {
          branchId: job.branchId || '',
          type: jobType,
        },
      });

      if (config) {
        await this.prisma.automationExecution.create({
          data: {
            configId: config.id,
            status,
            result,
            branchId: job.branchId,
          },
        });
      }
    } catch (err) {
      this.logger.warn(`Failed to log automation execution: ${err.message}`);
    }
  }
}
