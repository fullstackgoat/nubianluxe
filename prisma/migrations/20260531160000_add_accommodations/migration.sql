-- CreateTable
CREATE TABLE "Accommodation" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "bulletPoints" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Accommodation_pkey" PRIMARY KEY ("id")
);

-- Seed default accommodations
INSERT INTO "Accommodation" ("id", "title", "icon", "bulletPoints", "sortOrder", "createdAt", "updatedAt") VALUES
  ('acc_01', '24-Hour Booking Time Slots', 'Calendar', ARRAY[]::TEXT[], 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_02', 'Braiding Hair Included', 'Package', ARRAY[]::TEXT[], 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_03', 'Human Hair Pickup Available', 'Users', ARRAY[]::TEXT[], 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_04', 'Custom Hair Color Blends', 'Palette', ARRAY[]::TEXT[], 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_05', 'Shampoo & Nano Steam Conditioning', 'Droplets', ARRAY[]::TEXT[], 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_06', 'Hair Trims Included', 'Scissors', ARRAY[]::TEXT[], 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_07', 'Luxury Hair Care Products', 'Sparkles', ARRAY[]::TEXT[], 6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_08', 'Complimentary Snacks & Beverages', 'Coffee', ARRAY[]::TEXT[], 7, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_09', 'Complimentary Meals (Extended Appts)', 'UtensilsCrossed', ARRAY[]::TEXT[], 8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_10', 'At-Home Hair Care Gift Bag', 'Gift', ARRAY[]::TEXT[], 9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_11', 'Quiet Work Environment', 'Laptop', ARRAY[]::TEXT[], 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_12', 'No Overbooking — Ever', 'Ban', ARRAY[]::TEXT[], 11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_13', 'Hassle-Free Parking', 'Car', ARRAY[]::TEXT[], 12, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_14', 'In-Home Professional Salon', 'Home', ARRAY[]::TEXT[], 13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_15', 'Luxury Salon Chair', 'Armchair', ARRAY[]::TEXT[], 14, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_16', 'Comfortable Break Space', 'Sofa', ARRAY[]::TEXT[], 15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_17', 'Entertainment at Your Fingertips', 'Tv', ARRAY[]::TEXT[], 16, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_18', 'Scheduled Comfort Breaks', 'Clock', ARRAY[]::TEXT[], 17, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_19', 'Personalized Follow-Up Care', 'Camera', ARRAY[]::TEXT[], 18, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('acc_20', 'Referral Program Incentives', 'Star', ARRAY[]::TEXT[], 19, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
