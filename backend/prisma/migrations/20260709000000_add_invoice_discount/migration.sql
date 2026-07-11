-- Discounts on fee invoices (applied at approval time).
-- Additive + nullable only: safe, non-blocking on a live database
-- (ADD COLUMN without default is metadata-only in PostgreSQL).

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED');

-- AlterTable
ALTER TABLE "Invoice"
  ADD COLUMN "discountType" "DiscountType",
  ADD COLUMN "discountValue" DECIMAL(12,2),
  ADD COLUMN "discountAmount" DECIMAL(12,2),
  ADD COLUMN "discountReason" TEXT,
  ADD COLUMN "discountedById" TEXT,
  ADD COLUMN "discountedAt" TIMESTAMP(3);
