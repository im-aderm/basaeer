import { Controller, Get, Query, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';
import { StudentReportQueryDto, FinanceReportQueryDto, ReportQueryDto } from './dto/report-query.dto';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('dashboard')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getDashboard(@Request() req) {
        return this.reportingService.getUnifiedDashboard(req.user.branchId);
    }

    @Get('students')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getStudentAnalytics(@Request() req, @Query() query: StudentReportQueryDto) {
        return this.reportingService.getStudentAnalytics({
            ...query,
            branchId: req.user.role === UserRole.SUPER_ADMIN ? query.branchId : req.user.branchId
        });
    }

    @Get('finance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    getFinanceAnalytics(@Request() req, @Query() query: FinanceReportQueryDto) {
        return this.reportingService.getFinanceAnalytics({
            ...query,
            branchId: req.user.role === UserRole.SUPER_ADMIN ? query.branchId : req.user.branchId
        });
    }

    @Get('hr')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    getHRAnalytics(@Request() req, @Query() query: ReportQueryDto) {
        return this.reportingService.getHRAnalytics({
            ...query,
            branchId: req.user.role === UserRole.SUPER_ADMIN ? query.branchId : req.user.branchId
        });
    }

    @Get('academic')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAcademicAnalytics(@Request() req, @Query() query: ReportQueryDto) {
        return this.reportingService.getAcademicAnalytics({
            ...query,
            branchId: req.user.role === UserRole.SUPER_ADMIN ? query.branchId : req.user.branchId
        });
    }

    @Get('attendance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAttendanceAnalytics(@Request() req, @Query() query: ReportQueryDto) {
        return this.reportingService.getAttendanceAnalytics({
            ...query,
            branchId: req.user.role === UserRole.SUPER_ADMIN ? query.branchId : req.user.branchId
        });
    }

    @Get('export/performance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    async exportPerformance(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportStudentPerformancePDF(req.user.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=performance_report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('export/finance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    async exportFinance(@Request() req, @Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const buffer = await this.reportingService.exportFeesPDF(
            req.user.branchId,
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=finance_report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
}
