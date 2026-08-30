-- The public admission workflow deliberately assigns a class after staff
-- review. Keep the database constraint aligned with the optional Prisma
-- field and public DTO so an otherwise valid anonymous application can be
-- created without a preselected class.
ALTER TABLE "OnlineAdmission"
  ALTER COLUMN "desiredClassId" DROP NOT NULL;
