import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ExportCleanupService {
  private readonly logger = new Logger(ExportCleanupService.name);
  private readonly exportDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    'exports',
  );

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredExports() {
    this.logger.log('Starting expired exports cleanup...');

    const expired = await this.prisma.academicExport.findMany({
      where: {
        expiresAt: { lt: new Date() },
        status: { not: 'EXPIRED' },
      },
    });

    for (const exp of expired) {
      if (exp.fileUrl) {
        const fileName = path.basename(exp.fileUrl);
        const filePath = path.join(this.exportDir, fileName);

        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
            this.logger.log(`Deleted file: ${filePath}`);
          } catch (err) {
            this.logger.error(
              `Failed to delete file ${filePath}: ${err.message}`,
            );
          }
        }
      }

      await this.prisma.academicExport.update({
        where: { id: exp.id },
        data: { status: 'EXPIRED', fileUrl: null },
      });
    }

    this.logger.log(`Cleanup completed. ${expired.length} exports processed.`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async cleanupOrphanedFiles() {
    this.logger.log('Starting orphaned export files cleanup...');

    if (!fs.existsSync(this.exportDir)) return;

    const files = fs.readdirSync(this.exportDir);
    const dbFiles = await this.prisma.academicExport.findMany({
      where: { fileUrl: { not: null } },
      select: { fileUrl: true },
    });

    const dbFileNames = new Set(dbFiles.map((f) => path.basename(f.fileUrl!)));

    for (const file of files) {
      if (!dbFileNames.has(file)) {
        const filePath = path.join(this.exportDir, file);
        try {
          fs.unlinkSync(filePath);
          this.logger.log(`Deleted orphaned file: ${filePath}`);
        } catch (err) {
          this.logger.error(
            `Failed to delete orphaned file ${filePath}: ${err.message}`,
          );
        }
      }
    }
  }
}
