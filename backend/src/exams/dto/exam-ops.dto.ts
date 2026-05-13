import { IsString, IsEnum, IsArray, ValidateNested, IsNumber, IsOptional, Min, Max, IsBoolean, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { Term, ExamTerm } from '../../generated/client/client';

export class CreateAcademicSessionDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsISO8601()
  startDate: string;

  @ApiProperty()
  @IsISO8601()
  endDate: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}

export class StudentScoreDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  asgn1?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  asgn2?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  test1?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  test2?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  examScore?: number;
}

export class BulkSubmitScoresDto {
  @ApiProperty()
  @IsString()
  subjectId: string;

  @ApiProperty()
  @IsString()
  sectionId: string;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: Term })
  @IsEnum(Term)
  term: Term;

  @ApiProperty({ enum: ExamTerm })
  @IsEnum(ExamTerm)
  examTerm: ExamTerm;

  @ApiProperty({ type: [StudentScoreDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentScoreDto)
  scores: StudentScoreDto[];
}

export class RecordBehaviouralDto {
  @ApiProperty()
  @IsString()
  studentId: string;

  @ApiProperty()
  @IsString()
  sessionId: string;

  @ApiProperty({ enum: Term })
  @IsEnum(Term)
  term: Term;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  punctuality?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  classAttendance?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  attentiveness?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  neatness?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  honesty?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  selfControl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  relationships?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sports?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  toolHandling?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  branchId?: string;
}
