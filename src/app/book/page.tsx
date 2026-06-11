import { Suspense } from "react";
import BookingWizard from "@/components/booking/BookingWizard";
import Navigation from "@/components/Navigation";
import { getPriceListCategories } from "@/lib/price-list";
import { toBookingCatalog } from "@/lib/booking-services";
import { getBlockedDates } from "@/app/actions/booking";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Your Appointment",
  description:
    "Reserve your luxury braiding appointment at Nubian Luxe. Choose your service, tier, and secure your slot with a $100 deposit.",
};

export default async function BookPage() {
  const [categories, blockedDates] = await Promise.all([
    getPriceListCategories(),
    getBlockedDates(),
  ]);
  const catalog = toBookingCatalog(categories);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[var(--color-obsidian)] pt-20 sm:pt-24 pb-12 sm:pb-20 overflow-x-hidden">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
              <div className="w-8 h-8 border border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          }
        >
          <BookingWizard catalog={catalog} blockedDates={blockedDates} />
        </Suspense>
      </main>
    </>
  );
}
