import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Settings' })
  @Get()
  @Permissions('settings:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getSettings(@GetTenantContext() ctx: TenantContext) {
    const branchId: string | undefined =
      ctx.role === UserRole.SUPER_ADMIN
        ? undefined
        : (ctx.branchId ?? undefined);
    return this.settingsService.getSettings(branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Setting By Key' })
  @Get(':key')
  @Permissions('settings:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getSettingByKey(
    @Param('key') key: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    const branchId: string | undefined =
      ctx.role === UserRole.SUPER_ADMIN
        ? undefined
        : (ctx.branchId ?? undefined);
    return this.settingsService.getSettingByKey(key, branchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateSettingDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Settings' })
  @Post()
  @Permissions('settings:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateSettings(
    @Body() dto: UpdateSettingDto | UpdateSettingDto[],
    @GetTenantContext() ctx: TenantContext,
  ) {
    const branchId: string | undefined =
      ctx.role === UserRole.SUPER_ADMIN
        ? undefined
        : (ctx.branchId ?? undefined);
    if (Array.isArray(dto)) {
      return this.settingsService.upsertSettings(dto, branchId);
    }
    return this.settingsService.updateSetting(dto, branchId);
  }
}
