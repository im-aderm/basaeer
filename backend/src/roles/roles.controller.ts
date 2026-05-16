import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignRoleDto, CreateUserAndAssignRoleDto } from './dto/assign-role.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
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
@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Roles' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() ctx: TenantContext) {
    const branchId = ctx.isSuperAdmin ? (undefined as any) : ctx.branchId;
    return this.rolesService.findAll(branchId || undefined, ctx.isSuperAdmin);
  }

  // ── Modules & Seed (must be before parameterized routes) ───────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Get distinct modules from DB' })
  @Get('modules')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getModules() {
    return this.rolesService.getModules();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Seed CustomRolePermission from legacy RolePermission' })
  @Post('seed')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  seedPermissions() {
    return this.rolesService.seedPermissions();
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Get Role' })
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Role' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Body() dto: CreateRoleDto, @GetTenantContext() ctx: TenantContext) {
    return this.rolesService.create(dto, ctx.branchId || undefined, ctx.isSuperAdmin);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateRoleDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Role' })
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateRoleDto, @GetTenantContext() ctx: TenantContext) {
    return this.rolesService.update(id, dto, ctx.branchId || undefined, ctx.isSuperAdmin);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Role' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.rolesService.remove(id, ctx.branchId || undefined, ctx.isSuperAdmin);
  }

  // ── Permissions ───────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Get Role Permissions' })
  @Get(':id/permissions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getPermissions(@Param('id') id: string) {
    return this.rolesService.getPermissions(id);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdatePermissionDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Role Permission' })
  @Post(':id/permissions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.rolesService.updatePermission(id, dto, ctx.branchId || undefined, ctx.isSuperAdmin);
  }

  @ApiBearerAuth()
  @ApiBody({ type: [UpdatePermissionDto] })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Bulk Update Role Permissions' })
  @Post(':id/permissions/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  bulkUpdatePermissions(
    @Param('id') id: string,
    @Body() permissions: UpdatePermissionDto[],
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.rolesService.bulkUpdatePermissions(id, permissions, ctx.branchId || undefined, ctx.isSuperAdmin);
  }

  // ── User Assignment ────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Assign Role to User' })
  @Post(':id/assign')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  assignRole(@Body() dto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateUserAndAssignRoleDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create User and Assign Role' })
  @Post(':id/create-user')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createUserAndAssign(@Body() dto: CreateUserAndAssignRoleDto) {
    return this.rolesService.createUserAndAssignRole(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Get Users by Role' })
  @Get(':id/users')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getUsers(@Param('id') id: string) {
    return this.rolesService.getUsersByRole(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Remove Role from User' })
  @Delete('users/:userId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  removeRoleFromUser(
    @Param('userId') userId: string,
  ) {
    return this.rolesService.removeRoleFromUser(userId);
  }
}