import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
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
    RecordParticipantDto
} from './dto/live-classes.dto';

@Controller('live-classes')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class LiveClassesController {
    constructor(private readonly liveClassesService: LiveClassesService) { }

    // ==================== Configuration Endpoints ====================

    @Post('config')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    createOrUpdateConfig(@Body() dto: CreateGoogleMeetConfigDto) {
        return this.liveClassesService.createOrUpdateConfig(dto);
    }

    @Get('config')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getConfig(@Request() req) {
        return this.liveClassesService.getConfig(req.user.branchId);
    }

    @Post('config/test')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    testConnection(@Request() req) {
        return this.liveClassesService.testConnection(req.user.branchId);
    }

    // ==================== Session Management Endpoints ====================

    @Post('sessions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    async createSession(@Request() req, @Body() dto: CreateSessionDto) {
        // Get staff ID from user
        const staff = await this.liveClassesService['prisma'].staff.findUnique({
            where: { userId: req.user.id },
        });

        if (!staff) {
            throw new Error('Staff profile not found');
        }

        return this.liveClassesService.createSession(req.user.branchId, staff.id, dto);
    }

    @Get('sessions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    getSessions(
        @Request() req,
        @Query('status') status?: string,
        @Query('classId') classId?: string,
        @Query('sectionId') sectionId?: string,
        @Query('hostId') hostId?: string
    ) {
        return this.liveClassesService.getSessions(req.user.branchId, {
            status,
            classId,
            sectionId,
            hostId,
        });
    }

    @Get('sessions/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    getSessionById(@Param('id') id: string) {
        return this.liveClassesService.getSessionById(id);
    }

    @Patch('sessions/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    updateSession(@Param('id') id: string, @Body() dto: UpdateSessionDto) {
        return this.liveClassesService.updateSession(id, dto);
    }

    @Post('sessions/:id/start')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    startSession(@Param('id') id: string) {
        return this.liveClassesService.startSession(id);
    }

    @Post('sessions/:id/end')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    endSession(@Param('id') id: string) {
        return this.liveClassesService.endSession(id);
    }

    @Delete('sessions/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    cancelSession(@Param('id') id: string, @Request() req) {
        return this.liveClassesService.cancelSession(id, req.user.branchId);
    }

    // ==================== Participant Management Endpoints ====================

    @Post('sessions/:id/participants')
    recordParticipant(@Param('id') sessionId: string, @Body() dto: RecordParticipantDto) {
        return this.liveClassesService.recordParticipant(sessionId, dto);
    }

    @Get('sessions/:id/participants')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getParticipants(@Param('id') sessionId: string) {
        return this.liveClassesService.getParticipants(sessionId);
    }

    @Get('sessions/:id/attendance')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getAttendanceReport(@Param('id') sessionId: string) {
        return this.liveClassesService.getAttendanceReport(sessionId);
    }
}
