import { IsString, IsOptional } from 'class-validator';
import { UserRole } from '../../generated/client/client';

export class AssignRoleDto {
  @IsString()
  userId: string;

  @IsString()
  roleId: string;
}

export class CreateUserAndAssignRoleDto {
  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  roleId: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  role?: UserRole;
}