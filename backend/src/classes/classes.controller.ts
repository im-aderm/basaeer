import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ClassesService } from './classes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';
import { Public } from '../auth/public.decorator';

@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
@Controller('classes')
export class ClassesController {
    constructor(private readonly classesService: ClassesService) { }

    @Post()
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    create(@Request() req, @Body() createClassDto: any) {
        // Assign branchId from user if not provided in body
        if (!createClassDto.branch && req.user.branchId) {
            createClassDto.branch = { connect: { id: req.user.branchId } };
        }
        return this.classesService.create(createClassDto);
    }

    @Get()
    @Public()
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
    findAll(@Request() req) {
        // If Super Admin and branchId query param is missing, they might want all (but service currently requires it)
        // For Phase 2, we stick to branch-based filtering.
        const branchId = req.query.branchId || req.user?.branchId;
        return this.classesService.findAll(branchId);
    }

    @Get(':id')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN, UserRole.TEACHER)
    findOne(@Param('id') id: string) {
        return this.classesService.findOne(id);
    }

    @Post(':id/sections')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    addSection(@Param('id') id: string, @Body('name') name: string) {
        return this.classesService.addSection(id, name);
    }

    @Post(':id/assign-teacher')
    @Roles(UserRole.BRANCH_ADMIN, UserRole.SUPER_ADMIN)
    assignTeacher(@Param('id') id: string, @Body('teacherId') teacherId: string) {
        return this.classesService.assignTeacher(id, teacherId);
    }
}
