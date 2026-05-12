import { IsArray, IsString, IsNotEmpty } from 'class-validator';

export class DeactivateLoginDto {
  @IsArray()
  @IsString({ each: true })
  studentIds: string[];

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsString()
  @IsNotEmpty()
  reasonId?: string;
}
