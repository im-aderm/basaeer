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
import { ReportTemplatesService } from '../report-templates/report-templates.service';
import { REPORT_TEMPLATE_TYPES } from '../report-templates/built-in-templates';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole, Term } from '../generated/client/client';
import { Public } from '../auth/public.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Exams')
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
    private readonly reportTemplatesService: ReportTemplatesService,
  ) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get()
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('management/:id')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Put('management/:id')
  @Permissions('exams:update')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch('management/:id/status')
  @Permissions('exams:update')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('management/:id/clone')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('types-v2')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('types-v2')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('components')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('components')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('components/validate')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('compute/section/:sectionId')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('analytics')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('approvals')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('approvals')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch('approvals/:id/review')
  @Permissions('exams:update')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Publish Approved Results' })
  @Post('publication')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Revoke Publication' })
  @Patch('publication/:id/revoke')
  @Permissions('exams:update')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('transcripts')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('transcripts/:studentId')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Approve Transcript' })
  @Patch('transcripts/:id/approve')
  @Permissions('exams:update')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('transcripts/:id/pdf')
  @Permissions('exams:read')
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
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Verify Transcript' })
  @Get('verify/transcript/:code')
  verifyTranscript(@Param('code') code: string) {
    return this.transcriptService.verify(code);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Verify a report-card QR/link code' })
  @Get('verify/result/:code')
  verifyResult(@Param('code') code: string) {
    return this.examsService.verifyResultCode(code);
  }

  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('tahfeez/assessments')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('tahfeez/progress')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('tahfeez/reports/:studentId')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('portal/results/:studentId/:sessionId/:term')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('portal/performance/:studentId')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Sessions' })
  @Get('sessions')
  @Permissions('exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getSessions(@GetTenantContext() ctx: TenantContext) {
    return this.examsService.getAllSessions(ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateAcademicSessionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Session' })
  @Post('sessions')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiBody({ type: BulkSubmitScoresDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Scores' })
  @Post('submit-scores')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiBody({ type: RecordBehaviouralDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Behavioural' })
  @Post('behavioural')
  @Permissions('exams:create')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Summarize Term' })
  @Post('summarize/:studentId')
  @Permissions('exams:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
  async summarizeTerm(
    @Param('studentId') studentId: string,
    @Body('sessionId') sessionId: string,
    @Body('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
  ) {
    // A single student's summary can't be recomputed in isolation — their
    // score shifts everyone else's class position, so this delegates to the
    // whole-section computation (the one canonical grading/ranking engine)
    // rather than the old standalone per-student summary path.
    const sectionId = await this.examsService.resolveStudentSection(
      studentId,
      ctx,
    );
    return this.resultComputationService.computeSection(
      sectionId,
      sessionId,
      term,
      ctx,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('report/:studentId/:sessionId/:term')
  @Permissions('exams:read')
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
      ctx,
    );
    if (!data) throw new NotFoundException('Report data not found');

    const formatted = await this.examsService.formatReportData(data, term);
    const template = await this.reportTemplatesService.getEffectiveTemplate(
      REPORT_TEMPLATE_TYPES.STUDENT_REPORT,
      data.branchId,
    );
    const html = await this.reportingService.fillTemplate(
      template.html,
      formatted,
    );
    const pdf = await this.reportingService.generatePdf(html, {
      format: template.config.paperSize,
      landscape: template.config.landscape,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Report_${data.user?.firstName}_${term}.pdf`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('report-annual/:studentId/:sessionId')
  @Permissions('exams:read')
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
    @GetTenantContext() ctx: TenantContext,
    @Res() res: Response,
  ) {
    const formatted = await this.examsService.formatAnnualReportData(
      studentId,
      sessionId,
      ctx,
    );
    if (!formatted) throw new NotFoundException('Annual report data not found');

    const template = await this.reportTemplatesService.getEffectiveTemplate(
      REPORT_TEMPLATE_TYPES.ANNUAL_CUMULATIVE,
      formatted.branchId,
    );
    const html = await this.reportingService.fillTemplate(
      template.html,
      formatted,
    );
    const pdf = await this.reportingService.generatePdf(html, {
      format: template.config.paperSize,
      landscape: template.config.landscape,
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Annual_Report_${formatted.studentName.replace(/\s+/g, '_')}.pdf`,
      'Content-Length': pdf.length,
    });

    res.end(pdf);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Broadsheet' })
  @Get('broadsheet/:sectionId/:sessionId/:term')
  @Permissions('exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async getBroadsheet(
    @Param('sectionId') sectionId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
    @Res() res: Response,
  ) {
    const { headers, rows } = await this.examsService.getBroadsheetData(
      sectionId,
      sessionId,
      term,
      ctx,
    );
    const excel = await this.reportingService.generateExcel(headers, rows);

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=Broadsheet_${sectionId}_${term}.xlsx`,
    });

    res.end(excel);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Download Batch Reports' })
  @Get('batch-report/:sectionId/:sessionId/:term')
  @Permissions('exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async downloadBatchReports(
    @Param('sectionId') sectionId: string,
    @Param('sessionId') sessionId: string,
    @Param('term') term: Term,
    @GetTenantContext() ctx: TenantContext,
    @Res() res: Response,
  ) {
    const result = await this.examsService.generateBatchZip(
      sectionId,
      sessionId,
      term,
      ctx,
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


  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Grading Scales' })
  @Get('grading-scales')
  @Permissions('exams:read')
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

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Grading Scale' })
  @Post('grading-scales')
  @Permissions('exams:create')
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
