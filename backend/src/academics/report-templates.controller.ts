import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { ReportTemplatesService } from './report-templates.service';
import { CreateReportTemplateDto, UpdateReportTemplateDto } from './dto/template.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academics/templates')
export class ReportTemplatesController {
  constructor(private readonly templatesService: ReportTemplatesService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Body() dto: CreateReportTemplateDto, @Req() req: any) {
    return this.templatesService.create(dto, req.user.branchId);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.templatesService.findAll(req.user.branchId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.findOne(id, req.user.branchId);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateReportTemplateDto, @Req() req: any) {
    return this.templatesService.update(id, dto, req.user.branchId);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @Req() req: any) {
    return this.templatesService.remove(id, req.user.branchId);
  }
}
