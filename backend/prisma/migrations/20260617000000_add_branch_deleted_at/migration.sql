-- Add deletedAt column to Branch for soft-delete support
ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
