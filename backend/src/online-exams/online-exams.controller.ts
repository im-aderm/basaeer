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
  NotFoundException,
} from '@nestjs/common';
import { OnlineExamsService } from './online-exams.service';
import {
  CreateQuestionGroupDto,
  CreateQuestionDto,
  CreateOnlineExamDto,
  SubmitAttemptDto,
  GradeDescriptiveAnswerDto,
} from './dto/online-exam.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
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
import { PermissionsGuard } from '../auth/permissions.guard';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Online Exams')
@Controller('online-exams')
export class OnlineExamsController {
  constructor(private readonly examsService: OnlineExamsService) {}

  // ==================== Question Groups ====================
  @ApiBearerAuth()
  @ApiBody({ type: CreateQuestionGroupDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Group' })
  @Post('groups')
  @Permissions('online-exams:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  createGroup(
    @Body() dto: CreateQuestionGroupDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examsService.createQuestionGroup(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Groups' })
  @Get('groups')
  @Permissions('online-exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getGroups(@GetTenantContext() ctx: TenantContext, @Query('branchId') branchIdQuery?: string) {
    const branchId: string =
      ctx.role === UserRole.SUPER_ADMIN
        ? (branchIdQuery ?? ctx.branchId ?? '')
        : (ctx.branchId ?? '');
    return this.examsService.getQuestionGroups(branchId);
  }

  // ==================== Questions ====================
  @ApiBearerAuth()
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Question' })
  @Post('questions')
  @Permissions('online-exams:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  createQuestion(
    @Body() dto: CreateQuestionDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examsService.createQuestion(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Questions' })
  @Get('groups/:groupId/questions')
  @Permissions('online-exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getQuestions(
    @Param('groupId') groupId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examsService.getQuestionsByGroup(groupId, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateQuestionDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Question' })
  @Patch('questions/:id')
  @Permissions('online-exams:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  updateQuestion(@Param('id') id: string, @Body() dto: CreateQuestionDto, @GetTenantContext() ctx: TenantContext) {
    return this.examsService.updateQuestion(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Question' })
  @Delete('questions/:id')
  @Permissions('online-exams:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  deleteQuestion(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.examsService.deleteQuestion(id, ctx);
  }

  // ==================== Exams ====================
  @ApiBearerAuth()
  @ApiBody({ type: CreateOnlineExamDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Exam' })
  @Post()
  @Permissions('online-exams:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  createExam(
    @Body() dto: CreateOnlineExamDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.examsService.createExam(dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Exams' })
  @Get()
  @Permissions('online-exams:read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  getExams(
    @GetTenantContext() ctx: TenantContext,
    @Query('classId') classId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    const branchId = ctx.branchId ?? '';
    return this.examsService.getExams(branchId, { classId, subjectId });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Start Exam' })
  @Get(':id/start')
  @Permissions('online-exams:read')
  @Roles(UserRole.STUDENT)
  async startExam(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    const student = await this.examsService.findStudentByUserId(ctx.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found for this user');
    }
    return this.examsService.getExamForStudent(id, student.id);
  }

  @ApiBearerAuth()
  @ApiBody({ type: SubmitAttemptDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Submit Attempt' })
  @Post('submit')
  @Permissions('online-exams:create')
  @Roles(UserRole.STUDENT)
  async submitAttempt(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: SubmitAttemptDto,
  ) {
    const student = await this.examsService.findStudentByUserId(ctx.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found for this user');
    }
    return this.examsService.submitAttempt(student.id, dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: SubmitAttemptDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Sync Answers' })
  @Post('sync')
  @Permissions('online-exams:create')
  @Roles(UserRole.STUDENT)
  async syncAnswers(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: SubmitAttemptDto,
  ) {
    const student = await this.examsService.findStudentByUserId(ctx.userId);
    if (!student) {
      throw new NotFoundException('Student profile not found for this user');
    }
    return this.examsService.syncAnswers(student.id, dto);
  }

  // ==================== Grading ====================
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Attempts' })
  @Get(':id/attempts')
  @Permissions('online-exams:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getAttempts(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.examsService.getAttempts(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: GradeDescriptiveAnswerDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Grade Answer' })
  @Patch('attempts/:attemptId/questions/:questionId/grade')
  @Permissions('online-exams:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  gradeAnswer(
    @Param('attemptId') attemptId: string,
    @Param('questionId') questionId: string,
    @Body() dto: GradeDescriptiveAnswerDto,
  ) {
    return this.examsService.gradeDescriptiveAnswer(
      attemptId,
      questionId,
      dto.marksAwarded,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Generate Positions' })
  @Post(':id/generate-positions')
  @Permissions('online-exams:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  generatePositions(@Param('id') id: string) {
    return this.examsService.generatePositions(id);
  }
}
