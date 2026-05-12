import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { CommsService } from '../../comms/comms.service';
import { NotificationsService } from '../../notifications/notifications.service';

interface BirthdayPerson {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  branchId: string;
}

interface PendingInvoice {
  id: string;
  totalAmount: number;
  dueDate: Date;
  branchId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    user?: { id: string; email: string; phone: string | null } | null;
  };
}

@Injectable()
export class AutomationWorker {
  private readonly logger = new Logger(AutomationWorker.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly commsService: CommsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async handleBirthdayWishes() {
    this.logger.log('Running daily birthday wishes check...');
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    try {
      const students = await this.prisma.$queryRaw<BirthdayPerson[]>`
        SELECT id, "firstName", "lastName", email, phone, "branchId"
        FROM "Student"
        WHERE EXTRACT(MONTH FROM "dateOfBirth") = ${month}
        AND EXTRACT(DAY FROM "dateOfBirth") = ${day}
      `;

      const staff = await this.prisma.$queryRaw<BirthdayPerson[]>`
        SELECT s.id, u."firstName", u."lastName", u.email, u.phone, s."branchId"
        FROM "Staff" s
        JOIN "User" u ON s."userId" = u.id
        WHERE EXTRACT(MONTH FROM u."dateOfBirth") = ${month}
        AND EXTRACT(DAY FROM u."dateOfBirth") = ${day}
      `;

      const birthdayPeople = [...students, ...staff];
      this.logger.log(`Found ${birthdayPeople.length} birthdays today.`);

      for (const person of birthdayPeople) {
        await this.dispatchBirthdayWish(person);
      }

      if (birthdayPeople.length > 0) {
        await this.logExecution(
          'BIRTHDAY_WISH',
          birthdayPeople
            .map((p) => p.branchId)
            .filter((v, i, a) => a.indexOf(v) === i),
          `Dispatched ${birthdayPeople.length} birthday wishes`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Birthday wishes check failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async dispatchBirthdayWish(person: BirthdayPerson) {
    const config = await this.prisma.automationConfig.findFirst({
      where: {
        branchId: person.branchId,
        type: 'BIRTHDAY_WISH',
        isEnabled: true,
      },
    });

    if (!config) {
      this.logger.debug(
        `BIRTHDAY_WISH automation not enabled for branch ${person.branchId}`,
      );
      return;
    }

    const name = `${person.firstName} ${person.lastName}`;
    const template =
      config.template ||
      `Happy Birthday, ${name}! From all of us at Basaeer College.`;
    const personalizedMessage = template.replace(/\{\{name\}\}/g, name);

    const dispatchedChannels: string[] = [];

    if (person.phone) {
      try {
        await this.commsService.sendSms({
          phone: person.phone,
          message: personalizedMessage,
          branchId: person.branchId,
        });
        dispatchedChannels.push('SMS');
      } catch (err) {
        this.logger.error(
          `Failed to queue birthday SMS for ${name}: ${err.message}`,
        );
      }
    }

    if (person.email) {
      try {
        await this.commsService.sendEmail({
          email: person.email,
          subject: '🎂 Happy Birthday from Basaeer College!',
          message: `<p>Dear ${name},</p><p>${personalizedMessage}</p><p>Wishing you a wonderful year ahead!</p><p>- Basaeer College</p>`,
          branchId: person.branchId,
        });
        dispatchedChannels.push('EMAIL');
      } catch (err) {
        this.logger.error(
          `Failed to queue birthday email for ${name}: ${err.message}`,
        );
      }
    }

    try {
      await this.notificationsService.createNotification({
        userId: person.id,
        title: '🎂 Happy Birthday!',
        message: personalizedMessage,
        type: 'BIRTHDAY_WISH',
        branchId: person.branchId,
      });
      dispatchedChannels.push('NOTIFICATION');
    } catch (err) {
      this.logger.error(
        `Failed to create birthday notification for ${name}: ${err.message}`,
      );
    }

    this.logger.log(
      `Birthday wish dispatched for ${name} via: ${dispatchedChannels.join(', ') || 'none'}`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async handleFeeReminders() {
    this.logger.log('Running daily fee reminders check...');

    try {
      const configs = await this.prisma.automationConfig.findMany({
        where: { type: 'FEE_REMINDER', isEnabled: true },
      });

      for (const config of configs) {
        const dueDateLimit = new Date();
        dueDateLimit.setDate(
          dueDateLimit.getDate() + (config.triggerDays || 0),
        );

        const pendingInvoices = await this.prisma.invoice.findMany({
          where: {
            branchId: config.branchId,
            status: 'UNPAID',
            dueDate: { lte: dueDateLimit },
          },
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: { id: true, email: true, phone: true },
                },
              },
            },
          },
        });

        this.logger.log(
          `Found ${pendingInvoices.length} pending invoices for branch ${config.branchId}.`,
        );

        for (const invoice of pendingInvoices) {
          await this.dispatchFeeReminder(invoice, config);
        }
      }
    } catch (error) {
      this.logger.error(
        `Fee reminders check failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async dispatchFeeReminder(
    invoice: PendingInvoice,
    config: { id: string; template: string | null; branchId: string },
  ) {
    const student = invoice.student;
    const studentName = `${student.firstName} ${student.lastName}`;
    const amountFormatted = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(invoice.totalAmount);
    const dueDateFormatted = invoice.dueDate.toLocaleDateString('en-NG');

    const template =
      config.template ||
      `Dear parent/guardian of ${studentName}, this is a reminder that an invoice of ${amountFormatted} is due on ${dueDateFormatted}. Please make payment at your earliest convenience. - Basaeer College`;

    const message = template
      .replace(/\{\{studentName\}\}/g, studentName)
      .replace(/\{\{amount\}\}/g, amountFormatted)
      .replace(/\{\{dueDate\}\}/g, dueDateFormatted);

    const userId = student.user?.id;
    const email = student.user?.email;
    const phone = student.user?.phone;

    if (phone) {
      try {
        await this.commsService.sendSms({
          phone,
          message: message.substring(0, 480),
          userId,
          branchId: config.branchId,
        });
        this.logger.log(`Fee reminder SMS queued for ${studentName}`);
      } catch (err) {
        this.logger.error(
          `Failed to queue fee reminder SMS for ${studentName}: ${err.message}`,
        );
      }
    }

    if (email) {
      try {
        await this.commsService.sendEmail({
          email,
          subject: `Fee Reminder - ${studentName}`,
          message: `<p>Dear parent/guardian,</p><p>${message}</p><p>Please visit the school accounts office or use the portal to make payment.</p><p>- Basaeer College</p>`,
          userId,
          branchId: config.branchId,
        });
        this.logger.log(`Fee reminder email queued for ${studentName}`);
      } catch (err) {
        this.logger.error(
          `Failed to queue fee reminder email for ${studentName}: ${err.message}`,
        );
      }
    }

    if (userId) {
      try {
        await this.notificationsService.createNotification({
          userId,
          title: 'Fee Reminder',
          message: message.substring(0, 255),
          type: 'FEE_REMINDER',
          branchId: config.branchId,
        });
      } catch (err) {
        this.logger.error(
          `Failed to create fee reminder notification for ${studentName}: ${err.message}`,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async handleAttendanceAlerts() {
    this.logger.log('Running daily attendance alerts check...');

    try {
      const configs = await this.prisma.automationConfig.findMany({
        where: { type: 'ATTENDANCE_ALERT', isEnabled: true },
      });

      for (const config of configs) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);

        const absentStudents = await this.prisma.attendance.findMany({
          where: {
            branchId: config.branchId,
            date: yesterday,
            status: 'ABSENT',
          },
          select: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                user: {
                  select: { id: true, email: true, phone: true },
                },
              },
            },
          },
          distinct: ['studentId'],
        });

        this.logger.log(
          `Found ${absentStudents.length} absent students for branch ${config.branchId}`,
        );

        for (const record of absentStudents) {
          await this.dispatchAttendanceAlert(record.student, config);
        }
      }
    } catch (error) {
      this.logger.error(
        `Attendance alerts check failed: ${error.message}`,
        error.stack,
      );
    }
  }

  private async dispatchAttendanceAlert(
    student: {
      id: string;
      firstName: string;
      lastName: string;
      user: { id: string; email: string; phone: string | null } | null;
    },
    config: { id: string; template: string | null; branchId: string },
  ) {
    const studentName = `${student.firstName} ${student.lastName}`;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toLocaleDateString('en-NG');

    const template =
      config.template ||
      `Dear parent/guardian, ${studentName} was marked absent on ${dateStr}. Please contact the school if you have any questions. - Basaeer College`;
    const message = template
      .replace(/\{\{studentName\}\}/g, studentName)
      .replace(/\{\{date\}\}/g, dateStr);

    const parent = student.user;
    if (!parent) return;

    if (parent.phone) {
      try {
        await this.commsService.sendSms({
          phone: parent.phone,
          message: message.substring(0, 480),
          userId: parent.id,
          branchId: config.branchId,
        });
      } catch (err) {
        this.logger.error(
          `Failed to queue attendance alert SMS for ${studentName}: ${err.message}`,
        );
      }
    }

    if (parent.email) {
      try {
        await this.commsService.sendEmail({
          email: parent.email,
          subject: `Attendance Alert - ${studentName}`,
          message: `<p>Dear parent/guardian,</p><p>${message}</p><p>- Basaeer College</p>`,
          userId: parent.id,
          branchId: config.branchId,
        });
      } catch (err) {
        this.logger.error(
          `Failed to queue attendance alert email for ${studentName}: ${err.message}`,
        );
      }
    }

    try {
      await this.notificationsService.createNotification({
        userId: parent.id,
        title: 'Attendance Alert',
        message: message.substring(0, 255),
        type: 'ATTENDANCE_ALERT',
        branchId: config.branchId,
      });
    } catch (err) {
      this.logger.error(
        `Failed to create attendance alert notification for ${studentName}: ${err.message}`,
      );
    }
  }

  private async logExecution(
    type: string,
    branchIds: string[],
    result: string,
  ) {
    for (const branchId of branchIds) {
      const config = await this.prisma.automationConfig.findFirst({
        where: { branchId, type },
      });
      if (!config) continue;

      try {
        await this.prisma.automationExecution.create({
          data: {
            configId: config.id,
            status: 'SUCCESS',
            result,
            branchId,
          },
        });
      } catch (err) {
        this.logger.warn(
          `Failed to log automation execution for ${type}/${branchId}: ${err.message}`,
        );
      }
    }
  }
}
