import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Body,
  UseGuards,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('users:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId?: string,
    @Query('role') role?: UserRole,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId ?? undefined;
    return this.usersService.findAll(effectiveBranchId, role);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('users:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Body() data: any) {
    return this.usersService.createUser(data);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Status' })
  @Patch(':id/status')
  @Permissions('users:deactivate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean, @GetTenantContext() ctx: TenantContext) {
    return this.usersService.updateStatus(id, isActive, ctx);
  }
}
