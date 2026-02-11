import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

import { BranchGuard } from '../auth/branch.guard';
import { Request } from '@nestjs/common';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('attendance')
export class AttendanceController {
    constructor(private readonly attendanceService: AttendanceService) { }

    @Post()
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markAttendance(@Body() dto: CreateAttendanceDto) {
        return this.attendanceService.markAttendance(dto);
    }

    @Post('bulk')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    markBulkAttendance(@Body() dto: { records: CreateAttendanceDto[] }) {
        return this.attendanceService.markBulkAttendance(dto);
    }

    @Get('section')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    findBySection(@Query('sectionId') sectionId: string, @Query('date') date: string) {
        return this.attendanceService.findBySectionAndDate(sectionId, date);
    }

    @Get('student/:id')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.PARENT, UserRole.STUDENT)
    getStudentAttendance(@Query('id') studentId: string) {
        return this.attendanceService.getStudentAttendance(studentId);
    }
}
