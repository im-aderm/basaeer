import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AdmissionInterviewService } from './admission-interview.service';
import { CreateAdmissionInterviewDto, UpdateAdmissionInterviewDto, CompleteInterviewDto, BulkScheduleInterviewDto } from './dto/create-admission-interview.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Admission Interviews')
@ApiBearerAuth()
@Controller('admission-interviews')
export class AdmissionInterviewController {
  constructor(private readonly interviewService: AdmissionInterviewService) {}

  @Post()
  @Permissions('admission-interview:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Schedule interview for an applicant' })
  @ApiBody({ type: CreateAdmissionInterviewDto })
  @ApiResponse({ status: 201, description: 'Interview scheduled' })
  create(@Body() createDto: CreateAdmissionInterviewDto, @GetTenantContext() context: TenantContext) {
    return this.interviewService.create(createDto, context);
  }

  @Get()
  @Permissions('admission-interview:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'List all interviews' })
  @ApiResponse({ status: 200, description: 'List of interviews' })
  findAll(
    @GetTenantContext() context: TenantContext,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.interviewService.findAll(context, { status, dateFrom, dateTo });
  }

  @Get(':id')
  @Permissions('admission-interview:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get interview detail' })
  @ApiResponse({ status: 200, description: 'Interview detail' })
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.interviewService.findOne(id, context);
  }

  @Patch(':id')
  @Permissions('admission-interview:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update interview' })
  @ApiBody({ type: UpdateAdmissionInterviewDto })
  @ApiResponse({ status: 200, description: 'Interview updated' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdmissionInterviewDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.interviewService.update(id, updateDto, context);
  }

  @Post(':id/complete')
  @Permissions('admission-interview:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Mark interview as complete with outcome' })
  @ApiBody({ type: CompleteInterviewDto })
  @ApiResponse({ status: 201, description: 'Interview completed' })
  complete(
    @Param('id') id: string,
    @Body() completeDto: CompleteInterviewDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.interviewService.complete(id, completeDto, context);
  }

  @Post('bulk-schedule')
  @Permissions('admission-interview:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Schedule interviews for multiple applicants' })
  @ApiBody({ type: BulkScheduleInterviewDto })
  @ApiResponse({ status: 201, description: 'Interviews scheduled' })
  bulkSchedule(
    @Body() dto: BulkScheduleInterviewDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.interviewService.bulkSchedule(dto, context);
  }

  @Delete(':id')
  @Permissions('admission-interview:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Cancel interview' })
  @ApiResponse({ status: 200, description: 'Interview cancelled' })
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.interviewService.remove(id, context);
  }
}
