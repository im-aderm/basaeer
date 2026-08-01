import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { HostelType } from '../../generated/client/client';

export class CreateHostelDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(HostelType)
  type: HostelType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  branchId?: string;
}
