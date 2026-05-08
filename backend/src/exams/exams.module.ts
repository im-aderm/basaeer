import { Module } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamsController } from './exams.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportingModule } from '../reporting/reporting.module';
import { ExamManagementService } from './exam-management.service';
import { ResultComputationService } from './result-computation.service';
import { ResultApprovalService } from './result-approval.service';
import { TranscriptService } from './transcript.service';
import { TahfeezService } from './tahfeez.service';
import { AcademicPortalService } from './academic-portal.service';

@Module({
    imports: [PrismaModule, ReportingModule],
    controllers: [ExamsController],
    providers: [ExamsService, ExamManagementService, ResultComputationService, ResultApprovalService, TranscriptService, TahfeezService, AcademicPortalService],
    exports: [ExamsService, ExamManagementService, ResultComputationService, ResultApprovalService, TranscriptService, TahfeezService, AcademicPortalService],
})
export class ExamsModule { }
