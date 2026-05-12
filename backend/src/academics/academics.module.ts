import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { ReportTemplatesService } from './report-templates.service';
import { ReportTemplatesController } from './report-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';
import { ExamsModule } from '../exams/exams.module';
import { ExportQueueService } from './export-queue.service';
import { AcademicExportProcessor } from './academic-export.processor';
import { ComputationQueueService } from './computation-queue.service';
import { AcademicComputationProcessor } from './academic-computation.processor';
import { ExportCleanupService } from './export-cleanup.service';

@Module({
  imports: [
    PrismaModule,
    ReportingModule,
    ExamsModule,
    BullModule.registerQueue(
      { name: 'academic-exports' },
      { name: 'academic-computations' },
    ),
  ],
  controllers: [AcademicsController, ReportTemplatesController],
  providers: [
    AcademicsService,
    ExportQueueService,
    AcademicExportProcessor,
    ReportTemplatesService,
    ComputationQueueService,
    AcademicComputationProcessor,
    ExportCleanupService,
  ],
  exports: [
    AcademicsService,
    ExportQueueService,
    ReportTemplatesService,
    ComputationQueueService,
  ],
})
export class AcademicsModule {}
