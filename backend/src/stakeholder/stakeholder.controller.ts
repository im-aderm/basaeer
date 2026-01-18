import { Controller, Get, Post, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { StakeholderService } from './stakeholder.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import {
    SendMessageDto,
    CreateConversationDto,
    CreateAlumniDto,
    CreateAlumniEventDto,
    UpdateAlumniEventParticipationDto
} from './dto/stakeholder.dto';

@Controller('stakeholder')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StakeholderController {
    constructor(private readonly stakeholderService: StakeholderService) { }

    // --- PARENT PORTAL ---

    @Get('parent/children')
    @Roles(UserRole.PARENT)
    getChildren(@Request() req) {
        return this.stakeholderService.getChildren(req.user.id);
    }

    @Get('parent/child/:id/attendance')
    @Roles(UserRole.PARENT)
    getChildAttendance(@Param('id') studentId: string, @Request() req) {
        return this.stakeholderService.getChildAttendance(studentId, req.user.id);
    }

    @Get('parent/child/:id/financials')
    @Roles(UserRole.PARENT)
    getChildFinancials(@Param('id') studentId: string, @Request() req) {
        return this.stakeholderService.getChildFinancials(studentId, req.user.id);
    }

    // --- MESSAGING ---

    @Post('messaging/conversation')
    createConversation(@Body() dto: CreateConversationDto, @Request() req) {
        return this.stakeholderService.createConversation(req.user.id, req.user.branchId, dto);
    }

    @Post('messaging/send')
    sendMessage(@Body() dto: SendMessageDto, @Request() req) {
        return this.stakeholderService.sendMessage(req.user.id, dto);
    }

    @Get('messaging/conversations')
    getConversations(@Request() req) {
        return this.stakeholderService.getConversations(req.user.id);
    }

    // --- ALUMNI ---

    @Post('alumni')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createAlumni(@Body() dto: CreateAlumniDto, @Request() req) {
        return this.stakeholderService.createAlumni(req.user.branchId, dto);
    }

    @Get('alumni')
    getAlumni(@Query('branchId') branchId: string) {
        return this.stakeholderService.getAlumni(branchId);
    }

    @Post('alumni/event')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createEvent(@Body() dto: CreateAlumniEventDto, @Request() req) {
        return this.stakeholderService.createAlumniEvent(req.user.branchId, dto);
    }

    @Get('alumni/events')
    getEvents(@Query('branchId') branchId: string) {
        return this.stakeholderService.getAlumniEvents(branchId);
    }

    @Post('alumni/event/:id/rsvp')
    rsvpEvent(@Param('id') eventId: string, @Body() dto: UpdateAlumniEventParticipationDto, @Request() req) {
        // In a real scenario, we'd find the alumni record linked to this user
        // For now, assuming user.id relates to an alumni entry
        return this.stakeholderService.rsvpEvent(req.user.id, eventId, dto.status);
    }
}
