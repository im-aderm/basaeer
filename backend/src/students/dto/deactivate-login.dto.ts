import { IsArray, IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class DeactivateLoginDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  studentIds: string[];

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  reasonId?: string;
}
