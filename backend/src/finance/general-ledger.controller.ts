import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { GeneralLedgerService } from './general-ledger.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('General Ledger')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@Controller('general-ledger')
export class GeneralLedgerController {
  constructor(private readonly ledger: GeneralLedgerService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Seed Chart of Accounts for branch' })
  @ApiOperation({ summary: 'Seed Chart of Accounts' })
  @Post('seed')
  @Permissions('finance:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  async seedChartOfAccounts(@GetTenantContext() ctx: TenantContext) {
    return this.ledger.seedChartOfAccounts(ctx.branchId || ctx.selectedBranchId || '', ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Trial balance retrieved' })
  @ApiOperation({ summary: 'Get Trial Balance' })
  @Get('trial-balance')
  @Permissions('finance:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  async getTrialBalance(@GetTenantContext() ctx: TenantContext) {
    return this.ledger.getTrialBalance(ctx.branchId || ctx.selectedBranchId || '');
  }
}
