import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { ProvidersService } from './providers.service';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Providers')
@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Health' })
  @Get('health')
  async getHealth() {
    return this.providersService.getProviderHealth();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Sms Balance' })
  @Get('sms/balance')
  @Permissions('providers:read')
  @Roles(UserRole.SUPER_ADMIN)
  async getSmsBalance() {
    return this.providersService.getSmsBalance();
  }
}
