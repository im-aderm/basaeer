import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ReportingService } from './reporting.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import { Response } from 'express';
import {
  StudentReportQueryDto,
  FinanceReportQueryDto,
  ReportQueryDto,
} from './dto/report-query.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Reporting')
@Controller('reporting')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class ReportingController {
  constructor(private readonly reportingService: ReportingService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Dashboard' })
  @Get('dashboard')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getDashboard(@GetTenantContext() ctx: TenantContext) {
    return this.reportingService.getUnifiedDashboard(ctx.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Student Analytics' })
  @Get('students')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getStudentAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: StudentReportQueryDto,
  ) {
    return this.reportingService.getStudentAnalytics({
      ...query,
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Finance Analytics' })
  @Get('finance')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  getFinanceAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: FinanceReportQueryDto,
  ) {
    return this.reportingService.getFinanceAnalytics({
      ...query,
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve H R Analytics' })
  @Get('hr')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  getHRAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportingService.getHRAnalytics({
      ...query,
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Academic Analytics' })
  @Get('academic')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getAcademicAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportingService.getAcademicAnalytics({
      ...query,
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Attendance Analytics' })
  @Get('attendance')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getAttendanceAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportingService.getAttendanceAnalytics({
      ...query,
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Inventory Analytics' })
  @Get('inventory')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getInventoryAnalytics(
    @GetTenantContext() ctx: TenantContext,
    @Query() query: ReportQueryDto,
  ) {
    return this.reportingService.getInventoryAnalytics({
      branchId:
        ctx.role === UserRole.SUPER_ADMIN ? query.branchId : ctx.branchId!,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Export Performance' })
  @Get('export/performance')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async exportPerformance(
    @GetTenantContext() ctx: TenantContext,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ) {
    if (format === 'excel') {
      const buffer = await this.reportingService.exportStudentPerformanceExcel(ctx.branchId!);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=performance_report.xlsx',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }
    const buffer = await this.reportingService.exportStudentPerformancePDF(
      ctx.branchId!,
    );
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=performance_report.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Export Finance' })
  @Get('export/finance')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  async exportFinance(
    @GetTenantContext() ctx: TenantContext,
    @Query('start') start: string,
    @Query('end') end: string,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ) {
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    if (format === 'excel') {
      const buffer = await this.reportingService.exportFeesExcel(ctx.branchId!, startDate, endDate);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=finance_report.xlsx',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }
    const buffer = await this.reportingService.exportFeesPDF(ctx.branchId!, startDate, endDate);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=finance_report.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Export HR' })
  @Get('export/hr')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.HR)
  async exportHR(
    @GetTenantContext() ctx: TenantContext,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ) {
    if (format === 'excel') {
      const buffer = await this.reportingService.exportHRExcel(ctx.branchId!);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=hr_report.xlsx',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }
    const buffer = await this.reportingService.exportHRPDF(ctx.branchId!);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=hr_report.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Export Inventory' })
  @Get('export/inventory')
  @Permissions('reporting:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async exportInventory(
    @GetTenantContext() ctx: TenantContext,
    @Query('format') format: string | undefined,
    @Res() res: Response,
  ) {
    if (format === 'excel') {
      const buffer = await this.reportingService.exportInventoryExcel(ctx.branchId!);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename=inventory_report.xlsx',
        'Content-Length': buffer.length,
      });
      return res.end(buffer);
    }
    const buffer = await this.reportingService.exportInventoryPDF(ctx.branchId!);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename=inventory_report.pdf',
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
