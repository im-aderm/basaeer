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
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateDeactivationReasonDto } from './dto/create-deactivation-reason.dto';
import { UpdateDeactivationReasonDto } from './dto/update-deactivation-reason.dto';
import { DeactivateLoginDto } from './dto/deactivate-login.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Student' })
  @Post()
  @Permissions('students:create')
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
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Permissions('students:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getStats(@GetTenantContext() context: TenantContext) {
    return this.studentsService.getStats(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('students:read')
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
  @Permissions('students:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  fetchDeactivationReasons(@GetTenantContext() context: TenantContext) {
    return this.studentsService.fetchDeactivationReasons(context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateDeactivationReasonDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Deactivation Reason' })
  @Post('deactivation-reasons')
  @Permissions('students:create')
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
  @Permissions('students:update')
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
  @Permissions('students:delete')
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
  @Permissions('students:create')
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
  @Permissions('students:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getLoginDeactivations(@GetTenantContext() context: TenantContext) {
    return this.studentsService.getLoginDeactivations(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('students:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.studentsService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateStudentDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Permissions('students:update')
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
  @Permissions('students:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.studentsService.remove(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Reactivate Login' })
  @Post(':id/reactivate-login')
  @Permissions('students:create')
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
  @Permissions('students:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  bulkReactivateLogin(
    @GetTenantContext() context: TenantContext,
    @Body('studentIds') studentIds: string[],
  ) {
    return this.studentsService.bulkReactivateLogin(studentIds, context);
  }
}
