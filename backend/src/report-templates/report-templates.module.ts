import { Module } from '@nestjs/common';
import { ReportTemplatesService } from './report-templates.service';
import { ReportTemplatesController } from './report-templates.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';

/**
 * Split out of the academics module so both AcademicsModule (the CRUD/
 * designer UI backing) and ExamsModule (actual report generation) can
 * depend on it without a circular AcademicsModule <-> ExamsModule import —
 * AcademicsModule already imports ExamsModule for its own export jobs.
 */
@Module({
  imports: [PrismaModule, ReportingModule],
  controllers: [ReportTemplatesController],
  providers: [ReportTemplatesService],
  exports: [ReportTemplatesService],
})
export class ReportTemplatesModule {}
