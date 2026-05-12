import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateStudentCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;
}
