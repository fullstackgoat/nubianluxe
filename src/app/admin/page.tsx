import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAccommodations } from "@/lib/accommodations";
import { getSalonSettings } from "@/lib/salon-settings";
import { getPriceListCategories } from "@/lib/price-list";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAdminConfigured, isAdminUser } from "@/lib/admin-auth";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin | Nubian Luxe" };

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/admin");

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!isAdminConfigured() || !isAdminUser(userId, userEmail)) redirect("/");

  let appointments: Awaited<ReturnType<typeof prisma.appointment.findMany>> = [];
  let blockedDates: Awaited<ReturnType<typeof prisma.blockedDate.findMany>> = [];
  let accommodations: Awaited<ReturnType<typeof getAccommodations>> = [];
  let priceListCategories: Awaited<ReturnType<typeof getPriceListCategories>> = [];
  let appointmentBufferMinutes = 0;
  let dbError: string | null = null;

  try {
    const [settings, ...rest] = await Promise.all([
      getSalonSettings(),
      prisma.appointment.findMany({ orderBy: { date: "desc" } }),
      prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
      getAccommodations(),
      getPriceListCategories(),
    ]);
    appointmentBufferMinutes = settings.appointmentBufferMinutes;
    [appointments, blockedDates, accommodations, priceListCategories] = rest;
  } catch (err) {
    console.error("Admin DB error:", err);
    dbError = "Database unavailable. Please check your DATABASE_URL in .env.local and ensure your Supabase project is active.";
  }

  return (
    <AdminDashboard
      appointments={appointments}
      blockedDates={blockedDates}
      appointmentBufferMinutes={appointmentBufferMinutes}
      accommodations={accommodations}
      priceListCategories={priceListCategories}
      dbError={dbError}
    />
  );
}
