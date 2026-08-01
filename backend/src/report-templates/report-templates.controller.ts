import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReportTemplatesService } from './report-templates.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
} from './dto/template.dto';
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
@ApiTags('Report Templates')
@Controller('academics/templates')
export class ReportTemplatesController {
  constructor(private readonly templatesService: ReportTemplatesService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateReportTemplateDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Permissions('academics:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(
    @Body() dto: CreateReportTemplateDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.templatesService.create(dto, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Rendered HTML preview' })
  @ApiOperation({ summary: 'Preview a draft template against sample data' })
  @Post('preview')
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async preview(
    @Body() body: { type: string; layout: any },
    @Res() res: Response,
  ) {
    const html = await this.templatesService.preview(body.type, body.layout);
    res.set({ 'Content-Type': 'text/html; charset=utf-8' });
    res.send(html);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() ctx: TenantContext) {
    return this.templatesService.findAll(ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Permissions('academics:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.templatesService.findOne(id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateReportTemplateDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Permissions('academics:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.templatesService.update(id, dto, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Permissions('academics:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.templatesService.remove(id, ctx.branchId!);
  }
}
