import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Navigation from "@/components/Navigation";
import FooterShell from "@/components/FooterShell";
import AccountDashboard from "@/components/account/AccountDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Account | Nubian Luxe",
};

export default async function AccountPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const email = user?.emailAddresses[0]?.emailAddress;

  const appointments = email
    ? await prisma.appointment.findMany({
        where: { clientEmail: email },
        orderBy: { date: "desc" },
      })
    : [];

  return (
    <main className="min-h-screen bg-obsidian">
      <Navigation />
      <AccountDashboard
        user={{
          firstName: user?.firstName ?? null,
          lastName: user?.lastName ?? null,
          email: email ?? null,
          imageUrl: user?.imageUrl ?? null,
        }}
        appointments={appointments}
      />
      <FooterShell />
    </main>
  );
}
