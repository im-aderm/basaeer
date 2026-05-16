import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdmissionExamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsUUID()
  @IsOptional()
  academicSessionId?: string;

  @IsDateString()
  @IsNotEmpty()
  examDate: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  maxScore?: number;
}

export class UpdateAdmissionExamDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsEnum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @IsDateString()
  @IsOptional()
  examDate?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsDateString()
  @IsOptional()
  startTime?: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  maxScore?: number;
}

export class CreateExamScoreDto {
  @IsUUID()
  @IsNotEmpty()
  admissionId: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkScoreUploadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkScoreItemDto)
  scores: BulkScoreItemDto[];
}

export class BulkScoreItemDto {
  @IsUUID()
  @IsNotEmpty()
  admissionId: string;

  @IsNumber()
  @IsNotEmpty()
  score: number;

  @IsNumber()
  @IsOptional()
  maxScore?: number;

  @IsString()
  @IsOptional()
  grade?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class ScheduleExamDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  admissionIds: string[];

  @IsUUID()
  @IsNotEmpty()
  examId: string;
}
