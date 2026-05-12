import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('hostels')
export class HostelsController {
    constructor(private readonly hostelsService: HostelsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    create(@Body() dto: CreateHostelDto, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.createHostel(dto, ctx);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    findAll(@GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.findAll(ctx);
    }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getStats(@GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.getVacancies(ctx);
    }

    @Get(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.findHostel(id, ctx);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateHostelDto, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.updateHostel(id, dto, ctx);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.deleteHostel(id, ctx);
    }

    @Post('rooms')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    createRoom(@Body() dto: CreateRoomDto, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.createRoom(dto, ctx);
    }

    @Get('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    findRoom(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.findRoom(id, ctx);
    }

    @Patch('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.updateRoom(id, dto, ctx);
    }

    @Delete('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    removeRoom(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.deleteRoom(id, ctx);
    }

    @Post('allocate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    allocateBed(@Body() dto: AllocateBedDto, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.allocateBed(dto, ctx);
    }

    @Post('release/:allocationId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    releaseBed(@Param('allocationId') allocationId: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.releaseBed(allocationId, ctx);
    }

    @Post('leave')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    createLeave(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.createLeave(dto, ctx);
    }

    @Get('leaves/branch')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getBranchLeaves(@GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.getBranchLeaves(ctx);
    }

    @Patch('leaves/:id/status')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    updateLeaveStatus(@Param('id') id: string, @Body('status') status: string, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.updateLeaveStatus(id, status, ctx);
    }

    @Post('maintenance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    createMaintenance(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.createMaintenanceRequest(dto, ctx);
    }

    @Get('maintenance/branch')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getBranchMaintenance(@GetTenantContext() ctx: TenantContext) {
        return this.hostelsService.getBranchMaintenance(ctx);
    }
}
