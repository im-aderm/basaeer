import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsUUID,
  Min,
} from 'class-validator';
import { VoucherType } from '../../generated/client/client';

export class CreateExpenseCategoryDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID()
  branchId: string;
}

export class CreateVoucherDto {
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsOptional()
  @IsEnum(VoucherType)
  type?: VoucherType;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsUUID()
  expenseCategoryId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsNotEmpty()
  @IsString()
  paidTo: string;

  @IsUUID()
  branchId: string;
}
