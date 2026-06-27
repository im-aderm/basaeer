import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsUUID,
  MinLength,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBranchAdminDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}

export class CreateBranchDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'code must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  code: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
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

  @IsUUID()
  @IsOptional()
  adminUserId?: string;

  @ValidateNested()
  @IsOptional()
  @Type(() => CreateBranchAdminDto)
  createAdminUser?: CreateBranchAdminDto;
}
