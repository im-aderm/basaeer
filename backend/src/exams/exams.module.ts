import { Module, forwardRef } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';
import { BranchesModule } from '../branches/branches.module';
import { ReportTemplatesModule } from '../report-templates/report-templates.module';
import { ResultDeliveryModule } from '../result-delivery/result-delivery.module';
import { ExamManagementService } from './exam-management.service';
import { ResultComputationService } from './result-computation.service';
import { ResultApprovalService } from './result-approval.service';
import { TranscriptService } from './transcript.service';
import { TahfeezService } from './tahfeez.service';
import { AcademicPortalService } from './academic-portal.service';
import { ResultVerificationService } from './result-verification.service';

@Module({
  imports: [
    PrismaModule,
    ReportingModule,
    BranchesModule,
    ReportTemplatesModule,
    forwardRef(() => ResultDeliveryModule),
  ],
  controllers: [ExamsController],
  providers: [
    ExamsService,
    ExamManagementService,
    ResultComputationService,
    ResultApprovalService,
    TranscriptService,
    TahfeezService,
    AcademicPortalService,
    ResultVerificationService,
  ],
  exports: [
    ExamsService,
    ExamManagementService,
    ResultComputationService,
    ResultApprovalService,
    TranscriptService,
    TahfeezService,
    AcademicPortalService,
    ResultVerificationService,
  ],
})
export class ExamsModule {}
