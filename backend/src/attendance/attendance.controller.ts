import { Controller, Get, Post, Body, Query, UseGuards, Param, Patch } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { AttendanceSessionService } from './attendance-session.service';

import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(
        private readonly attendanceService: AttendanceService,
        private readonly sessionService: AttendanceSessionService
    ) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markAttendance(@Body() dto: CreateAttendanceDto, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.markAttendance(dto, context);
    }

    @Post('bulk')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markBulkAttendance(@Body() dto: { records: CreateAttendanceDto[] }, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.markBulkAttendance(dto, context);
    }

    // QR Scanning
    @Post('scan')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async processQR(
        @Body() dto: { payload: string, sessionId: string },
        @GetTenantContext() context: TenantContext,
    ) {
        return this.attendanceService.processQRScan(dto.payload, dto.sessionId, context);
    }

    // Sessions
    @Post('sessions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async createSession(
        @Body() dto: { name?: string, classId?: string, sectionId?: string, subjectId?: string, date?: string },
        @GetTenantContext() context: TenantContext,
    ) {
        return this.sessionService.createSession(dto, context);
    }

    @Get('sessions/active')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async getActiveSessions(@GetTenantContext() context: TenantContext) {
        return this.sessionService.getActiveSessions(context);
    }

    @Patch('sessions/:id/close')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async closeSession(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
        return this.sessionService.closeSession(id, context);
    }

    @Get('sessions/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async getSession(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
        return this.sessionService.getSessionDetails(id, context);
    }

    @Get('section')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    findBySection(
        @Query('sectionId') sectionId: string, 
        @Query('date') date: string, 
        @GetTenantContext() context: TenantContext,
        @Query('skip') skip?: string,
        @Query('take') take?: string
    ) {
        const skipNum = skip ? parseInt(skip, 10) : undefined;
        const takeNum = take ? parseInt(take, 10) : undefined;
        return this.attendanceService.findBySectionAndDate(sectionId, date, context, skipNum, takeNum);
    }

    @Get('student/:id')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    getStudentAttendance(@Param('id') studentId: string, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.getStudentAttendance(studentId, context);
    }

    @Get('stats')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    getStats(@GetTenantContext() context: TenantContext) {
        return this.attendanceService.getStats(context);
    }
}
