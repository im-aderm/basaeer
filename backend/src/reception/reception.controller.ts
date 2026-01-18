import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ReceptionService } from './reception.service';
import {
    CreateEnquiryDto,
    CreateCallLogDto,
    CreateVisitorLogDto,
    CreateComplaintDto,
    CreatePostalRecordDto
} from './dto/reception.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client';

@Controller('reception')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReceptionController {
    constructor(private readonly receptionService: ReceptionService) { }

    @Post('enquiries')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createEnquiry(@Body() dto: CreateEnquiryDto) {
        return this.receptionService.createEnquiry(dto);
    }

    @Get('enquiries')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getEnquiries(@Query('branchId') branchId: string) {
        return this.receptionService.getEnquiries(branchId);
    }

    @Post('call-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createCallLog(@Body() dto: CreateCallLogDto) {
        return this.receptionService.createCallLog(dto);
    }

    @Get('call-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getCallLogs(@Query('branchId') branchId: string) {
        return this.receptionService.getCallLogs(branchId);
    }

    @Post('visitor-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createVisitorLog(@Body() dto: CreateVisitorLogDto) {
        return this.receptionService.createVisitorLog(dto);
    }

    @Get('visitor-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getVisitorLogs(@Query('branchId') branchId: string) {
        return this.receptionService.getVisitorLogs(branchId);
    }

    @Post('complaints')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createComplaint(@Body() dto: CreateComplaintDto) {
        return this.receptionService.createComplaint(dto);
    }

    @Get('complaints')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getComplaints(@Query('branchId') branchId: string) {
        return this.receptionService.getComplaints(branchId);
    }

    @Post('postal-records')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createPostalRecord(@Body() dto: CreatePostalRecordDto) {
        return this.receptionService.createPostalRecord(dto);
    }

    @Get('postal-records')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getPostalRecords(@Query('branchId') branchId: string) {
        return this.receptionService.getPostalRecords(branchId);
    }
}
