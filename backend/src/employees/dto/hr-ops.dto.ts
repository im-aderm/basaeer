import {
  IsString,
  IsNumber,
  IsOptional,
  IsJSON,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsNotEmpty,
  IsEnum,
} from 'class-validator';
import { OmitType } from '@nestjs/mapped-types';

export class CreateSalaryTemplateDto {
  @IsNumber()
  @IsNotEmpty()
  basicSalary: number;

  @IsOptional()
  @IsJSON()
  allowances?: any;

  @IsOptional()
  @IsJSON()
  deductions?: any;

  @IsNumber()
  @IsNotEmpty()
  netSalary: number;

  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class GeneratePayrollDto {
  @IsInt()
  @Min(1)
  @Max(12)
  @IsNotEmpty()
  month: number;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsNotEmpty()
  branchId: string;
}

export class CreateLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  type: string; // SICK, CASUAL, ANNUAL

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class UpdateLeaveStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string; // APPROVED, REJECTED
}

export class CreateAwardDto {
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class RequestAdvanceSalaryDto {
  @IsString()
  @IsNotEmpty()
  staffId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  reason: string;
}

/**
 * Self-service variant for POST /advance-salary/request — the caller's own
 * staffId is derived from their JWT (ctx.userId), never client-supplied, so
 * this omits it from RequestAdvanceSalaryDto rather than trusting a
 * staffId in the body. Previously this endpoint read amount/reason via
 * @Body('amount')/@Body('reason') property decorators, which never runs
 * through the global ValidationPipe at all — a negative or non-numeric
 * amount reached the service layer unchecked.
 */
export class SelfRequestAdvanceSalaryDto extends OmitType(
  RequestAdvanceSalaryDto,
  ['staffId'] as const,
) {}
