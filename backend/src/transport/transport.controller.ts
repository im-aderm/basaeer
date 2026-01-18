import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { AssignTransportDto } from './dto/assign-transport.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('transport')
export class TransportController {
    constructor(private readonly transportService: TransportService) { }

    @Post('vehicles')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    createVehicle(@Body() dto: CreateVehicleDto) {
        return this.transportService.createVehicle(dto);
    }

    @Get('vehicles')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findAllVehicles(@Request() req) {
        return this.transportService.findAllVehicles(req.user.branchId);
    }

    @Post('routes')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    createRoute(@Body() dto: CreateRouteDto) {
        return this.transportService.createRoute(dto);
    }

    @Get('routes')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findAllRoutes(@Request() req) {
        return this.transportService.findAllRoutes(req.user.branchId);
    }

    @Post('assign')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    assignStudent(@Body() dto: AssignTransportDto) {
        return this.transportService.assignStudent(dto);
    }

    @Delete('assign/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    removeAssignment(@Param('studentId') studentId: string) {
        return this.transportService.removeAssignment(studentId);
    }
}
