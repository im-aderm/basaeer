import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DataRetentionService {
  private readonly logger = new Logger(DataRetentionService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDailyCleanup() {
    this.logger.log('Starting daily data retention cleanup...');

    await this.cleanupExpiredExports();
    await this.cleanupOldDeliveryLogs();
    await this.cleanupOldQueueMetrics();
    await this.cleanupOldRetryEvents();
    await this.cleanupOldQueueJobLogs();
    await this.cleanupOldWebhooks();

    this.logger.log('Daily data retention cleanup completed.');
  }

  @Cron(CronExpression.EVERY_WEEK)
  async runWeeklyCleanup() {
    this.logger.log('Starting weekly data retention cleanup...');

    await this.cleanupOldAuditLogs();
    await this.cleanupOldAutomationExecutions();
    await this.cleanupOldProviderHealthLogs();

    this.logger.log('Weekly data retention cleanup completed.');
  }

  private async cleanupExpiredExports() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 7);

      const result = await this.prisma.academicExport.deleteMany({
        where: {
          OR: [
            { status: 'EXPIRED' },
            { createdAt: { lt: cutoff }, status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] } },
          ],
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} expired/completed exports`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup expired exports: ${error.message}`);
    }
  }

  private async cleanupOldDeliveryLogs() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);

      const result = await this.prisma.messageDeliveryLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old delivery logs`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup delivery logs: ${error.message}`);
    }
  }

  private async cleanupOldQueueMetrics() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const result = await this.prisma.queueMetric.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old queue metrics`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup queue metrics: ${error.message}`);
    }
  }

  private async cleanupOldRetryEvents() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 60);

      const result = await this.prisma.messageRetryEvent.deleteMany({
        where: {
          createdAt: { lt: cutoff },
          status: { in: ['SUCCESS', 'FAILED'] },
        },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old retry events`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup retry events: ${error.message}`);
    }
  }

  private async cleanupOldQueueJobLogs() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const result = await this.prisma.queueJobLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old queue job logs`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup queue job logs: ${error.message}`);
    }
  }

  private async cleanupOldWebhooks() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const processed = await this.prisma.webhookEvent.deleteMany({
        where: {
          createdAt: { lt: cutoff },
          status: 'PROCESSED',
        },
      });

      const oldFailed = await this.prisma.webhookEvent.deleteMany({
        where: {
          createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          status: 'FAILED',
        },
      });

      if (processed.count + oldFailed.count > 0) {
        this.logger.log(`Cleaned up ${processed.count + oldFailed.count} old webhook events`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup webhooks: ${error.message}`);
    }
  }

  private async cleanupOldAuditLogs() {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);

      const result = await this.prisma.auditLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} audit log entries older than 1 year`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup audit logs: ${error.message}`);
    }
  }

  private async cleanupOldAutomationExecutions() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 90);

      const result = await this.prisma.automationExecution.deleteMany({
        where: { executedAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old automation executions`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup automation executions: ${error.message}`);
    }
  }

  private async cleanupOldProviderHealthLogs() {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 60);

      const result = await this.prisma.providerHealthLog.deleteMany({
        where: { createdAt: { lt: cutoff } },
      });

      if (result.count > 0) {
        this.logger.log(`Cleaned up ${result.count} old provider health logs`);
      }
    } catch (error) {
      this.logger.error(`Failed to cleanup provider health logs: ${error.message}`);
    }
  }
}
