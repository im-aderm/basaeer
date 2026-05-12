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
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
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

@ApiTags('Live Classes')
@Controller('live-classes')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class LiveClassesController {
  constructor(private readonly liveClassesService: LiveClassesService) {}

  // ==================== Configuration Endpoints ====================

  @ApiBearerAuth()
  @ApiBody({ type: CreateGoogleMeetConfigDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Or Update Config' })
  @Post('config')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createOrUpdateConfig(@Body() dto: CreateGoogleMeetConfigDto) {
    return this.liveClassesService.createOrUpdateConfig(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Config' })
  @Get('config')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getConfig(@Request() req: any) {
    return this.liveClassesService.getConfig(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Test Connection' })
  @Post('config/test')
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
  @Roles(
    UserRole.SUPER_ADMIN,
    UserRole.BRANCH_ADMIN,
    UserRole.TEACHER,
    UserRole.STUDENT,
  )
  getSessionById(@Param('id') id: string) {
    return this.liveClassesService.getSessionById(id);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateSessionDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Session' })
  @Patch('sessions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
    return this.liveClassesService.updateSession(id, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Start Session' })
  @Post('sessions/:id/start')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  startSession(@Param('id') id: string) {
    return this.liveClassesService.startSession(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create End Session' })
  @Post('sessions/:id/end')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  endSession(@Param('id') id: string) {
    return this.liveClassesService.endSession(id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete Session' })
  @Delete('sessions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  cancelSession(@Param('id') id: string, @Request() req: any) {
    return this.liveClassesService.cancelSession(id, req.user.branchId);
  }

  // ==================== Participant Management Endpoints ====================

  @ApiBearerAuth()
  @ApiBody({ type: RecordParticipantDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Participant' })
  @Post('sessions/:id/participants')
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
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getParticipants(@Param('id') sessionId: string) {
    return this.liveClassesService.getParticipants(sessionId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Attendance Report' })
  @Get('sessions/:id/attendance')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  getAttendanceReport(@Param('id') sessionId: string) {
    return this.liveClassesService.getAttendanceReport(sessionId);
  }
}
