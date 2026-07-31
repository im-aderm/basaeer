import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
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

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
@ApiTags('Assignments')
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('assignments:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  create(
    @GetTenantContext() context: TenantContext,
    @Body() data: any,
    @Request() req: any,
  ) {
    data.branchId = req.user.branchId;
    if (req.user.role === UserRole.TEACHER) {
      data.teacherId = req.user.staffId;
    }
    return this.assignmentsService.createAssignment(data, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('assignments:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findAll(@GetTenantContext() context: TenantContext, @Query() filters: any) {
    return this.assignmentsService.findAll(context, filters);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve By Student' })
  @Get('student/:studentId')
  @Permissions('assignments:read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.STUDENT,
    UserRole.PARENT,
  )
  findByStudent(
    @GetTenantContext() context: TenantContext,
    @Param('studentId') studentId: string,
  ) {
    return this.assignmentsService.findByStudent(studentId, context);
  }

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  findOne(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
    return this.assignmentsService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Put(':id')
  @Permissions('assignments:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  update(
    @GetTenantContext() context: TenantContext,
    @Param('id') id: string,
    @Body() data: any,
  ) {
    return this.assignmentsService.update(id, data, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Permissions('assignments:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  remove(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
    return this.assignmentsService.remove(id, context);
  }

  // --- Submissions ---
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post('submit')
  @Permissions('assignments:create')
  @Roles(UserRole.STUDENT)
  submit(@GetTenantContext() context: TenantContext, @Body() data: any) {
    return this.assignmentsService.submitAssignment(data, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Submissions' })
  @Get(':id/submissions')
  @Permissions('assignments:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getSubmissions(
    @GetTenantContext() context: TenantContext,
    @Param('id') id: string,
  ) {
    return this.assignmentsService.getSubmissions(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Grade' })
  @Put('submissions/:id/grade')
  @Permissions('assignments:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  grade(
    @GetTenantContext() context: TenantContext,
    @Param('id') id: string,
    @Body('grade') grade: number,
    @Body('feedback') feedback?: string,
  ) {
    return this.assignmentsService.gradeSubmission(
      id,
      grade,
      feedback,
      context,
    );
  }
}
