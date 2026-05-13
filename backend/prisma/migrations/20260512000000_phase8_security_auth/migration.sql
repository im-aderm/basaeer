-- AlterTable: Add mustChangePassword to User
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;

-- AlterEnum: Add PAYSTACK to PaymentMethod
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'PAYSTACK';