import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markAttendance(@Body() dto: CreateAttendanceDto, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.markAttendance(dto, context);
    }

    @Post('bulk')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markBulkAttendance(@Body() dto: { records: CreateAttendanceDto[] }, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.markBulkAttendance(dto, context);
    }

    @Get('section')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    findBySection(@Query('sectionId') sectionId: string, @Query('date') date: string, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.findBySectionAndDate(sectionId, date, context);
    }

    @Get('student/:id')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    getStudentAttendance(@Param('id') studentId: string, @GetTenantContext() context: TenantContext) {
        return this.attendanceService.getStudentAttendance(studentId, context);
    }

    @Get('stats')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    getStats(@GetTenantContext() context: TenantContext) {
        return this.attendanceService.getStats(context);
    }
}
