import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEnum,
} from 'class-validator';

export class CreateCampusEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsString()
  @IsNotEmpty()
  category: string; // ACADEMIC, HOLIDAY, SPORTS, CULTURAL

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRSVP?: boolean;
}

export class UpdateEventRSVPDto {
  @IsString()
  @IsNotEmpty()
  status: 'INTERESTED' | 'GOING' | 'DECLINED';
}
