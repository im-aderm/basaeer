import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { ProvidersService } from './providers.service';

@Controller('providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Get('health')
  async getHealth() {
    return this.providersService.getProviderHealth();
  }

  @Get('sms/balance')
  @Roles(UserRole.SUPER_ADMIN)
  async getSmsBalance() {
    return this.providersService.getSmsBalance();
  }
}
