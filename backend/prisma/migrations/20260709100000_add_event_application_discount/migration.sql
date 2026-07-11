-- Discounts on event registration fees (applied at payment verification).
-- Additive + nullable only: safe, non-blocking on a live database.
-- "DiscountType" enum already exists (created in 20260709000000_add_invoice_discount).

-- AlterTable
ALTER TABLE "EventApplication"
  ADD COLUMN "discountType" "DiscountType",
  ADD COLUMN "discountValue" DECIMAL(12,2),
  ADD COLUMN "discountAmount" DECIMAL(12,2),
  ADD COLUMN "discountReason" TEXT,
  ADD COLUMN "discountedById" TEXT,
  ADD COLUMN "discountedAt" TIMESTAMP(3);
