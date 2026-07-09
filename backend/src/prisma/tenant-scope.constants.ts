/**
 * Models that the global Prisma tenant-isolation extension does NOT
 * automatically scope by branchId/sessionId.
 *
 * Two kinds of models live here:
 *   1. Genuinely global/system tables that have no branchId column and exist
 *      independently of any tenant (e.g. User, Role, Translation, AuditLog).
 *   2. Tenant tables that DO have a branchId column but are scoped manually at
 *      the service layer instead of by the extension (historically because they
 *      lack a sessionId column). These are listed in MANUALLY_SCOPED_MODELS
 *      below so that adding a new tenant model here is a conscious, reviewed act
 *      rather than a silent isolation gap.
 *
 * The invariant test in `tenant-scope.spec.ts` enforces that:
 *   - every model NOT in this list has a branchId field (so the extension's
 *     automatic branchId injection cannot throw at runtime), and
 *   - every model in this list that DOES have a branchId field is declared in
 *     MANUALLY_SCOPED_MODELS (so a tenant table cannot be silently exempted).
 *
 * Keep this in sync with the Prisma schema; the test will fail if it drifts.
 */
export const TENANT_EXEMPT_MODELS: string[] = [
  'AcademicSession', 'Branch', 'User', 'UserPreference',
  'Role', 'RolePermission', 'CustomRolePermission',
  'GlobalSetting', 'Translation', 'ScheduledJob', 'ModuleConfiguration',
  'AuditLog', 'EmailTemplate', 'SmsTemplate',
  'Notification', 'NotificationPreference',
  'Campaign', 'CampaignRecipient',
  'QueueJobLog', 'AutomationExecution', 'MessageDeliveryLog',
  'ProviderHealthLog', 'WebhookEvent', 'DeliveryWebhookLog',
  'RealtimeConnection', 'QueueMetric', 'ProviderFailoverEvent',
  'MessageRetryEvent', 'ProviderBalanceSnapshot', 'NotificationDeliveryEvent',
  'ApiKey', 'WebhookEndpoint', 'WebhookDeliveryLog',
  'Counter', 'PaymentWebhookLog',
  // Models without sessionId in DB (lost during schema rewrite — to be restored)
  'Student', 'Staff', 'Invoice', 'InvoiceItem', 'Payment',
  'Class', 'Section', 'Subject', 'Department', 'Designation',
  'FeeCategory', 'FeeStructure', 'ExpenseCategory',
  'Bed', 'Room', 'Hostel', 'HostelAllocation', 'HostelLeave',
  'AttendanceSession', 'AttendanceScan',
  'StaffAttendance', 'StaffAward',
  'LeaveRequest', 'AdvanceSalary', 'Payroll', 'SalaryTemplate',
  'Book', 'BookCopy', 'BookReservation', 'BorrowRecord', 'LibraryFine',
  'Vehicle', 'TransportRoute', 'TransportAssignment', 'TransportAttendance',
  'Certificate', 'CertificateTemplate',
  'Assignment', 'Submission',
  'AssessmentRecord', 'AssessmentComponent', 'AssessmentScore',
  'ResultSummary', 'BehaviouralRating', 'GradingScale',
  'Exam', 'ExamType', 'ResultApproval', 'ResultPublication',
  'GPARecord', 'StudentRanking', 'Broadsheet', 'Transcript',
  'TranscriptVerification', 'AcademicRemark', 'SubjectPosition',
  'TahfeezAssessment', 'TahfeezMemorizationProgress',
  'Question', 'QuestionGroup', 'QuestionOption', 'QuestionAnswer',
  'OnlineExam', 'OnlineExamAttempt',
  'OnlineAdmission', 'AdmissionEnquiry',
  'AdmissionExam', 'AdmissionExamScore', 'AdmissionInterview',
  'PreviousSchool', 'StudentCategory',
  'InventoryCategory', 'InventoryStore', 'InventorySupplier',
  'InventoryUnit', 'InventoryProduct', 'InventoryPurchase',
  'InventoryIssue', 'InventorySale',
  'CallLog', 'VisitorLog', 'Complaint', 'PostalRecord',
  'CampusEvent', 'EventRSVP', 'EventApplication', 'EventPackage', 'EventSchedule', 'EventGallery', 'EventCategory', 'EventPayment', 'Alumni', 'AlumniEvent', 'AlumniEventParticipant',
  'LiveClassSession', 'MeetingParticipant', 'GoogleMeetConfig',
  'IdCardTemplate', 'IdCard', 'DigitalResource', 'DigitalResourceLog',
  'AttachmentCategory', 'ReportTemplate', 'AcademicExport',
  'ComputationJob', 'DeactivationReason', 'LoginDeactivation',
  'AutomationConfig', 'Conversation', 'ConversationParticipant', 'Message',
  'ClassSchedule', 'MaintenanceRequest', 'HostelMaintenanceTicket',
  'CampusAccessLog',
];

/** Fast-membership set for the runtime extension. */
export const TENANT_EXEMPT_MODEL_SET = new Set(TENANT_EXEMPT_MODELS);
