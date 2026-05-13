import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Api Key' })
  @Post('api-keys')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createApiKey(
    @GetTenantContext() ctx: TenantContext,
    @Body() body: { name: string; scopes: string[] },
  ) {
    return this.integrationsService.createApiKey(
      ctx.branchId!,
      body.name,
      body.scopes,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Api Keys' })
  @Get('api-keys')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  listApiKeys(@GetTenantContext() ctx: TenantContext) {
    return this.integrationsService.listApiKeys(ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Api Key' })
  @Delete('api-keys/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteApiKey(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.integrationsService.deleteApiKey(id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Webhook' })
  @Post('webhooks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  registerWebhook(
    @GetTenantContext() ctx: TenantContext,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.integrationsService.registerWebhook(
      ctx.branchId!,
      body.url,
      body.events,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Webhooks' })
  @Get('webhooks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  listWebhooks(@GetTenantContext() ctx: TenantContext) {
    return this.integrationsService.listWebhooks(ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Webhook' })
  @Delete('webhooks/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteWebhook(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.integrationsService.deleteWebhook(id, ctx.branchId!);
  }
}
