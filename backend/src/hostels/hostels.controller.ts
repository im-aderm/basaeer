import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { HostelsService } from './hostels.service';
import { CreateHostelDto } from './dto/create-hostel.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { AllocateBedDto } from './dto/allocate-bed.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { UpdateHostelDto } from './dto/update-hostel.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Hostels')
@Controller('hostels')
export class HostelsController {
  constructor(private readonly hostelsService: HostelsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateHostelDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  create(@Body() dto: CreateHostelDto, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.createHostel(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.findAll(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.getVacancies(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.findHostel(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateHostelDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Permissions('hostels:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHostelDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.updateHostel(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Permissions('hostels:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.deleteHostel(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateRoomDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Room' })
  @Post('rooms')
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  createRoom(
    @Body() dto: CreateRoomDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.createRoom(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Room' })
  @Get('rooms/:id')
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  findRoom(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.findRoom(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateRoomDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Room' })
  @Patch('rooms/:id')
  @Permissions('hostels:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  updateRoom(
    @Param('id') id: string,
    @Body() dto: UpdateRoomDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.updateRoom(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Room' })
  @Delete('rooms/:id')
  @Permissions('hostels:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  removeRoom(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.deleteRoom(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: AllocateBedDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Allocate Bed' })
  @Post('allocate')
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  allocateBed(
    @Body() dto: AllocateBedDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.allocateBed(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Release Bed' })
  @Post('release/:allocationId')
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  releaseBed(
    @Param('allocationId') allocationId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.releaseBed(allocationId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Leave' })
  @Post('leave')
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  createLeave(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.createLeave(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Branch Leaves' })
  @Get('leaves/branch')
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  getBranchLeaves(@GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.getBranchLeaves(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Leave Status' })
  @Patch('leaves/:id/status')
  @Permissions('hostels:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  updateLeaveStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.hostelsService.updateLeaveStatus(id, status, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Maintenance' })
  @Post('maintenance')
  @Permissions('hostels:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN)
  createMaintenance(@Body() dto: any, @GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.createMaintenanceRequest(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Branch Maintenance' })
  @Get('maintenance/branch')
  @Permissions('hostels:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.HOSTEL_ADMIN, UserRole.BRANCH_ADMIN)
  getBranchMaintenance(@GetTenantContext() ctx: TenantContext) {
    return this.hostelsService.getBranchMaintenance(ctx);
  }
}
