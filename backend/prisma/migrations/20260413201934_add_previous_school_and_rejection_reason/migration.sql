-- CreateTable
CREATE TABLE "PreviousSchool" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "address" TEXT,
    "fromYear" TEXT,
    "toYear" TEXT,
    "admissionId" TEXT NOT NULL,

    CONSTRAINT "PreviousSchool_pkey" PRIMARY KEY ("id")
);

-- Add rejection reason column to OnlineAdmission
ALTER TABLE "OnlineAdmission" ADD COLUMN "rejectionReason" TEXT;

-- Remove previousSchool column (replaced by relation)
ALTER TABLE "OnlineAdmission" DROP COLUMN IF EXISTS "previousSchool";

-- CreateIndex
CREATE INDEX "PreviousSchool_admissionId_idx" ON "PreviousSchool"("admissionId");

-- AddForeignKey
ALTER TABLE "PreviousSchool" ADD CONSTRAINT "PreviousSchool_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "OnlineAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
