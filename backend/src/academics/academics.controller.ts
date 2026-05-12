import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query, Delete, Req } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AcademicsService } from './academics.service';
import { ExportQueueService } from './export-queue.service';
import { ComputationQueueService } from './computation-queue.service';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto/academics-ops.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { CreateClassScheduleDto } from './dto/class-schedule.dto';
import { StartExportDto } from './dto/export.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { GetTenantContext } from '../auth/tenant-context.decorator';
import { UserRole, Term } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('academics')
export class AcademicsController {
    constructor(
        private readonly academicsService: AcademicsService,
        private readonly exportQueueService: ExportQueueService,
        private readonly computationQueueService: ComputationQueueService,
    ) { }

    // Assignments
    @Post('assignments')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createAssignment(@Body() dto: CreateAssignmentDto) {
        return this.academicsService.createAssignment(dto);
    }

    @Post('submissions')
    @Roles(UserRole.STUDENT)
    submitAssignment(@Body() dto: SubmitAssignmentDto) {
        return this.academicsService.submitAssignment(dto);
    }

    @Patch('submissions/:id/grade')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    gradeSubmission(@Param('id') id: string, @Body('grade') grade: number, @Body('feedback') feedback?: string) {
        return this.academicsService.gradeSubmission(id, grade, feedback);
    }

    @Get('assignments')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.STUDENT)
    getAssignments(
        @Query('classId') classId?: string,
        @Query('sectionId') sectionId?: string,
        @Query('subjectId') subjectId?: string,
        @Query('teacherId') teacherId?: string
    ) {
        return this.academicsService.getAssignments({ classId, sectionId, subjectId, teacherId });
    }

    @Get('assignments/:id/submissions')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    getAssignmentSubmissions(@Param('id') id: string) {
        return this.academicsService.getAssignmentSubmissions(id);
    }

    @Get('student-assignments/:studentId')
    @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    getStudentAssignments(@Param('studentId') studentId: string) {
        return this.academicsService.getStudentAssignments(studentId);
    }

    // Performance
    @Get('performance/:studentId')
    @Roles(UserRole.STUDENT, UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    getPerformance(@Param('studentId') studentId: string) {
        return this.academicsService.getStudentPerformance(studentId);
    }

    // Promotion
    @Post('promote')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    promoteStudents(@Body() dto: PromoteStudentsDto) {
        return this.academicsService.promoteStudents(dto);
    }

    // Schedules
    @Post('schedules')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    createSchedule(@Body() dto: CreateClassScheduleDto) {
        return this.academicsService.createSchedule(dto);
    }

    @Get('schedules')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    getSchedules(
        @Query('classId') classId?: string,
        @Query('sectionId') sectionId?: string,
        @Query('teacherId') teacherId?: string
    ) {
        return this.academicsService.getSchedules({ classId, sectionId, teacherId });
    }

    @Delete('schedules/:id')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    deleteSchedule(@Param('id') id: string) {
        return this.academicsService.deleteSchedule(id);
    }

    // Exports
    @Post('exports')
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.EXAM_OFFICER, UserRole.ACADEMIC_OFFICER)
    async startExport(
        @Body() dto: StartExportDto,
        @GetTenantContext() ctx: TenantContext
    ) {
        return this.exportQueueService.startExport(dto, ctx.userId, ctx.branchId);
    }

    @Get('exports')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.EXAM_OFFICER, UserRole.ACADEMIC_OFFICER)
    async getExports(@GetTenantContext() ctx: TenantContext) {
        return this.exportQueueService.getBranchExports(ctx.branchId);
    }

    @Get('exports/:id')
    async getExportStatus(@Param('id') id: string) {
        return this.exportQueueService.getExportStatus(id);
    }

    @Delete('exports/:id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    async deleteExport(@Param('id') id: string) {
        return this.exportQueueService.deleteExport(id);
    }

    // Computations
    @Post('compute-section')
    @Throttle({ default: { limit: 2, ttl: 60000 } })
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.EXAM_OFFICER)
    async computeSection(
        @Body() dto: { sectionId: string; sessionId: string; term: Term },
        @GetTenantContext() ctx: TenantContext
    ) {
        return this.computationQueueService.queueSectionComputation(
            dto.sectionId,
            dto.sessionId,
            dto.term,
            ctx.userId,
            ctx.branchId
        );
    }

    @Get('compute-status/:jobId')
    async getComputeStatus(@Param('jobId') jobId: string) {
        return this.computationQueueService.getJobStatus(jobId);
    }
}
