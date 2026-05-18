import { IsString, IsISO8601, IsArray, ValidateNested, IsNumber, IsOptional, IsUUID, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class InvoiceItemDto {
  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty()
  @IsNumber()
  @Min(0.01)
  amount: number;
}

export class CreateInvoiceDto {
  @ApiProperty()
  @IsUUID()
  studentId: string;

  @ApiProperty()
  @IsISO8601()
  dueDate: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  branchId?: string;

  @ApiProperty({ type: [InvoiceItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items: InvoiceItemDto[];
}
