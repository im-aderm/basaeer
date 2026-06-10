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
  Patch,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { Public } from '../auth/public.decorator';
import { Throttle } from '@nestjs/throttler';
import {
  CreateCampusEventDto,
  UpdateCampusEventDto,
  UpdateEventRSVPDto,
  CreateEventApplicationDto,
  UpdateApplicationStatusDto,
  VerifyPaymentDto,
} from './dto/events.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import * as https from 'https';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // --- Public Marketing Endpoints ---

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve public events' })
  @Get('public')
  findPublic(
    @Query('branchId') branchId?: string,
    @Query('category') category?: string,
  ) {
    return this.eventsService.getPublicEvents(branchId, category);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve a public event by slug' })
  @Get('public/:slug')
  findPublicBySlug(@Param('slug') slug: string) {
    return this.eventsService.getPublicEventBySlug(slug);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiBody({ type: CreateEventApplicationDto })
  @ApiResponse({ status: 201, description: 'Application submitted successfully' })
  @ApiOperation({ summary: 'Submit public event application' })
  @Post('public/:slug/apply')
  async apply(
    @Param('slug') slug: string,
    @Body() dto: CreateEventApplicationDto,
    @Query('captchaToken') captchaToken?: string,
  ) {
    // Honeypot spam protection: if honeypot field is filled, silently reject
    if ((dto as any).honeypot) {
      throw new HttpException('Request rejected', HttpStatus.BAD_REQUEST);
    }

    // CAPTCHA verification: Google reCAPTCHA v2
    const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
    if (recaptchaSecret && captchaToken) {
      const verified = await this.verifyRecaptcha(captchaToken, recaptchaSecret);
      if (!verified) {
        throw new BadRequestException('CAPTCHA verification failed');
      }
    } else if (!recaptchaSecret) {
      // Dev mode: skip CAPTCHA if no secret key configured
      // In production, RECAPTCHA_SECRET_KEY must be set
    }

    return this.eventsService.submitApplication(slug, dto);
  }

  private async verifyRecaptcha(token: string, secret: string): Promise<boolean> {
    return new Promise((resolve) => {
      const data = `secret=${encodeURIComponent(secret)}&response=${encodeURIComponent(token)}`;
      const req = https.request(
        {
          hostname: 'www.google.com',
          path: '/recaptcha/api/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(data),
          },
        },
        (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => {
            try {
              const response = JSON.parse(body);
              resolve(!!response.success);
            } catch {
              resolve(false);
            }
          });
        },
      );
      req.on('error', () => resolve(false));
      req.write(data);
      req.end();
    });
  }

  // --- Admin/Staff Dashboard Endpoints ---

  @ApiBearerAuth()
  @ApiBody({ type: CreateCampusEventDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create event' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  create(
    @Body() dto: CreateCampusEventDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    const effectiveBranchId = ctx.branchId || dto.seoMetadata?.branchId || '';
    return this.eventsService.createEvent(effectiveBranchId, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve analytics for events' })
  @Get('analytics')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  getAnalytics(@GetTenantContext() ctx: TenantContext) {
    return this.eventsService.getAnalytics(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve all applications' })
  @Get('applications/all')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  getAllApplications(@GetTenantContext() ctx: TenantContext) {
    return this.eventsService.getAllApplications(ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve applications for specific event' })
  @Get(':id/applications')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  getEventApplications(
    @Param('id') eventId: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.getApplications(eventId, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve application details' })
  @Get('applications/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  getApplicationDetails(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.getApplicationDetails(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateApplicationStatusDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update event application status' })
  @Patch('applications/:id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateApplicationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.updateApplicationStatus(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: VerifyPaymentDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Verify application payment receipt' })
  @Patch('applications/:id/payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.ACCOUNTANT)
  verifyPayment(
    @Param('id') id: string,
    @Body() dto: VerifyPaymentDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.verifyPayment(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete event application' })
  @Delete('applications/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteApplication(
    @Param('id') id: string,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.deleteApplication(id, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve events list' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  find(
    @GetTenantContext() ctx: TenantContext,
    @Query('isPublic') isPublic?: string,
  ) {
    const publicOnly =
      isPublic === 'true' ? true : isPublic === 'false' ? false : undefined;
    return this.eventsService.getEvents(ctx, publicOnly);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve single event details' })
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.eventsService.getEventDetails(id, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateCampusEventDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update event' })
  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCampusEventDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.updateEvent(id, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateEventRSVPDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create RSVP' })
  @Post(':id/rsvp')
  rsvp(
    @Param('id') id: string,
    @Body() dto: UpdateEventRSVPDto,
    @GetTenantContext() ctx: TenantContext,
  ) {
    return this.eventsService.updateRSVP(id, ctx.userId, dto, ctx);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete event' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() ctx: TenantContext) {
    return this.eventsService.deleteEvent(id, ctx);
  }
}
