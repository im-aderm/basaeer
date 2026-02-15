import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hostels')
export class HostelsController {
    constructor(private readonly hostelsService: HostelsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    create(@Body() dto: CreateHostelDto, @Request() req) {
        return this.hostelsService.createHostel(dto, req.user.branchId);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    findAll(@Request() req) {
        return this.hostelsService.findAll(req.user.branchId);
    }

    @Get('stats')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getStats(@Request() req) {
        return this.hostelsService.getStats(req.user.branchId);
    }

    @Patch(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdateHostelDto, @Request() req) {
        return this.hostelsService.updateHostel(id, dto, req.user.branchId);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    deleteHostel(@Param('id') id: string, @Request() req) {
        return this.hostelsService.deleteHostel(id, req.user.branchId);
    }

    @Post('rooms')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    createRoom(@Body() dto: CreateRoomDto, @Request() req) {
        return this.hostelsService.createRoom(dto, req.user.branchId);
    }

    @Patch('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    updateRoom(@Param('id') id: string, @Body() dto: UpdateRoomDto, @Request() req) {
        return this.hostelsService.updateRoom(id, dto, req.user.branchId);
    }

    @Delete('rooms/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    deleteRoom(@Param('id') id: string, @Request() req) {
        return this.hostelsService.deleteRoom(id, req.user.branchId);
    }

    @Post('allocate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    allocate(@Body() dto: AllocateBedDto, @Request() req) {
        return this.hostelsService.allocateBed(dto, req.user.branchId);
    }

    @Patch('release/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    release(@Param('id') id: string, @Request() req) {
        return this.hostelsService.releaseBed(id, req.user.branchId);
    }

    @Get('vacancies')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getVacancies(@Request() req) {
        return this.hostelsService.getVacancies(req.user.branchId);
    }

    @Post('leave')
    @Roles(UserRole.STUDENT)
    createLeave(@Body() dto: any, @Request() req) {
        return this.hostelsService.createLeave(dto, req.user);
    }

    @Get('leaves')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STUDENT)
    getLeaves(@Request() req) {
        return this.hostelsService.getLeaves(req.user);
    }

    @Patch('leaves/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    updateLeaveStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.hostelsService.updateLeaveStatus(id, status, req.user.branchId);
    }

    @Post('maintenance')
    @Roles(UserRole.STUDENT, UserRole.HOSTEL_ADMIN)
    createMaintenance(@Body() dto: any, @Request() req) {
        // Pass user to helper to link student if applicable
        return this.hostelsService.createMaintenanceRequest(dto, req.user);
    }

    @Get('maintenance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STUDENT)
    getMaintenanceRequests(@Request() req) {
        return this.hostelsService.getMaintenanceRequests(req.user);
    }

    @Get('my-details')
    @Roles(UserRole.STUDENT)
    getMyHostelDetails(@Request() req) {
        return this.hostelsService.getMyHostelDetails(req.user);
    }

    @Patch('maintenance/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    updateMaintenanceStatus(@Param('id') id: string, @Body('status') status: string, @Request() req) {
        return this.hostelsService.updateMaintenanceStatus(id, status, req.user.branchId);
    }
}
