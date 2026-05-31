-- AlterTable
ALTER TABLE "PriceListService" ADD COLUMN "duration" INTEGER NOT NULL DEFAULT 180;
ALTER TABLE "PriceListService" ADD COLUMN "stripeProductId" TEXT;
ALTER TABLE "PriceListService" ADD COLUMN "stripePriceId" TEXT;
