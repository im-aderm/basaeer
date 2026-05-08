import { Controller, Get, Post, Body, UseGuards, Request, Param } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
    constructor(private readonly settingsService: SettingsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getSettings(@Request() req) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.branchId;
        return this.settingsService.getSettings(branchId);
    }

    @Get(':key')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getSettingByKey(@Param('key') key: string, @Request() req) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.branchId;
        return this.settingsService.getSettingByKey(key, branchId);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateSettings(@Body() dto: UpdateSettingDto | UpdateSettingDto[], @Request() req) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.branchId;
        if (Array.isArray(dto)) {
            return this.settingsService.upsertSettings(dto, branchId);
        }
        return this.settingsService.updateSetting(dto, branchId);
    }
}
