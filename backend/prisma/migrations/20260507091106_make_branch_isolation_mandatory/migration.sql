/*
  Warnings:

  - Made the column `branchId` on table `Attendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `GradingScale` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `Hostel` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `InventoryCategory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `InventoryStore` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `InventoryUnit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `LoginDeactivation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `QuestionGroup` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `StaffAttendance` required. This step will fail if there are existing NULL values in that column.
  - Made the column `branchId` on table `VisitorLog` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_branchId_fkey";

-- DropForeignKey
ALTER TABLE "GradingScale" DROP CONSTRAINT "GradingScale_branchId_fkey";

-- DropForeignKey
ALTER TABLE "Hostel" DROP CONSTRAINT "Hostel_branchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryCategory" DROP CONSTRAINT "InventoryCategory_branchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryStore" DROP CONSTRAINT "InventoryStore_branchId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryUnit" DROP CONSTRAINT "InventoryUnit_branchId_fkey";

-- DropForeignKey
ALTER TABLE "LoginDeactivation" DROP CONSTRAINT "LoginDeactivation_branchId_fkey";

-- DropForeignKey
ALTER TABLE "QuestionGroup" DROP CONSTRAINT "QuestionGroup_branchId_fkey";

-- DropForeignKey
ALTER TABLE "StaffAttendance" DROP CONSTRAINT "StaffAttendance_branchId_fkey";

-- DropForeignKey
ALTER TABLE "VisitorLog" DROP CONSTRAINT "VisitorLog_branchId_fkey";

-- AlterTable
ALTER TABLE "Attendance" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "GradingScale" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Hostel" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryCategory" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryStore" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "InventoryUnit" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "LoginDeactivation" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "QuestionGroup" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "StaffAttendance" ALTER COLUMN "branchId" SET NOT NULL;

-- AlterTable
ALTER TABLE "VisitorLog" ALTER COLUMN "branchId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "LoginDeactivation" ADD CONSTRAINT "LoginDeactivation_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hostel" ADD CONSTRAINT "Hostel_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionGroup" ADD CONSTRAINT "QuestionGroup_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GradingScale" ADD CONSTRAINT "GradingScale_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisitorLog" ADD CONSTRAINT "VisitorLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryCategory" ADD CONSTRAINT "InventoryCategory_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryStore" ADD CONSTRAINT "InventoryStore_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryUnit" ADD CONSTRAINT "InventoryUnit_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
