import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransportService } from './transport.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { UpdateRouteDto } from './dto/update-route.dto';
import { AssignTransportDto } from './dto/assign-transport.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Transport')
@Controller('transport')
export class TransportController {
  constructor(private readonly transportService: TransportService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Vehicle' })
  @Post('vehicles')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  createVehicle(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateVehicleDto,
  ) {
    return this.transportService.createVehicle(dto, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Vehicles' })
  @Get('vehicles')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  findAllVehicles(@GetTenantContext() ctx: TenantContext) {
    return this.transportService.findAllVehicles(ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One Vehicle' })
  @Get('vehicles/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  findOneVehicle(
    @GetTenantContext() ctx: TenantContext,
    @Param('id') id: string,
  ) {
    return this.transportService.findVehicle(id, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Vehicle' })
  @Patch('vehicles/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  updateVehicle(
    @GetTenantContext() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.transportService.updateVehicle(id, dto, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Vehicle' })
  @Delete('vehicles/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  deleteVehicle(
    @GetTenantContext() ctx: TenantContext,
    @Param('id') id: string,
  ) {
    return this.transportService.deleteVehicle(id, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Route' })
  @Post('routes')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  createRoute(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateRouteDto,
  ) {
    return this.transportService.createRoute(dto, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Routes' })
  @Get('routes')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  findAllRoutes(@GetTenantContext() ctx: TenantContext) {
    return this.transportService.findAllRoutes(ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One Route' })
  @Get('routes/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  findOneRoute(
    @GetTenantContext() ctx: TenantContext,
    @Param('id') id: string,
  ) {
    return this.transportService.findRoute(id, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Route' })
  @Patch('routes/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  updateRoute(
    @GetTenantContext() ctx: TenantContext,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.transportService.updateRoute(id, dto, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Route' })
  @Delete('routes/:id')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  deleteRoute(@GetTenantContext() ctx: TenantContext, @Param('id') id: string) {
    return this.transportService.deleteRoute(id, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Assign Student' })
  @Post('assign')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  assignStudent(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: AssignTransportDto,
  ) {
    return this.transportService.assignStudent(dto, ctx.branchId || '');
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Assignment' })
  @Delete('assign/:studentId')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  removeAssignment(
    @GetTenantContext() ctx: TenantContext,
    @Param('studentId') studentId: string,
  ) {
    return this.transportService.removeAssignment(
      studentId,
      ctx.branchId || '',
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Assignments Count' })
  @Get('stats/assignments')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.TRANSPORT_OFFICER,
    UserRole.BRANCH_ADMIN,
  )
  getAssignmentsCount(@GetTenantContext() ctx: TenantContext) {
    return this.transportService.getAssignmentsCount(ctx.branchId || '');
  }
}
