import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { OnlineAdmissionService } from './online-admission.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@Controller('online-admissions')
export class OnlineAdmissionController {
    constructor(private readonly onlineAdmissionService: OnlineAdmissionService) { }

    @Get('test-status')
    test() {
        return { status: 'ok' };
    }

    @Post()
    create(@Body() createDto: CreateOnlineAdmissionDto) {
        return this.onlineAdmissionService.create(createDto);
    }

    @Get('public/init/:branchId')
    getPublicInitData(@Param('branchId') branchId: string) {
        return this.onlineAdmissionService.getPublicInitData(branchId);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    findAll(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = branchId || req.user.branchId;
        return this.onlineAdmissionService.findAll(effectiveBranchId);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    findOne(@Param('id') id: string) {
        return this.onlineAdmissionService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    update(@Param('id') id: string, @Body() updateDto: UpdateOnlineAdmissionDto) {
        return this.onlineAdmissionService.update(id, updateDto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@Param('id') id: string) {
        return this.onlineAdmissionService.remove(id);
    }

    @Post(':id/approve')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    approve(
        @Param('id') id: string,
        @Body() approvalData: { classId?: string, sectionId?: string }
    ) {
        return this.onlineAdmissionService.approve(id, approvalData);
    }

    @Post(':id/reject')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    reject(
        @Param('id') id: string,
        @Body('reason') reason: string
    ) {
        return this.onlineAdmissionService.reject(id, reason);
    }
}
