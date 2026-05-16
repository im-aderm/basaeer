import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsUUID,
  IsEnum,
  IsArray,
} from 'class-validator';

export class CreateAdmissionInterviewDto {
  @IsUUID()
  @IsNotEmpty()
  admissionId: string;

  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @IsDateString()
  @IsNotEmpty()
  interviewDate: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  interviewerName?: string;

  @IsString()
  @IsOptional()
  interviewerId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateAdmissionInterviewDto {
  @IsDateString()
  @IsOptional()
  interviewDate?: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  interviewerName?: string;

  @IsString()
  @IsOptional()
  interviewerId?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'PENDING_REVIEW'])
  outcome?: string;
}

export class CompleteInterviewDto {
  @IsOptional()
  @IsEnum(['PASS', 'FAIL', 'PENDING_REVIEW'])
  outcome?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class BulkScheduleInterviewDto {
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  admissionIds: string[];

  @IsDateString()
  @IsNotEmpty()
  interviewDate: string;

  @IsString()
  @IsOptional()
  venue?: string;

  @IsString()
  @IsOptional()
  interviewerName?: string;
}
