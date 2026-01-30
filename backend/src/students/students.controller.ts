import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { CreateDeactivationReasonDto } from './dto/create-deactivation-reason.dto';
import { UpdateDeactivationReasonDto } from './dto/update-deactivation-reason.dto';
import { DeactivateLoginDto } from './dto/deactivate-login.dto';
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

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getStats(@Request() req) {
    const branchId = req.user.branchId;
    return this.studentsService.getStats(branchId);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN, UserRole.TEACHER)
  findAll(@Request() req, @Query('classId') classId?: string, @Query('sectionId') sectionId?: string) {
    const branchId = req.query.branchId || req.user.branchId;
    return this.studentsService.findAll(branchId, classId, sectionId);
  }

  // Deactivation Reasons
  @Get('deactivation-reasons')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  fetchDeactivationReasons(@Request() req) {
    const branchId = req.user.branchId;
    return this.studentsService.fetchDeactivationReasons(branchId);
  }

  @Post('deactivation-reasons')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  createDeactivationReason(@Request() req, @Body() dto: CreateDeactivationReasonDto) {
    if (!dto.branchId) dto.branchId = req.user.branchId;
    return this.studentsService.createDeactivationReason(dto);
  }

  @Patch('deactivation-reasons/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  updateDeactivationReason(@Param('id') id: string, @Body() dto: UpdateDeactivationReasonDto) {
    return this.studentsService.updateDeactivationReason(id, dto);
  }

  @Delete('deactivation-reasons/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deleteDeactivationReason(@Param('id') id: string) {
    return this.studentsService.deleteDeactivationReason(id);
  }

  // Login Deactivation
  @Post('deactivate-login')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  deactivateLogin(@Request() req, @Body() dto: DeactivateLoginDto) {
    const branchId = req.user.branchId;
    return this.studentsService.deactivateLogin(dto.studentIds, dto.reason, branchId, dto.reasonId);
  }

  @Get('login-deactivations')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  getLoginDeactivations(@Request() req) {
    const branchId = req.user.branchId;
    return this.studentsService.getLoginDeactivations(branchId);
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

  @Post(':id/reactivate-login')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  reactivateLogin(@Param('id') id: string) {
    return this.studentsService.reactivateLogin(id);
  }
}

