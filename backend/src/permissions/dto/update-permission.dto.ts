import { IsEnum, IsString, IsBoolean } from 'class-validator';
import { UserRole } from '../../generated/client/client';

export class UpdatePermissionDto {
  @IsEnum(UserRole)
  role: UserRole;

  @IsString()
  module: string;

  @IsString()
  action: string;

  @IsBoolean()
  isAllowed: boolean;
}
