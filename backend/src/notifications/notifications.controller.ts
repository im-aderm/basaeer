import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BranchGuard } from '../auth/branch.guard';
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

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, BranchGuard, PermissionsGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  async findAll(@GetTenantContext() tenantContext: TenantContext) {
    return this.notificationsService.findAll(tenantContext.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update As Read' })
  @Patch(':id/read')
  async markAsRead(
    @Param('id') id: string,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.notificationsService.markAsRead(id, tenantContext.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Preferences' })
  @Get('preferences')
  async getPreferences(@GetTenantContext() tenantContext: TenantContext) {
    return this.notificationsService.getPreferences(tenantContext.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Preferences' })
  @Patch('preferences')
  async updatePreferences(
    @GetTenantContext() tenantContext: TenantContext,
    @Body() data: { email?: boolean; sms?: boolean; inApp?: boolean },
  ) {
    return this.notificationsService.updatePreferences(
      tenantContext.userId,
      data,
    );
  }
}
