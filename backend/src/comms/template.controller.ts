import { Controller, Get, Post, Put, Body, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { TenantContext } from '../auth/branch.guard';

@Controller('comms/templates')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TemplateController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('email')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getEmailTemplates(@GetTenantContext() context: TenantContext) {
    return this.prisma.emailTemplate.findMany({
      where: { branchId: context.branchId },
    });
  }

  @Post('email')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async createEmailTemplate(
    @Body() dto: { name: string; subject: string; body: string; type: string; variables?: any },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.prisma.emailTemplate.create({
      data: {
        ...dto,
        branchId: context.branchId,
      },
    });
  }

  @Put('email/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async updateEmailTemplate(
    @Param('id') id: string,
    @Body() dto: { name?: string; subject?: string; body?: string; type?: string; variables?: any },
  ) {
    return this.prisma.emailTemplate.update({
      where: { id },
      data: dto,
    });
  }

  @Get('sms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getSmsTemplates(@GetTenantContext() context: TenantContext) {
    return this.prisma.smsTemplate.findMany({
      where: { branchId: context.branchId },
    });
  }

  @Post('sms')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async createSmsTemplate(
    @Body() dto: { name: string; content: string; type: string; variables?: any },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.prisma.smsTemplate.create({
      data: {
        ...dto,
        branchId: context.branchId,
      },
    });
  }

  @Put('sms/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async updateSmsTemplate(
    @Param('id') id: string,
    @Body() dto: { name?: string; content?: string; type?: string; variables?: any },
  ) {
    return this.prisma.smsTemplate.update({
      where: { id },
      data: dto,
    });
  }
}
