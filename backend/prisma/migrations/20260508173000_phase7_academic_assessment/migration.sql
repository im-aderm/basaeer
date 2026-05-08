-- Phase 7 academic assessment foundation.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'HOD';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PRINCIPAL';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'EXAM_OFFICER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'ACADEMIC_OFFICER';

CREATE TYPE "AcademicExamStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'MARK_ENTRY', 'UNDER_REVIEW', 'APPROVED', 'OPEN', 'LOCKED', 'PUBLISHED', 'ARCHIVED');
CREATE TYPE "ResultApprovalStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'EXAMINER_REVIEW', 'HOD_REVIEW', 'PRINCIPAL_REVIEW', 'APPROVED', 'REJECTED', 'REVISION_REQUESTED', 'PUBLISHED');
CREATE TYPE "RankingScope" AS ENUM ('CLASS', 'SECTION', 'BRANCH', 'SUBJECT', 'OVERALL');
CREATE TYPE "TranscriptStatus" AS ENUM ('DRAFT', 'APPROVED', 'LOCKED', 'REVOKED');

ALTER TABLE "GradingScale"
ADD COLUMN "scaleType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
ADD COLUMN "gradePoint" DOUBLE PRECISION,
ADD COLUMN "classOfResult" TEXT,
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE TABLE "Exam" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "status" "AcademicExamStatus" NOT NULL DEFAULT 'DRAFT',
    "branchId" TEXT NOT NULL,
    "classId" TEXT,
    "sectionId" TEXT,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "gradingStartsAt" TIMESTAMP(3),
    "gradingEndsAt" TIMESTAMP(3),
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "lockedAt" TIMESTAMP(3),
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Exam_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ExamType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "weight" DOUBLE PRECISION NOT NULL,
    "branchId" TEXT NOT NULL,
    "classId" TEXT,
    "level" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExamType_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AssessmentComponent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "branchId" TEXT NOT NULL,
    "classId" TEXT,
    "subjectId" TEXT,
    "curriculum" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AssessmentComponent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResultApproval" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "classId" TEXT,
    "sectionId" TEXT,
    "subjectId" TEXT,
    "status" "ResultApprovalStatus" NOT NULL DEFAULT 'DRAFT',
    "currentStep" TEXT NOT NULL DEFAULT 'TEACHER',
    "requestedById" TEXT,
    "reviewedById" TEXT,
    "rejectionNote" TEXT,
    "revisionNote" TEXT,
    "approvedAt" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResultApproval_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResultPublication" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "classId" TEXT,
    "sectionId" TEXT,
    "publishedById" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ResultPublication_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GPARecord" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "totalGradePoint" DOUBLE PRECISION NOT NULL,
    "creditUnits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gpa" DOUBLE PRECISION NOT NULL,
    "cgpa" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "GPARecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StudentRanking" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "scope" "RankingScope" NOT NULL,
    "scopeId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "rank" INTEGER NOT NULL,
    "outOf" INTEGER NOT NULL,
    "tieGroup" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "StudentRanking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Broadsheet" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "classId" TEXT NOT NULL,
    "sectionId" TEXT,
    "generatedById" TEXT,
    "checksum" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Broadsheet_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transcript" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "transcriptNo" TEXT NOT NULL,
    "status" "TranscriptStatus" NOT NULL DEFAULT 'DRAFT',
    "cumulativeGpa" DOUBLE PRECISION,
    "checksum" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Transcript_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TranscriptVerification" (
    "id" TEXT NOT NULL,
    "transcriptId" TEXT NOT NULL,
    "verificationCode" TEXT NOT NULL,
    "qrPayload" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TranscriptVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AcademicRemark" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "authorId" TEXT,
    "category" TEXT NOT NULL,
    "remark" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AcademicRemark_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SubjectPosition" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "position" INTEGER NOT NULL,
    "outOf" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SubjectPosition_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TahfeezAssessment" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT,
    "sessionId" TEXT NOT NULL,
    "term" "Term" NOT NULL,
    "surah" TEXT NOT NULL,
    "juz" TEXT,
    "fromAyah" INTEGER,
    "toAyah" INTEGER,
    "memorizationScore" DOUBLE PRECISION NOT NULL,
    "tajweedScore" DOUBLE PRECISION NOT NULL,
    "fluencyScore" DOUBLE PRECISION NOT NULL,
    "revisionScore" DOUBLE PRECISION,
    "totalScore" DOUBLE PRECISION NOT NULL,
    "grade" TEXT,
    "remark" TEXT,
    "assessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TahfeezAssessment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TahfeezMemorizationProgress" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "currentSurah" TEXT NOT NULL,
    "currentJuz" TEXT,
    "completedAyahs" INTEGER NOT NULL DEFAULT 0,
    "totalAyahs" INTEGER NOT NULL DEFAULT 0,
    "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastReviewedAt" TIMESTAMP(3),
    "teacherRemark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TahfeezMemorizationProgress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "GradingScale_branchId_scaleType_isActive_idx" ON "GradingScale"("branchId", "scaleType", "isActive");
CREATE INDEX "Exam_branchId_sessionId_term_idx" ON "Exam"("branchId", "sessionId", "term");
CREATE INDEX "Exam_branchId_classId_sectionId_idx" ON "Exam"("branchId", "classId", "sectionId");
CREATE INDEX "Exam_status_isArchived_idx" ON "Exam"("status", "isArchived");
CREATE UNIQUE INDEX "ExamType_branchId_name_classId_key" ON "ExamType"("branchId", "name", "classId");
CREATE INDEX "ExamType_branchId_isActive_idx" ON "ExamType"("branchId", "isActive");
CREATE UNIQUE INDEX "AssessmentComponent_branchId_name_classId_subjectId_key" ON "AssessmentComponent"("branchId", "name", "classId", "subjectId");
CREATE INDEX "AssessmentComponent_branchId_classId_subjectId_idx" ON "AssessmentComponent"("branchId", "classId", "subjectId");
CREATE INDEX "ResultApproval_branchId_sessionId_term_idx" ON "ResultApproval"("branchId", "sessionId", "term");
CREATE INDEX "ResultApproval_branchId_status_idx" ON "ResultApproval"("branchId", "status");
CREATE UNIQUE INDEX "ResultPublication_branchId_sessionId_term_classId_sectionId_key" ON "ResultPublication"("branchId", "sessionId", "term", "classId", "sectionId");
CREATE INDEX "ResultPublication_branchId_isPublished_idx" ON "ResultPublication"("branchId", "isPublished");
CREATE UNIQUE INDEX "GPARecord_studentId_sessionId_term_key" ON "GPARecord"("studentId", "sessionId", "term");
CREATE INDEX "GPARecord_branchId_sessionId_term_idx" ON "GPARecord"("branchId", "sessionId", "term");
CREATE UNIQUE INDEX "StudentRanking_studentId_sessionId_term_scope_scopeId_key" ON "StudentRanking"("studentId", "sessionId", "term", "scope", "scopeId");
CREATE INDEX "StudentRanking_branchId_sessionId_term_scope_idx" ON "StudentRanking"("branchId", "sessionId", "term", "scope");
CREATE INDEX "Broadsheet_branchId_sessionId_term_idx" ON "Broadsheet"("branchId", "sessionId", "term");
CREATE INDEX "Broadsheet_classId_sectionId_idx" ON "Broadsheet"("classId", "sectionId");
CREATE UNIQUE INDEX "Transcript_transcriptNo_key" ON "Transcript"("transcriptNo");
CREATE INDEX "Transcript_branchId_studentId_idx" ON "Transcript"("branchId", "studentId");
CREATE INDEX "Transcript_status_idx" ON "Transcript"("status");
CREATE UNIQUE INDEX "TranscriptVerification_verificationCode_key" ON "TranscriptVerification"("verificationCode");
CREATE INDEX "TranscriptVerification_transcriptId_idx" ON "TranscriptVerification"("transcriptId");
CREATE INDEX "AcademicRemark_branchId_sessionId_term_idx" ON "AcademicRemark"("branchId", "sessionId", "term");
CREATE INDEX "AcademicRemark_studentId_sessionId_term_idx" ON "AcademicRemark"("studentId", "sessionId", "term");
CREATE UNIQUE INDEX "SubjectPosition_studentId_subjectId_sessionId_term_key" ON "SubjectPosition"("studentId", "subjectId", "sessionId", "term");
CREATE INDEX "SubjectPosition_branchId_sectionId_subjectId_idx" ON "SubjectPosition"("branchId", "sectionId", "subjectId");
CREATE INDEX "TahfeezAssessment_branchId_sessionId_term_idx" ON "TahfeezAssessment"("branchId", "sessionId", "term");
CREATE INDEX "TahfeezAssessment_studentId_sessionId_term_idx" ON "TahfeezAssessment"("studentId", "sessionId", "term");
CREATE UNIQUE INDEX "TahfeezMemorizationProgress_studentId_currentSurah_key" ON "TahfeezMemorizationProgress"("studentId", "currentSurah");
CREATE INDEX "TahfeezMemorizationProgress_branchId_studentId_idx" ON "TahfeezMemorizationProgress"("branchId", "studentId");
