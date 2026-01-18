import { Controller, Get, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { UpdateAutomationConfigDto } from './dto/automation.dto';

@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Get('configs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getConfigs(@Request() req) {
        return this.automationService.getConfigs(req.user.branchId);
    }

    @Put('config/:type')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateConfig(@Param('type') type: string, @Body() dto: UpdateAutomationConfigDto, @Request() req) {
        return this.automationService.updateConfig(req.user.branchId, type, dto);
    }

    @Get('seed')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    seed(@Request() req) {
        return this.automationService.seedInitialConfigs(req.user.branchId);
    }
}
