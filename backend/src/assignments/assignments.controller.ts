import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    create(@Body() data: any, @Request() req) {
        data.branchId = req.user.branchId;
        if (req.user.role === UserRole.TEACHER) {
            data.teacherId = req.user.staffId;
        }
        return this.assignmentsService.createAssignment(data);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    findAll(@Request() req, @Query() filters: any) {
        return this.assignmentsService.findAll(req.user.branchId, filters);
    }

    @Get('student/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STUDENT, UserRole.PARENT)
    findByStudent(@Param('studentId') studentId: string) {
        return this.assignmentsService.findByStudent(studentId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.assignmentsService.findOne(id);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    update(@Param('id') id: string, @Body() data: any) {
        return this.assignmentsService.update(id, data);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    remove(@Param('id') id: string) {
        return this.assignmentsService.remove(id);
    }

    // --- Submissions ---
    @Post('submit')
    @Roles(UserRole.STUDENT)
    submit(@Body() data: any) {
        return this.assignmentsService.submitAssignment(data);
    }

    @Get(':id/submissions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getSubmissions(@Param('id') id: string) {
        return this.assignmentsService.getSubmissions(id);
    }

    @Put('submissions/:id/grade')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    grade(@Param('id') id: string, @Body('grade') grade: number, @Body('feedback') feedback?: string) {
        return this.assignmentsService.gradeSubmission(id, grade, feedback);
    }
}
