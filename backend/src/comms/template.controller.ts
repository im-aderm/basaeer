import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Comms Templates')
@Controller('comms/templates')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class TemplateController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Email Templates' })
  @Get('email')
  @Permissions('comms:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getEmailTemplates(@GetTenantContext() context: TenantContext) {
    return this.prisma.emailTemplate.findMany({
      where: { branchId: context.branchId },
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Email Template' })
  @Post('email')
  @Permissions('comms:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async createEmailTemplate(
    @Body()
    dto: {
      name: string;
      subject: string;
      body: string;
      type: string;
      variables?: any;
    },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.prisma.emailTemplate.create({
      data: {
        ...dto,
        branchId: context.branchId,
      },
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Email Template' })
  @Put('email/:id')
  @Permissions('comms:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      subject?: string;
      body?: string;
      type?: string;
      variables?: any;
    },
  ) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data: dto,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Sms Templates' })
  @Get('sms')
  @Permissions('comms:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getSmsTemplates(@GetTenantContext() context: TenantContext) {
    return this.prisma.smsTemplate.findMany({
      where: { branchId: context.branchId },
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Sms Template' })
  @Post('sms')
  @Permissions('comms:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async createSmsTemplate(
    @Body()
    dto: { name: string; content: string; type: string; variables?: any },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.prisma.smsTemplate.create({
      data: {
        ...dto,
        branchId: context.branchId,
      },
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Sms Template' })
  @Put('sms/:id')
  @Permissions('comms:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async updateSmsTemplate(
    @Param('id') id: string,
    @Body()
    dto: { name?: string; content?: string; type?: string; variables?: any },
  ) {
    return this.prisma.smsTemplate.update({
      where: { id },
      data: dto,
    });
  }
}
