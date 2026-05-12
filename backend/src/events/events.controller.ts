import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { CreateCampusEventDto, UpdateEventRSVPDto } from './dto/events.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateCampusEventDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(
    @Body() dto: CreateCampusEventDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.createEvent(ctx.branchId || '', dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve ings' })
  @Get()
  findings(
    @GetTenantContext() ctx: TenantContext,
    @Query('isPublic') isPublic?: string,
  ) {
    const publicOnly =
      isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.eventsService.getEvents(ctx.branchId || '', publicOnly);
  }

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.getEventDetails(id);
  }

  @ApiBody({ type: UpdateEventRSVPDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Rsvp' })
  @Post(':id/rsvp')
  rsvp(
    @Param('id') id: string,
    @Body() dto: UpdateEventRSVPDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.updateRSVP(id, ctx.userId, dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string) {
    return this.eventsService.deleteEvent(id);
  }
}
