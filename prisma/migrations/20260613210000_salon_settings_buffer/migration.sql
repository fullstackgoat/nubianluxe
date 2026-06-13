CREATE TABLE "SalonSettings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "appointmentBufferMinutes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SalonSettings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "SalonSettings" ("id", "appointmentBufferMinutes", "updatedAt")
VALUES ('default', 0, CURRENT_TIMESTAMP);
