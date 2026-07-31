import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { CommsService } from './comms.service';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Communications')
@Controller('comms')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class CommsController {
  constructor(private readonly commsService: CommsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Email' })
  @Post('bulk-email')
  @Permissions('comms:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async sendBulkEmail(
    @Body() dto: { subject: string; message: string; recipientGroup: string },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.commsService.createBulkEmailCampaign({
      ...dto,
      branchId: context.branchId || null,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Sms' })
  @Post('bulk-sms')
  @Permissions('comms:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async sendBulkSms(
    @Body() dto: { message: string; recipientGroup: string },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.commsService.createBulkSmsCampaign({
      ...dto,
      branchId: context.branchId || null,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Campaigns' })
  @Get('campaigns')
  @Permissions('comms:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getCampaigns(@GetTenantContext() context: TenantContext) {
    return this.commsService.getCampaigns(context.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Campaign Details' })
  @Get('campaigns/:id')
  @Permissions('comms:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getCampaignDetails(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.commsService.getCampaignDetails(id, context);
  }
}
