import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, Query } from '@nestjs/common';
import { AcademicsService } from './academics.service';
import { CreateAssignmentDto, SubmitAssignmentDto } from './dto/academics-ops.dto';
import { PromoteStudentsDto } from './dto/promote-students.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academics')
export class AcademicsController {
    constructor(private readonly academicsService: AcademicsService) { }

    @Post('assignments')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    createAssignment(@Body() dto: CreateAssignmentDto) {
        return this.academicsService.createAssignment(dto);
    }

    @Post('submissions')
    @Roles(UserRole.STUDENT)
    submitAssignment(@Body() dto: SubmitAssignmentDto) {
        return this.academicsService.submitAssignment(dto);
    }

    @Patch('submissions/:id/grade')
    @Roles(UserRole.TEACHER)
    gradeSubmission(@Param('id') id: string, @Body('grade') grade: number, @Body('feedback') feedback?: string) {
        return this.academicsService.gradeSubmission(id, grade, feedback);
    }

    @Get('assignments')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN, UserRole.STUDENT)
    getAssignments(
        @Query('classId') classId?: string,
        @Query('sectionId') sectionId?: string,
        @Query('subjectId') subjectId?: string,
        @Query('teacherId') teacherId?: string
    ) {
        return this.academicsService.getAssignments({ classId, sectionId, subjectId, teacherId });
    }

    @Get('assignments/:id/submissions')
    @Roles(UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    getAssignmentSubmissions(@Param('id') id: string) {
        return this.academicsService.getAssignmentSubmissions(id);
    }

    @Get('student-assignments/:studentId')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER)
    getStudentAssignments(@Param('studentId') studentId: string) {
        return this.academicsService.getStudentAssignments(studentId);
    }

    @Get('performance/:studentId')
    @Roles(UserRole.STUDENT, UserRole.PARENT, UserRole.TEACHER, UserRole.BRANCH_ADMIN)
    getPerformance(@Param('studentId') studentId: string) {
        return this.academicsService.getStudentPerformance(studentId);
    }

    @Post('promote')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
    promoteStudents(@Body() dto: PromoteStudentsDto) {
        return this.academicsService.promoteStudents(dto);
    }
}
