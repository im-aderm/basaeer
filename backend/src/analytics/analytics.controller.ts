import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';
import { ExecutiveDashboardService } from './executive-dashboard.service';
import { BranchDashboardService } from './branch-dashboard.service';
import { TrendPeriod } from './dto/executive-overview.dto';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly executiveService: ExecutiveDashboardService,
    private readonly branchService: BranchDashboardService,
  ) {}

  // ─── Executive Dashboard (Super Admin only) ───

  @Get('executive/overview')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive overview KPIs' })
  @ApiResponse({ status: 200, description: 'Executive overview data' })
  getExecutiveOverview(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getOverview(ctx);
  }

  @Get('executive/finance')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive finance analytics' })
  @ApiResponse({ status: 200, description: 'Finance data by branch' })
  getExecutiveFinance(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getFinance(ctx);
  }

  @Get('executive/attendance')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive attendance analytics' })
  @ApiResponse({ status: 200, description: 'Attendance data by branch' })
  getExecutiveAttendance(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getAttendance(ctx);
  }

  @Get('executive/academics')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Executive academics analytics' })
  @ApiResponse({ status: 200, description: 'Academics data by branch' })
  getExecutiveAcademics(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getAcademics(ctx);
  }

  @Get('executive/branches')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Branch comparison data' })
  @ApiResponse({ status: 200, description: 'Branch comparison KPIs' })
  getExecutiveBranches(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getBranchComparison(ctx);
  }

  @Get('executive/trends')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Time series trends' })
  @ApiResponse({ status: 200, description: 'Trend data' })
  getExecutiveTrends(
    @GetTenantContext() ctx: TenantContext,
    @Query('period') period?: TrendPeriod,
  ) {
    return this.executiveService.getTrends(ctx, period || '30d');
  }

  @Get('executive/insights')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Rule-based executive insights' })
  @ApiResponse({ status: 200, description: 'Insight cards' })
  getExecutiveInsights(@GetTenantContext() ctx: TenantContext) {
    return this.executiveService.getInsights(ctx);
  }

  // ─── Branch Dashboard (Super Admin + Branch Admin) ───

  @Get('branch/:branchId/overview')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Branch overview KPIs' })
  @ApiResponse({ status: 200, description: 'Branch overview data' })
  getBranchOverview(
    @Param('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.branchService.getOverview(branchId, ctx);
  }

  @Get('branch/:branchId/finance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  @ApiOperation({ summary: 'Branch finance analytics' })
  @ApiResponse({ status: 200, description: 'Branch finance data' })
  getBranchFinance(
    @Param('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.branchService.getFinance(branchId, ctx);
  }

  @Get('branch/:branchId/attendance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Branch attendance analytics' })
  @ApiResponse({ status: 200, description: 'Branch attendance data' })
  getBranchAttendance(
    @Param('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.branchService.getAttendance(branchId, ctx);
  }

  @Get('branch/:branchId/academics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  @ApiOperation({ summary: 'Branch academics analytics' })
  @ApiResponse({ status: 200, description: 'Branch academics data' })
  getBranchAcademics(
    @Param('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.branchService.getAcademics(branchId, ctx);
  }

  @Get('branch/:branchId/daily-ops')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Branch daily operations' })
  @ApiResponse({ status: 200, description: 'Daily operations data' })
  getBranchDailyOps(
    @Param('branchId') branchId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.branchService.getDailyOps(branchId, ctx);
  }
}
