import {
  IsString,
  IsOptional,
  IsEmail,
  IsDateString,
  IsNumber,
  IsEnum,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateEnquiryDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  branchId: string;
}

export class UpdateEnquiryDto extends PartialType(CreateEnquiryDto) {}

export class CreateCallLogDto {
  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUpDate?: string;

  @IsString()
  callType: string; // INCOMING, OUTGOING

  @IsString()
  branchId: string;
}

export class UpdateCallLogDto extends PartialType(CreateCallLogDto) {}

export class CreateVisitorLogDto {
  @IsString()
  purpose: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  idCard?: string;

  @IsOptional()
  @IsNumber()
  numPerson?: number;

  @IsOptional()
  @IsString()
  inTime?: string;

  @IsOptional()
  @IsString()
  outTime?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsString()
  branchId: string;
}

export class UpdateVisitorLogDto extends PartialType(CreateVisitorLogDto) {}

export class CreateComplaintDto {
  @IsString()
  complaintType: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsString()
  name: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  actionTaken?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  branchId: string;
}

export class UpdateComplaintDto extends PartialType(CreateComplaintDto) {}

export class CreatePostalRecordDto {
  @IsString()
  fromTitle: string;

  @IsString()
  toTitle: string;

  @IsOptional()
  @IsString()
  referenceNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsString()
  type: string; // DISPATCH, RECEIVE

  @IsString()
  branchId: string;
}

export class UpdatePostalRecordDto extends PartialType(CreatePostalRecordDto) {}
