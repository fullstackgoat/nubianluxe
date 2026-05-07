-- AlterTable: track the catalog-listed starting price (cents) and whether
-- the service portion has been paid (either upfront at booking or marked
-- paid by the admin after the appointment).
ALTER TABLE "Appointment" ADD COLUMN "servicePrice" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Appointment" ADD COLUMN "servicePaid" BOOLEAN NOT NULL DEFAULT false;
