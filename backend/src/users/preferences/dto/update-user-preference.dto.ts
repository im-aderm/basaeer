import { IsString, IsBoolean, IsOptional, IsObject } from 'class-validator';

export class UpdateUserPreferenceDto {
  @IsString()
  @IsOptional()
  theme?: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsBoolean()
  @IsOptional()
  sidebarCollapsed?: boolean;

  @IsObject()
  @IsOptional()
  dashboardWidgets?: any;

  @IsObject()
  @IsOptional()
  notifications?: any;
}
