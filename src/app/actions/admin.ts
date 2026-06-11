"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { eachDayOfInterval } from "date-fns";
import { parseDateInput, toDateKey, toLocalDateKey } from "@/lib/dates";
import { getServiceDuration } from "@/lib/service-durations";
import {
  archiveStripeCatalogEntry,
  archiveStripePrice,
  createStripeCatalogEntry,
  createStripePriceForProduct,
  updateStripeProductDetails,
  validateCatalogPrice,
} from "@/lib/stripe-catalog";
import { isAdminConfigured, isAdminUser } from "@/lib/admin-auth";
import { resyncAllPriceListServices } from "@/lib/sync-stripe-catalog";
import { getBookingUrlForService } from "@/lib/booking-services";
import {
  type PriceListBulletPoint,
} from "@/lib/price-list-bullets";
import { persistBulletPoints } from "@/lib/price-list-db";

// Mirrors src/app/admin/page.tsx — admin if userId or email is on the allowlist.
async function assertAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthenticated");

  if (!isAdminConfigured()) throw new Error("Admin not configured");

  const user = await currentUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  if (!isAdminUser(userId, userEmail)) throw new Error("Forbidden");
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

export async function addBlockedDates(
  startDate: string,
  endDate?: string,
  reason?: string
): Promise<{ created: number; skipped: number }> {
  await assertAdmin();

  const start = parseDateInput(startDate);
  const end = endDate ? parseDateInput(endDate) : start;
  if (start > end) {
    throw new Error("End date must be on or after the start date.");
  }

  const days = eachDayOfInterval({ start, end });
  const existing = await prisma.blockedDate.findMany({
    where: { date: { gte: start, lte: end } },
    select: { date: true },
  });
  const existingKeys = new Set(existing.map((row) => toDateKey(row.date)));
  const toCreate = days.filter((day) => !existingKeys.has(toLocalDateKey(day)));

  if (toCreate.length === 0) {
    throw new Error("All dates in this range are already blocked.");
  }

  await prisma.blockedDate.createMany({
    data: toCreate.map((date) => ({ date, reason })),
  });

  revalidatePath("/admin");
  revalidatePath("/book");

  return { created: toCreate.length, skipped: days.length - toCreate.length };
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
  data: {
    title: string;
    description: string;
    bulletPoints: PriceListBulletPoint[];
    price?: string;
    duration?: number;
  }
) {
  await assertAdmin();

  const existing = await prisma.priceListService.findUnique({
    where: { id },
    include: { category: true },
  });
  if (!existing) throw new Error("Service not found");

  const title = data.title.trim();
  const description = data.description.trim();
  if (!title) throw new Error("Title is required");

  const nextPrice = data.price?.trim() ?? existing.price;
  if (data.price !== undefined) {
    validateCatalogPrice(nextPrice);
  }

  const nextDuration =
    data.duration !== undefined && data.duration > 0
      ? data.duration
      : existing.duration;

  let stripePriceId = existing.stripePriceId;

  if (nextPrice !== existing.price && existing.stripeProductId) {
    stripePriceId = await createStripePriceForProduct(existing.stripeProductId, {
      serviceId: id,
      price: nextPrice,
    });
    if (existing.stripePriceId) {
      await archiveStripePrice(existing.stripePriceId);
    }
  }

  if (existing.stripeProductId) {
    await updateStripeProductDetails(existing.stripeProductId, {
      name: `${existing.category.title} — ${title}`,
      description,
      catalogPrice: nextPrice,
      title,
    });
  }

  await prisma.priceListService.update({
    where: { id },
    data: {
      title,
      description,
      price: nextPrice,
      duration: nextDuration,
      ...(stripePriceId !== existing.stripePriceId && { stripePriceId }),
    },
  });
  await persistBulletPoints(id, data.bulletPoints);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/book");
}

export async function createPriceListService(
  categoryId: string,
  data: {
    title: string;
    price: string;
    description: string;
    bulletPoints: PriceListBulletPoint[];
    duration?: number;
  }
) {
  await assertAdmin();

  const title = data.title.trim();
  const price = data.price.trim();
  const description = data.description.trim();
  if (!title) throw new Error("Title is required");
  if (!price) throw new Error("Price is required");
  validateCatalogPrice(price);

  const category = await prisma.serviceCategory.findUnique({
    where: { id: categoryId },
  });
  if (!category) throw new Error("Category not found");

  const maxSort = await prisma.priceListService.aggregate({
    where: { categoryId },
    _max: { sortOrder: true },
  });
  const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;
  const duration =
    data.duration && data.duration > 0
      ? data.duration
      : getServiceDuration(categoryId, title);

  const service = await prisma.priceListService.create({
    data: {
      categoryId,
      title,
      price,
      description,
      bookingUrl: "",
      duration,
      sortOrder,
    },
  });
  await persistBulletPoints(service.id, data.bulletPoints);

  const bookingUrl = getBookingUrlForService(service.id);
  let stripeLinked = false;

  try {
    const stripe = await createStripeCatalogEntry({
      serviceId: service.id,
      categoryId,
      categoryTitle: category.title,
      title,
      price,
      description,
    });

    await prisma.priceListService.update({
      where: { id: service.id },
      data: {
        stripeProductId: stripe.productId,
        stripePriceId: stripe.priceId,
        bookingUrl,
      },
    });
    stripeLinked = true;
  } catch (err) {
    await prisma.priceListService.update({
      where: { id: service.id },
      data: { bookingUrl },
    });
    console.error(
      "Stripe catalog create failed:",
      err instanceof Error ? err.message : err
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/book");

  return { id: service.id, stripeLinked };
}

export async function deletePriceListService(id: string) {
  await assertAdmin();

  const existing = await prisma.priceListService.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      stripeProductId: true,
      stripePriceId: true,
    },
  });
  if (!existing) throw new Error("Service not found");

  if (existing.stripeProductId) {
    await archiveStripeCatalogEntry(
      existing.stripeProductId,
      existing.stripePriceId
    );
  }

  await prisma.priceListService.delete({ where: { id } });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/book");

  return { title: existing.title };
}

export async function resyncStripeCatalog(options?: { offset?: number; limit?: number }) {
  await assertAdmin();

  const offset = options?.offset ?? 0;
  const limit = options?.limit ?? 4;
  const result = await resyncAllPriceListServices({
    force: offset === 0,
    offset,
    limit,
  });

  if (result.done) {
    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/book");
  }

  return result;
}
