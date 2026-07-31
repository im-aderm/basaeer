import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { AcademicSessionsService } from './academic-sessions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';

@ApiTags('Academic Sessions')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
@ApiBearerAuth()
@Controller('academic-sessions')
export class AcademicSessionsController {
  constructor(private readonly sessionsService: AcademicSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all academic sessions for a branch' })
  @ApiResponse({ status: 200, description: 'List of sessions' })
  async findAll(
    @Query('branchId') branchId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    const effectiveBranchId =
      context.role === UserRole.SUPER_ADMIN ? branchId : context.branchId;
    return this.sessionsService.findAll(effectiveBranchId, context);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single academic session' })
  @ApiResponse({ status: 200, description: 'Session details' })
  async findOne(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionsService.findOne(id, context);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new academic session' })
  @ApiResponse({ status: 201, description: 'Session created' })
  async create(
    @Body() data: { name: string; startDate: string; endDate: string; branchId: string },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionsService.create(data, context);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an academic session' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  async update(
    @Param('id') id: string,
    @Body() data: { name?: string; startDate?: string; endDate?: string; status?: 'UPCOMING' | 'CURRENT' | 'COMPLETED' },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionsService.update(id, data, context);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update an academic session (e.g., status transition)' })
  @ApiResponse({ status: 200, description: 'Session updated' })
  async patch(
    @Param('id') id: string,
    @Body() data: { status?: 'UPCOMING' | 'CURRENT' | 'COMPLETED' },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionsService.update(id, data, context);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an academic session' })
  @ApiResponse({ status: 200, description: 'Session deleted' })
  async remove(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionsService.remove(id, context);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get the current active session for a branch' })
  @ApiResponse({ status: 200, description: 'Active session' })
  async getActiveSession(
    @Query('branchId') branchId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    const effectiveBranchId =
      context.role === UserRole.SUPER_ADMIN ? branchId : context.branchId;
    return this.sessionsService.getActiveSession(effectiveBranchId);
  }
}
