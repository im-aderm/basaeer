import { Controller, Get, Put, Post, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { AutomationService } from './automation.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { UpdateAutomationConfigDto, UpsertAutomationConfigDto, ToggleScheduledJobDto } from './dto/automation.dto';

@Controller('automation')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AutomationController {
    constructor(private readonly automationService: AutomationService) { }

    @Get('configs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getConfigs(@Query('branchId') branchId?: string, @Request() req?: any) {
        const targetBranchId = branchId || (req.user.role !== UserRole.SUPER_ADMIN ? req.user.branchId : undefined);
        return this.automationService.getConfigs(targetBranchId);
    }

    @Post('configs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    upsertConfig(@Body() dto: UpsertAutomationConfigDto) {
        return this.automationService.upsertConfig(dto);
    }

    @Put('config/:type')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateConfig(@Param('type') type: string, @Body() dto: UpdateAutomationConfigDto, @Request() req) {
        return this.automationService.updateConfig(req.user.branchId, type, dto);
    }

    @Get('jobs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    listJobs(@Query('branchId') branchId?: string, @Request() req?: any) {
        const targetBranchId = branchId || (req.user.role !== UserRole.SUPER_ADMIN ? req.user.branchId : undefined);
        return this.automationService.listJobs(targetBranchId);
    }

    @Patch('jobs/:id/toggle')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    toggleJob(@Param('id') id: string, @Body() dto: ToggleScheduledJobDto) {
        return this.automationService.toggleJob(id, dto.isEnabled);
    }

    @Get('seed')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    seed(@Request() req) {
        return this.automationService.seedInitialConfigs(req.user.branchId);
    }
}
