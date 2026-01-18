import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
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
        // If super admin, they can see all. If branch admin, only their branch + global.
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.branchId;
        return this.settingsService.getSettings(branchId);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    updateSetting(@Body() dto: UpdateSettingDto, @Request() req) {
        const branchId = req.user.role === UserRole.SUPER_ADMIN ? undefined : req.user.branchId;
        return this.settingsService.updateSetting(dto, branchId);
    }
}
