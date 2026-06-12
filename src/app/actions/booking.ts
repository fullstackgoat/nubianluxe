"use server";

import { prisma } from "@/lib/prisma";
import {
  getStripe,
  DEPOSIT_AMOUNT,
  TIER_FEES,
  STRIPE_PRICE_IDS,
  getTierPriceId,
} from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseDateInput, toDateKey } from "@/lib/dates";
import { getHairColorRequirement } from "@/lib/hair-colors";
import {
  slotToTime,
  SLOT_HOLD_MS,
} from "@/lib/slot-utils";
import { parseServicePriceCents, TIER_SLOTS, type TierId } from "@/lib/booking-data";
import {
  appointmentDateToInterval,
  classifySlots,
  getIntervalForSlot,
  type TimeInterval,
} from "@/lib/slot-availability";
import {
  computeServiceSelectionTotals,
  formatSelectedServiceOptions,
  getPricedBulletIndices,
  parseBulletPoints,
} from "@/lib/price-list-bullets";

const BookingSchema = z.object({
  serviceId:           z.string().min(1),
  serviceCategoryId:   z.string().min(1),
  bookingSessionId:    z.string().min(1),
  clientName:            z.string().min(2),
  clientEmail:           z.string().email(),
  clientPhone:           z.string().min(10),
  service:               z.string().min(2),
  serviceCategory:       z.string().min(2),
  servicePrice:          z.number().int().nonnegative(),
  selectedBulletIndices: z.array(z.number().int().nonnegative()).default([]),
  selectedAddOnServiceIds: z.array(z.string()).default([]),
  stripeProductId:       z.string().optional(),
  stripePriceId:         z.string().optional(),
  hairColorCategory:     z.string().optional(),
  hairColorValue:        z.string().optional(),
  hairColorSkipped:      z.boolean().optional(),
  tier:                  z.enum(["REGULAR", "PREMIUM", "VIP"]),
  date:                  z.string(),
  timeSlot:              z.string(),
  duration:              z.number().int().positive(),
  payServiceUpfront:     z.boolean().default(false),
  notes:                 z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

export type SlotHoldInfo = {
  date: string;
  timeSlot: string;
  expiresAt: string;
};

async function cleanupExpiredHolds() {
  await prisma.slotHold.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}

function dayBounds(date: string) {
  const day = parseDateInput(date);
  const start = new Date(day);
  start.setHours(0, 0, 0, 0);
  const end = new Date(day);
  end.setHours(23, 59, 59, 999);
  return { day, start, end };
}

async function getAppointmentsForDay(date: string) {
  const { start, end } = dayBounds(date);
  return prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: {
      date: true,
      duration: true,
      status: true,
      depositPaid: true,
      bookingSessionId: true,
    },
  });
}

function isOwnPendingHold(
  appt: { status: string; depositPaid: boolean; bookingSessionId: string | null },
  sessionId?: string
) {
  return (
    !!sessionId &&
    appt.status === "PENDING" &&
    !appt.depositPaid &&
    appt.bookingSessionId === sessionId
  );
}

async function getOccupiedIntervalsForDay(
  date: string,
  sessionId?: string
): Promise<TimeInterval[]> {
  await cleanupExpiredHolds();

  const appointments = await getAppointmentsForDay(date);
  const appointmentIntervals = appointments
    .filter((appt) => !isOwnPendingHold(appt, sessionId))
    .map((appt) => appointmentDateToInterval(appt.date, appt.duration));

  const { day } = dayBounds(date);
  const holds = await prisma.slotHold.findMany({
    where: {
      date: day,
      expiresAt: { gt: new Date() },
      ...(sessionId ? { NOT: { sessionId } } : {}),
    },
    select: { timeSlot: true, durationMinutes: true },
  });

  const holdIntervals = holds.map((hold) =>
    getIntervalForSlot(hold.timeSlot, hold.durationMinutes)
  );

  return [...appointmentIntervals, ...holdIntervals];
}

async function getDaySlotAvailability(
  date: string,
  requestDurationMinutes: number,
  tier: TierId,
  sessionId?: string
) {
  const tierConfig = TIER_SLOTS[tier];
  const tierSlots = getTierSlotsForDate(date, tier);
  const occupiedIntervals = await getOccupiedIntervalsForDay(date, sessionId);

  return classifySlots({
    tierSlots,
    tierEndHour: tierConfig.endHour,
    requestDurationMinutes,
    occupiedIntervals,
  });
}

function getTierSlotsForDate(date: string, tier: TierId): string[] {
  const day = parseDateInput(date);
  const config = TIER_SLOTS[tier];
  if (!config.days.includes(day.getDay())) return [];

  const slots: string[] = [];
  for (let h = config.startHour; h < config.endHour; h += 2) {
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    slots.push(`${hour}:00 ${ampm}`);
  }
  return slots;
}

async function isSlotAvailableForBooking(
  date: string,
  timeSlot: string,
  requestDurationMinutes: number,
  tier: TierId,
  sessionId?: string
) {
  const availability = await getDaySlotAvailability(
    date,
    requestDurationMinutes,
    tier,
    sessionId
  );
  return availability.available.includes(timeSlot);
}

async function validateActiveHold(
  sessionId: string,
  date: string,
  timeSlot: string
) {
  await cleanupExpiredHolds();
  const { day } = dayBounds(date);

  const hold = await prisma.slotHold.findUnique({
    where: { date_timeSlot: { date: day, timeSlot } },
  });

  if (!hold || hold.sessionId !== sessionId || hold.expiresAt <= new Date()) {
    return {
      ok: false as const,
      error:
        "Your time slot hold has expired. Please go back and select a new time.",
    };
  }

  return { ok: true as const, hold };
}

export async function reserveSlotHold(
  sessionId: string,
  date: string,
  timeSlot: string,
  durationMinutes: number,
  tier: TierId
): Promise<{ expiresAt: string } | { error: string }> {
  if (!sessionId?.trim()) {
    return { error: "Invalid booking session." };
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
    return { error: "Invalid service duration." };
  }

  await cleanupExpiredHolds();
  const { day } = dayBounds(date);

  const available = await isSlotAvailableForBooking(
    date,
    timeSlot,
    durationMinutes,
    tier,
    sessionId
  );

  if (!available) {
    return { error: "That time slot is no longer available. Please choose another time." };
  }

  const existing = await prisma.slotHold.findUnique({
    where: { date_timeSlot: { date: day, timeSlot } },
  });

  if (existing && existing.sessionId !== sessionId && existing.expiresAt > new Date()) {
    return { error: "That time slot was just taken. Please choose another time." };
  }

  await prisma.slotHold.deleteMany({ where: { sessionId } });

  const expiresAt = new Date(Date.now() + SLOT_HOLD_MS);
  const hold = await prisma.slotHold.upsert({
    where: { date_timeSlot: { date: day, timeSlot } },
    create: { sessionId, date: day, timeSlot, durationMinutes, expiresAt },
    update: { sessionId, durationMinutes, expiresAt },
  });

  return { expiresAt: hold.expiresAt.toISOString() };
}

export async function extendSlotHold(
  sessionId: string,
  date: string,
  timeSlot: string
): Promise<{ expiresAt: string } | { error: string }> {
  const check = await validateActiveHold(sessionId, date, timeSlot);
  if (!check.ok) return { error: check.error };

  const expiresAt = new Date(Date.now() + SLOT_HOLD_MS);
  const hold = await prisma.slotHold.update({
    where: { id: check.hold.id },
    data: { expiresAt },
  });

  return { expiresAt: hold.expiresAt.toISOString() };
}

export async function getActiveSlotHold(
  sessionId: string
): Promise<SlotHoldInfo | null> {
  if (!sessionId?.trim()) return null;

  await cleanupExpiredHolds();

  const hold = await prisma.slotHold.findFirst({
    where: {
      sessionId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { expiresAt: "desc" },
  });

  if (!hold) return null;

  return {
    date: toDateKey(hold.date),
    timeSlot: hold.timeSlot,
    expiresAt: hold.expiresAt.toISOString(),
  };
}

export async function releaseSlotHold(sessionId: string) {
  if (!sessionId?.trim()) return;
  await prisma.slotHold.deleteMany({ where: { sessionId } });
}

export async function createBookingIntent(input: BookingInput) {
  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid booking data", details: parsed.error.flatten() };
  }

  const {
    tier,
    clientEmail,
    clientName,
    service,
    servicePrice,
    payServiceUpfront,
    date,
    timeSlot,
    bookingSessionId,
  } = parsed.data;
  const tierFee = TIER_FEES[tier];
  const tierPriceId = getTierPriceId(tier);

  const holdCheck = await validateActiveHold(bookingSessionId, date, timeSlot);
  if (!holdCheck.ok) {
    return { error: holdCheck.error };
  }

  const blocked = await prisma.blockedDate.findFirst({
    where: { date: parseDateInput(date) },
  });
  if (blocked) {
    return { error: "This date is unavailable. Please choose another day." };
  }

  const slotStillAvailable = await isSlotAvailableForBooking(
    date,
    timeSlot,
    parsed.data.duration,
    tier,
    bookingSessionId
  );
  if (!slotStillAvailable) {
    return { error: "That time slot is no longer available. Please choose another time." };
  }

  const hairRequirement = getHairColorRequirement(parsed.data.serviceCategoryId);
  const hairSkipped = parsed.data.hairColorSkipped === true;

  if (hairRequirement === "required" && (hairSkipped || !parsed.data.hairColorValue?.trim())) {
    return { error: "Please select a hair color from the color chart before booking." };
  }

  const dbService = await prisma.priceListService.findUnique({
    where: { id: parsed.data.serviceId },
    select: {
      title: true,
      price: true,
      duration: true,
      bulletPoints: true,
      categoryId: true,
    },
  });

  if (!dbService || dbService.categoryId !== parsed.data.serviceCategoryId) {
    return { error: "Selected service is no longer available. Please refresh and try again." };
  }

  const bulletPoints = parseBulletPoints(dbService.bulletPoints);
  const pricedBulletIndices = getPricedBulletIndices(bulletPoints);

  if (pricedBulletIndices.length > 0) {
    const hasSelection = parsed.data.selectedBulletIndices.some((index) =>
      pricedBulletIndices.includes(index)
    );
    if (!hasSelection) {
      return { error: "Please select a service option before booking." };
    }
  }

  const pricing = computeServiceSelectionTotals({
    basePriceCents: parseServicePriceCents(dbService.price),
    basePriceLabel: dbService.price,
    baseDuration: dbService.duration,
    bulletPoints,
    selectedIndices: parsed.data.selectedBulletIndices,
  });

  const addOnCategory = await prisma.serviceCategory.findFirst({
    where: { title: "Add-On Services" },
    select: { id: true },
  });

  let addOnTotalCents = 0;
  let addOnTotalDuration = 0;
  const validatedAddOns: { title: string; price: string }[] = [];

  if (parsed.data.selectedAddOnServiceIds.length > 0) {
    if (!addOnCategory) {
      return { error: "Add-on services are unavailable. Please refresh and try again." };
    }

    if (dbService.categoryId === addOnCategory.id) {
      return { error: "Invalid add-on selection." };
    }

    const addOnServices = await prisma.priceListService.findMany({
      where: {
        id: { in: parsed.data.selectedAddOnServiceIds },
        categoryId: addOnCategory.id,
      },
      select: { id: true, title: true, price: true, duration: true },
    });

    if (addOnServices.length !== parsed.data.selectedAddOnServiceIds.length) {
      return { error: "One or more add-on services are no longer available." };
    }

    for (const addOn of addOnServices) {
      addOnTotalCents += parseServicePriceCents(addOn.price);
      addOnTotalDuration += addOn.duration;
      validatedAddOns.push({ title: addOn.title, price: addOn.price });
    }
  }

  const expectedPriceCents = pricing.servicePriceCents + addOnTotalCents;
  const expectedDuration = pricing.duration + addOnTotalDuration;

  if (expectedPriceCents !== servicePrice) {
    return { error: "Service price changed. Please refresh and try again." };
  }

  if (expectedDuration !== parsed.data.duration) {
    return { error: "Service duration changed. Please refresh and try again." };
  }

  const selectedOptionsNote = formatSelectedServiceOptions(pricing.selectedOptions);
  const addOnServicesNote =
    validatedAddOns.length > 0
      ? `Add-on services: ${validatedAddOns.map((addOn) => `${addOn.title} (${addOn.price})`).join(", ")}`
      : "";
  const combinedNotes = [
    parsed.data.notes?.trim(),
    selectedOptionsNote ? `Service options: ${selectedOptionsNote}` : "",
    addOnServicesNote,
  ]
    .filter(Boolean)
    .join("\n\n");

  const totalCharge = payServiceUpfront
    ? servicePrice + tierFee
    : DEPOSIT_AMOUNT + tierFee;

  const appointmentDate = new Date(`${parsed.data.date}T${slotToTime(parsed.data.timeSlot)}`);

  try {
    const stalePending = await prisma.appointment.findMany({
      where: {
        bookingSessionId,
        status: "PENDING",
        depositPaid: false,
      },
      select: { id: true, stripePaymentIntentId: true },
    });

    for (const stale of stalePending) {
      if (stale.stripePaymentIntentId) {
        try {
          await getStripe().paymentIntents.cancel(stale.stripePaymentIntentId);
        } catch {
          // Intent may already be canceled or succeeded.
        }
      }
      await prisma.appointment.delete({ where: { id: stale.id } });
    }

    const paymentIntent = await getStripe().paymentIntents.create({
      amount: totalCharge,
      currency: "usd",
      metadata: {
        clientEmail,
        clientName,
        service,
        serviceId:              parsed.data.serviceId,
        tier,
        bookingDate:            parsed.data.date,
        timeSlot:               parsed.data.timeSlot,
        bookingSessionId,
        pay_service_upfront:    String(payServiceUpfront),
        service_price_cents:    String(servicePrice),
        ...(selectedOptionsNote && { service_options: selectedOptionsNote }),
        ...(addOnServicesNote && { add_on_services: addOnServicesNote }),
        stripe_deposit_price:   STRIPE_PRICE_IDS.DEPOSIT,
        ...(parsed.data.stripeProductId && {
          stripe_service_product: parsed.data.stripeProductId,
        }),
        ...(parsed.data.stripePriceId && {
          stripe_service_price: parsed.data.stripePriceId,
        }),
        ...(parsed.data.hairColorCategory &&
          parsed.data.hairColorValue && {
            hair_color_category: parsed.data.hairColorCategory,
            hair_color_value: parsed.data.hairColorValue,
          }),
        ...(tierPriceId && { stripe_tier_price: tierPriceId }),
      },
      description: payServiceUpfront
        ? `Nubian Luxe — ${service} (${tier}) — Full Payment (Service + Booking Fee)`
        : `Nubian Luxe — ${service} (${tier}) — Deposit + Booking Fee`,
      receipt_email: clientEmail,
    });

    const appointment = await prisma.appointment.create({
      data: {
        clientName:            parsed.data.clientName,
        clientEmail:           parsed.data.clientEmail,
        clientPhone:           parsed.data.clientPhone,
        service:               dbService.title,
        serviceCategory:       parsed.data.serviceCategory,
        servicePrice,
        tier:                  parsed.data.tier,
        tierFee,
        deposit:               DEPOSIT_AMOUNT,
        date:                  appointmentDate,
        duration:              pricing.duration,
        notes:                 combinedNotes || null,
        bookingSessionId,
        hairColorCategory:     hairSkipped ? null : parsed.data.hairColorCategory || null,
        hairColorValue:        hairSkipped ? null : parsed.data.hairColorValue?.trim() || null,
        stripePaymentIntentId: paymentIntent.id,
      },
    });

    await prisma.slotHold.deleteMany({ where: { sessionId: bookingSessionId } });

    return {
      clientSecret:  paymentIntent.client_secret,
      appointmentId: appointment.id,
      totalCharge,
    };
  } catch (err) {
    console.error("Booking intent error:", err);
    return { error: "Failed to create booking. Please try again." };
  }
}

export async function getBlockedDates(): Promise<string[]> {
  const rows = await prisma.blockedDate.findMany({
    select: { date: true },
    orderBy: { date: "asc" },
  });
  return rows.map((row) => toDateKey(row.date));
}

export async function getDaySlotAvailabilityForBooking(
  date: string,
  requestDurationMinutes: number,
  tier: TierId,
  sessionId?: string
) {
  return getDaySlotAvailability(date, requestDurationMinutes, tier, sessionId);
}

/** @deprecated Use getDaySlotAvailabilityForBooking */
export async function getBookedSlots(
  date: string,
  sessionId?: string,
  requestDurationMinutes = 120,
  tier: TierId = "REGULAR"
) {
  const availability = await getDaySlotAvailability(
    date,
    requestDurationMinutes,
    tier,
    sessionId
  );
  return [...availability.occupied, ...availability.blocked];
}

export async function confirmBooking(appointmentId: string) {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED", depositPaid: true },
  });
  revalidatePath("/book");
  revalidatePath("/admin");
}
