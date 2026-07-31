-- Extends Postgres RLS coverage (phase9_rls_expansion) to every remaining
-- model with a REQUIRED (non-nullable) branchId column that was missed in
-- that migration -- these are exactly the models manually scoped at the
-- service layer (via TenantHelper.applyIsolation), not auto-scoped by the
-- Prisma extension, so RLS is the only framework-level safety net for a
-- missed branchId check on any of them.
--
-- Deliberately excludes models with an OPTIONAL branchId (e.g. GlobalSetting,
-- ModuleConfiguration, EmailTemplate, AuditLog, Notification, Role, ...) --
-- those follow a "global row (branchId IS NULL) with optional per-branch
-- override" pattern, and a naive `branchId = current_setting(...)` policy
-- would silently hide every global row from branch-scoped requests. Giving
-- those the right policy shape is a separate, deliberate follow-up.
--
-- NOTE: as with phase9_rls_expansion, these policies do not yet enforce
-- anything on their own -- FORCE ROW LEVEL SECURITY has not been added (see
-- the remediation plan), and without it the table-owning role (the app's own
-- DB role) bypasses RLS entirely. Enabling FORCE is intentionally deferred
-- to its own migration, after prisma.service.ts's corrected GUC-setting and
-- every worker's tenant-context propagation have been verified in staging.

ALTER TABLE "AcademicExport" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_academic_export ON "AcademicExport" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdmissionExam" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_admission_exam ON "AdmissionExam" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdmissionInterview" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_admission_interview ON "AdmissionInterview" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_api_key ON "ApiKey" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AttachmentCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_attachment_category ON "AttachmentCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AutomationConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_automation_config ON "AutomationConfig" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "BankStatementLine" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_bank_statement_line ON "BankStatementLine" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "BookCopy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_book_copy ON "BookCopy" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "BookReservation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_book_reservation ON "BookReservation" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ChartOfAccount" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_chart_of_account ON "ChartOfAccount" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ComputationJob" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_computation_job ON "ComputationJob" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Counter" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_counter ON "Counter" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "CreditTransaction" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_credit_transaction ON "CreditTransaction" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "EventApplication" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_event_application ON "EventApplication" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "GeneralLedgerEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_general_ledger_entry ON "GeneralLedgerEntry" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "GoogleMeetConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_google_meet_config ON "GoogleMeetConfig" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "HostelMaintenanceTicket" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_hostel_maintenance_ticket ON "HostelMaintenanceTicket" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "JournalEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_journal_entry ON "JournalEntry" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ReportTemplate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_report_template ON "ReportTemplate" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "StudentAccount" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_student_account ON "StudentAccount" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TaxRate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_tax_rate ON "TaxRate" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "WebhookEndpoint" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_webhook_endpoint ON "WebhookEndpoint" USING ("branchId" = current_setting('app.current_branch_id', true));
