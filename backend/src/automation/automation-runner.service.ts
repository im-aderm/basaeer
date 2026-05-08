import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as cronParser from 'cron-parser';

@Injectable()
export class AutomationRunnerService {
  private readonly logger = new Logger(AutomationRunnerService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('* * * * *')
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
      await this.processJob(job);
    }
  }

  private async processJob(job: any) {
    this.logger.log(`Processing job: ${job.name}`);

    // Mark as RUNNING
    await this.prisma.scheduledJob.update({
      where: { id: job.id },
      data: { status: 'RUNNING', lastRun: new Date() },
    });

    try {
      // Simulate action
      this.logger.log(`Executing action for ${job.name}...`);
      
      // Try to find a matching AutomationConfig to create an Execution record
      const config = await this.prisma.automationConfig.findFirst({
        where: { 
            branchId: job.branchId || '',
            // Try to match name to type, e.g. "Send Fee Reminders" -> "FEE_REMINDER"
            type: job.name.toUpperCase().replace(/\s+/g, '_')
        }
      });

      if (config) {
        await this.prisma.automationExecution.create({
          data: {
            configId: config.id,
            status: 'SUCCESS',
            result: `Successfully executed ${job.name}`,
            branchId: job.branchId,
          },
        });
      } else {
          this.logger.warn(`No AutomationConfig found for job ${job.name}, skipping AutomationExecution record.`);
      }

      // Calculate next run
      const interval = cronParser.parseExpression(job.cron);
      const nextRun = interval.next().toDate();

      // Update job status
      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: 'IDLE',
          nextRun: nextRun,
          lastResult: 'SUCCESS',
        },
      });
    } catch (error) {
      this.logger.error(`Error processing job ${job.name}: ${error.message}`);
      
      await this.prisma.scheduledJob.update({
        where: { id: job.id },
        data: {
          status: 'IDLE',
          errorCount: { increment: 1 },
          lastResult: `FAILED: ${error.message}`,
        },
      });
    }
  }
}
