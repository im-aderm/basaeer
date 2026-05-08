import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpsertModuleConfigDto {
  @IsString()
  moduleKey: string;

  @IsBoolean()
  @IsOptional()
  isEnabled?: boolean;

  @IsObject()
  @IsOptional()
  config?: any;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class ToggleModuleDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  @IsOptional()
  branchId?: string;
}
