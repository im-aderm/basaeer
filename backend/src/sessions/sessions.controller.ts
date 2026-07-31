import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SessionsService } from './sessions.service';
import { Prisma, UserRole } from '../generated/client/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Sessions')
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('sessions:create')
  @Roles(UserRole.SUPER_ADMIN)
  create(@Body() data: Prisma.AcademicSessionCreateInput) {
    return this.sessionsService.create(data);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('sessions:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() ctx: TenantContext) {
    const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : (ctx.branchId ?? undefined);
    return this.sessionsService.findAll(branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Active' })
  @Get('active')
  @Permissions('sessions:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findActive(@GetTenantContext() ctx: TenantContext) {
    const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : (ctx.branchId ?? undefined);
    return this.sessionsService.findActive(branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('sessions:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : (ctx.branchId ?? undefined);
    return this.sessionsService.findOne(id, branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Permissions('sessions:update')
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() data: Prisma.AcademicSessionUpdateInput,
    @GetTenantContext() ctx: TenantContext,
  ) {
    const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : (ctx.branchId ?? undefined);
    return this.sessionsService.update(id, data, branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Permissions('sessions:delete')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    const branchId = ctx.role === UserRole.SUPER_ADMIN ? undefined : (ctx.branchId ?? undefined);
    return this.sessionsService.remove(id, branchId);
  }
}
