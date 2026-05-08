import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { CommsService } from './comms.service';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';

@Controller('comms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommsController {
  constructor(private readonly commsService: CommsService) {}

  @Post('bulk-email')
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

  @Post('bulk-sms')
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

  @Get('campaigns')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getCampaigns(@GetTenantContext() context: TenantContext) {
    return this.commsService.getCampaigns(context.branchId);
  }
}
