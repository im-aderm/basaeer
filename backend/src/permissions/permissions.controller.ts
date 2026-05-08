import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('permissions')
export class PermissionsController {
    constructor(private readonly permissionsService: PermissionsService) { }

    @Get()
    @Roles(UserRole.SUPER_ADMIN)
    getPermissions() {
        return this.permissionsService.getPermissions();
    }

    @Get('my')
    getMyPermissions(@Request() req) {
        return this.permissionsService.getPermissions(req.user.role);
    }

    @Get(':role')
    @Roles(UserRole.SUPER_ADMIN)
    getRolePermissions(@Param('role') role: UserRole) {
        return this.permissionsService.getPermissions(role);
    }

    @Post()
    @Roles(UserRole.SUPER_ADMIN)
    updatePermission(@Body() dto: UpdatePermissionDto) {
        return this.permissionsService.updatePermission(dto);
    }

    @Post(':role')
    @Roles(UserRole.SUPER_ADMIN)
    bulkUpdatePermissions(
        @Param('role') role: UserRole,
        @Body() permissions: UpdatePermissionDto[]
    ) {
        return this.permissionsService.bulkUpdatePermissions(role, permissions);
    }

    @Post('seed')
    @Roles(UserRole.SUPER_ADMIN)
    seedPermissions() {
        return this.permissionsService.seedInitialPermissions();
    }
}
