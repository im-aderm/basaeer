import * as path from 'path';
import * as fs from 'fs';
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ExamsService } from './exams.service';
import { ExamManagementService } from './exam-management.service';
import { ResultComputationService } from './result-computation.service';
import { ResultApprovalService } from './result-approval.service';
import { TranscriptService } from './transcript.service';
import { TahfeezService } from './tahfeez.service';
import { AcademicPortalService } from './academic-portal.service';
import {
  CreateAcademicSessionDto,
  BulkSubmitScoresDto,
  RecordBehaviouralDto,
} from './dto/exam-ops.dto';
import { ReportingService } from '../reporting/reporting.service';
import { END_OF_TERM_TEMPLATE } from '../reporting/templates/end-of-term.template';
import { ANNUAL_CUMULATIVE_TEMPLATE } from '../reporting/templates/annual-cumulative.template';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, Term, ExamTerm } from '../generated/client/client';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('exams')
export class ExamsController {
  constructor(
    private readonly examsService: ExamsService,
    private readonly reportingService: ReportingService,
    private readonly examManagementService: ExamManagementService,
    private readonly resultComputationService: ResultComputationService,
    private readonly resultApprovalService: ResultApprovalService,
    private readonly transcriptService: TranscriptService,
    private readonly tahfeezService: TahfeezService,
    private readonly academicPortalService: AcademicPortalService,
  ) {}

  @Get()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  listExams(@Query() query: any, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.listExams(query, ctx);
  }

  @Post()
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  createExam(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.createExam(dto, ctx);
  }

  @Get('management/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  getExam(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.getExam(id, ctx);
  }

  @Put('management/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  updateExam(
    @Param('id') id: string,
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examManagementService.updateExam(id, dto, ctx);
  }

  @Patch('management/:id/status')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  transitionExam(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examManagementService.transitionExam(id, status, ctx);
  }

  @Post('management/:id/clone')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  cloneExam(
    @Param('id') id: string,
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examManagementService.cloneExam(id, dto, ctx);
  }

  @Get('types-v2')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  listExamTypes(@GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.listExamTypes(ctx);
  }

  @Post('types-v2')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  upsertExamType(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.upsertExamType(dto, ctx);
  }

  @Get('components')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  listComponents(@Query() query: any, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.listAssessmentComponents(query, ctx);
  }

  @Post('components')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  createComponent(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.examManagementService.createAssessmentComponent(dto, ctx);
  }

  @Get('components/validate')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  validateComponents(
    @Query() query: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examManagementService.validateComponentWeights(query, ctx);
  }

  @Post('compute/section/:sectionId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  computeSection(
    @Param('sectionId') sectionId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.resultComputationService.computeSection(
      sectionId,
      sessionId,
      term,
      ctx,
    );
  }

  @Get('analytics')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  analytics(
    @Query('sessionId') sessionId: string,
    @Query('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.resultComputationService.analytics(sessionId, term, ctx);
  }

  @Get('approvals')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  listApprovals(@Query() query: any, @GetTenantContext() ctx: TenantContext) {
    return this.resultApprovalService.list(query, ctx);
  }

  @Post('approvals')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  submitApproval(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.resultApprovalService.submit(dto, ctx);
  }

  @Patch('approvals/:id/review')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  reviewApproval(
    @Param('id') id: string,
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.resultApprovalService.review(id, dto, ctx);
  }

  @Post('publication')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
  )
  publishApprovedResults(
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.resultApprovalService.publish(dto, ctx);
  }

  @Patch('publication/:id/revoke')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
  )
  revokePublication(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.resultApprovalService.revokePublication(id, ctx);
  }

  @Get('transcripts')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  listTranscripts(@Query() query: any, @GetTenantContext() ctx: TenantContext) {
    return this.transcriptService.list(query, ctx);
  }

  @Post('transcripts/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  generateTranscript(
    @Param('studentId') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.transcriptService.generate(studentId, ctx);
  }

  @Patch('transcripts/:id/approve')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
  )
  approveTranscript(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.transcriptService.approve(id, ctx);
  }

  @Get('transcripts/:id/pdf')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  async transcriptPdf(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
    @Res() res: Response,
  ) {
    const pdf = await this.transcriptService.pdf(id, ctx);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Transcript_${id}.pdf`,
      'Content-Length': pdf.length,
    });
    res.end(pdf);
  }

  @Public()
  @Get('verify/transcript/:code')
  verifyTranscript(@Param('code') code: string) {
    return this.transcriptService.verify(code);
  }

  @Post('tahfeez/assessments')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  assessTahfeez(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.tahfeezService.assess(dto, ctx);
  }

  @Post('tahfeez/progress')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  updateTahfeezProgress(
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.tahfeezService.updateProgress(dto, ctx);
  }

  @Get('tahfeez/reports/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  tahfeezReport(
    @Param('studentId') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.tahfeezService.report(studentId, ctx);
  }

  @Get('portal/results/:studentId/:sessionId/:term')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  portalResult(
    @Param('studentId') studentId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.academicPortalService.result(studentId, sessionId, term, ctx);
  }

  @Get('portal/performance/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.HOD,
    UserRole.PRINCIPAL,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  portalPerformance(
    @Param('studentId') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.academicPortalService.performance(studentId, ctx);
  }

  @Get('sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getSessions() {
    return this.examsService.getAllSessions();
  }

  @Post('sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createSession(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateAcademicSessionDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.examsService.createSession(dto);
  }

  @Post('submit-scores')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
  submitScores(
    @Body() dto: BulkSubmitScoresDto,
    @GetTenantContext() ctx: TenantContext,
    @Request() req: any,
  ) {
    const branchId =
      ctx.role === UserRole.SUPER_ADMIN
        ? req.body.branchId || req.query.branchId || ctx.branchId
        : ctx.branchId;
    return this.examsService.submitBulkScores(dto, branchId);
  }

  @Post('behavioural')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
  recordBehavioural(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: RecordBehaviouralDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.examsService.recordBehavioural(dto);
  }

  @Post('summarize/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
  summarizeTerm(
    @Param('studentId') studentId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @Body('examTerm') examTerm: ExamTerm,
  ) {
    return this.examsService.generateTermSummary(
      studentId,
      sessionId,
      term,
      examTerm,
    );
  }

  @Post('eligibility/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  toggleEligibility(
    @Param('studentId') studentId: string,
    @Body('subjectId') subjectId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @Body('isEligible') isEligible: boolean,
  ) {
    return this.examsService.toggleEligibility(
      studentId,
      subjectId,
      sessionId,
      term,
      isEligible,
    );
  }

  @Post('publish')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  publishResults(
    @Body('sectionId') sectionId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @Body('isLocked') isLocked: boolean,
  ) {
    return this.examsService.lockResultsBatch(
      sectionId,
      sessionId,
      term,
      isLocked,
    );
  }

  @Get('report/:studentId/:sessionId/:term')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  async getReport(
    @Param('studentId') studentId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
    @Res() res: Response, // Using @Res() instead of return to handle stream
  ) {
    const data = await this.examsService.getFullReportData(
      studentId,
      sessionId,
      term,
    );
    if (!data) throw new NotFoundException('Report data not found');

    const formatted = await this.examsService.formatReportData(data, term);
    const html = await this.reportingService.fillTemplate(
      END_OF_TERM_TEMPLATE,
      formatted,
    );
    const pdf = await this.reportingService.generatePdf(html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Report_${data.user?.firstName}_${term}.pdf`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('report-annual/:studentId/:sessionId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  async getAnnualReport(
    @Param('studentId') studentId: string,
    @Param('sessionId') sessionId: string,
    @Res() res: Response,
  ) {
    const formatted = await this.examsService.formatAnnualReportData(
      studentId,
      sessionId,
    );
    if (!formatted) throw new NotFoundException('Annual report data not found');

    const html = await this.reportingService.fillTemplate(
      ANNUAL_CUMULATIVE_TEMPLATE,
      formatted,
    );
    const pdf = await this.reportingService.generatePdf(html);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Annual_Report_${formatted.studentName.replace(/\s+/g, '_')}.pdf`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @Get('broadsheet/:sectionId/:sessionId/:term')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async getBroadsheet(
    @Param('sectionId') sectionId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @Res() res: Response,
  ) {
    const { headers, rows } = await this.examsService.getBroadsheetData(
      sectionId,
      sessionId,
      term,
    );
    const excel = await this.reportingService.generateExcel(headers, rows);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=Broadsheet_${sectionId}_${term}.xlsx`,
    });

    res.end(excel);
  }

  @Get('batch-report/:sectionId/:sessionId/:term')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async downloadBatchReports(
    @Param('sectionId') sectionId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @Res() res: Response,
  ) {
    const result = await this.examsService.generateBatchZip(
      sectionId,
      sessionId,
      term,
    );
    const filePath = path.join(process.cwd(), result.fileUrl);

    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename=Reports_${sectionId}_${term}.zip`,
      'Content-Length': result.fileSize,
    });

    const readStream = fs.createReadStream(filePath);
    readStream.pipe(res);
  }

  @Post('lock/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  lockResult(
    @Param('studentId') studentId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @Body('isLocked') isLocked: boolean,
  ) {
    return this.examsService.lockResults(studentId, sessionId, term, isLocked);
  }

  @Get('grading-scales')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getGradingScales(
    @Request() req: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    const branchId =
      ctx.role === UserRole.SUPER_ADMIN
        ? req.query.branchId || ctx.branchId
        : ctx.branchId;
    return this.examsService.getGradingScales(branchId);
  }

  @Post('grading-scales')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createGradingScale(
    @Request() req: any,
    @Body() dto: any,
    @GetTenantContext() ctx: TenantContext,
  ) {
    const branchId =
      ctx.role === UserRole.SUPER_ADMIN
        ? req.body.branchId || req.query.branchId || ctx.branchId
        : ctx.branchId;
    return this.examsService.createGradingScale(dto, branchId);
  }
}
