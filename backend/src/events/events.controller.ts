import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { CreateCampusEventDto, UpdateEventRSVPDto } from './dto/events.dto';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    create(@Body() dto: CreateCampusEventDto, @GetTenantContext() ctx: TenantContext) {
        return this.eventsService.createEvent(ctx.branchId || '', dto);
    }

    @Get()
    findings(@GetTenantContext() ctx: TenantContext, @Query('isPublic') isPublic?: string) {
        const publicOnly = isPublic === 'true' ? true : (isPublic === 'false' ? false : undefined);
        return this.eventsService.getEvents(ctx.branchId || '', publicOnly);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.getEventDetails(id);
    }

    @Post(':id/rsvp')
    rsvp(@Param('id') id: string, @Body() dto: UpdateEventRSVPDto, @GetTenantContext() ctx: TenantContext) {
        return this.eventsService.updateRSVP(id, ctx.userId, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@Param('id') id: string) {
        return this.eventsService.deleteEvent(id);
    }
}
