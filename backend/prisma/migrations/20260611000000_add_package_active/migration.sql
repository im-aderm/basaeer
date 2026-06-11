-- Add active column to EventPackage for soft-delete support
ALTER TABLE "EventPackage" ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;
