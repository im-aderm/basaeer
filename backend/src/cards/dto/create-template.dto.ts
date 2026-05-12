import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';

export enum IdCardType {
  STUDENT = 'STUDENT',
  EMPLOYEE = 'EMPLOYEE',
  ADMIT = 'ADMIT',
}

export class CreateIdCardTemplateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(IdCardType)
  @IsNotEmpty()
  type: IdCardType;

  @IsString()
  @IsOptional()
  backgroundImage?: string;

  @IsObject()
  @IsNotEmpty()
  config: any;

  @IsString()
  @IsNotEmpty()
  branchId: string;
}
