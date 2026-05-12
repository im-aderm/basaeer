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
} from '@nestjs/common';
import { ReportTemplatesService } from './report-templates.service';
import {
  CreateReportTemplateDto,
  UpdateReportTemplateDto,
} from './dto/template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('academics/templates')
export class ReportTemplatesController {
  constructor(private readonly templatesService: ReportTemplatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(
    @Body() dto: CreateReportTemplateDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.templatesService.create(dto, ctx.branchId!);
  }

  @Get()
  findAll(@GetTenantContext() ctx: TenantContext) {
    return this.templatesService.findAll(ctx.branchId!);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.templatesService.findOne(id, ctx.branchId!);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateReportTemplateDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.templatesService.update(id, dto, ctx.branchId!);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.templatesService.remove(id, ctx.branchId!);
  }
}
