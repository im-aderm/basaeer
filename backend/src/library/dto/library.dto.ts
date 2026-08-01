import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { PartialType, OmitType } from '@nestjs/mapped-types';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}

export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['branchId'] as const),
) {}

export class BorrowBookDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

export class ReturnBookDto {
  @IsString()
  @IsNotEmpty()
  borrowRecordId: string;
}

export class CreateBookCopyDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  accessionNumber: string;

  @IsString()
  @IsOptional()
  condition?: string;
}

export class BorrowByBarcodeDto {
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  studentId: string;

  @IsDateString()
  @IsNotEmpty()
  dueDate: string;
}

export class ReserveBookDto {
  @IsString()
  @IsNotEmpty()
  bookId: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsDateString()
  @IsOptional()
  expiresAt?: string;
}
