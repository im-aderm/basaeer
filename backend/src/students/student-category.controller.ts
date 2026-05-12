import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { StudentCategoryService } from './student-category.service';
import { CreateStudentCategoryDto } from './dto/create-student-category.dto';
import { UpdateStudentCategoryDto } from './dto/update-student-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../generated/client/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('student-categories')
export class StudentCategoryController {
  constructor(
    private readonly studentCategoryService: StudentCategoryService,
  ) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Request() req, @Body() createDto: CreateStudentCategoryDto) {
    // Assign branchId from user if not provided in body
    if (!createDto.branchId && req.user.branchId) {
      createDto.branchId = req.user.branchId;
    }
    return this.studentCategoryService.create(createDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@Query('branchId') branchId: string) {
    return this.studentCategoryService.findAll(branchId);
  }

  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string) {
    return this.studentCategoryService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() updateDto: UpdateStudentCategoryDto) {
    return this.studentCategoryService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string) {
    return this.studentCategoryService.remove(id);
  }
}
