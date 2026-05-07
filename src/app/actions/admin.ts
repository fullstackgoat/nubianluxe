"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Mirrors the OR-check in src/app/admin/page.tsx so the page guard and the
// action guard agree. A user is admin if their Clerk userId matches
// CLERK_ADMIN_USER_ID *or* their primary email matches ADMIN_EMAIL.
async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  const adminUserId = process.env.CLERK_ADMIN_USER_ID;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminUserId && !adminEmail) throw new Error("Admin not configured");

  const idMatches = Boolean(adminUserId && userId === adminUserId);

  let emailMatches = false;
  if (adminEmail) {
    const user = await currentUser();
    const userEmail = user?.emailAddresses[0]?.emailAddress;
    emailMatches = Boolean(userEmail && userEmail === adminEmail);
  }

  if (!idMatches && !emailMatches) throw new Error("Forbidden");
}

export async function confirmAppointment(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "CONFIRMED", depositPaid: true },
  });
  revalidatePath("/admin");
}

export async function cancelAppointment(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin");
}

export async function completeAppointment(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "COMPLETED" },
  });
  revalidatePath("/admin");
}

export async function markNoShow(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { status: "NO_SHOW" },
  });
  revalidatePath("/admin");
}

export async function markServicePaid(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { servicePaid: true },
  });
  revalidatePath("/admin");
}

export async function unmarkServicePaid(id: string) {
  await assertAdmin();
  await prisma.appointment.update({
    where: { id },
    data: { servicePaid: false },
  });
  revalidatePath("/admin");
}

export async function addBlockedDate(date: string, reason?: string) {
  await assertAdmin();
  await prisma.blockedDate.create({
    data: { date: new Date(date), reason },
  });
  revalidatePath("/admin");
}

export async function removeBlockedDate(id: string) {
  await assertAdmin();
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin");
}
