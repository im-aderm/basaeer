import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getSettings(@GetTenantContext() ctx: TenantContext) {
        const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : ctx.branchId;
        return this.settingsService.getSettings(branchId);
    }

    @Get(':key')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getSettingByKey(@Param('key') key: string, @GetTenantContext() ctx: TenantContext) {
        const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : ctx.branchId;
        return this.settingsService.getSettingByKey(key, branchId);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateSettings(@Body() dto: UpdateSettingDto | UpdateSettingDto[], @GetTenantContext() ctx: TenantContext) {
        const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : ctx.branchId;
        if (Array.isArray(dto)) {
            return this.settingsService.upsertSettings(dto, branchId);
        }
        return this.settingsService.updateSetting(dto, branchId);
    }
}
