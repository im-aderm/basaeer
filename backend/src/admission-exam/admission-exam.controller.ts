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
import { AdmissionExamService } from './admission-exam.service';
import { CreateAdmissionExamDto, UpdateAdmissionExamDto, CreateExamScoreDto, BulkScoreUploadDto, ScheduleExamDto } from './dto/create-admission-exam.dto';
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
@ApiTags('Admission Exams')
@ApiBearerAuth()
@Controller('admission-exams')
export class AdmissionExamController {
  constructor(private readonly examService: AdmissionExamService) {}

  @Post()
  @Permissions('admission-exam:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Create entrance exam' })
  @ApiBody({ type: CreateAdmissionExamDto })
  @ApiResponse({ status: 201, description: 'Exam created' })
  create(@Body() createDto: CreateAdmissionExamDto, @GetTenantContext() context: TenantContext) {
    return this.examService.create(createDto, context);
  }

  @Get()
  @Permissions('admission-exam:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'List all entrance exams' })
  @ApiResponse({ status: 200, description: 'List of exams' })
  findAll(
    @GetTenantContext() context: TenantContext,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.examService.findAll(context, { status, dateFrom, dateTo });
  }

  @Get(':id')
  @Permissions('admission-exam:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get exam detail with scores' })
  @ApiResponse({ status: 200, description: 'Exam detail' })
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.examService.findOne(id, context);
  }

  @Get(':id/rankings')
  @Permissions('admission-exam:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get ranked applicants by score' })
  @ApiResponse({ status: 200, description: 'Ranked list' })
  getRankings(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.examService.getRankings(id, context);
  }

  @Patch(':id')
  @Permissions('admission-exam:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Update exam' })
  @ApiBody({ type: UpdateAdmissionExamDto })
  @ApiResponse({ status: 200, description: 'Exam updated' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAdmissionExamDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.examService.update(id, updateDto, context);
  }

  @Delete(':id')
  @Permissions('admission-exam:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Delete exam' })
  @ApiResponse({ status: 200, description: 'Exam deleted' })
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.examService.remove(id, context);
  }

  @Post(':id/scores')
  @Permissions('admission-exam:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Add single exam score' })
  @ApiBody({ type: CreateExamScoreDto })
  @ApiResponse({ status: 201, description: 'Score added' })
  addScore(
    @Param('id') id: string,
    @Body() createDto: CreateExamScoreDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.examService.addScore(id, createDto, context, context.userId);
  }

  @Post(':id/scores/bulk')
  @Permissions('admission-exam:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Bulk upload exam scores' })
  @ApiBody({ type: BulkScoreUploadDto })
  @ApiResponse({ status: 201, description: 'Scores uploaded' })
  bulkAddScores(
    @Param('id') id: string,
    @Body() dto: BulkScoreUploadDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.examService.bulkAddScores(id, dto.scores, context, context.userId);
  }

  @Post(':id/assign')
  @Permissions('admission-exam:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Assign applicants to exam' })
  @ApiBody({ type: ScheduleExamDto })
  @ApiResponse({ status: 201, description: 'Applicants assigned' })
  assignAdmissions(
    @Param('id') id: string,
    @Body() dto: ScheduleExamDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.examService.assignAdmissionsToExam(id, dto.admissionIds, context);
  }
}
