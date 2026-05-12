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
  UseInterceptors,
  UploadedFile,
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
  constructor(private readonly studentsService: StudentsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateStudentDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(
    @GetTenantContext() context: TenantContext,
    @Body() createStudentDto: CreateStudentDto,
  ) {
    return this.studentsService.create(createStudentDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Import' })
  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async import(
    @GetTenantContext() context: TenantContext,
    @UploadedFile() file: any,
  ) {
    return this.studentsService.importStudents(file.buffer, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
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
  findAll(
    @GetTenantContext() context: TenantContext,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.studentsService.findAll(
      context,
      classId,
      sectionId,
      skipNum,
      takeNum,
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
}
