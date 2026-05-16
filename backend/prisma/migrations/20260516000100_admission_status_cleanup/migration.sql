-- Clean up legacy AdmissionStatus enum values
-- Migrate any PENDING -> APPLICATION_RECEIVED
UPDATE "OnlineAdmission" SET status = 'APPLICATION_RECEIVED' WHERE status = 'PENDING';

-- Migrate any APPROVED -> ENROLLED
UPDATE "OnlineAdmission" SET status = 'ENROLLED' WHERE status = 'APPROVED';

-- Drop the default before type conversion
ALTER TABLE "OnlineAdmission" ALTER COLUMN status DROP DEFAULT;

-- Remove legacy enum values from the type
ALTER TYPE "AdmissionStatus" RENAME TO "AdmissionStatus_old";

CREATE TYPE "AdmissionStatus" AS ENUM (
  'APPLICATION_RECEIVED',
  'DOCUMENT_REVIEW',
  'INTERVIEW_SCHEDULED',
  'INTERVIEW_COMPLETED',
  'EXAM_SCHEDULED',
  'EXAM_COMPLETED',
  'ADMISSION_OFFERED',
  'ACCEPTED',
  'REJECTED',
  'WAITLISTED',
  'ENROLLED',
  'CANCELLED'
);

ALTER TABLE "OnlineAdmission" ALTER COLUMN status TYPE "AdmissionStatus" USING status::text::"AdmissionStatus";

-- Restore the default
ALTER TABLE "OnlineAdmission" ALTER COLUMN status SET DEFAULT 'APPLICATION_RECEIVED';

DROP TYPE "AdmissionStatus_old" CASCADE;
