-- AlterTable: make subjectId and teacherId optional, add isBreak
ALTER TABLE "ClassSchedule" ALTER COLUMN "subjectId" DROP NOT NULL;
ALTER TABLE "ClassSchedule" ALTER COLUMN "teacherId" DROP NOT NULL;
ALTER TABLE "ClassSchedule" ADD COLUMN "isBreak" BOOLEAN NOT NULL DEFAULT false;

-- Drop the unique constraint on teacherId/day/startTime (nullable + unique is problematic)
DROP INDEX IF EXISTS "ClassSchedule_teacherId_dayOfWeek_startTime_key";
CREATE INDEX "ClassSchedule_teacherId_dayOfWeek_startTime_idx" ON "ClassSchedule"("teacherId", "dayOfWeek", "startTime");
