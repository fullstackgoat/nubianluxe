export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

// Confirmation email is intentionally not sent from this webhook right now —
// the owner confirms each booking manually. See TODO.md §8 for the plan to
// re-enable auto-confirmation + Resend email + status flip.

export async function POST(req: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[stripe-webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const appointment = await prisma.appointment.findFirst({
          where: { stripePaymentIntentId: pi.id },
        });

        if (!appointment) {
          console.warn(`[stripe-webhook] No appointment found for PaymentIntent ${pi.id}`);
          break;
        }

        // NOTE: Auto-confirmation is intentionally disabled.
        // Owner reviews each booking and confirms manually via the admin panel
        // (which calls the `confirmBooking` server action in actions/booking.ts).
        // See TODO.md §8 to re-enable automatic confirmation later.
        //
        // We DO still record that payment cleared so the admin dashboard shows
        // accurate paid status without having to cross-reference Stripe.
        // Idempotent: skip if we've already recorded the deposit as paid.
        if (appointment.depositPaid) {
          console.log(`[stripe-webhook] Appointment ${appointment.id} payment already recorded; skipping`);
          break;
        }

        // The metadata field is a string ("true"/"false") because Stripe metadata
        // values are always strings.
        const paidServiceUpfront = pi.metadata?.pay_service_upfront === "true";

        await prisma.appointment.update({
          where: { id: appointment.id },
          data: {
            // status intentionally NOT updated — left as PENDING for manual review
            depositPaid: true,
            tierFeePaid: appointment.tierFee > 0,
            ...(paidServiceUpfront && { servicePaid: true }),
          },
        });

        console.log(
          `[stripe-webhook] Recorded payment for appointment ${appointment.id} (PI ${pi.id})` +
          (paidServiceUpfront ? " — service paid in full" : "") +
          " — awaiting manual confirmation",
        );
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        // Leave the appointment PENDING so the client can retry payment.
        // Stripe Elements on the booking page will surface the failure to the user.
        const reason = pi.last_payment_error?.message ?? "unknown";
        console.warn(`[stripe-webhook] PaymentIntent ${pi.id} failed: ${reason}`);
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        // TODO: when refund flow is implemented, find the appointment by
        // charge.payment_intent and flip status to CANCELLED + zero out
        // depositPaid/tierFeePaid. For now just log.
        console.log(`[stripe-webhook] Charge ${charge.id} refunded — manual review required`);
        break;
      }

      default:
        // Ignore unsubscribed event types — Stripe still expects a 2xx.
        console.log(`[stripe-webhook] Ignoring unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error(`[stripe-webhook] Handler error for event ${event.id} (${event.type}):`, err);
    // Return 500 so Stripe retries — the DB write is idempotent (guarded above).
    return NextResponse.json({ error: "Internal handler error" }, { status: 500 });
  }
}
