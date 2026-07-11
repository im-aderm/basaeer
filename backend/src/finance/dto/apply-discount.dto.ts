import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class ApplyDiscountDto {
  @IsEnum(['PERCENTAGE', 'FIXED'])
  discountType: 'PERCENTAGE' | 'FIXED';

  /** For PERCENTAGE this is a percent (0–100); for FIXED it is a money amount. */
  @IsNumber()
  @Min(0.01)
  discountValue: number;

  @IsString()
  @IsNotEmpty({ message: 'A reason is required when applying a discount.' })
  discountReason: string;
}
