import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AlumniService } from './alumni.service';
import {
  CreateAlumniProfileDto,
  UpdateAlumniProfileDto,
  CreateAlumniEventDto,
} from './dto/alumni.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Alumni')
@Controller('alumni')
export class AlumniController {
  constructor(private readonly alumniService: AlumniService) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateAlumniProfileDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Profile' })
  @Post('profile')
  createProfile(@Body() dto: CreateAlumniProfileDto) {
    return this.alumniService.createProfile(dto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Profiles' })
  @Get('profiles')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAllProfiles(@Req() req: any, @Query('year') year?: string) {
    return this.alumniService.findAllProfiles(
      req.user.branchId,
      year ? parseInt(year) : undefined,
    );
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve My Profile' })
  @Get('profile/me')
  getMyProfile(@Req() req: any) {
    return this.alumniService.getProfile(req.user.id);
  }

  @ApiBody({ type: UpdateAlumniProfileDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update Profile' })
  @Patch('profile/:id')
  updateProfile(@Param('id') id: string, @Body() dto: UpdateAlumniProfileDto) {
    return this.alumniService.updateProfile(id, dto);
  }

  @ApiBearerAuth()
  @ApiBody({ type: CreateAlumniEventDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Event' })
  @Post('events')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createEvent(@Body() dto: CreateAlumniEventDto, @Req() req: any) {
    return this.alumniService.createEvent(dto, req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All Events' })
  @Get('events')
  findAllEvents(@Req() req: any) {
    return this.alumniService.findAllEvents(req.user.branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create For Event' })
  @Post('events/:id/register')
  registerForEvent(@Param('id') id: string, @Req() req: any) {
    return this.alumniService.registerForEvent(id, req.user.id);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Event Attendees' })
  @Get('events/:id/attendees')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getEventAttendees(@Param('id') id: string) {
    return this.alumniService.getEventAttendees(id);
  }
}
