import { IsString, IsNotEmpty, IsOptional, IsEmail, IsDateString, IsUUID, IsNumber, IsBoolean } from 'class-validator';

export class CreateOnlineAdmissionDto {
    // 1. Student Basic Information
    @IsString()
    @IsOptional()
    admissionNumber?: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsString()
    @IsOptional()
    otherNames?: string;

    @IsString()
    @IsNotEmpty()
    gender: string;

    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: string;

    @IsString()
    @IsOptional()
    placeOfBirth?: string;

    @IsString()
    @IsOptional()
    nationality?: string;

    @IsString()
    @IsOptional()
    stateOfOrigin?: string;

    @IsString()
    @IsOptional()
    lga?: string;

    @IsString()
    @IsOptional()
    religion?: string;

    @IsString()
    @IsOptional()
    passportPhoto?: string;

    // 2. Admission Details
    @IsUUID()
    @IsOptional()
    academicSessionId?: string;

    @IsString()
    @IsOptional()
    admissionTerm?: any; // Enum Term

    @IsUUID()
    @IsNotEmpty()
    desiredClassId: string;

    @IsUUID()
    @IsOptional()
    desiredSectionId?: string;

    @IsString()
    @IsOptional()
    admissionType?: string; // NEW, TRANSFER, RETURNING

    @IsString()
    @IsOptional()
    previousSchool?: string;

    @IsString()
    @IsOptional()
    transferReason?: string;

    @IsNumber()
    @IsOptional()
    assessmentScore?: number;

    // 3. Parent / Guardian Information
    @IsString()
    @IsNotEmpty()
    guardianName: string;

    @IsString()
    @IsOptional()
    guardianRelation?: string;

    @IsString()
    @IsNotEmpty()
    guardianPhone: string;

    @IsEmail()
    @IsOptional()
    guardianEmail?: string;

    @IsString()
    @IsOptional()
    guardianAddress?: string;

    @IsString()
    @IsOptional()
    guardianOccupation?: string;

    @IsString()
    @IsOptional()
    guardianOfficeAddress?: string;

    @IsString()
    @IsOptional()
    secondaryGuardianName?: string;

    @IsString()
    @IsOptional()
    secondaryGuardianPhone?: string;

    @IsString()
    @IsOptional()
    secondaryGuardianRelation?: string;

    // 4. Contact & Address Information
    @IsString()
    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    city?: string;

    @IsString()
    @IsOptional()
    state?: string;

    @IsString()
    @IsOptional()
    country?: string;

    @IsString()
    @IsOptional()
    emergencyContactName?: string;

    @IsString()
    @IsOptional()
    emergencyContactPhone?: string;

    @IsString()
    @IsOptional()
    emergencyContactRelation?: string;

    // 5. Medical Information
    @IsString()
    @IsOptional()
    bloodGroup?: string;

    @IsString()
    @IsOptional()
    genotype?: string;

    @IsString()
    @IsOptional()
    allergies?: string;

    @IsString()
    @IsOptional()
    medicalConditions?: string;

    @IsString()
    @IsOptional()
    specialNeeds?: string;

    @IsString()
    @IsOptional()
    familyDoctorName?: string;

    @IsString()
    @IsOptional()
    familyDoctorPhone?: string;

    // 6. Hostel & Transport
    @IsBoolean()
    @IsOptional()
    hostelRequired?: boolean;

    @IsString()
    @IsOptional()
    preferredHostel?: string;

    @IsString()
    @IsOptional()
    hostelNotes?: string;

    @IsBoolean()
    @IsOptional()
    transportRequired?: boolean;

    @IsString()
    @IsOptional()
    pickupLocation?: string;

    @IsString()
    @IsOptional()
    preferredRoute?: string;

    // 7. Documents Upload (URLs after upload)
    @IsString()
    @IsOptional()
    birthCertificateUrl?: string;

    @IsString()
    @IsOptional()
    testimonialUrl?: string;

    @IsString()
    @IsOptional()
    transferCertificateUrl?: string;

    @IsString()
    @IsOptional()
    immunizationCardUrl?: string;

    // 8. System & Administrative
    @IsUUID()
    @IsNotEmpty()
    branchId: string;

    @IsString()
    @IsOptional()
    createdByStaffId?: string;

    @IsDateString()
    @IsOptional()
    admissionDate?: string;

    @IsDateString()
    @IsOptional()
    approvalDate?: string;

    @IsString()
    @IsOptional()
    approvedByStaffId?: string;

    @IsString()
    @IsOptional()
    studentStatus?: string;

    @IsBoolean()
    @IsOptional()
    createPortalAccount?: boolean;

    // 9. Consent & Declaration
    @IsBoolean()
    @IsOptional()
    guardianConsent?: boolean;

    @IsBoolean()
    @IsOptional()
    dataProcessingConsent?: boolean;

    @IsBoolean()
    @IsOptional()
    schoolRulesAgreement?: boolean;

    @IsString()
    @IsOptional()
    signature?: string;

    @IsDateString()
    @IsOptional()
    consentDate?: string;

    // 10. Optional Advanced
    @IsEmail()
    @IsOptional()
    studentEmail?: string;

    @IsString()
    @IsOptional()
    portalUsername?: string;

    @IsString()
    @IsOptional()
    preferredLanguage?: string;

    @IsString()
    @IsOptional()
    religionClassType?: string;

    @IsBoolean()
    @IsOptional()
    scholarshipEligible?: boolean;

    @IsString()
    @IsOptional()
    referralSource?: string;

    // Legacy/Compatibility
    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    phone?: string;

    @IsUUID()
    @IsOptional()
    studentCategoryId?: string;
}
