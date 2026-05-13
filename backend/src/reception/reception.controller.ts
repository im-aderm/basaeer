import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
  Param,
  Delete,
} from '@nestjs/common';
import { ReceptionService } from './reception.service';
import {
  CreateEnquiryDto,
  CreateCallLogDto,
  CreateVisitorLogDto,
  CreateComplaintDto,
  CreatePostalRecordDto,
  UpdateEnquiryDto,
  UpdateCallLogDto,
  UpdateVisitorLogDto,
  UpdateComplaintDto,
  UpdatePostalRecordDto,
} from './dto/reception.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Reception')
@Controller('reception')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class ReceptionController {
  constructor(private readonly receptionService: ReceptionService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateEnquiryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Enquiry' })
  @Post('enquiries')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  createEnquiry(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateEnquiryDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.receptionService.createEnquiry(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Enquiries' })
  @Get('enquiries')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getEnquiries(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId: string,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId!;
    return this.receptionService.getEnquiries(effectiveBranchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateEnquiryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Enquiry' })
  @Post('enquiries/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  updateEnquiry(@Param('id') id: string, @Body() dto: UpdateEnquiryDto, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.updateEnquiry(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Enquiry' })
  @Delete('enquiries/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  deleteEnquiry(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.deleteEnquiry(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateCallLogDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Call Log' })
  @Post('call-logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  createCallLog(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateCallLogDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.receptionService.createCallLog(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Call Logs' })
  @Get('call-logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getCallLogs(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId: string,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId!;
    return this.receptionService.getCallLogs(effectiveBranchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateCallLogDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Call Log' })
  @Post('call-logs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  updateCallLog(@Param('id') id: string, @Body() dto: UpdateCallLogDto, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.updateCallLog(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Call Log' })
  @Delete('call-logs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  deleteCallLog(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.deleteCallLog(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateVisitorLogDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Visitor Log' })
  @Post('visitor-logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  createVisitorLog(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateVisitorLogDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.receptionService.createVisitorLog(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Visitor Logs' })
  @Get('visitor-logs')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getVisitorLogs(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId: string,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId!;
    return this.receptionService.getVisitorLogs(effectiveBranchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateVisitorLogDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Visitor Log' })
  @Post('visitor-logs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  updateVisitorLog(@Param('id') id: string, @Body() dto: UpdateVisitorLogDto, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.updateVisitorLog(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Visitor Log' })
  @Delete('visitor-logs/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  deleteVisitorLog(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.deleteVisitorLog(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateComplaintDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Complaint' })
  @Post('complaints')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  createComplaint(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreateComplaintDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.receptionService.createComplaint(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Complaints' })
  @Get('complaints')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getComplaints(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId: string,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId!;
    return this.receptionService.getComplaints(effectiveBranchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateComplaintDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Complaint' })
  @Post('complaints/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  updateComplaint(@Param('id') id: string, @Body() dto: UpdateComplaintDto, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.updateComplaint(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Complaint' })
  @Delete('complaints/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  deleteComplaint(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.deleteComplaint(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreatePostalRecordDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Postal Record' })
  @Post('postal-records')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  createPostalRecord(
    @GetTenantContext() ctx: TenantContext,
    @Body() dto: CreatePostalRecordDto,
  ) {
    if (!dto.branchId && ctx.branchId) {
      dto.branchId = ctx.branchId;
    }
    return this.receptionService.createPostalRecord(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Postal Records' })
  @Get('postal-records')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  getPostalRecords(
    @GetTenantContext() ctx: TenantContext,
    @Query('branchId') branchId: string,
  ) {
    const effectiveBranchId =
      ctx.role === UserRole.SUPER_ADMIN ? branchId : ctx.branchId!;
    return this.receptionService.getPostalRecords(effectiveBranchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdatePostalRecordDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Update Postal Record' })
  @Post('postal-records/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  updatePostalRecord(
    @Param('id') id: string,
    @Body() dto: UpdatePostalRecordDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.receptionService.updatePostalRecord(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Postal Record' })
  @Delete('postal-records/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
  deletePostalRecord(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.receptionService.deletePostalRecord(id, ctx);
  }
}
