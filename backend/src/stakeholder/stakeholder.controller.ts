import { Controller, Get, Post, Body, Param, UseGuards, Request, Query, Delete } from '@nestjs/common';
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
    UpdateAlumniEventParticipationDto
} from './dto/stakeholder.dto';

@Controller('stakeholder')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class StakeholderController {
    constructor(private readonly stakeholderService: StakeholderService) { }

    // --- PARENT PORTAL ---

    @Get('parent/children')
    @Roles(UserRole.PARENT)
    getChildren(@GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getChildren(ctx.userId);
    }

    @Get('parent/child/:id/attendance')
    @Roles(UserRole.PARENT)
    getChildAttendance(@Param('id') studentId: string, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getChildAttendance(studentId, ctx.userId);
    }

    @Get('parent/child/:id/financials')
    @Roles(UserRole.PARENT)
    getChildFinancials(@Param('id') studentId: string, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getChildFinancials(studentId, ctx.userId);
    }

    @Get('parent/child/:id/homework')
    @Roles(UserRole.PARENT)
    getChildHomework(@Param('id') studentId: string, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getChildHomework(studentId, ctx.userId);
    }

    @Get('parent/child/:id/exams')
    @Roles(UserRole.PARENT)
    getChildExams(@Param('id') studentId: string, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getChildExams(studentId, ctx.userId);
    }

    @Get('parent/events')
    @Roles(UserRole.PARENT)
    getParentEvents(@GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getParentEvents(ctx.userId);
    }

    // --- ADMIN PARENT MANAGEMENT ---

    @Get('admin/parents')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getAllParents(@Query('branchId') branchId: string) {
        return this.stakeholderService.getAllParentsAdmin(branchId);
    }

    @Get('admin/parents/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    getParentDetails(@Param('id') id: string) {
        return this.stakeholderService.getParentDetailsAdmin(id);
    }

    @Post('admin/parents/:id/students/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    linkStudent(@Param('id') parentId: string, @Param('studentId') studentId: string) {
        return this.stakeholderService.linkStudentToParent(parentId, studentId);
    }

    @Delete('admin/parents/students/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    unlinkStudent(@Param('studentId') studentId: string) {
        return this.stakeholderService.unlinkStudentFromParent(studentId);
    }

    // --- MESSAGING ---

    @Post('messaging/conversation')
    createConversation(@Body() dto: CreateConversationDto, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.createConversation(ctx.userId, ctx.branchId, dto);
    }

    @Post('messaging/send')
    sendMessage(@Body() dto: SendMessageDto, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.sendMessage(ctx.userId, dto);
    }

    @Get('messaging/conversations')
    getConversations(@GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.getConversations(ctx.userId);
    }

    // --- ALUMNI ---

    @Post('alumni')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createAlumni(@Body() dto: CreateAlumniDto, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.createAlumni(ctx.branchId, dto);
    }

    @Get('alumni')
    getAlumni(@Query('branchId') branchId: string) {
        return this.stakeholderService.getAlumni(branchId);
    }

    @Post('alumni/event')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createEvent(@Body() dto: CreateAlumniEventDto, @GetTenantContext() ctx: TenantContext) {
        return this.stakeholderService.createAlumniEvent(ctx.branchId, dto);
    }

    @Get('alumni/events')
    getEvents(@Query('branchId') branchId: string) {
        return this.stakeholderService.getAlumniEvents(branchId);
    }

    @Post('alumni/event/:id/rsvp')
    rsvpEvent(@Param('id') eventId: string, @Body() dto: UpdateAlumniEventParticipationDto, @GetTenantContext() ctx: TenantContext) {
        // In a real scenario, we'd find the alumni record linked to this user
        // For now, assuming user.id relates to an alumni entry
        return this.stakeholderService.rsvpEvent(ctx.userId, eventId, dto.status);
    }
}
