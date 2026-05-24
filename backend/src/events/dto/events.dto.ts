import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsInt,
  IsArray,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  IsEmail,
  IsUrl,
  IsEnum,
  Matches,
  Allow,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateEventPackageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  ageRange?: string;

  @IsOptional()
  @IsString()
  timing?: string;

  @IsNumber()
  @Min(0)
  fee: number;

  @IsString()
  @IsNotEmpty()
  boardingType: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableSlots?: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateEventScheduleDto {
  @IsString()
  @IsNotEmpty()
  day: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsString()
  @IsNotEmpty()
  activity: string;
}

export class CreateEventGalleryDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @IsOptional()
  @IsBoolean()
  isCover?: boolean;

  @IsOptional()
  @IsInt()
  order?: number;

  @IsOptional()
  @IsString()
  caption?: string;
}

export const EVENT_CATEGORIES = [
  'CAMP', 'CONFERENCE', 'COMPETITION', 'WORKSHOP',
  'EXCURSION', 'SUMMER_PROGRAM', 'TAHFIZ_PROGRAM',
  'ACADEMIC_PROGRAM', 'OTHERS',
] as const;

export const EVENT_STATUSES = ['DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;
export const BOARDING_TYPES = ['DAY', 'BOARDING', 'FULL_BOARDING'] as const;
export const GENDER_VALUES = ['MALE', 'FEMALE'] as const;

export class CreateCampusEventDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  rulesAndDiscipline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  mealsAndHospitality?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whyChooseThisEvent?: string[];

  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsEnum(EVENT_CATEGORIES)
  category: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRSVP?: boolean;

  @IsOptional()
  @IsEnum(EVENT_STATUSES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl()
  brochurePdf?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  registrationOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationFormEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentRequired?: boolean;

  @IsOptional()
  @IsObject()
  seoMetadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventPackageDto)
  packages?: CreateEventPackageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventScheduleDto)
  schedules?: CreateEventScheduleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventGalleryDto)
  gallery?: CreateEventGalleryDto[];
}

export class UpdateCampusEventDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  shortDescription?: string;

  @IsOptional()
  @IsString()
  fullDescription?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @IsOptional()
  @IsString()
  rulesAndDiscipline?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];

  @IsOptional()
  @IsString()
  mealsAndHospitality?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  whyChooseThisEvent?: string[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  applicationDeadline?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsEnum(EVENT_CATEGORIES)
  category?: string;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRSVP?: boolean;

  @IsOptional()
  @IsEnum(EVENT_STATUSES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsUrl()
  brochurePdf?: string;

  @IsOptional()
  @IsInt()
  capacity?: number;

  @IsOptional()
  @IsBoolean()
  registrationOpen?: boolean;

  @IsOptional()
  @IsBoolean()
  applicationFormEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  paymentRequired?: boolean;

  @IsOptional()
  @IsObject()
  seoMetadata?: Record<string, any>;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventPackageDto)
  packages?: CreateEventPackageDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventScheduleDto)
  schedules?: CreateEventScheduleDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateEventGalleryDto)
  gallery?: CreateEventGalleryDto[];
}

export class UpdateEventRSVPDto {
  @IsString()
  @IsNotEmpty()
  status: 'INTERESTED' | 'GOING' | 'DECLINED';
}

export class CreateEventApplicationDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEnum(GENDER_VALUES)
  gender: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsOptional()
  @IsString()
  parentName?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+]?[\d\s()-]{7,20}$/, { message: 'Invalid phone number format' })
  parentPhone?: string;

  @IsOptional()
  @IsEmail()
  parentEmail?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  localGovernment?: string;

  @IsOptional()
  @IsString()
  memorizationLevel?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  islamicBackground?: string;

  @IsOptional()
  @IsString()
  previousParticipation?: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsString()
  @IsNotEmpty()
  emergencyContact: string;

  @IsOptional()
  @IsString()
  accommodationPreference?: string;

  @IsString()
  @IsNotEmpty()
  packageId: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  passportPhotoUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  birthCertificateUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  ninUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  schoolIdUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  medicalReportUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  proofOfPaymentUrl?: string;

  // Honeypot field for spam protection (should be empty)
  @IsOptional()
  @IsString()
  honeypot?: string;
}

export class UpdateApplicationStatusDto {
  @IsString()
  @IsNotEmpty()
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'WAITLISTED';
}

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}
