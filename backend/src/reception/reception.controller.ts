import { Controller, Get, Post, Body, Query, UseGuards, Request, Param, Delete } from '@nestjs/common';
import { ReceptionService } from './reception.service';
import {
    CreateEnquiryDto,
    CreateCallLogDto,
    CreateVisitorLogDto,
    CreateComplaintDto,
    CreatePostalRecordDto,
    UpdateEnquiryDto,
    UpdateCallLogDto,
    UpdateVisitorLogDto,
    UpdateComplaintDto,
    UpdatePostalRecordDto
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
    createEnquiry(@Request() req, @Body() dto: CreateEnquiryDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.receptionService.createEnquiry(dto);
    }

    @Get('enquiries')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getEnquiries(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.receptionService.getEnquiries(effectiveBranchId);
    }

    @Post('enquiries/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    updateEnquiry(@Param('id') id: string, @Body() dto: UpdateEnquiryDto) {
        return this.receptionService.updateEnquiry(id, dto);
    }

    @Delete('enquiries/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    deleteEnquiry(@Param('id') id: string) {
        return this.receptionService.deleteEnquiry(id);
    }

    @Post('call-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createCallLog(@Request() req, @Body() dto: CreateCallLogDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.receptionService.createCallLog(dto);
    }

    @Get('call-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getCallLogs(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.receptionService.getCallLogs(effectiveBranchId);
    }

    @Post('call-logs/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    updateCallLog(@Param('id') id: string, @Body() dto: UpdateCallLogDto) {
        return this.receptionService.updateCallLog(id, dto);
    }

    @Delete('call-logs/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    deleteCallLog(@Param('id') id: string) {
        return this.receptionService.deleteCallLog(id);
    }

    @Post('visitor-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createVisitorLog(@Request() req, @Body() dto: CreateVisitorLogDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.receptionService.createVisitorLog(dto);
    }

    @Get('visitor-logs')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getVisitorLogs(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.receptionService.getVisitorLogs(effectiveBranchId);
    }

    @Post('visitor-logs/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    updateVisitorLog(@Param('id') id: string, @Body() dto: UpdateVisitorLogDto) {
        return this.receptionService.updateVisitorLog(id, dto);
    }

    @Delete('visitor-logs/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    deleteVisitorLog(@Param('id') id: string) {
        return this.receptionService.deleteVisitorLog(id);
    }

    @Post('complaints')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createComplaint(@Request() req, @Body() dto: CreateComplaintDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.receptionService.createComplaint(dto);
    }

    @Get('complaints')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getComplaints(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.receptionService.getComplaints(effectiveBranchId);
    }

    @Post('complaints/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    updateComplaint(@Param('id') id: string, @Body() dto: UpdateComplaintDto) {
        return this.receptionService.updateComplaint(id, dto);
    }

    @Delete('complaints/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    deleteComplaint(@Param('id') id: string) {
        return this.receptionService.deleteComplaint(id);
    }

    @Post('postal-records')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    createPostalRecord(@Request() req, @Body() dto: CreatePostalRecordDto) {
        if (!dto.branchId && req.user.branchId) {
            dto.branchId = req.user.branchId;
        }
        return this.receptionService.createPostalRecord(dto);
    }

    @Get('postal-records')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    getPostalRecords(@Request() req, @Query('branchId') branchId: string) {
        const effectiveBranchId = req.user.role === UserRole.SUPER_ADMIN ? branchId : req.user.branchId;
        return this.receptionService.getPostalRecords(effectiveBranchId);
    }

    @Post('postal-records/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    updatePostalRecord(@Param('id') id: string, @Body() dto: UpdatePostalRecordDto) {
        return this.receptionService.updatePostalRecord(id, dto);
    }

    @Delete('postal-records/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.RECEPTIONIST)
    deletePostalRecord(@Param('id') id: string) {
        return this.receptionService.deletePostalRecord(id);
    }
}
