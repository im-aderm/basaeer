import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
  Delete,
} from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole } from '../generated/client/client';
import {
  SendMessageDto,
  CreateConversationDto,
  CreateAlumniDto,
  CreateAlumniEventDto,
  UpdateAlumniEventParticipationDto,
} from './dto/stakeholder.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Stakeholder')
@Controller('stakeholder')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class StakeholderController {
  constructor(private readonly stakeholderService: StakeholderService) {}

  // --- PARENT PORTAL ---

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Children' })
  @Get('parent/children')
  @Roles(UserRole.PARENT)
  getChildren(@GetTenantContext() ctx: TenantContext) {
    return this.stakeholderService.getChildren(ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Child Attendance' })
  @Get('parent/child/:id/attendance')
  @Roles(UserRole.PARENT)
  getChildAttendance(
    @Param('id') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.getChildAttendance(studentId, ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Child Financials' })
  @Get('parent/child/:id/financials')
  @Roles(UserRole.PARENT)
  getChildFinancials(
    @Param('id') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.getChildFinancials(studentId, ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Child Homework' })
  @Get('parent/child/:id/homework')
  @Roles(UserRole.PARENT)
  getChildHomework(
    @Param('id') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.getChildHomework(studentId, ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Child Exams' })
  @Get('parent/child/:id/exams')
  @Roles(UserRole.PARENT)
  getChildExams(
    @Param('id') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.getChildExams(studentId, ctx.userId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Parent Events' })
  @Get('parent/events')
  @Roles(UserRole.PARENT)
  getParentEvents(@GetTenantContext() ctx: TenantContext) {
    return this.stakeholderService.getParentEvents(ctx.userId);
  }

  // --- ADMIN PARENT MANAGEMENT ---

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Parents' })
  @Get('admin/parents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getAllParents(@Query('branchId') branchId: string) {
    return this.stakeholderService.getAllParentsAdmin(branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Parent Details' })
  @Get('admin/parents/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getParentDetails(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.stakeholderService.getParentDetailsAdmin(id, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Link Student' })
  @Post('admin/parents/:id/students/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  linkStudent(
    @Param('id') parentId: string,
    @Param('studentId') studentId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.linkStudentToParent(parentId, studentId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Unlink Student' })
  @Delete('admin/parents/students/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  unlinkStudent(@Param('studentId') studentId: string, @GetTenantContext() ctx: TenantContext) {
    return this.stakeholderService.unlinkStudentFromParent(studentId, ctx);
  }

  // --- MESSAGING ---

  @ApiBearerAuth()
  @ApiBody({ type: CreateConversationDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Conversation' })
  @Post('messaging/conversation')
  createConversation(
    @Body() dto: CreateConversationDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.createConversation(
      ctx.userId,
      ctx.branchId!,
      dto,
    );
  }

  @ApiBearerAuth()
  @ApiBody({ type: SendMessageDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Message' })
  @Post('messaging/send')
  sendMessage(
    @Body() dto: SendMessageDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.sendMessage(ctx.userId, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Conversations' })
  @Get('messaging/conversations')
  getConversations(@GetTenantContext() ctx: TenantContext) {
    return this.stakeholderService.getConversations(ctx.userId);
  }

  // --- ALUMNI ---

  @ApiBearerAuth()
  @ApiBody({ type: CreateAlumniDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Alumni' })
  @Post('alumni')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  createAlumni(
    @Body() dto: CreateAlumniDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.createAlumni(ctx.branchId!, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Alumni' })
  @Get('alumni')
  getAlumni(@Query('branchId') branchId: string) {
    return this.stakeholderService.getAlumni(branchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateAlumniEventDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Event' })
  @Post('alumni/event')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  createEvent(
    @Body() dto: CreateAlumniEventDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.stakeholderService.createAlumniEvent(ctx.branchId!, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Events' })
  @Get('alumni/events')
  getEvents(@Query('branchId') branchId: string) {
    return this.stakeholderService.getAlumniEvents(branchId);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateAlumniEventParticipationDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Rsvp Event' })
  @Post('alumni/event/:id/rsvp')
  rsvpEvent(
    @Param('id') eventId: string,
    @Body() dto: UpdateAlumniEventParticipationDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    // In a real scenario, we'd find the alumni record linked to this user
    // For now, assuming user.id relates to an alumni entry
    return this.stakeholderService.rsvpEvent(ctx.userId, eventId, dto.status);
  }
}
