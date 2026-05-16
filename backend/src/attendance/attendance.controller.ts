import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { AttendanceSessionService } from './attendance-session.service';

import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Attendance')
@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
    private readonly sessionService: AttendanceSessionService,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateAttendanceDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Mark Attendance' })
  @Post()
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  markAttendance(
    @Body() dto: CreateAttendanceDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.markAttendance(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Mark Bulk Attendance' })
  @Post('bulk')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  markBulkAttendance(
    @Body() dto: { records: CreateAttendanceDto[] },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.markBulkAttendance(dto, context);
  }

  // QR Scanning
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Process Q R' })
  @Post('scan')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async processQR(
    @Body() dto: { payload: string; sessionId: string },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.processQRScan(
      dto.payload,
      dto.sessionId,
      context,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Sync Scans' })
  @Post('scan/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async bulkSyncScans(
    @Body()
    dto: {
      scans: { payload: string; sessionId: string; timestamp?: string }[];
    },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.bulkSyncScans(dto, context);
  }

  // Sessions
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Session' })
  @Post('sessions')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async createSession(
    @Body()
    dto: {
      name?: string;
      classId?: string;
      sectionId?: string;
      subjectId?: string;
      date?: string;
    },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionService.createSession(dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Active Sessions' })
  @Get('sessions/active')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async getActiveSessions(@GetTenantContext() context: TenantContext) {
    return this.sessionService.getActiveSessions(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Session' })
  @Patch('sessions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async updateSession(
    @Param('id') id: string,
    @Body() dto: any,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionService.updateSession(id, dto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Lock Session' })
  @Post('sessions/:id/lock')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async lockSession(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionService.lockSession(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Close Session' })
  @Patch('sessions/:id/close')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async closeSession(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionService.closeSession(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Session' })
  @Get('sessions/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  async getSession(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.sessionService.getSessionDetails(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Student Q R' })
  @Get('qr/:studentId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async getStudentQR(
    @Param('studentId') studentId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.getStudentQR(studentId, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Bulk Generate Q R' })
  @Post('qr/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  async bulkGenerateQR(
    @Body() dto: { studentIds: string[] },
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.bulkGenerateQR(dto.studentIds, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve By Section' })
  @Get('section')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  findBySection(
    @Query('sectionId') sectionId: string,
    @Query('date') date: string,
    @GetTenantContext() context: TenantContext,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const skipNum = skip ? parseInt(skip, 10) : undefined;
    const takeNum = take ? parseInt(take, 10) : undefined;
    return this.attendanceService.findBySectionAndDate(
      sectionId,
      date,
      context,
      skipNum,
      takeNum,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve resource' })
  @Get('student/:id')
  @Roles(
    UserRole.TEACHER,
    UserRole.BRANCH_ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.PARENT,
    UserRole.STUDENT,
  )
  getStudentAttendance(
    @Param('id') studentId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.getStudentAttendance(studentId, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Stats' })
  @Get('stats')
  @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  getStats(@GetTenantContext() context: TenantContext) {
    return this.attendanceService.getStats(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Trends' })
  @Get('analytics/trends')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  getTrends(
    @Query('days') days: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.getTrends(
      days ? parseInt(days, 10) : 30,
      context,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Chronic Absentees' })
  @Get('analytics/chronic')
  @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
  getChronicAbsentees(
    @Query('threshold') threshold: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.attendanceService.getChronicAbsentees(
      threshold ? parseFloat(threshold) : 20,
      context,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Teacher — Get My Class Attendance' })
  @Get('my-class')
  @Roles(UserRole.TEACHER)
  getMyClassAttendance(@GetTenantContext() context: TenantContext) {
    return this.attendanceService.getMyClassAttendance(context);
  }
}
