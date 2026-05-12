import {
  Controller,
  Get,
  Put,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import {
  UpdateAutomationConfigDto,
  UpsertAutomationConfigDto,
  ToggleScheduledJobDto,
} from './dto/automation.dto';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Automation')
@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Configs' })
  @Get('configs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getConfigs(@GetTenantContext() tenantContext: TenantContext) {
    return this.automationService.getConfigs(tenantContext);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpsertAutomationConfigDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Config' })
  @Post('configs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  upsertConfig(
    @Body() dto: UpsertAutomationConfigDto,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.automationService.upsertConfig(dto, tenantContext);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateAutomationConfigDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Config' })
  @Put('config/:type')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateConfig(
    @Param('type') type: string,
    @Body() dto: UpdateAutomationConfigDto,
    @GetTenantContext() tenantContext: TenantContext,
  ) {
    return this.automationService.updateConfig(type, dto, tenantContext);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Jobs' })
  @Get('jobs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  listJobs(@GetTenantContext() tenantContext: TenantContext) {
    return this.automationService.listJobs(tenantContext);
  }

  @ApiBearerAuth()
  @ApiBody({ type: ToggleScheduledJobDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Job' })
  @Patch('jobs/:id/toggle')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  toggleJob(@Param('id') id: string, @Body() dto: ToggleScheduledJobDto) {
    return this.automationService.toggleJob(id, dto.isEnabled);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Seed' })
  @Get('seed')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  seed(@GetTenantContext() tenantContext: TenantContext) {
    return this.automationService.seedInitialConfigs(tenantContext);
  }
}
