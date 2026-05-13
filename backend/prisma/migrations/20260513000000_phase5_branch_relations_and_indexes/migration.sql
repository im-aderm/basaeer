-- CreateTable: Already exists, only adding relations and indexes
-- This migration adds Branch relations to models that had branchId but no foreign key,
-- and adds missing composite indexes for query performance.

-- Add foreign key constraints for branchId columns that were missing them

-- Exam
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ExamType
ALTER TABLE "ExamType" ADD CONSTRAINT "ExamType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AssessmentComponent
ALTER TABLE "AssessmentComponent" ADD CONSTRAINT "AssessmentComponent_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ResultApproval
ALTER TABLE "ResultApproval" ADD CONSTRAINT "ResultApproval_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ResultPublication
ALTER TABLE "ResultPublication" ADD CONSTRAINT "ResultPublication_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- GPARecord
ALTER TABLE "GPARecord" ADD CONSTRAINT "GPARecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- StudentRanking
ALTER TABLE "StudentRanking" ADD CONSTRAINT "StudentRanking_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Broadsheet
ALTER TABLE "Broadsheet" ADD CONSTRAINT "Broadsheet_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Transcript
ALTER TABLE "Transcript" ADD CONSTRAINT "Transcript_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AcademicRemark
ALTER TABLE "AcademicRemark" ADD CONSTRAINT "AcademicRemark_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- SubjectPosition
ALTER TABLE "SubjectPosition" ADD CONSTRAINT "SubjectPosition_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- TahfeezAssessment
ALTER TABLE "TahfeezAssessment" ADD CONSTRAINT "TahfeezAssessment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- TahfeezMemorizationProgress
ALTER TABLE "TahfeezMemorizationProgress" ADD CONSTRAINT "TahfeezMemorizationProgress_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Invoice
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add missing composite indexes

CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");
CREATE INDEX IF NOT EXISTS "Invoice_branchId_status_idx" ON "Invoice"("branchId", "status");
CREATE INDEX IF NOT EXISTS "Invoice_branchId_dueDate_idx" ON "Invoice"("branchId", "dueDate");
CREATE INDEX IF NOT EXISTS "Payment_status_idx" ON "Payment"("status");
CREATE INDEX IF NOT EXISTS "LeaveRequest_status_idx" ON "LeaveRequest"("status");
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Student_parentId_idx" ON "Student"("parentId");
CREATE INDEX IF NOT EXISTS "Student_branchId_classId_idx" ON "Student"("branchId", "classId");
CREATE INDEX IF NOT EXISTS "User_role_isActive_idx" ON "User"("role", "isActive");
CREATE INDEX IF NOT EXISTS "User_email_isActive_idx" ON "User"("email", "isActive");
CREATE INDEX IF NOT EXISTS "Exam_sessionId_status_idx" ON "Exam"("sessionId", "status");
CREATE INDEX IF NOT EXISTS "AuditLog_module_idx" ON "AuditLog"("module");
CREATE INDEX IF NOT EXISTS "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");