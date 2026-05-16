import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateDeactivationReasonDto } from './dto/create-deactivation-reason.dto';
import { UpdateDeactivationReasonDto } from './dto/update-deactivation-reason.dto';
import { DeactivateLoginDto } from './dto/deactivate-login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    @InjectQueue('student-import') private importQueue: Queue,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Student' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async create(
    @Body() createStudentDto: CreateStudentDto,
    @GetTenantContext() context: TenantContext,
  ) {
    const result = await this.studentsService.create(createStudentDto, context);
    return { id: result.student.id, tempPassword: result.tempPassword };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Import' })
  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async import(
    @GetTenantContext() context: TenantContext,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /(ms-excel|openxmlformats-officedocument.spreadsheetml.sheet|csv)/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.studentsService.importStudents(file.buffer, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Get Import Status' })
  @Get('import/status/:jobId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getImportStatus(@Param('jobId') jobId: string) {
    const job = await this.importQueue.getJob(jobId);
    if (!job) throw new NotFoundException('Import job not found');

    const state = await job.getState();
    const result = job.returnvalue as { success: number; failed: number; details: string[] } | null;

    return {
      jobId: job.id,
      status: state,
      progress: job.progress,
      summary: result
        ? {
            total: (result.success || 0) + (result.failed || 0),
            succeeded: result.success || 0,
            failed: result.failed || 0,
            failureRate: (result.success || 0) + (result.failed || 0) > 0 ? Math.round(((result.failed || 0) / ((result.success || 0) + (result.failed || 0))) * 100) : 0,
          }
        : null,
      errors: result?.details?.filter((d) => d.includes('failed') || d.includes('Missing') || d.includes('already exists')) || [],
      timestamp: job.timestamp,
      finishedAt: job.finishedOn,
    };
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() context: TenantContext) {
    return this.studentsService.getStats(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async findAll(
    @GetTenantContext() context: TenantContext,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('search') search?: string,
    @Query('enrollmentStatus') enrollmentStatus?: string,
    @Query('isActive') isActive?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.studentsService.findAllWithCount(
      context,
      {
        classId,
        sectionId,
        search,
        enrollmentStatus,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      },
      skipNum,
      takeNum,
      sortBy,
      sortOrder,
    );
  }

  // Deactivation Reasons
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Deactivation Reasons' })
  @Get('deactivation-reasons')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  fetchDeactivationReasons(@GetTenantContext() context: TenantContext) {
    return this.studentsService.fetchDeactivationReasons(context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateDeactivationReasonDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Deactivation Reason' })
  @Post('deactivation-reasons')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createDeactivationReason(
    @GetTenantContext() context: TenantContext,
    @Body() dto: CreateDeactivationReasonDto,
  ) {
    return this.studentsService.createDeactivationReason(dto, context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateDeactivationReasonDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Deactivation Reason' })
  @Patch('deactivation-reasons/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateDeactivationReason(
    @Param('id') id: string,
    @Body() dto: UpdateDeactivationReasonDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.studentsService.updateDeactivationReason(id, dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Deactivation Reason' })
  @Delete('deactivation-reasons/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteDeactivationReason(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.studentsService.deleteDeactivationReason(id, context);
  }

  // Login Deactivation
  @ApiBearerAuth()
  @ApiBody({ type: DeactivateLoginDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Deactivate Login' })
  @Post('deactivate-login')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deactivateLogin(
    @GetTenantContext() context: TenantContext,
    @Body() dto: DeactivateLoginDto,
  ) {
    return this.studentsService.deactivateLogin(
      dto.studentIds,
      dto.reason,
      context,
      dto.reasonId,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Login Deactivations' })
  @Get('login-deactivations')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getLoginDeactivations(@GetTenantContext() context: TenantContext) {
    return this.studentsService.getLoginDeactivations(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.studentsService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.studentsService.update(id, updateStudentDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.studentsService.remove(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Reactivate Login' })
  @Post(':id/reactivate-login')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  reactivateLogin(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.studentsService.reactivateLogin(id, context);
  }

  @ApiBearerAuth()
  @ApiBody({ schema: { type: 'object', properties: { studentIds: { type: 'array', items: { type: 'string' } } } } })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Bulk Reactivate Login' })
  @Post('bulk-reactivate-login')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  bulkReactivateLogin(
    @GetTenantContext() context: TenantContext,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.studentsService.bulkReactivateLogin(studentIds, context);
  }
}
