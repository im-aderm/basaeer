import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { AccessControlService } from './access-control.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import { CreateAccessLogDto } from './dto/access-control.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Access Control')
@Controller('access-control')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class AccessControlController {
  constructor(private readonly accessControlService: AccessControlService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateAccessLogDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Log' })
  @Post('log')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  log(@Body() dto: CreateAccessLogDto, @GetTenantContext() ctx: TenantContext) {
    return this.accessControlService.logAccess(ctx.branchId!, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Logs' })
  @Get('logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getLogs(
    @GetTenantContext() ctx: TenantContext,
    @Query('limit') limit?: string,
  ) {
    return this.accessControlService.getBranchLogs(
      ctx.branchId!,
      limit ? parseInt(limit) : 50,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Logs' })
  @Get('my-logs')
  getMyLogs(@GetTenantContext() ctx: TenantContext) {
    return this.accessControlService.getUserLogs(ctx.userId);
  }
}
