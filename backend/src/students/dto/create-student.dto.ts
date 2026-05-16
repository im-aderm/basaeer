import {
  IsEmail,
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  MinLength,
  IsUUID,
  IsNumber,
} from 'class-validator';

export class CreateStudentDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsUUID()
  branchId: string;

  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsUUID()
  sectionId?: string;

  @IsOptional()
  @IsDateString()
  dob?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  otherNames?: string;

  @IsOptional()
  @IsString()
  placeOfBirth?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  stateOfOrigin?: string;

  @IsOptional()
  @IsString()
  lga?: string;

  @IsOptional()
  @IsString()
  religion?: string;

  @IsOptional()
  @IsString()
  passportPhoto?: string;

  @IsOptional()
  @IsString()
  guardianOccupation?: string;

  @IsOptional()
  @IsString()
  guardianOfficeAddress?: string;

  @IsOptional()
  @IsString()
  secondaryGuardianName?: string;

  @IsOptional()
  @IsString()
  secondaryGuardianPhone?: string;

  @IsOptional()
  @IsString()
  secondaryGuardianRelation?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  emergencyContactName?: string;

  @IsOptional()
  @IsString()
  emergencyContactPhone?: string;

  @IsOptional()
  @IsString()
  emergencyContactRelation?: string;

  @IsOptional()
  @IsString()
  bloodGroup?: string;

  @IsOptional()
  @IsString()
  genotype?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  medicalConditions?: string;

  @IsOptional()
  @IsString()
  specialNeeds?: string;

  @IsOptional()
  @IsString()
  familyDoctorName?: string;

  @IsOptional()
  @IsString()
  familyDoctorPhone?: string;

  @IsOptional()
  @IsString()
  birthCertificateUrl?: string;

  @IsOptional()
  @IsString()
  testimonialUrl?: string;

  @IsOptional()
  @IsString()
  transferCertificateUrl?: string;

  @IsOptional()
  @IsString()
  immunizationCardUrl?: string;

  @IsOptional()
  @IsString()
  preferredLanguage?: string;

  @IsOptional()
  @IsString()
  religionClassType?: string;

  @IsOptional()
  @IsBoolean()
  scholarshipEligible?: boolean;

  @IsOptional()
  @IsString()
  referralSource?: string;

  @IsOptional()
  @IsString()
  enrollmentStatus?: string;

  @IsOptional()
  @IsDateString()
  admissionDate?: string;

  @IsOptional()
  @IsDateString()
  exitDate?: string;

  @IsOptional()
  @IsString()
  exitReason?: string;
}
