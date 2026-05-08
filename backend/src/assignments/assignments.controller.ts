import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { BranchGuard, TenantContext } from '../auth/branch.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';
import { GetTenantContext } from '../auth/tenant-context.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('assignments')
export class AssignmentsController {
    constructor(private readonly assignmentsService: AssignmentsService) { }

    @Post()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    create(@GetTenantContext() context: TenantContext, @Body() data: any, @Request() req) {
        data.branchId = req.user.branchId;
        if (req.user.role === UserRole.TEACHER) {
            data.teacherId = req.user.staffId;
        }
        return this.assignmentsService.createAssignment(data, context);
    }

    @Get()
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    findAll(@GetTenantContext() context: TenantContext, @Query() filters: any) {
        return this.assignmentsService.findAll(context, filters);
    }

    @Get('student/:studentId')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.STUDENT, UserRole.PARENT)
    findByStudent(@GetTenantContext() context: TenantContext, @Param('studentId') studentId: string) {
        return this.assignmentsService.findByStudent(studentId, context);
    }

    @Get(':id')
    findOne(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.assignmentsService.findOne(id, context);
    }

    @Put(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    update(@GetTenantContext() context: TenantContext, @Param('id') id: string, @Body() data: any) {
        return this.assignmentsService.update(id, data, context);
    }

    @Delete(':id')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    remove(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.assignmentsService.remove(id, context);
    }

    // --- Submissions ---
    @Post('submit')
    @Roles(UserRole.STUDENT)
    submit(@GetTenantContext() context: TenantContext, @Body() data: any) {
        return this.assignmentsService.submitAssignment(data, context);
    }

    @Get(':id/submissions')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    getSubmissions(@GetTenantContext() context: TenantContext, @Param('id') id: string) {
        return this.assignmentsService.getSubmissions(id, context);
    }

    @Put('submissions/:id/grade')
    @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
    grade(
        @GetTenantContext() context: TenantContext,
        @Param('id') id: string,
        @Body('grade') grade: number,
        @Body('feedback') feedback?: string
    ) {
        return this.assignmentsService.gradeSubmission(id, grade, feedback, context);
    }
}
