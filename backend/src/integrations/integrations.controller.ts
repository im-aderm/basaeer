import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
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
    @Req() req: any,
    @Body() body: { name: string; scopes: string[] },
  ) {
    return this.integrationsService.createApiKey(
      req.user.branchId,
      body.name,
      body.scopes,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Api Keys' })
  @Get('api-keys')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  listApiKeys(@Req() req: any) {
    return this.integrationsService.listApiKeys(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Api Key' })
  @Delete('api-keys/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteApiKey(@Req() req: any, @Param('id') id: string) {
    return this.integrationsService.deleteApiKey(id, req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Webhook' })
  @Post('webhooks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  registerWebhook(
    @Req() req: any,
    @Body() body: { url: string; events: string[] },
  ) {
    return this.integrationsService.registerWebhook(
      req.user.branchId,
      body.url,
      body.events,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Webhooks' })
  @Get('webhooks')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  listWebhooks(@Req() req: any) {
    return this.integrationsService.listWebhooks(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Webhook' })
  @Delete('webhooks/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteWebhook(@Req() req: any, @Param('id') id: string) {
    return this.integrationsService.deleteWebhook(id, req.user.branchId);
  }
}
