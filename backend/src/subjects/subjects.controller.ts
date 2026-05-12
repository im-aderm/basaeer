import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Prisma } from '../generated/client/client';
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

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Subjects')
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  create(
    @GetTenantContext() context: TenantContext,
    @Body() createSubjectDto: any,
  ) {
    return this.subjectsService.create(createSubjectDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Roles(
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  findAll(@GetTenantContext() context: TenantContext) {
    return this.subjectsService.findAll(context.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.subjectsService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: Prisma.SubjectUpdateInput,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.subjectsService.update(id, updateSubjectDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.subjectsService.remove(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Assign Teacher' })
  @Post(':id/assign-teacher')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  assignTeacher(
    @Param('id') id: string,
    @Body('teacherId') teacherId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.subjectsService.assignTeacher(id, teacherId, context);
  }
}
