-- Phase 9: Enable RLS on ALL tenant-scoped tables
-- This includes the original 10 tables from phase8 that were never applied, plus all remaining tables

-- Original 10 tables (from phase8_long_term_architecture that was skipped)
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_student ON "Student" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_user ON "User" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_invoice ON "Invoice" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_payment ON "Payment" USING ("invoiceId" IN (SELECT id FROM "Invoice" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_attendance ON "Attendance" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AssessmentRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_assessment_record ON "AssessmentRecord" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Voucher" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_voucher ON "Voucher" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_class ON "Class" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_subject ON "Subject" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Exam" ENABLE ROW LEVEL SECURITY;
CREATE POLICY branch_isolation_exam_base ON "Exam" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Core academic
ALTER TABLE "Section" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_section ON "Section" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Department" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_department ON "Department" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Designation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_designation ON "Designation" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Staff" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff ON "Staff" USING (
  "departmentId" IN (SELECT id FROM "Department" WHERE "branchId" = current_setting('app.current_branch_id', true))
  OR "branchId" IN (SELECT id FROM "Branch" WHERE id = current_setting('app.current_branch_id', true)::uuid)
);

-- Hostel
ALTER TABLE "Hostel" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hostel ON "Hostel" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_room ON "Room" USING ("hostelId" IN (SELECT id FROM "Hostel" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "Bed" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_bed ON "Bed" USING ("roomId" IN (SELECT id FROM "Room" WHERE "hostelId" IN (SELECT id FROM "Hostel" WHERE "branchId" = current_setting('app.current_branch_id', true))));

ALTER TABLE "HostelAllocation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hostel_allocation ON "HostelAllocation" USING ("hostelId" IN (SELECT id FROM "Hostel" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "HostelLeave" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hostel_leave ON "HostelLeave" USING ("allocationId" IN (SELECT id FROM "HostelAllocation" WHERE "hostelId" IN (SELECT id FROM "Hostel" WHERE "branchId" = current_setting('app.current_branch_id', true))));

-- Library
ALTER TABLE "Book" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book ON "Book" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "BookCopy" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book_copy ON "BookCopy" USING ("bookId" IN (SELECT id FROM "Book" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "BorrowRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_borrow_record ON "BorrowRecord" USING ("bookId" IN (SELECT id FROM "Book" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Online Exams
ALTER TABLE "OnlineExam" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_online_exam ON "OnlineExam" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "OnlineExamAttempt" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_online_exam_attempt ON "OnlineExamAttempt" USING ("examId" IN (SELECT id FROM "OnlineExam" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "QuestionGroup" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_question_group ON "QuestionGroup" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Question" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_question ON "Question" USING ("groupId" IN (SELECT id FROM "QuestionGroup" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "QuestionOption" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_question_option ON "QuestionOption" USING ("questionId" IN (SELECT id FROM "Question" WHERE "groupId" IN (SELECT id FROM "QuestionGroup" WHERE "branchId" = current_setting('app.current_branch_id', true))));

-- Assignments
ALTER TABLE "Assignment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_assignment ON "Assignment" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Submission" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_submission ON "Submission" USING ("assignmentId" IN (SELECT id FROM "Assignment" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Certificates
ALTER TABLE "Certificate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_certificate ON "Certificate" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "CertificateTemplate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_certificate_template ON "CertificateTemplate" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Finance
ALTER TABLE "FeeCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fee_category ON "FeeCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "FeeStructure" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fee_structure ON "FeeStructure" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Transport
ALTER TABLE "Vehicle" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vehicle ON "Vehicle" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TransportRoute" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_transport_route ON "TransportRoute" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TransportAssignment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_transport_assignment ON "TransportAssignment" USING (
  COALESCE("branchId", (SELECT "branchId" FROM "TransportRoute" WHERE id = "TransportAssignment"."routeId")) = current_setting('app.current_branch_id', true)
);

-- Academic sessions & results
ALTER TABLE "AcademicSession" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_academic_session ON "AcademicSession" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ResultSummary" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_result_summary ON "ResultSummary" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "GradingScale" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_grading_scale ON "GradingScale" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Exams (Exam already enabled above)
ALTER TABLE "ExamType" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_exam_type ON "ExamType" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AssessmentComponent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_assessment_component ON "AssessmentComponent" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AssessmentScore" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_assessment_score ON "AssessmentScore" USING ("recordId" IN (SELECT id FROM "AssessmentRecord" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Reception
ALTER TABLE "AdmissionEnquiry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_admission_enquiry ON "AdmissionEnquiry" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "CallLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_call_log ON "CallLog" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "VisitorLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_visitor_log ON "VisitorLog" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Complaint" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_complaint ON "Complaint" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "PostalRecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_postal_record ON "PostalRecord" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Inventory
ALTER TABLE "InventoryCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_category ON "InventoryCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventoryProduct" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_product ON "InventoryProduct" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventoryStore" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_store ON "InventoryStore" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventorySupplier" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_supplier ON "InventorySupplier" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventoryUnit" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_unit ON "InventoryUnit" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventoryPurchase" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_purchase ON "InventoryPurchase" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventorySale" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_sale ON "InventorySale" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "InventoryIssue" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_inventory_issue ON "InventoryIssue" USING ("branchId" = current_setting('app.current_branch_id', true));

-- HR
ALTER TABLE "ExpenseCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_expense_category ON "ExpenseCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Expense" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_expense ON "Expense" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Payroll" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_payroll ON "Payroll" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "SalaryTemplate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_salary_template ON "SalaryTemplate" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdvanceSalary" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_advance_salary ON "AdvanceSalary" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "LeaveRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_leave_request ON "LeaveRequest" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "StaffAttendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff_attendance ON "StaffAttendance" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "StaffAward" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_staff_award ON "StaffAward" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Live classes & digital resources
ALTER TABLE "LiveClassSession" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_live_class_session ON "LiveClassSession" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "DigitalResource" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_digital_resource ON "DigitalResource" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Id cards
ALTER TABLE "IdCard" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_id_card ON "IdCard" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "IdCardTemplate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_id_card_template ON "IdCardTemplate" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Attendance sessions & transport attendance
ALTER TABLE "AttendanceSession" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_attendance_session ON "AttendanceSession" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AttendanceScan" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_attendance_scan ON "AttendanceScan" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TransportAttendance" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_transport_attendance ON "TransportAttendance" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Behavioural
ALTER TABLE "BehaviouralRating" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_behavioural_rating ON "BehaviouralRating" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Admissions
ALTER TABLE "OnlineAdmission" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_online_admission ON "OnlineAdmission" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "PreviousSchool" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_previous_school ON "PreviousSchool" USING ("admissionId" IN (SELECT id FROM "OnlineAdmission" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "StudentCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_student_category ON "StudentCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdmissionInterview" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_admission_interview ON "AdmissionInterview" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdmissionExam" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_admission_exam ON "AdmissionExam" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AdmissionExamScore" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_admission_exam_score ON "AdmissionExamScore" USING ("examId" IN (SELECT id FROM "AdmissionExam" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Alumni
ALTER TABLE "Alumni" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_alumni ON "Alumni" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "AlumniEvent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_alumni_event ON "AlumniEvent" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Access logs
ALTER TABLE "CampusAccessLog" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_campus_access_log ON "CampusAccessLog" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Deactivation
ALTER TABLE "DeactivationReason" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_deactivation_reason ON "DeactivationReason" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "LoginDeactivation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_login_deactivation ON "LoginDeactivation" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Counter
ALTER TABLE "Counter" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_counter ON "Counter" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Class schedules
ALTER TABLE "ClassSchedule" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_class_schedule ON "ClassSchedule" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Conversations (branch-scoped)
ALTER TABLE "Conversation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_conversation ON "Conversation" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_message ON "Message" USING ("conversationId" IN (SELECT id FROM "Conversation" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "ConversationParticipant" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_conversation_participant ON "ConversationParticipant" USING ("conversationId" IN (SELECT id FROM "Conversation" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Events
ALTER TABLE "CampusEvent" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_campus_event ON "CampusEvent" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "EventRSVP" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_event_rsvp ON "EventRSVP" USING ("eventId" IN (SELECT id FROM "CampusEvent" WHERE "branchId" = current_setting('app.current_branch_id', true)));

-- Results
ALTER TABLE "ResultApproval" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_result_approval ON "ResultApproval" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "ResultPublication" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_result_publication ON "ResultPublication" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Broadsheet" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_broadsheet ON "Broadsheet" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "Transcript" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_transcript ON "Transcript" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TranscriptVerification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_transcript_verification ON "TranscriptVerification" USING ("transcriptId" IN (SELECT id FROM "Transcript" WHERE "branchId" = current_setting('app.current_branch_id', true)));

ALTER TABLE "AcademicRemark" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_academic_remark ON "AcademicRemark" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "GPARecord" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_gpa_record ON "GPARecord" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "StudentRanking" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_student_ranking ON "StudentRanking" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "SubjectPosition" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_subject_position ON "SubjectPosition" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Tahfeez
ALTER TABLE "TahfeezAssessment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tahfeez_assessment ON "TahfeezAssessment" USING ("branchId" = current_setting('app.current_branch_id', true));

ALTER TABLE "TahfeezMemorizationProgress" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tahfeez_memorization_progress ON "TahfeezMemorizationProgress" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Book reservations
ALTER TABLE "BookReservation" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_book_reservation ON "BookReservation" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Hostel maintenance
ALTER TABLE "HostelMaintenanceTicket" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hostel_maintenance ON "HostelMaintenanceTicket" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Library fines
ALTER TABLE "LibraryFine" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_library_fine ON "LibraryFine" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Academic exports
ALTER TABLE "AcademicExport" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_academic_export ON "AcademicExport" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Report templates
ALTER TABLE "ReportTemplate" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_report_template ON "ReportTemplate" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Computation jobs
ALTER TABLE "ComputationJob" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_computation_job ON "ComputationJob" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Attachment categories
ALTER TABLE "AttachmentCategory" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_attachment_category ON "AttachmentCategory" USING ("branchId" = current_setting('app.current_branch_id', true));

-- Maintenance requests
ALTER TABLE "MaintenanceRequest" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_maintenance_request ON "MaintenanceRequest" USING ("branchId" = current_setting('app.current_branch_id', true));
