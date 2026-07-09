import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { BulkExportService } from './bulk-export.service';
import { StartBulkExportDto } from './dto/start-bulk-export.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';

@ApiTags('Bulk Export')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('bulk-exports')
export class BulkExportController {
  constructor(private readonly service: BulkExportService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Start a bulk document export (ZIP of PDFs)' })
  @ApiResponse({ status: 201, description: 'Export queued' })
  start(
    @Body() dto: StartBulkExportDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.service.start(dto, ctx);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'List my recent bulk exports' })
  list(@GetTenantContext() ctx: TenantContext) {
    return this.service.list(ctx);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiOperation({ summary: 'Get a bulk export job status' })
  getStatus(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.service.getStatus(id, ctx);
  }
}
