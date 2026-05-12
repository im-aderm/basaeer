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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Student Categories')
@Controller('student-categories')
export class StudentCategoryController {
  constructor(
    private readonly studentCategoryService: StudentCategoryService,
  ) {}

  @ApiBearerAuth()
  @ApiBody({ type: CreateStudentCategoryDto })
  @ApiResponse({ status: 201, description: 'Operation successful' })
  @ApiOperation({ summary: 'Create resource' })
  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  create(@Request() req: any, @Body() createDto: CreateStudentCategoryDto) {
    // Assign branchId from user if not provided in body
    if (!createDto.branchId && req.user.branchId) {
      createDto.branchId = req.user.branchId;
    }
    return this.studentCategoryService.create(createDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve All' })
  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findAll(@Query('branchId') branchId: string) {
    return this.studentCategoryService.findAll(branchId);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Retrieve One' })
  @Get(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  findOne(@Param('id') id: string) {
    return this.studentCategoryService.findOne(id);
  }

  @ApiBearerAuth()
  @ApiBody({ type: UpdateStudentCategoryDto })
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Update resource' })
  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  update(@Param('id') id: string, @Body() updateDto: UpdateStudentCategoryDto) {
    return this.studentCategoryService.update(id, updateDto);
  }

  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Operation successful' })
  @ApiOperation({ summary: 'Delete resource' })
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.BRANCH_ADMIN)
  remove(@Param('id') id: string) {
    return this.studentCategoryService.remove(id);
  }
}
