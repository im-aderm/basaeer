import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;

  @IsOptional()
  @IsNumber()
  priority?: number;
}