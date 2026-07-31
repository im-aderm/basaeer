import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DesignationsService } from './designations.service';
import { CreateDesignationDto } from './dto/create-designation.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { Permissions } from '../../auth/permissions.decorator';
import { BranchGuard, TenantContext } from '../../auth/branch.guard';
import { GetTenantContext } from '../../auth/tenant-context.decorator';
import { UserRole } from '../../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../../auth/permissions.guard';

@ApiTags('Designations')
@Controller('designations')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class DesignationsController {
  constructor(private readonly designationsService: DesignationsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateDesignationDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('employees:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Body() createDesignationDto: CreateDesignationDto) {
    return this.designationsService.create(createDesignationDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@Request() req: any) {
    return this.designationsService.findAll(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('employees:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.designationsService.findOne(id, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Permissions('employees:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.designationsService.remove(id, ctx);
  }
}
