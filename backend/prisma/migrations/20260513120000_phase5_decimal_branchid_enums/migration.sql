-- Phase 5.1: Convert Float money fields to Decimal(12,2)
ALTER TABLE "FeeStructure" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "Invoice" ALTER COLUMN "totalAmount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "Invoice" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InvoiceItem" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "Payment" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "LibraryFine" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "SalaryTemplate" ALTER COLUMN "basicSalary" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "SalaryTemplate" ALTER COLUMN "netSalary" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "Payroll" ALTER COLUMN "amountPaid" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "AdvanceSalary" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "Voucher" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventoryProduct" ALTER COLUMN "costPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventoryProduct" ALTER COLUMN "sellingPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventoryPurchase" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventoryPurchase" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventorySale" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "InventorySale" ALTER COLUMN "totalPrice" SET DATA TYPE DECIMAL(12,2);
ALTER TABLE "ProviderBalanceSnapshot" ALTER COLUMN "balance" SET DATA TYPE DECIMAL(12,2);

-- Phase 5.2: Add branchId to models that require tenant isolation
-- SalaryTemplate
ALTER TABLE "SalaryTemplate" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "SalaryTemplate_branchId_idx" ON "SalaryTemplate"("branchId");
ALTER TABLE "SalaryTemplate" ADD CONSTRAINT "SalaryTemplate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- Payroll
ALTER TABLE "Payroll" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Payroll_branchId_idx" ON "Payroll"("branchId");
ALTER TABLE "Payroll" ADD CONSTRAINT "Payroll_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- LeaveRequest
ALTER TABLE "LeaveRequest" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "LeaveRequest_branchId_idx" ON "LeaveRequest"("branchId");
ALTER TABLE "LeaveRequest" ADD CONSTRAINT "LeaveRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- StaffAward
ALTER TABLE "StaffAward" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "StaffAward_branchId_idx" ON "StaffAward"("branchId");
ALTER TABLE "StaffAward" ADD CONSTRAINT "StaffAward_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- AdvanceSalary
ALTER TABLE "AdvanceSalary" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "AdvanceSalary_branchId_idx" ON "AdvanceSalary"("branchId");
ALTER TABLE "AdvanceSalary" ADD CONSTRAINT "AdvanceSalary_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- HostelAllocation
ALTER TABLE "HostelAllocation" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "HostelAllocation_branchId_idx" ON "HostelAllocation"("branchId");
ALTER TABLE "HostelAllocation" ADD CONSTRAINT "HostelAllocation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- HostelLeave
ALTER TABLE "HostelLeave" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "HostelLeave_branchId_idx" ON "HostelLeave"("branchId");
ALTER TABLE "HostelLeave" ADD CONSTRAINT "HostelLeave_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- MaintenanceRequest
ALTER TABLE "MaintenanceRequest" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "MaintenanceRequest_branchId_idx" ON "MaintenanceRequest"("branchId");
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- BorrowRecord
ALTER TABLE "BorrowRecord" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "BorrowRecord_branchId_idx" ON "BorrowRecord"("branchId");
ALTER TABLE "BorrowRecord" ADD CONSTRAINT "BorrowRecord_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- LibraryFine
ALTER TABLE "LibraryFine" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "LibraryFine_branchId_idx" ON "LibraryFine"("branchId");
ALTER TABLE "LibraryFine" ADD CONSTRAINT "LibraryFine_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- Submission
ALTER TABLE "Submission" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "Submission_branchId_idx" ON "Submission"("branchId");
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- ClassSchedule
ALTER TABLE "ClassSchedule" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "ClassSchedule_branchId_idx" ON "ClassSchedule"("branchId");
ALTER TABLE "ClassSchedule" ADD CONSTRAINT "ClassSchedule_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- IdCard
ALTER TABLE "IdCard" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
CREATE INDEX "IdCard_branchId_idx" ON "IdCard"("branchId");
ALTER TABLE "IdCard" ADD CONSTRAINT "IdCard_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON UPDATE CASCADE ON DELETE RESTRICT;

-- BookCopy - model removed from schema, skip

-- BookReservation - table not created yet, skip

-- HostelMaintenanceTicket - table not created yet, skip

-- Remove temporary defaults from new branchId columns
ALTER TABLE "SalaryTemplate" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "Payroll" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "LeaveRequest" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "StaffAward" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "AdvanceSalary" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "HostelAllocation" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "HostelLeave" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "BorrowRecord" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "LibraryFine" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "Submission" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "ClassSchedule" ALTER COLUMN "branchId" DROP DEFAULT;
ALTER TABLE "IdCard" ALTER COLUMN "branchId" DROP DEFAULT;

-- Phase 5.4: Convert String status fields to Enums
-- Create new enum types
CREATE TYPE "StaffStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'SUSPENDED', 'RESIGNED', 'RETIRED');
CREATE TYPE "BorrowStatus" AS ENUM ('BORROWED', 'RETURNED', 'OVERDUE', 'LOST');
CREATE TYPE "PayrollStatus" AS ENUM ('UNPAID', 'PAID', 'PROCESSING');
CREATE TYPE "LeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "AdvanceSalaryStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PAID');
CREATE TYPE "AdmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'ENROLLED', 'CANCELLED');
CREATE TYPE "IssueStatus" AS ENUM ('ISSUED', 'RETURNED', 'LOST', 'DAMAGED');
CREATE TYPE "SubmissionStatus" AS ENUM ('SUBMITTED', 'GRADED', 'LATE', 'MISSING');
CREATE TYPE "IdCardStatusEnum" AS ENUM ('CREATED', 'PRINTED', 'ISSUED', 'EXPIRED');
CREATE TYPE "MaintenanceStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE "MaintenancePriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED', 'EXPIRED');
CREATE TYPE "HostelLeaveStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE "EventParticipationStatus" AS ENUM ('INTERESTED', 'GOING', 'NOT_GOING', 'REGISTERED', 'DECLINED');

-- Add VERIFIED to existing PaymentStatus enum
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'VERIFIED';

-- Alter Staff.status to StaffStatus
ALTER TABLE "Staff" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Staff" ALTER COLUMN "status" TYPE "StaffStatus" USING ("status"::"StaffStatus");
ALTER TABLE "Staff" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- Alter BorrowRecord.status to BorrowStatus
ALTER TABLE "BorrowRecord" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "BorrowRecord" ALTER COLUMN "status" TYPE "BorrowStatus" USING ("status"::"BorrowStatus");
ALTER TABLE "BorrowRecord" ALTER COLUMN "status" SET DEFAULT 'BORROWED';

-- Alter Payroll.status to PayrollStatus
ALTER TABLE "Payroll" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Payroll" ALTER COLUMN "status" TYPE "PayrollStatus" USING ("status"::"PayrollStatus");
ALTER TABLE "Payroll" ALTER COLUMN "status" SET DEFAULT 'UNPAID';

-- Alter LeaveRequest.status to LeaveStatus
ALTER TABLE "LeaveRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LeaveRequest" ALTER COLUMN "status" TYPE "LeaveStatus" USING ("status"::"LeaveStatus");
ALTER TABLE "LeaveRequest" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Alter AdvanceSalary.status to AdvanceSalaryStatus
ALTER TABLE "AdvanceSalary" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AdvanceSalary" ALTER COLUMN "status" TYPE "AdvanceSalaryStatus" USING ("status"::"AdvanceSalaryStatus");
ALTER TABLE "AdvanceSalary" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Alter OnlineAdmission.status to AdmissionStatus
ALTER TABLE "OnlineAdmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OnlineAdmission" ALTER COLUMN "status" TYPE "AdmissionStatus" USING ("status"::"AdmissionStatus");
ALTER TABLE "OnlineAdmission" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Alter OnlineAdmission.paymentStatus to PaymentStatus
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus" USING ("paymentStatus"::"PaymentStatus");
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';

-- Alter OnlineAdmission.paymentMethod to PaymentMethod
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentMethod" DROP DEFAULT;
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod" USING ("paymentMethod"::"PaymentMethod");
ALTER TABLE "OnlineAdmission" ALTER COLUMN "paymentMethod" SET DEFAULT 'BANK_TRANSFER';

-- Alter InventoryIssue.status to IssueStatus
ALTER TABLE "InventoryIssue" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "InventoryIssue" ALTER COLUMN "status" TYPE "IssueStatus" USING ("status"::"IssueStatus");
ALTER TABLE "InventoryIssue" ALTER COLUMN "status" SET DEFAULT 'ISSUED';

-- Alter Submission.status to SubmissionStatus
ALTER TABLE "Submission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Submission" ALTER COLUMN "status" TYPE "SubmissionStatus" USING ("status"::"SubmissionStatus");
ALTER TABLE "Submission" ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- Alter IdCard.status to IdCardStatusEnum
ALTER TABLE "IdCard" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "IdCard" ALTER COLUMN "status" TYPE "IdCardStatusEnum" USING ("status"::"IdCardStatusEnum");
ALTER TABLE "IdCard" ALTER COLUMN "status" SET DEFAULT 'CREATED';

-- Alter BookCopy.status - model removed from schema, skip

-- Alter BookReservation.status - table not created yet, skip

-- Alter HostelLeave.status to HostelLeaveStatus
ALTER TABLE "HostelLeave" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "HostelLeave" ALTER COLUMN "status" TYPE "HostelLeaveStatus" USING ("status"::"HostelLeaveStatus");
ALTER TABLE "HostelLeave" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Alter MaintenanceRequest.status to MaintenanceStatus
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "status" TYPE "MaintenanceStatus" USING ("status"::"MaintenanceStatus");
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- Alter MaintenanceRequest.priority to MaintenancePriority
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "priority" DROP DEFAULT;
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "priority" TYPE "MaintenancePriority" USING ("priority"::"MaintenancePriority");
ALTER TABLE "MaintenanceRequest" ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';

-- Alter HostelMaintenanceTicket - table not created yet, skip

-- Alter AlumniEventParticipant.status to EventParticipationStatus
ALTER TABLE "AlumniEventParticipant" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AlumniEventParticipant" ALTER COLUMN "status" TYPE "EventParticipationStatus" USING ("status"::"EventParticipationStatus");
ALTER TABLE "AlumniEventParticipant" ALTER COLUMN "status" SET DEFAULT 'INTERESTED';

-- Alter EventRSVP.status to EventParticipationStatus
ALTER TABLE "EventRSVP" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "EventRSVP" ALTER COLUMN "status" TYPE "EventParticipationStatus" USING ("status"::"EventParticipationStatus");
ALTER TABLE "EventRSVP" ALTER COLUMN "status" SET DEFAULT 'INTERESTED';
