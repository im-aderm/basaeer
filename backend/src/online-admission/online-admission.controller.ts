import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { FileInterceptor } from '@nestjs/platform-express';
import { Queue } from 'bullmq';
import { OnlineAdmissionService } from './online-admission.service';
import { CreateOnlineAdmissionDto } from './dto/create-online-admission.dto';
import { UpdateOnlineAdmissionDto } from './dto/update-online-admission.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { Public } from '../auth/public.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@ApiTags('Online Admission')
@Controller('online-admissions')
export class OnlineAdmissionController {
  constructor(
    private readonly onlineAdmissionService: OnlineAdmissionService,
    @InjectQueue('admission-import') private importQueue: Queue,
  ) {}

  @Public()
  @ApiBody({ type: CreateOnlineAdmissionDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  create(@Body() createDto: CreateOnlineAdmissionDto) {
    if (!createDto.branchId) {
      throw new BadRequestException('branchId is required');
    }
    return this.onlineAdmissionService.create(createDto, undefined as any);
  }

  @Public()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve Public Init Data' })
  @Get('public/init/:branchId')
  getPublicInitData(@Param('branchId') branchId: string) {
    return this.onlineAdmissionService.getPublicInitData(branchId);
  }

  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.findAll(context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.findOne(id, context);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateOnlineAdmissionDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOnlineAdmissionDto,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.update(id, updateDto, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.remove(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Approve' })
  @Post(':id/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  approve(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body() approvalData: { classId?: string; sectionId?: string },
  ) {
    return this.onlineAdmissionService.approve(id, context, approvalData);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Reject' })
  @Post(':id/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.reject(id, reason, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Verify Payment' })
  @Post(':id/verify-payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  verifyPayment(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.verifyPayment(id, context);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create Reject Payment' })
  @Post(':id/reject-payment')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  rejectPayment(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @GetTenantContext() context: TenantContext,
  ) {
    return this.onlineAdmissionService.rejectPayment(id, reason, context);
  }

  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Import job queued successfully' })
  @ApiOperation({ summary: 'Bulk import admissions via ZIP file' })
  @Post('import')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async importAdmissions(
    @UploadedFile() file: Express.Multer.File,
    @Body('branchId') branchId: string,
    @GetTenantContext() context: TenantContext,
  ) {
    if (!file) {
      throw new BadRequestException('ZIP file is required');
    }
    if (!file.originalname.toLowerCase().endsWith('.zip')) {
      throw new BadRequestException('Only ZIP files are supported');
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException('ZIP file must be under 50MB');
    }

    const resolvedBranchId = branchId || context.branchId;
    if (!resolvedBranchId) {
      throw new BadRequestException('branchId is required');
    }

    const job = await this.importQueue.add('import-admission', {
      fileBuffer: file.buffer,
      context: {
        userId: (context as any).userId,
        branchId: resolvedBranchId,
        role: (context as any).role,
      },
    });

    return {
      success: true,
      jobId: job.id,
      message: 'Import job queued. Processing in background.',
    };
  }

  @Get('pipeline')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Pipeline statistics' })
  @ApiOperation({ summary: 'Get admission pipeline statistics' })
  getPipeline(@GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.getPipeline(context);
  }

  @Post(':id/make-offer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Offer made' })
  @ApiOperation({ summary: 'Make admission offer with class assignment' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        offeredClassId: { type: 'string' },
        offeredSectionId: { type: 'string' },
        reassignmentReason: { type: 'string' },
        offerDeadline: { type: 'string', format: 'date-time' },
      },
    },
  })
  makeOffer(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body() offerData: {
      offeredClassId?: string;
      offeredSectionId?: string;
      reassignmentReason?: string;
      offerDeadline?: string;
    },
  ) {
    return this.onlineAdmissionService.makeOffer(id, context, offerData);
  }

  @Post(':id/accept-offer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Offer accepted' })
  @ApiOperation({ summary: 'Accept admission offer' })
  acceptOffer(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.acceptOffer(id, context);
  }

  @Post(':id/decline-offer')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Offer declined' })
  @ApiOperation({ summary: 'Decline admission offer' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } } } })
  declineOffer(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body('reason') reason: string,
  ) {
    return this.onlineAdmissionService.declineOffer(id, reason, context);
  }

  @Post(':id/waitlist')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Added to waitlist' })
  @ApiOperation({ summary: 'Add applicant to waitlist' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        position: { type: 'number' },
        notes: { type: 'string' },
      },
    },
  })
  addToWaitlist(
    @Param('id') id: string,
    @GetTenantContext() context: TenantContext,
    @Body() data?: { position?: number; notes?: string },
  ) {
    return this.onlineAdmissionService.addToWaitlist(id, context, data);
  }

  @Post(':id/advance-waitlist')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @ApiBearerAuth()
  @ApiResponse({ status: 201, description: 'Advanced from waitlist' })
  @ApiOperation({ summary: 'Advance applicant from waitlist to offer' })
  advanceFromWaitlist(@Param('id') id: string, @GetTenantContext() context: TenantContext) {
    return this.onlineAdmissionService.advanceFromWaitlist(id, context);
  }
}
