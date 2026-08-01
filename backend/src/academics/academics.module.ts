import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AcademicsService } from './academics.service';
import { AcademicsController } from './academics.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';
import { ExamsModule } from '../exams/exams.module';
import { ReportTemplatesModule } from '../report-templates/report-templates.module';
import { ExportQueueService } from './export-queue.service';
import { AcademicExportProcessor } from './academic-export.processor';
import { ComputationQueueService } from './computation-queue.service';
import { AcademicComputationProcessor } from './academic-computation.processor';
import { ExportCleanupService } from './export-cleanup.service';

import { AssessmentService } from './assessment.service';
import { AssessmentController } from './assessment.controller';

@Module({
  imports: [
    PrismaModule,
    ReportingModule,
    ExamsModule,
    ReportTemplatesModule,
    BullModule.registerQueue(
      { name: 'academic-exports' },
      { name: 'academic-computations' },
    ),
  ],
  controllers: [
    AcademicsController,
    AssessmentController,
  ],
  providers: [
    AcademicsService,
    AssessmentService,
    ExportQueueService,
    AcademicExportProcessor,
    ComputationQueueService,
    AcademicComputationProcessor,
    ExportCleanupService,
  ],
  exports: [
    AcademicsService,
    AssessmentService,
    ExportQueueService,
    ComputationQueueService,
  ],
})
export class AcademicsModule {}
