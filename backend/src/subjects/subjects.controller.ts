
import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { Prisma } from '../generated/client/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('subjects')
export class SubjectsController {
    constructor(private readonly subjectsService: SubjectsService) { }

    @Post()
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    create(@Request() req, @Body() createSubjectDto: any) {
        // Assign branchId from user if not provided in body
        if (!createSubjectDto.branch && req.user.branchId) {
            createSubjectDto.branch = { connect: { id: req.user.branchId } };
        }
        return this.subjectsService.create(createSubjectDto);
    }

    @Get()
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER, UserRole.STUDENT)
    findAll(@Request() req) {
        const branchId = req.query.branchId || req.user.branchId;
        return this.subjectsService.findAll(branchId);
    }

    @Get(':id')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
    findOne(@Param('id') id: string) {
        return this.subjectsService.findOne(id);
    }

    @Patch(':id')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    update(@Param('id') id: string, @Body() updateSubjectDto: Prisma.SubjectUpdateInput) {
        return this.subjectsService.update(id, updateSubjectDto);
    }

    @Delete(':id')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    remove(@Param('id') id: string) {
        return this.subjectsService.remove(id);
    }

    @Post(':id/assign-teacher')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    assignTeacher(@Param('id') id: string, @Body('teacherId') teacherId: string) {
        return this.subjectsService.assignTeacher(id, teacherId);
    }
}
