import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import {
  CreateAssessmentComponentDto,
  BulkRecordMarksDto,
} from './dto/assessment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole, Term } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Assessments')
@Controller('academics/assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateAssessmentComponentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Assessment Component' })
  @Post('components')
  @Permissions('academics:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createComponent(
    @Body() dto: CreateAssessmentComponentDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.createComponent(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Assessment Components' })
  @Get('components')
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getComponents(
    @GetTenantContext() context: TenantContext,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.assessmentService.getComponents(context, classId, subjectId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Assessment Component' })
  @Patch('components/:id')
  @Permissions('academics:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateComponent(
    @Param('id') id: string,
    @Body() dto: Partial<CreateAssessmentComponentDto>,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.updateComponent(id, dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete (deactivate) Assessment Component' })
  @Delete('components/:id')
  @Permissions('academics:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteComponent(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.deleteComponent(id, context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: BulkRecordMarksDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Bulk Record Marks' })
  @Post('bulk-marks')
  @Permissions('academics:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  recordBulkMarks(
    @Body() dto: BulkRecordMarksDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.recordBulkMarks(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Scores for a Record' })
  @Get('records/:recordId/scores')
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getRecordScores(@Param('recordId') recordId: string, @GetTenantContext() ctx: TenantContext) {
    return this.assessmentService.getScoresByRecord(recordId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update a Single Score' })
  @Patch('scores/:scoreId')
  @Permissions('academics:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  updateScore(
    @Param('scoreId') scoreId: string,
    @Body() body: { score: number },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.updateScore(scoreId, body.score, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete a Single Score' })
  @Delete('scores/:scoreId')
  @Permissions('academics:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  deleteScore(
    @Param('scoreId') scoreId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.deleteScore(scoreId, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Open Day Performance' })
  @Get('open-day/:studentId')
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT, UserRole.PARENT)
  getOpenDayPerformance(
    @Param('studentId') studentId: string,
    @Query('sessionId') sessionId: string,
    @Query('term') term: Term,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.assessmentService.getOpenDayPerformance(studentId, sessionId, term, context);
  }
}
