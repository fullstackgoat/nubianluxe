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
import type { BookingTier } from "@/generated/prisma/client";

const BookingSchema = z.object({
  clientName:        z.string().min(2),
  clientEmail:       z.string().email(),
  clientPhone:       z.string().min(10),
  service:           z.string().min(2),
  serviceCategory:   z.string().min(2),
  servicePrice:      z.number().int().nonnegative(), // catalog starting price in cents
  tier:              z.enum(["REGULAR", "PREMIUM", "VIP"]),
  date:              z.string(), // ISO date YYYY-MM-DD
  timeSlot:          z.string(),
  duration:          z.number().int().positive(),
  payServiceUpfront: z.boolean().default(false),
  notes:             z.string().optional(),
});

export type BookingInput = z.infer<typeof BookingSchema>;

export async function createBookingIntent(input: BookingInput) {
  const parsed = BookingSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Invalid booking data", details: parsed.error.flatten() };
  }

  const { tier, clientEmail, clientName, service, servicePrice, payServiceUpfront } = parsed.data;
  const tierFee = TIER_FEES[tier];
  const tierPriceId = getTierPriceId(tier);

  // Pricing model:
  // - Deposit ($100) is always charged at booking and credits toward the service total.
  // - Tier fee ($0/$25/$50) is always charged at booking, non-refundable, separate from service.
  // - Service price is OPTIONALLY charged upfront. If upfront, we collect
  //   the full service amount (the deposit is "applied" toward it, not double-charged).
  //   If deferred, only deposit + tier fee is charged now; the remainder
  //   (servicePrice - deposit) is collected in person at the appointment.
  const totalCharge = payServiceUpfront
    ? servicePrice + tierFee                  // service price covers deposit; tier fee on top
    : DEPOSIT_AMOUNT + tierFee;               // deposit + tier fee only

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: totalCharge,
      currency: "usd",
      metadata: {
        clientEmail,
        clientName,
        service,
        tier,
        bookingDate:            parsed.data.date,
        timeSlot:               parsed.data.timeSlot,
        pay_service_upfront:    String(payServiceUpfront),
        service_price_cents:    String(servicePrice),
        stripe_deposit_price:   STRIPE_PRICE_IDS.DEPOSIT,
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
        service:               parsed.data.service,
        serviceCategory:       parsed.data.serviceCategory,
        servicePrice,
        tier:                  parsed.data.tier,
        tierFee,
        deposit:               DEPOSIT_AMOUNT,
        date:                  new Date(`${parsed.data.date}T${slotToTime(parsed.data.timeSlot)}`),
        duration:              parsed.data.duration,
        notes:                 parsed.data.notes,
        stripePaymentIntentId: paymentIntent.id,
        // Note: depositPaid/tierFeePaid/servicePaid flip to true via the webhook
        // once the PaymentIntent succeeds (see api/stripe/webhook/route.ts).
      },
    });

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

export async function getBookedSlots(date: string): Promise<string[]> {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const booked = await prisma.appointment.findMany({
    where: {
      date: { gte: start, lte: end },
      status: { not: "CANCELLED" },
    },
    select: { date: true },
  });

  return booked.map((a: { date: Date }) => {
    const h = a.date.getHours();
    const hour = h % 12 === 0 ? 12 : h % 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour}:00 ${ampm}`;
  });
}

function slotToTime(slot: string): string {
  const [time, ampm] = slot.split(" ");
  let [hours] = time.split(":").map(Number);
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:00:00`;
}

export async function confirmBooking(appointmentId: string) {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: "CONFIRMED", depositPaid: true },
  });
  revalidatePath("/book");
  revalidatePath("/admin");
}
