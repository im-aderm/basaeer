import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BranchGuard } from '../auth/branch.guard';
import { UserRole } from '../generated/client/client';

@Controller('students')
@UseGuards(JwtAuthGuard, RolesGuard, BranchGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Request() req, @Body() createStudentDto: CreateStudentDto) {
    // Assign branchId from user if not provided in body
    if (!createStudentDto.branchId && req.user.branchId) {
      createStudentDto.branchId = req.user.branchId;
    }
    return this.studentsService.create(createStudentDto);
  }

  @Post('import')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async import(@Request() req, @UploadedFile() file: any) {
    const branchId = req.query.branchId || req.user.branchId;
    return this.studentsService.importStudents(file.buffer, branchId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findAll(@Request() req, @Query('classId') classId?: string, @Query('sectionId') sectionId?: string) {
    const branchId = req.query.branchId || req.user.branchId;
    return this.studentsService.findAll(branchId, classId, sectionId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(id, updateStudentDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string) {
    return this.studentsService.remove(id);
  }
}
