import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class UpdateAutomationConfigDto {
  @IsBoolean()
  @IsNotEmpty()
  isEnabled: boolean;

  @IsOptional()
  @IsString()
  template?: string;

  @IsOptional()
  @IsInt()
  triggerDays?: number;
}

export class UpsertAutomationConfigDto extends UpdateAutomationConfigDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class ToggleScheduledJobDto {
  @IsBoolean()
  @IsNotEmpty()
  isEnabled: boolean;
}
