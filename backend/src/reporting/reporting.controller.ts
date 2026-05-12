import { Controller, Get, Query, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';
import { StudentReportQueryDto, FinanceReportQueryDto, ReportQueryDto } from './dto/report-query.dto';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('dashboard')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getDashboard(@GetTenantContext() ctx: TenantContext) {
        return this.reportingService.getUnifiedDashboard(ctx.branchId);
    }

    @Get('students')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getStudentAnalytics(@GetTenantContext() ctx: TenantContext, @Query() query: StudentReportQueryDto) {
        return this.reportingService.getStudentAnalytics({
            ...query,
            branchId: ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId
        });
    }

    @Get('finance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    getFinanceAnalytics(@GetTenantContext() ctx: TenantContext, @Query() query: FinanceReportQueryDto) {
        return this.reportingService.getFinanceAnalytics({
            ...query,
            branchId: ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId
        });
    }

    @Get('hr')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    getHRAnalytics(@GetTenantContext() ctx: TenantContext, @Query() query: ReportQueryDto) {
        return this.reportingService.getHRAnalytics({
            ...query,
            branchId: ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId
        });
    }

    @Get('academic')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAcademicAnalytics(@GetTenantContext() ctx: TenantContext, @Query() query: ReportQueryDto) {
        return this.reportingService.getAcademicAnalytics({
            ...query,
            branchId: ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId
        });
    }

    @Get('attendance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAttendanceAnalytics(@GetTenantContext() ctx: TenantContext, @Query() query: ReportQueryDto) {
        return this.reportingService.getAttendanceAnalytics({
            ...query,
            branchId: ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId
        });
    }

    @Get('export/performance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    async exportPerformance(@GetTenantContext() ctx: TenantContext, @Res() res: Response) {
        const buffer = await this.reportingService.exportStudentPerformancePDF(ctx.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=performance_report.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }

    @Get('export/finance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    async exportFinance(@GetTenantContext() ctx: TenantContext, @Query('start') start: string, @Query('end') end: string, @Res() res: Response) {
        const buffer = await this.reportingService.exportFeesPDF(
            ctx.branchId,
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
