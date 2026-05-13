-- Phase 8.3: Create AssessmentScore junction table
CREATE TABLE "AssessmentScore" (
    "id" TEXT NOT NULL,
    "score" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "studentId" TEXT NOT NULL,
    "componentId" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentScore_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AssessmentScore_recordId_idx" ON "AssessmentScore"("recordId");
CREATE INDEX "AssessmentScore_componentId_idx" ON "AssessmentScore"("componentId");
CREATE INDEX "AssessmentScore_studentId_idx" ON "AssessmentScore"("studentId");
CREATE UNIQUE INDEX "AssessmentScore_recordId_componentId_key" ON "AssessmentScore"("recordId", "componentId");

ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "AssessmentComponent"("id") ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_recordId_fkey" FOREIGN KEY ("recordId") REFERENCES "AssessmentRecord"("id") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE "AssessmentScore" ADD CONSTRAINT "AssessmentScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON UPDATE CASCADE ON DELETE CASCADE;

-- Phase 8.4: PostgreSQL Row-Level Security
ALTER TABLE "Student" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Attendance" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AssessmentRecord" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Voucher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Class" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subject" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Exam" ENABLE ROW LEVEL SECURITY;

CREATE POLICY branch_isolation_policy ON "Student"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "Invoice"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "Attendance"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "AssessmentRecord"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "Voucher"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "Class"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

CREATE POLICY branch_isolation_policy ON "Subject"
    USING ("branchId" = current_setting('app.current_branch_id')::text);

-- Phase 8.5: Redis Cache (handled in NestJS code — no SQL migration needed)

-- Phase 8.6: Cursor-Based Pagination (handled in NestJS code — no SQL migration needed)

-- Phase 8.7: Attendance Table Partitioning
CREATE TABLE "Attendance_new" (LIKE "Attendance" INCLUDING DEFAULTS INCLUDING CONSTRAINTS) PARTITION BY RANGE (date);
CREATE TABLE "Attendance_2026" PARTITION OF "Attendance_new" FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
CREATE TABLE "Attendance_2027" PARTITION OF "Attendance_new" FOR VALUES FROM ('2027-01-01') TO ('2028-01-01');
DROP TABLE "Attendance" CASCADE;
ALTER TABLE "Attendance_new" RENAME TO "Attendance";

-- Phase 8.8: Full-Text Search with pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS student_name_trgm_idx ON "Student" USING gin (
    ("firstName" || ' ' || "lastName") gin_trgm_ops
);

CREATE INDEX IF NOT EXISTS user_name_email_trgm_idx ON "User" USING gin (
    ("firstName" || ' ' || "lastName") gin_trgm_ops
);

CREATE INDEX IF NOT EXISTS book_title_trgm_idx ON "Book" USING gin ("title" gin_trgm_ops);
CREATE INDEX IF NOT EXISTS book_author_trgm_idx ON "Book" USING gin ("author" gin_trgm_ops);

-- Phase 8.9: Full Audit Trail
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Designation" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Designation" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "Voucher" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;
ALTER TABLE "AssessmentRecord" ADD COLUMN IF NOT EXISTS "createdByUserId" TEXT;
ALTER TABLE "AssessmentRecord" ADD COLUMN IF NOT EXISTS "updatedByUserId" TEXT;

ALTER TABLE "Student" ADD CONSTRAINT "Student_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Student" ADD CONSTRAINT "Student_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Class" ADD CONSTRAINT "Class_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Class" ADD CONSTRAINT "Class_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Book" ADD CONSTRAINT "Book_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE "Book" ADD CONSTRAINT "Book_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON UPDATE CASCADE ON DELETE SET NULL;

-- Phase 8.10: Soft Delete
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Section" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Subject" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Department" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Staff" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "Student_deletedAt_idx" ON "Student"("deletedAt");
CREATE INDEX IF NOT EXISTS "Class_deletedAt_idx" ON "Class"("deletedAt");
CREATE INDEX IF NOT EXISTS "Section_deletedAt_idx" ON "Section"("deletedAt");
CREATE INDEX IF NOT EXISTS "Subject_deletedAt_idx" ON "Subject"("deletedAt");
CREATE INDEX IF NOT EXISTS "Department_deletedAt_idx" ON "Department"("deletedAt");
CREATE INDEX IF NOT EXISTS "Staff_deletedAt_idx" ON "Staff"("deletedAt");
CREATE INDEX IF NOT EXISTS "Book_deletedAt_idx" ON "Book"("deletedAt");
