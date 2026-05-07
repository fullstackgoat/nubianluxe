import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminDashboard from "@/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin | Nubian Luxe" };

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const adminUserId = process.env.CLERK_ADMIN_USER_ID;
  const adminEmail = process.env.ADMIN_EMAIL;
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const isAdmin =
    (adminUserId && userId === adminUserId) ||
    (adminEmail && userEmail === adminEmail);

  if (!isAdmin) redirect("/");

  let appointments: Awaited<ReturnType<typeof prisma.appointment.findMany>> = [];
  let blockedDates: Awaited<ReturnType<typeof prisma.blockedDate.findMany>> = [];
  let dbError: string | null = null;

  try {
    [appointments, blockedDates] = await Promise.all([
      prisma.appointment.findMany({ orderBy: { date: "desc" } }),
      prisma.blockedDate.findMany({ orderBy: { date: "asc" } }),
    ]);
  } catch (err) {
    console.error("Admin DB error:", err);
    dbError = "Database unavailable. Please check your DATABASE_URL in .env.local and ensure your Supabase project is active.";
  }

  return (
    <AdminDashboard
      appointments={appointments}
      blockedDates={blockedDates}
      dbError={dbError}
    />
  );
}
