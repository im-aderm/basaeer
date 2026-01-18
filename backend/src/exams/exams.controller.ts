import { Controller, Get, Post, Body, Param, UseGuards, Request, Res, NotFoundException } from '@nestjs/common';
import { ExamsService } from './exams.service';
import { CreateAcademicSessionDto, BulkSubmitScoresDto, RecordBehaviouralDto } from './dto/exam-ops.dto';
import { ReportingService } from '../reporting/reporting.service';
import { END_OF_TERM_TEMPLATE } from '../reporting/templates/end-of-term.template';
import { ANNUAL_CUMULATIVE_TEMPLATE } from '../reporting/templates/annual-cumulative.template';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole, Term, ExamTerm } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('exams')
export class ExamsController {
    constructor(
        private readonly examsService: ExamsService,
        private readonly reportingService: ReportingService
    ) { }

    @Get('sessions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getSessions() {
        return this.examsService.getAllSessions();
    }

    @Post('sessions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createSession(@Request() req, @Body() dto: CreateAcademicSessionDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.examsService.createSession(dto);
    }

    @Post('submit-scores')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    submitScores(@Body() dto: BulkSubmitScoresDto, @Request() req: any) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? (req.body.branchId || req.query.branchId || req.user.branchId) : req.user.branchId;
        return this.examsService.submitBulkScores(dto, branchId);
    }

    @Post('behavioural')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    recordBehavioural(@Request() req, @Body() dto: RecordBehaviouralDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.examsService.recordBehavioural(dto);
    }

    @Post('summarize/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    summarizeTerm(
        @Param('studentId') studentId: string,
        @Body('sessionId') sessionId: string,
        @Body('term') term: Term,
        @Body('examTerm') examTerm: ExamTerm
    ) {
        return this.examsService.generateTermSummary(studentId, sessionId, term, examTerm);
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
        return this.examsService.toggleEligibility(studentId, subjectId, sessionId, term, isEligible);
    }

    @Post('publish')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    publishResults(
        @Body('sectionId') sectionId: string,
        @Body('sessionId') sessionId: string,
        @Body('term') term: Term,
        @Body('isLocked') isLocked: boolean,
    ) {
        return this.examsService.lockResultsBatch(sectionId, sessionId, term, isLocked);
    }

    @Get('report/:studentId/:sessionId/:term')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
    async getReport(
        @Param('studentId') studentId: string,
        @Param('sessionId') sessionId: string,
        @Param('term') term: Term,
        @Request() req: any,
        @Res() res: Response // Using @Res() instead of return to handle stream
    ) {
        const data = await this.examsService.getFullReportData(studentId, sessionId, term);
        if (!data) throw new NotFoundException('Report data not found');

        const formatted = await this.examsService.formatReportData(data, term);
        const html = await this.reportingService.fillTemplate(END_OF_TERM_TEMPLATE, formatted);
        const pdf = await this.reportingService.generatePdf(html);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Report_${data.user?.firstName}_${term}.pdf`,
            'Content-Length': pdf.length,
        });

        res.end(pdf);
    }

    @Get('report-annual/:studentId/:sessionId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
    async getAnnualReport(
        @Param('studentId') studentId: string,
        @Param('sessionId') sessionId: string,
        @Res() res: Response
    ) {
        const formatted = await this.examsService.formatAnnualReportData(studentId, sessionId);
        if (!formatted) throw new NotFoundException('Annual report data not found');

        const html = await this.reportingService.fillTemplate(ANNUAL_CUMULATIVE_TEMPLATE, formatted);
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
        @Res() res: Response
    ) {
        const { headers, rows } = await this.examsService.getBroadsheetData(sectionId, sessionId, term);
        const excel = await this.reportingService.generateExcel(headers, rows);

        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename=Broadsheet_${sectionId}_${term}.xlsx`,
        });

        res.end(excel);
    }

    @Get('batch-report/:sectionId/:sessionId/:term')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async getBatchReport(
        @Param('sectionId') sectionId: string,
        @Param('sessionId') sessionId: string,
        @Param('term') term: Term,
        @Res() res: Response
    ) {
        const zipBuffer = await this.examsService.generateBatchZip(sectionId, sessionId, term);

        res.set({
            'Content-Type': 'application/zip',
            'Content-Disposition': `attachment; filename=Reports_${sectionId}_${term}.zip`,
            'Content-Length': zipBuffer.length,
        });

        res.end(zipBuffer);
    }

    @Post('lock/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    lockResult(
        @Param('studentId') studentId: string,
        @Body('sessionId') sessionId: string,
        @Body('term') term: Term,
        @Body('isLocked') isLocked: boolean
    ) {
        return this.examsService.lockResults(studentId, sessionId, term, isLocked);
    }

    @Get('grading-scales')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getGradingScales(@Request() req: any) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? req.query.branchId : req.user.branchId;
        return this.examsService.getGradingScales(branchId);
    }

    @Post('grading-scales')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createGradingScale(@Body() dto: any, @Request() req: any) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? (req.body.branchId || req.query.branchId) : req.user.branchId;
        return this.examsService.createGradingScale(dto, branchId);
    }
}
