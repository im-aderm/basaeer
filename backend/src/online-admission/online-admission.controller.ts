import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OnlineAdmissionService } from './online-admission.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('online-admissions')
export class OnlineAdmissionController {
  constructor(
    private readonly onlineAdmissionService: OnlineAdmissionService,
  ) {}

  @Public()
  @Post()
  create(
    @Body() createDto: CreateOnlineAdmissionDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.create(createDto, context);
  }

  @Public()
  @Get('public/init/:branchId')
  getPublicInitData(@Param('branchId') branchId: string) {
    return this.onlineAdmissionService.getPublicInitData(branchId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.findAll(context);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.findOne(id, context);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOnlineAdmissionDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.update(id, updateDto, context);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.remove(id, context);
  }

  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  approve(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body() approvalData: { classId?: string; sectionId?: string },
  ) {
    return this.onlineAdmissionService.approve(id, context, approvalData);
  }

  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.reject(id, reason, context);
  }

  @Post(':id/verify-payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  verifyPayment(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.verifyPayment(id, context);
  }

  @Post(':id/reject-payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  rejectPayment(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.rejectPayment(id, reason, context);
  }
}
