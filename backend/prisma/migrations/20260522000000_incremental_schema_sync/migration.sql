-- Incremental schema sync: adds missing enums, tables, columns, indexes, and foreign keys
-- that exist in the Prisma schema but are absent from the database.

-- ═══════════════════════════════════════════════════════════════════════
-- 1. MISSING ENUM TYPES
-- ═══════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE "SessionStatus" AS ENUM ('UPCOMING', 'CURRENT', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "AdmissionExamStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "InterviewStatus" AS ENUM ('SCHEDULED', 'COMPLETED', 'NO_SHOW', 'RESCHEDULED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "InterviewOutcome" AS ENUM ('PASS', 'FAIL', 'PENDING_REVIEW');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "AccountType" AS ENUM ('ASSET', 'LIABILITY', 'INCOME', 'EXPENSE', 'EQUITY');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "EntrySide" AS ENUM ('DEBIT', 'CREDIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "JournalType" AS ENUM ('INVOICE', 'PAYMENT', 'VOUCHER', 'CREDIT_NOTE', 'REFUND', 'JOURNAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE "VoucherType" AS ENUM ('EXPENSE', 'PAYMENT_ON_ACCOUNT', 'REFUND', 'CREDIT_NOTE');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════════════════
-- 2. MISSING COLUMNS ON EXISTING TABLES
-- ═══════════════════════════════════════════════════════════════════════

-- User: add roleId column
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "roleId" TEXT;

-- AcademicSession: add status column
ALTER TABLE "AcademicSession" ADD COLUMN IF NOT EXISTS "status" "SessionStatus" NOT NULL DEFAULT 'UPCOMING';

-- Voucher: add missing columns
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "type" "VoucherType" NOT NULL DEFAULT 'EXPENSE';
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "studentId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "sessionId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;

-- OnlineAdmission: add missing columns for new workflow
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offeredClassId" TEXT;
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offeredSectionId" TEXT;
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "classReassignmentReason" TEXT;
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offerLetterSentAt" TIMESTAMP(3);
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offerAcceptedAt" TIMESTAMP(3);
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offerDeclinedAt" TIMESTAMP(3);
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offerDeclineReason" TEXT;
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "offerDeadline" TIMESTAMP(3);
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "waitlistPosition" INTEGER;
ALTER TABLE "OnlineAdmission" ADD COLUMN IF NOT EXISTS "waitlistNotes" TEXT;

-- ═══════════════════════════════════════════════════════════════════════
-- 3. MISSING TABLES
-- ═══════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "branchId" TEXT,
    "sessionId" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CustomRolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "CustomRolePermission_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "StudentAccount" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "creditBalance" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "StudentAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CreditTransaction" (
    "id" TEXT NOT NULL,
    "studentAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "referenceId" TEXT,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdmissionExam" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "academicSessionId" TEXT,
    "examDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "status" "AdmissionExamStatus" NOT NULL DEFAULT 'DRAFT',
    "maxScore" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionExam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdmissionExamScore" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "examId" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL,
    "maxScore" DECIMAL(5,2) NOT NULL DEFAULT 100,
    "grade" TEXT,
    "notes" TEXT,
    "gradedById" TEXT,
    "gradedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionExamScore_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "AdmissionInterview" (
    "id" TEXT NOT NULL,
    "admissionId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "interviewDate" TIMESTAMP(3) NOT NULL,
    "venue" TEXT,
    "interviewerName" TEXT,
    "interviewerId" TEXT,
    "notes" TEXT,
    "outcome" "InterviewOutcome",
    "status" "InterviewStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdmissionInterview_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ChartOfAccount" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "AccountType" NOT NULL,
    "parentId" TEXT,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ChartOfAccount_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalEntry" (
    "id" TEXT NOT NULL,
    "journalType" "JournalType" NOT NULL,
    "referenceId" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "GeneralLedgerEntry" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "side" "EntrySide" NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "description" TEXT,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneralLedgerEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "TaxRate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "type" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TaxRate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BankStatementLine" (
    "id" TEXT NOT NULL,
    "transactionRef" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "type" TEXT NOT NULL,
    "matchedPaymentId" TEXT,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT,
    "isReconciled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "BankStatementLine_pkey" PRIMARY KEY ("id")
);

-- ═══════════════════════════════════════════════════════════════════════
-- 4. MISSING UNIQUE CONSTRAINTS AND INDEXES
-- ═══════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "Role_slug_key" ON "Role"("slug");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "StudentAccount_studentId_key" ON "StudentAccount"("studentId");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "ChartOfAccount_code_key" ON "ChartOfAccount"("code");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "CustomRolePermission_roleId_module_action_key" ON "CustomRolePermission"("roleId", "module", "action");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "AdmissionExamScore_admissionId_examId_key" ON "AdmissionExamScore"("admissionId", "examId");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE UNIQUE INDEX IF NOT EXISTS "AdmissionInterview_admissionId_key" ON "AdmissionInterview"("admissionId");
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "Role_sessionId_idx" ON "Role"("sessionId");
CREATE INDEX IF NOT EXISTS "StudentAccount_studentId_idx" ON "StudentAccount"("studentId");
CREATE INDEX IF NOT EXISTS "StudentAccount_branchId_idx" ON "StudentAccount"("branchId");
CREATE INDEX IF NOT EXISTS "StudentAccount_sessionId_idx" ON "StudentAccount"("sessionId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_studentAccountId_idx" ON "CreditTransaction"("studentAccountId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_createdAt_idx" ON "CreditTransaction"("createdAt");
CREATE INDEX IF NOT EXISTS "CreditTransaction_branchId_idx" ON "CreditTransaction"("branchId");
CREATE INDEX IF NOT EXISTS "CreditTransaction_sessionId_idx" ON "CreditTransaction"("sessionId");
CREATE INDEX IF NOT EXISTS "AdmissionExam_branchId_idx" ON "AdmissionExam"("branchId");
CREATE INDEX IF NOT EXISTS "AdmissionExam_examDate_idx" ON "AdmissionExam"("examDate");
CREATE INDEX IF NOT EXISTS "AdmissionExam_status_idx" ON "AdmissionExam"("status");
CREATE INDEX IF NOT EXISTS "AdmissionExamScore_examId_idx" ON "AdmissionExamScore"("examId");
CREATE INDEX IF NOT EXISTS "AdmissionExamScore_admissionId_idx" ON "AdmissionExamScore"("admissionId");
CREATE INDEX IF NOT EXISTS "AdmissionInterview_branchId_idx" ON "AdmissionInterview"("branchId");
CREATE INDEX IF NOT EXISTS "AdmissionInterview_interviewDate_idx" ON "AdmissionInterview"("interviewDate");
CREATE INDEX IF NOT EXISTS "AdmissionInterview_status_idx" ON "AdmissionInterview"("status");
CREATE INDEX IF NOT EXISTS "AdmissionInterview_sessionId_idx" ON "AdmissionInterview"("sessionId");
CREATE INDEX IF NOT EXISTS "AcademicSession_branchId_status_idx" ON "AcademicSession"("branchId", "status");
CREATE INDEX IF NOT EXISTS "User_roleId_idx" ON "User"("roleId");
CREATE INDEX IF NOT EXISTS "OnlineAdmission_offeredClassId_idx" ON "OnlineAdmission"("offeredClassId");
CREATE INDEX IF NOT EXISTS "Voucher_branchId_date_idx" ON "Voucher"("branchId", "date");
CREATE INDEX IF NOT EXISTS "ChartOfAccount_branchId_idx" ON "ChartOfAccount"("branchId");
CREATE INDEX IF NOT EXISTS "ChartOfAccount_sessionId_idx" ON "ChartOfAccount"("sessionId");
CREATE INDEX IF NOT EXISTS "ChartOfAccount_type_idx" ON "ChartOfAccount"("type");
CREATE INDEX IF NOT EXISTS "ChartOfAccount_code_idx" ON "ChartOfAccount"("code");
CREATE INDEX IF NOT EXISTS "JournalEntry_branchId_idx" ON "JournalEntry"("branchId");
CREATE INDEX IF NOT EXISTS "JournalEntry_sessionId_idx" ON "JournalEntry"("sessionId");
CREATE INDEX IF NOT EXISTS "JournalEntry_journalType_referenceId_idx" ON "JournalEntry"("journalType", "referenceId");
CREATE INDEX IF NOT EXISTS "JournalEntry_date_idx" ON "JournalEntry"("date");
CREATE INDEX IF NOT EXISTS "GeneralLedgerEntry_journalId_idx" ON "GeneralLedgerEntry"("journalId");
CREATE INDEX IF NOT EXISTS "GeneralLedgerEntry_accountId_idx" ON "GeneralLedgerEntry"("accountId");
CREATE INDEX IF NOT EXISTS "GeneralLedgerEntry_branchId_idx" ON "GeneralLedgerEntry"("branchId");
CREATE INDEX IF NOT EXISTS "GeneralLedgerEntry_sessionId_idx" ON "GeneralLedgerEntry"("sessionId");
CREATE INDEX IF NOT EXISTS "TaxRate_branchId_idx" ON "TaxRate"("branchId");
CREATE INDEX IF NOT EXISTS "TaxRate_sessionId_idx" ON "TaxRate"("sessionId");
CREATE INDEX IF NOT EXISTS "BankStatementLine_branchId_idx" ON "BankStatementLine"("branchId");
CREATE INDEX IF NOT EXISTS "BankStatementLine_sessionId_idx" ON "BankStatementLine"("sessionId");
CREATE INDEX IF NOT EXISTS "BankStatementLine_date_idx" ON "BankStatementLine"("date");
CREATE INDEX IF NOT EXISTS "BankStatementLine_matchedPaymentId_idx" ON "BankStatementLine"("matchedPaymentId");
CREATE INDEX IF NOT EXISTS "BankStatementLine_isReconciled_idx" ON "BankStatementLine"("isReconciled");

-- ═══════════════════════════════════════════════════════════════════════
-- 5. MISSING FOREIGN KEYS
-- ═══════════════════════════════════════════════════════════════════════

DO $$ BEGIN
    ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CustomRolePermission" ADD CONSTRAINT "CustomRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "StudentAccount" ADD CONSTRAINT "StudentAccount_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_studentAccountId_fkey" FOREIGN KEY ("studentAccountId") REFERENCES "StudentAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionExam" ADD CONSTRAINT "AdmissionExam_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionExam" ADD CONSTRAINT "AdmissionExam_academicSessionId_fkey" FOREIGN KEY ("academicSessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionExamScore" ADD CONSTRAINT "AdmissionExamScore_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "OnlineAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionExamScore" ADD CONSTRAINT "AdmissionExamScore_examId_fkey" FOREIGN KEY ("examId") REFERENCES "AdmissionExam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionInterview" ADD CONSTRAINT "AdmissionInterview_admissionId_fkey" FOREIGN KEY ("admissionId") REFERENCES "OnlineAdmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "AdmissionInterview" ADD CONSTRAINT "AdmissionInterview_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Voucher" ADD CONSTRAINT "Voucher_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "OnlineAdmission" ADD CONSTRAINT "OnlineAdmission_offeredClassId_fkey" FOREIGN KEY ("offeredClassId") REFERENCES "Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "OnlineAdmission" ADD CONSTRAINT "OnlineAdmission_offeredSectionId_fkey" FOREIGN KEY ("offeredSectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "Role" ADD CONSTRAINT "Role_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ChartOfAccount
DO $$ BEGIN
    ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ChartOfAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "ChartOfAccount" ADD CONSTRAINT "ChartOfAccount_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- JournalEntry
DO $$ BEGIN
    ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- GeneralLedgerEntry
DO $$ BEGIN
    ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "JournalEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "ChartOfAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "GeneralLedgerEntry" ADD CONSTRAINT "GeneralLedgerEntry_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- TaxRate
DO $$ BEGIN
    ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "TaxRate" ADD CONSTRAINT "TaxRate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- BankStatementLine
DO $$ BEGIN
    ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_matchedPaymentId_fkey" FOREIGN KEY ("matchedPaymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "BankStatementLine" ADD CONSTRAINT "BankStatementLine_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "AcademicSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;