import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Classes')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  create(
    @Body() createClassDto: any,
    @GetTenantContext() context: TenantContext,
  ) {
    if (!createClassDto.branch && context.branchId) {
      createClassDto.branch = { connect: { id: context.branchId } };
    }
    return this.classesService.create(createClassDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
  findAll(@GetTenantContext() context: TenantContext) {
    return this.classesService.findAll(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.classesService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Section' })
  @Post(':id/sections')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  addSection(
    @Param('id') id: string,
    @Body('name') name: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.classesService.addSection(id, name, context);
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
    return this.classesService.assignTeacher(id, teacherId, context);
  }
}
