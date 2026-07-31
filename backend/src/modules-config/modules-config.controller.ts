import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ModulesConfigService } from './modules-config.service';
import {
  UpsertModuleConfigDto,
  ToggleModuleDto,
} from './dto/module-config.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@ApiTags('Modules Config')
@Controller('modules')
export class ModulesConfigController {
  constructor(private readonly modulesConfigService: ModulesConfigService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('modules-config:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@Query('branchId') branchId?: string) {
    return this.modulesConfigService.findAll(branchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpsertModuleConfigDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('modules-config:create')
  @Roles(UserRole.SUPER_ADMIN)
  upsert(@Body() dto: UpsertModuleConfigDto) {
    return this.modulesConfigService.upsert(dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: ToggleModuleDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':moduleKey/toggle')
  @Permissions('modules-config:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  toggle(@Param('moduleKey') moduleKey: string, @Body() dto: ToggleModuleDto) {
    return this.modulesConfigService.toggle(moduleKey, dto);
  }
}
