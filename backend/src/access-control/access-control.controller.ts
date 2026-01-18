import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { CreateAccessLogDto } from './dto/access-control.dto';

@Controller('access-control')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AccessControlController {
    constructor(private readonly accessControlService: AccessControlService) { }

    @Post('log')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    log(@Body() dto: CreateAccessLogDto, @Request() req) {
        return this.accessControlService.logAccess(req.user.branchId, dto);
    }

    @Get('logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getLogs(@Request() req, @Query('limit') limit?: string) {
        return this.accessControlService.getBranchLogs(req.user.branchId, limit ? parseInt(limit) : 50);
    }

    @Get('my-logs')
    getMyLogs(@Request() req) {
        return this.accessControlService.getUserLogs(req.user.id);
    }
}
