import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BranchGuard } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard, BranchGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async findAll(@GetTenantContext() tenantContext: TenantContext) {
    return this.notificationsService.findAll(tenantContext.userId);
  }

  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.notificationsService.markAsRead(id, tenantContext.userId);
  }

  @Get('preferences')
  async getPreferences(@GetTenantContext() tenantContext: TenantContext) {
    return this.notificationsService.getPreferences(tenantContext.userId);
  }

  @Patch('preferences')
  async updatePreferences(
    @GetTenantContext() tenantContext: TenantContext,
    @Body() data: { email?: boolean; sms?: boolean; inApp?: boolean },
  ) {
    return this.notificationsService.updatePreferences(tenantContext.userId, data);
  }
}
