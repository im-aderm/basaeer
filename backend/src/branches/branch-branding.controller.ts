import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { BranchBrandingService } from './branch-branding.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { Public } from '../auth/public.decorator';
import { UserRole } from '../generated/client/client';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Branch Branding')
@Controller('branches')
export class BranchBrandingController {
  constructor(private readonly brandingService: BranchBrandingService) {}

  @Public()
  @ApiResponse({ status: 200, description: 'Returns branding data' })
  @ApiOperation({ summary: 'Get branch branding' })
  @Get(':id/branding')
  getBranding(@Param('id') id: string) {
    return this.brandingService.getBranding(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Branding updated' })
  @ApiOperation({ summary: 'Update branch branding' })
  @Patch(':id/branding')
  @Permissions('branches:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateBranding(
    @Param('id') id: string,
    @Body() data: { logoUrl?: string; primaryColor?: string; emailFooter?: string; smsSenderId?: string },
  ) {
    return this.brandingService.updateBranding(id, data);
  }
}
