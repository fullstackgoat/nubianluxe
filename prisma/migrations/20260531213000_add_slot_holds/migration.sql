-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN "bookingSessionId" TEXT;

-- CreateTable
CREATE TABLE "SlotHold" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotHold_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SlotHold_sessionId_idx" ON "SlotHold"("sessionId");

-- CreateIndex
CREATE INDEX "SlotHold_expiresAt_idx" ON "SlotHold"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "SlotHold_date_timeSlot_key" ON "SlotHold"("date", "timeSlot");
