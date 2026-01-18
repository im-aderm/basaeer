import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { CreateCampusEventDto, UpdateEventRSVPDto } from './dto/events.dto';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    create(@Body() dto: CreateCampusEventDto, @Request() req) {
        return this.eventsService.createEvent(req.user.branchId, dto);
    }

    @Get()
    findAll(@Request() req, @Query('isPublic') isPublic?: string) {
        const publicOnly = isPublic === 'true' ? true : (isPublic === 'false' ? false : undefined);
        return this.eventsService.getEvents(req.user.branchId, publicOnly);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.getEventDetails(id);
    }

    @Post(':id/rsvp')
    rsvp(@Param('id') id: string, @Body() dto: UpdateEventRSVPDto, @Request() req) {
        return this.eventsService.updateRSVP(id, req.user.id, dto);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    remove(@Param('id') id: string) {
        return this.eventsService.deleteEvent(id);
    }
}
