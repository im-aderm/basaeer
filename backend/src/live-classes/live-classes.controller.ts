import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LiveClassesService } from './live-classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { Permissions } from '../auth/permissions.decorator';
import { UserRole } from '../generated/client/client';
import {
  CreateGoogleMeetConfigDto,
  UpdateGoogleMeetConfigDto,
  CreateSessionDto,
  UpdateSessionDto,
  RecordParticipantDto,
} from './dto/live-classes.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { PermissionsGuard } from '../auth/permissions.guard';

@ApiTags('Live Classes')
@Controller('live-classes')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard, PermissionsGuard)
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  // ==================== Configuration Endpoints ====================

  @ApiBearerAuth()
  @ApiBody({ type: CreateGoogleMeetConfigDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Or Update Config' })
  @Post('config')
  @Permissions('live-classes:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createOrUpdateConfig(@Body() dto: CreateGoogleMeetConfigDto) {
    return this.liveClassesService.createOrUpdateConfig(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Config' })
  @Get('config')
  @Permissions('live-classes:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getConfig(@Request() req: any) {
    return this.liveClassesService.getConfig(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Test Connection' })
  @Post('config/test')
  @Permissions('live-classes:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  testConnection(@Request() req: any) {
    return this.liveClassesService.testConnection(req.user.branchId);
  }

  // ==================== Session Management Endpoints ====================

  @ApiBearerAuth()
  @ApiBody({ type: CreateSessionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Session' })
  @Post('sessions')
  @Permissions('live-classes:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async createSession(@Request() req: any, @Body() dto: CreateSessionDto) {
    // Get staff ID from user
    const staff = await this.liveClassesService['prisma'].staff.findUnique({
      where: { userId: req.user.id },
    });

    if (!staff) {
      throw new Error('Staff profile not found');
    }

    return this.liveClassesService.createSession(
      req.user.branchId,
      staff.id,
      dto,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Sessions' })
  @Get('sessions')
  @Permissions('live-classes:read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  getSessions(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('classId') classId?: string,
    @Query('sectionId') sectionId?: string,
    @Query('hostId') hostId?: string,
  ) {
    return this.liveClassesService.getSessions(req.user.branchId, {
      status,
      classId,
      sectionId,
      hostId,
    });
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Session By Id' })
  @Get('sessions/:id')
  @Permissions('live-classes:read')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  getSessionById(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.liveClassesService.getSessionById(id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Session' })
  @Patch('sessions/:id')
  @Permissions('live-classes:update')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.liveClassesService.updateSession(id, ctx.branchId!, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Start Session' })
  @Post('sessions/:id/start')
  @Permissions('live-classes:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  startSession(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.liveClassesService.startSession(id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create End Session' })
  @Post('sessions/:id/end')
  @Permissions('live-classes:create')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  endSession(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.liveClassesService.endSession(id, ctx.branchId!);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Session' })
  @Delete('sessions/:id')
  @Permissions('live-classes:delete')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  cancelSession(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.liveClassesService.cancelSession(id, ctx.branchId!);
  }

  // ==================== Participant Management Endpoints ====================

  @ApiBearerAuth()
  @ApiBody({ type: RecordParticipantDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Participant' })
  @Post('sessions/:id/participants')
  @Permissions('live-classes:create')
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  recordParticipant(
    @Param('id') sessionId: string,
    @Body() dto: RecordParticipantDto,
  ) {
    return this.liveClassesService.recordParticipant(sessionId, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Participants' })
  @Get('sessions/:id/participants')
  @Permissions('live-classes:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getParticipants(@Param('id') sessionId: string) {
    return this.liveClassesService.getParticipants(sessionId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Attendance Report' })
  @Get('sessions/:id/attendance')
  @Permissions('live-classes:read')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getAttendanceReport(
    @Param('id') sessionId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.liveClassesService.getAttendanceReport(sessionId, ctx.branchId!);
  }
}
