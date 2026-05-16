import { IsString, IsBoolean } from 'class-validator';

export class UpdatePermissionDto {
  @IsString()
  module: string;

  @IsString()
  action: string;

  @IsBoolean()
  isAllowed: boolean;
}