import { z } from "zod";

export const AdmissionSchema = z.object({
  // Step 2: Candidate Info
  firstName: z.string().min(1, "First name is required"),
  surname: z.string().min(1, "Surname is required"),
  lastName: z.string().min(1, "Last name is required"),
  address: z.string().min(5, "Full home address is required"),
  gender: z.enum(["MALE", "FEMALE"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  age: z.number().min(0).optional(),
  ninNumber: z.string().optional(),
  genotype: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencySickness: z.string().optional(),
  stateOfOrigin: z.string().optional(),
  nationality: z.string().optional(),
  languagesSpoken: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  phoneNumber: z.string().min(1, "Phone number is required"),
  whatsappNumber: z.string().optional(),

  // Step 3: Parent/Guardian Info
  guardianType: z.enum(["FATHER", "MOTHER", "GUARDIAN"]),
  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherPhone: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherPhone: z.string().optional(),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianRelation: z.string().optional(),
  guardianContact1: z.string().min(1, "Primary contact is required"),
  guardianContact2: z.string().optional(),
  guardianEmail: z.string().email("Invalid email address"),

  // Step 4: Previous School Info
  previousSchools: z.array(z.object({
    institutionName: z.string().min(1, "Institution name is required"),
    address: z.string().optional(),
    fromYear: z.string().optional(),
    toYear: z.string().optional(),
  })).optional(),

  // Step 5: Medical & Additional Info
  hasAppliedBefore: z.boolean().default(false),
  howHeard: z.string().optional(),
  hasMedicalCondition: z.boolean().default(false),
  medicalConditionInfo: z.string().optional(),
  hasLearningDifficulty: z.boolean().default(false),
  learningDifficultyInfo: z.string().optional(),
  hasSpecialNeeds: z.boolean().default(false),
  specialNeedsInfo: z.string().optional(),
  seekingFinancialAid: z.boolean().default(false),
  hasSiblingsInSchool: z.boolean().default(false),
  siblings: z.array(z.object({
    name: z.string(),
    level: z.string(),
  })).optional(),

  // Step 6: Documents
  passportPhoto: z.string().optional(),
  birthCertificateUrl: z.string().optional(),
  ninUrl: z.string().optional(),
  schoolReportUrl: z.string().optional(),
  medicalReportUrl: z.string().optional(),
  recommendationLetterUrl: z.string().optional(),
  transferLetterUrl: z.string().optional(),
  paymentProofUrl: z.string().optional(),

  // Step 7: Consent
  schoolRulesAgreement: z.boolean().refine(v => v === true, "You must accept the rules"),
  
  // Admission Details (Contextual)
  branchId: z.string(),
  desiredClassId: z.string().min(1, "Please select a class"),
  academicSessionId: z.string().min(1, "Please select a session"),
});

export type AdmissionFormData = z.infer<typeof AdmissionSchema>;
