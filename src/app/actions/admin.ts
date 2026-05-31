"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { parseDateInput } from "@/lib/dates";

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

export async function deleteAppointment(id: string) {
  await assertAdmin();
  await prisma.appointment.delete({ where: { id } });
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
    data: { date: parseDateInput(date), reason },
  });
  revalidatePath("/admin");
  revalidatePath("/book");
}

export async function removeBlockedDate(id: string) {
  await assertAdmin();
  await prisma.blockedDate.delete({ where: { id } });
  revalidatePath("/admin");
  revalidatePath("/book");
}

export async function updateAccommodation(
  id: string,
  data: { title: string; bulletPoints: string[] }
) {
  await assertAdmin();

  const title = data.title.trim();
  if (!title) throw new Error("Title is required");

  const bulletPoints = data.bulletPoints
    .map((point) => point.trim())
    .filter(Boolean);

  await prisma.accommodation.update({
    where: { id },
    data: { title, bulletPoints },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function updatePriceListService(
  id: string,
  data: { title: string; description: string; bulletPoints: string[] }
) {
  await assertAdmin();

  const title = data.title.trim();
  const description = data.description.trim();
  if (!title) throw new Error("Title is required");

  const bulletPoints = data.bulletPoints
    .map((point) => point.trim())
    .filter(Boolean);

  await prisma.priceListService.update({
    where: { id },
    data: { title, description, bulletPoints },
  });

  revalidatePath("/");
  revalidatePath("/admin");
}
