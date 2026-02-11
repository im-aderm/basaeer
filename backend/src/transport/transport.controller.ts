import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
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
    createVehicle(@Request() req, @Body() dto: CreateVehicleDto) {
        return this.transportService.createVehicle(dto, req.user.branchId);
    }

    @Get('vehicles')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findAllVehicles(@Request() req) {
        return this.transportService.findAllVehicles(req.user.branchId);
    }

    @Get('vehicles/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findOneVehicle(@Request() req, @Param('id') id: string) {
        return this.transportService.findVehicle(id, req.user.branchId);
    }

    @Patch('vehicles/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    updateVehicle(@Request() req, @Param('id') id: string, @Body() dto: UpdateVehicleDto) {
        return this.transportService.updateVehicle(id, dto, req.user.branchId);
    }

    @Delete('vehicles/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    deleteVehicle(@Request() req, @Param('id') id: string) {
        return this.transportService.deleteVehicle(id, req.user.branchId);
    }

    @Post('routes')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    createRoute(@Request() req, @Body() dto: CreateRouteDto) {
        return this.transportService.createRoute(dto, req.user.branchId);
    }

    @Get('routes')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findAllRoutes(@Request() req) {
        return this.transportService.findAllRoutes(req.user.branchId);
    }

    @Get('routes/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    findOneRoute(@Request() req, @Param('id') id: string) {
        return this.transportService.findRoute(id, req.user.branchId);
    }

    @Patch('routes/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    updateRoute(@Request() req, @Param('id') id: string, @Body() dto: UpdateRouteDto) {
        return this.transportService.updateRoute(id, dto, req.user.branchId);
    }

    @Delete('routes/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    deleteRoute(@Request() req, @Param('id') id: string) {
        return this.transportService.deleteRoute(id, req.user.branchId);
    }

    @Post('assign')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    assignStudent(@Request() req, @Body() dto: AssignTransportDto) {
        return this.transportService.assignStudent(dto, req.user.branchId);
    }

    @Delete('assign/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    removeAssignment(@Request() req, @Param('studentId') studentId: string) {
        return this.transportService.removeAssignment(studentId, req.user.branchId);
    }

    @Get('stats/assignments')
    @Roles(UserRole.SUPER_ADMIN, UserRole.TRANSPORT_OFFICER, UserRole.BRANCH_ADMIN)
    getAssignmentsCount(@Request() req) {
        return this.transportService.getAssignmentsCount(req.user.branchId);
    }
}
