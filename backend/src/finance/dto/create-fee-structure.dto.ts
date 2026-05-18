import { IsNumber, IsString, IsOptional, IsUUID, Min } from 'class-validator';

export class CreateFeeStructureDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsUUID()
  branchId: string;
}
