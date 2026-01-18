import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('hostels')
export class HostelsController {
    constructor(private readonly hostelsService: HostelsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    create(@Body() dto: CreateHostelDto) {
        return this.hostelsService.createHostel(dto);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    findAll(@Request() req) {
        return this.hostelsService.findAll(req.user.branchId);
    }

    @Post('rooms')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    createRoom(@Body() dto: CreateRoomDto) {
        return this.hostelsService.createRoom(dto);
    }

    @Post('allocate')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    allocate(@Body() dto: AllocateBedDto) {
        return this.hostelsService.allocateBed(dto);
    }

    @Patch('release/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
    release(@Param('id') id: string) {
        return this.hostelsService.releaseBed(id);
    }

    @Get('vacancies')
    @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
    getVacancies(@Request() req) {
        return this.hostelsService.getVacancies(req.user.branchId);
    }

    @Post('leave')
    @Roles(UserRole.STUDENT)
    createLeave(@Body() dto: any) {
        return this.hostelsService.createLeave(dto);
    }

    @Post('maintenance')
    @Roles(UserRole.STUDENT, UserRole.HOSTEL_ADMIN)
    createMaintenance(@Body() dto: any) {
        return this.hostelsService.createMaintenanceRequest(dto);
    }
}
