import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  UseGuards,
  Request,
  Query,
  Delete,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AcademicsService } from './academics.service';
import { ExportQueueService } from './export-queue.service';
import { ComputationQueueService } from './computation-queue.service';
import {
  CreateAssignmentDto,
  SubmitAssignmentDto,
} from './dto/academics-ops.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { CreateClassScheduleDto } from './dto/class-schedule.dto';
import { StartExportDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Academics')
@Controller('academics')
export class AcademicsController {
  constructor(
    private readonly academicsService: AcademicsService,
    private readonly exportQueueService: ExportQueueService,
    private readonly computationQueueService: ComputationQueueService,
  ) {}

  // Assignments
  @ApiBearerAuth()
  @ApiBody({ type: CreateAssignmentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Assignment' })
  @Post('assignments')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  createAssignment(@Body() dto: CreateAssignmentDto, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.createAssignment(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: SubmitAssignmentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Assignment' })
  @Post('submissions')
  @Roles(UserRole.STUDENT)
  submitAssignment(@Body() dto: SubmitAssignmentDto, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.submitAssignment(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Grade Submission' })
  @Patch('submissions/:id/grade')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  gradeSubmission(
    @Param('id') id: string,
    @Body('grade') grade: number,
    @GetTenantContext() ctx: TenantContext,
    @Body('feedback') feedback?: string,
  ) {
    return this.academicsService.gradeSubmission(id, grade, feedback, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Assignments' })
  @Get('assignments')
  @Roles(
    UserRole.TEACHER,
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.STUDENT,
  )
  getAssignments(
    @GetTenantContext() ctx: TenantContext,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('subjectId') subjectId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.academicsService.getAssignments({
      classId,
      sectionId,
      subjectId,
      teacherId,
    }, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Assignment Submissions' })
  @Get('assignments/:id/submissions')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  getAssignmentSubmissions(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.getAssignmentSubmissions(id, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Student Assignments' })
  @Get('student-assignments/:studentId')
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
  )
  getStudentAssignments(@Param('studentId') studentId: string, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.getStudentAssignments(studentId, ctx);
  }

  // Performance
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Performance' })
  @Get('performance/:studentId')
  @Roles(
    UserRole.STUDENT,
    UserRole.TEACHER,
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
  )
  getPerformance(@Param('studentId') studentId: string, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.getStudentPerformance(studentId, ctx);
  }

  // Promotion
  @ApiBearerAuth()
  @ApiBody({ type: PromoteStudentsDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Promote Students' })
  @Post('promote')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  promoteStudents(@Body() dto: PromoteStudentsDto, @GetTenantContext() ctx: TenantContext) {
    return this.academicsService.promoteStudents(dto, ctx);
  }

  // Schedules
  @ApiBearerAuth()
  @ApiBody({ type: CreateClassScheduleDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Schedule' })
  @Post('schedules')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  createSchedule(
    @Body() dto: CreateClassScheduleDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    dto.branchId = ctx.branchId ?? undefined;
    return this.academicsService.createSchedule(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Schedules' })
  @Get('schedules')
  @Roles(
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  getSchedules(
    @GetTenantContext() ctx: TenantContext,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('teacherId') teacherId?: string,
  ) {
    return this.academicsService.getSchedules({
      classId,
      sectionId,
      teacherId,
    }, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Schedule' })
  @Delete('schedules/:id')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  deleteSchedule(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.academicsService.deleteSchedule(id, ctx);
  }

  // Exports
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('exports')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  async startExport(
    @Body() dto: StartExportDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.exportQueueService.startExport(dto, ctx.userId, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Exports' })
  @Get('exports')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.EXAM_OFFICER,
    UserRole.ACADEMIC_OFFICER,
  )
  async getExports(@GetTenantContext() ctx: TenantContext) {
    return this.exportQueueService.getBranchExports(ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Export Status' })
  @Get('exports/:id')
  async getExportStatus(@Param('id') id: string) {
    return this.exportQueueService.getExportStatus(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Export' })
  @Delete('exports/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async deleteExport(@Param('id') id: string) {
    return this.exportQueueService.deleteExport(id);
  }

  // Computations
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Compute Section' })
  @Post('compute-section')
  @Throttle({ default: { limit: 2, ttl: 60000 } })
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.EXAM_OFFICER)
  async computeSection(
    @Body() dto: { sectionId: string; sessionId: string; term: Term },
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.computationQueueService.queueSectionComputation(
      dto.sectionId,
      dto.sessionId,
      dto.term,
      ctx.userId,
      ctx.branchId!,
    );
  }

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Compute Status' })
  @Get('compute-status/:jobId')
  async getComputeStatus(@Param('jobId') jobId: string) {
    return this.computationQueueService.getJobStatus(jobId);
  }
}
