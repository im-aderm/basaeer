import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentCategoryDto } from './create-student-category.dto';

export class UpdateStudentCategoryDto extends PartialType(
  CreateStudentCategoryDto,
) {}
