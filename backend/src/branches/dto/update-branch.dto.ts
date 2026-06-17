import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsUrl,
} from 'class-validator';

export class UpdateBranchDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  primaryColor?: string;

  @IsString()
  @IsOptional()
  emailFooter?: string;

  @IsString()
  @IsOptional()
  smsSenderId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
