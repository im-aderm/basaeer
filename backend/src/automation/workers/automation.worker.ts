import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class AutomationWorker {
    private readonly logger = new Logger(AutomationWorker.name);

    constructor(private prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_DAY_AT_9AM)
    async handleBirthdayWishes() {
        this.logger.log('Running daily birthday wishes check...');
        const today = new Date();
        const month = today.getMonth() + 1;
        const day = today.getDate();

        // Find students/staff with birthdays today
        // Note: Prisma doesn't have a direct month/day extraction for cross-db,
        // so we might need a raw query or fetch and filter if small.
        // For Postgres:
        const students = await this.prisma.$queryRaw`
            SELECT id, "firstName", "lastName", email, phone 
            FROM "Student" 
            WHERE EXTRACT(MONTH FROM "dateOfBirth") = ${month} 
            AND EXTRACT(DAY FROM "dateOfBirth") = ${day}
        `;

        this.logger.log(`Found ${(students as any[]).length} birthdays today.`);
        // Logic to send SMS/Email would go here
    }

    @Cron(CronExpression.EVERY_DAY_AT_10AM)
    async handleFeeReminders() {
        this.logger.log('Running daily fee reminders check...');
        // Logic to find unpaid invoices due in X days
        const configs = await this.prisma.automationConfig.findMany({
            where: { type: 'FEE_REMINDER', isEnabled: true }
        });

        for (const config of configs) {
            const dueDateLimit = new Date();
            dueDateLimit.setDate(dueDateLimit.getDate() + (config.triggerDays || 0));

            const pendingInvoices = await this.prisma.invoice.findMany({
                where: {
                    branchId: config.branchId,
                    status: 'UNPAID',
                    dueDate: { lte: dueDateLimit }
                },
                include: { student: true }
            });

            this.logger.log(`Found ${pendingInvoices.length} pending invoices for branch ${config.branchId}.`);
            // Trigger communication for each invoice
        }
    }
}
