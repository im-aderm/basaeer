import { Controller, Get, Query, UseGuards, Request, Res, StreamableFile } from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';

@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportingController {
    constructor(private readonly reportingService: ReportingService) { }

    @Get('dashboard')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getDashboard(@Request() req) {
        return this.reportingService.getUnifiedDashboard(req.user.branchId);
    }

    @Get('finance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    getFinance(@Request() req, @Query('start') start?: string, @Query('end') end?: string) {
        return this.reportingService.getFinancialSummary(
            req.user.branchId,
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
    }

    @Get('academic')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAcademic(@Request() req) {
        return this.reportingService.getAcademicPerformance(req.user.branchId);
    }

    @Get('inventory')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getInventory(@Request() req) {
        return this.reportingService.getInventoryStats(req.user.branchId);
    }

    @Get('hr')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    getHR(@Request() req) {
        return this.reportingService.getHRStats(req.user.branchId);
    }

    // PDF Export Endpoints
    @Get('export/student-performance/pdf')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async exportStudentPerformancePDF(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportStudentPerformancePDF(req.user.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=student-performance.pdf',
        });
        res.send(buffer);
    }

    @Get('export/fees/pdf')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    async exportFeesPDF(@Request() req, @Res() res: Response, @Query('start') start?: string, @Query('end') end?: string) {
        const buffer = await this.reportingService.exportFeesPDF(
            req.user.branchId,
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=fees-report.pdf',
        });
        res.send(buffer);
    }

    @Get('export/hr/pdf')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    async exportHRPDF(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportHRPDF(req.user.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=hr-report.pdf',
        });
        res.send(buffer);
    }

    @Get('export/inventory/pdf')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    async exportInventoryPDF(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportInventoryPDF(req.user.branchId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=inventory-report.pdf',
        });
        res.send(buffer);
    }

    // Excel Export Endpoints
    @Get('export/student-performance/excel')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async exportStudentPerformanceExcel(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportStudentPerformanceExcel(req.user.branchId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=student-performance.xlsx',
        });
        res.send(buffer);
    }

    @Get('export/fees/excel')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
    async exportFeesExcel(@Request() req, @Res() res: Response, @Query('start') start?: string, @Query('end') end?: string) {
        const buffer = await this.reportingService.exportFeesExcel(
            req.user.branchId,
            start ? new Date(start) : undefined,
            end ? new Date(end) : undefined
        );
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=fees-report.xlsx',
        });
        res.send(buffer);
    }

    @Get('export/hr/excel')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
    async exportHRExcel(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportHRExcel(req.user.branchId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=hr-report.xlsx',
        });
        res.send(buffer);
    }

    @Get('export/inventory/excel')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    async exportInventoryExcel(@Request() req, @Res() res: Response) {
        const buffer = await this.reportingService.exportInventoryExcel(req.user.branchId);
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=inventory-report.xlsx',
        });
        res.send(buffer);
    }
}
