/*
  Warnings:

  - The `status` column on the `Voucher` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "VoucherStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "resetTokenExpires" TIMESTAMP(3),
ADD COLUMN     "resetTokenHash" TEXT;

-- AlterTable
ALTER TABLE "Voucher" DROP COLUMN "status",
ADD COLUMN     "status" "VoucherStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "language" TEXT NOT NULL DEFAULT 'en',
    "sidebarCollapsed" BOOLEAN NOT NULL DEFAULT false,
    "dashboardWidgets" JSONB,
    "notifications" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModuleConfiguration" (
    "id" TEXT NOT NULL,
    "moduleKey" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "config" JSONB,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModuleConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Translation" (
    "id" TEXT NOT NULL,
    "locale" TEXT NOT NULL,
    "group" TEXT NOT NULL DEFAULT 'general',
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Translation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduledJob" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cron" TEXT NOT NULL,
    "lastRun" TIMESTAMP(3),
    "nextRun" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'IDLE',
    "lastResult" TEXT,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduledJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "type" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SmsTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "variables" JSONB,
    "type" TEXT NOT NULL,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SmsTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "email" BOOLEAN NOT NULL DEFAULT true,
    "sms" BOOLEAN NOT NULL DEFAULT true,
    "inApp" BOOLEAN NOT NULL DEFAULT true,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "scheduledAt" TIMESTAMP(3),
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRecipient" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT NOT NULL,
    "deliveryLog" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRecipient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueJobLog" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "queueName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "data" JSONB,
    "result" JSONB,
    "error" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueJobLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationExecution" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageDeliveryLog" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "providerResponse" JSONB,
    "branchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageDeliveryLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "ModuleConfiguration_branchId_idx" ON "ModuleConfiguration"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "ModuleConfiguration_moduleKey_branchId_key" ON "ModuleConfiguration"("moduleKey", "branchId");

-- CreateIndex
CREATE INDEX "Translation_locale_group_idx" ON "Translation"("locale", "group");

-- CreateIndex
CREATE UNIQUE INDEX "Translation_locale_group_key_key" ON "Translation"("locale", "group", "key");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduledJob_name_key" ON "ScheduledJob"("name");

-- CreateIndex
CREATE INDEX "ScheduledJob_branchId_idx" ON "ScheduledJob"("branchId");

-- CreateIndex
CREATE INDEX "EmailTemplate_branchId_idx" ON "EmailTemplate"("branchId");

-- CreateIndex
CREATE INDEX "SmsTemplate_branchId_idx" ON "SmsTemplate"("branchId");

-- CreateIndex
CREATE INDEX "Notification_branchId_idx" ON "Notification"("branchId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_branchId_idx" ON "NotificationPreference"("branchId");

-- CreateIndex
CREATE INDEX "Campaign_branchId_idx" ON "Campaign"("branchId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_campaignId_idx" ON "CampaignRecipient"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_userId_idx" ON "CampaignRecipient"("userId");

-- CreateIndex
CREATE INDEX "CampaignRecipient_branchId_idx" ON "CampaignRecipient"("branchId");

-- CreateIndex
CREATE INDEX "QueueJobLog_branchId_idx" ON "QueueJobLog"("branchId");

-- CreateIndex
CREATE INDEX "QueueJobLog_jobId_idx" ON "QueueJobLog"("jobId");

-- CreateIndex
CREATE INDEX "AutomationExecution_configId_idx" ON "AutomationExecution"("configId");

-- CreateIndex
CREATE INDEX "AutomationExecution_branchId_idx" ON "AutomationExecution"("branchId");

-- CreateIndex
CREATE INDEX "MessageDeliveryLog_branchId_idx" ON "MessageDeliveryLog"("branchId");

-- CreateIndex
CREATE INDEX "AdmissionEnquiry_branchId_idx" ON "AdmissionEnquiry"("branchId");

-- CreateIndex
CREATE INDEX "AdvanceSalary_staffId_idx" ON "AdvanceSalary"("staffId");

-- CreateIndex
CREATE INDEX "Alumni_branchId_idx" ON "Alumni"("branchId");

-- CreateIndex
CREATE INDEX "AlumniEvent_branchId_idx" ON "AlumniEvent"("branchId");

-- CreateIndex
CREATE INDEX "Assignment_branchId_idx" ON "Assignment"("branchId");

-- CreateIndex
CREATE INDEX "Attendance_branchId_sectionId_date_idx" ON "Attendance"("branchId", "sectionId", "date");

-- CreateIndex
CREATE INDEX "Attendance_sectionId_date_idx" ON "Attendance"("sectionId", "date");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AutomationConfig_branchId_idx" ON "AutomationConfig"("branchId");

-- CreateIndex
CREATE INDEX "Book_branchId_idx" ON "Book"("branchId");

-- CreateIndex
CREATE INDEX "BorrowRecord_studentId_idx" ON "BorrowRecord"("studentId");

-- CreateIndex
CREATE INDEX "CallLog_branchId_idx" ON "CallLog"("branchId");

-- CreateIndex
CREATE INDEX "CampusAccessLog_branchId_idx" ON "CampusAccessLog"("branchId");

-- CreateIndex
CREATE INDEX "CampusEvent_branchId_idx" ON "CampusEvent"("branchId");

-- CreateIndex
CREATE INDEX "Certificate_branchId_idx" ON "Certificate"("branchId");

-- CreateIndex
CREATE INDEX "CertificateTemplate_branchId_idx" ON "CertificateTemplate"("branchId");

-- CreateIndex
CREATE INDEX "Class_branchId_idx" ON "Class"("branchId");

-- CreateIndex
CREATE INDEX "ClassSchedule_classId_sectionId_idx" ON "ClassSchedule"("classId", "sectionId");

-- CreateIndex
CREATE INDEX "Complaint_branchId_idx" ON "Complaint"("branchId");

-- CreateIndex
CREATE INDEX "Conversation_branchId_idx" ON "Conversation"("branchId");

-- CreateIndex
CREATE INDEX "DeactivationReason_branchId_idx" ON "DeactivationReason"("branchId");

-- CreateIndex
CREATE INDEX "Department_branchId_idx" ON "Department"("branchId");

-- CreateIndex
CREATE INDEX "Designation_branchId_idx" ON "Designation"("branchId");

-- CreateIndex
CREATE INDEX "DigitalResource_branchId_idx" ON "DigitalResource"("branchId");

-- CreateIndex
CREATE INDEX "DigitalResourceLog_resourceId_idx" ON "DigitalResourceLog"("resourceId");

-- CreateIndex
CREATE INDEX "ExpenseCategory_branchId_idx" ON "ExpenseCategory"("branchId");

-- CreateIndex
CREATE INDEX "FeeCategory_branchId_idx" ON "FeeCategory"("branchId");

-- CreateIndex
CREATE INDEX "FeeStructure_branchId_idx" ON "FeeStructure"("branchId");

-- CreateIndex
CREATE INDEX "Hostel_branchId_idx" ON "Hostel"("branchId");

-- CreateIndex
CREATE INDEX "HostelAllocation_studentId_idx" ON "HostelAllocation"("studentId");

-- CreateIndex
CREATE INDEX "HostelLeave_studentId_idx" ON "HostelLeave"("studentId");

-- CreateIndex
CREATE INDEX "IdCardTemplate_branchId_idx" ON "IdCardTemplate"("branchId");

-- CreateIndex
CREATE INDEX "InventoryCategory_branchId_idx" ON "InventoryCategory"("branchId");

-- CreateIndex
CREATE INDEX "InventoryIssue_branchId_idx" ON "InventoryIssue"("branchId");

-- CreateIndex
CREATE INDEX "InventoryProduct_branchId_idx" ON "InventoryProduct"("branchId");

-- CreateIndex
CREATE INDEX "InventoryPurchase_branchId_idx" ON "InventoryPurchase"("branchId");

-- CreateIndex
CREATE INDEX "InventorySale_branchId_idx" ON "InventorySale"("branchId");

-- CreateIndex
CREATE INDEX "InventoryStore_branchId_idx" ON "InventoryStore"("branchId");

-- CreateIndex
CREATE INDEX "InventorySupplier_branchId_idx" ON "InventorySupplier"("branchId");

-- CreateIndex
CREATE INDEX "InventoryUnit_branchId_idx" ON "InventoryUnit"("branchId");

-- CreateIndex
CREATE INDEX "Invoice_branchId_idx" ON "Invoice"("branchId");

-- CreateIndex
CREATE INDEX "Invoice_studentId_idx" ON "Invoice"("studentId");

-- CreateIndex
CREATE INDEX "InvoiceItem_invoiceId_idx" ON "InvoiceItem"("invoiceId");

-- CreateIndex
CREATE INDEX "LeaveRequest_staffId_idx" ON "LeaveRequest"("staffId");

-- CreateIndex
CREATE INDEX "LiveClassSession_branchId_idx" ON "LiveClassSession"("branchId");

-- CreateIndex
CREATE INDEX "LoginDeactivation_branchId_idx" ON "LoginDeactivation"("branchId");

-- CreateIndex
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");

-- CreateIndex
CREATE INDEX "OnlineAdmission_branchId_idx" ON "OnlineAdmission"("branchId");

-- CreateIndex
CREATE INDEX "OnlineExam_branchId_idx" ON "OnlineExam"("branchId");

-- CreateIndex
CREATE INDEX "OnlineExamAttempt_studentId_idx" ON "OnlineExamAttempt"("studentId");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Payroll_staffId_idx" ON "Payroll"("staffId");

-- CreateIndex
CREATE INDEX "PostalRecord_branchId_idx" ON "PostalRecord"("branchId");

-- CreateIndex
CREATE INDEX "Question_groupId_idx" ON "Question"("groupId");

-- CreateIndex
CREATE INDEX "QuestionGroup_branchId_idx" ON "QuestionGroup"("branchId");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_idx" ON "QuestionOption"("questionId");

-- CreateIndex
CREATE INDEX "Section_classId_idx" ON "Section"("classId");

-- CreateIndex
CREATE INDEX "StaffAward_staffId_idx" ON "StaffAward"("staffId");

-- CreateIndex
CREATE INDEX "Student_branchId_idx" ON "Student"("branchId");

-- CreateIndex
CREATE INDEX "Student_branchId_classId_sectionId_idx" ON "Student"("branchId", "classId", "sectionId");

-- CreateIndex
CREATE INDEX "Student_classId_sectionId_idx" ON "Student"("classId", "sectionId");

-- CreateIndex
CREATE INDEX "StudentCategory_branchId_idx" ON "StudentCategory"("branchId");

-- CreateIndex
CREATE INDEX "Subject_branchId_idx" ON "Subject"("branchId");

-- CreateIndex
CREATE INDEX "Submission_assignmentId_idx" ON "Submission"("assignmentId");

-- CreateIndex
CREATE INDEX "TransportRoute_branchId_idx" ON "TransportRoute"("branchId");

-- CreateIndex
CREATE INDEX "User_branchId_idx" ON "User"("branchId");

-- CreateIndex
CREATE INDEX "Vehicle_branchId_idx" ON "Vehicle"("branchId");

-- CreateIndex
CREATE INDEX "VisitorLog_branchId_idx" ON "VisitorLog"("branchId");

-- CreateIndex
CREATE INDEX "Voucher_branchId_idx" ON "Voucher"("branchId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModuleConfiguration" ADD CONSTRAINT "ModuleConfiguration_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduledJob" ADD CONSTRAINT "ScheduledJob_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailTemplate" ADD CONSTRAINT "EmailTemplate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SmsTemplate" ADD CONSTRAINT "SmsTemplate_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRecipient" ADD CONSTRAINT "CampaignRecipient_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueJobLog" ADD CONSTRAINT "QueueJobLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_configId_fkey" FOREIGN KEY ("configId") REFERENCES "AutomationConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationExecution" ADD CONSTRAINT "AutomationExecution_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageDeliveryLog" ADD CONSTRAINT "MessageDeliveryLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
