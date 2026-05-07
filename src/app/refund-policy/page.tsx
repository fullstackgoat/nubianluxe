import type { Metadata } from "next";
import LegalLayout from "../(legal)/_components/LegalLayout";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Nubian Luxe Braiding Lounge's policy on cancellations, rescheduling, refunds, and no-shows.",
};

export default function RefundPolicyPage() {
  return (
    <LegalLayout
      eyebrow="Respecting Each Other's Time"
      title="Refund & Cancellation Policy"
      lastUpdated="May 6, 2026"
    >
      <p className="text-white/50 italic text-sm">
        This policy is provided as a starting point and should be reviewed by a licensed
        attorney before you rely on it in production. It is not legal advice.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Deposit
      </h2>
      <p>
        A <strong>$100 deposit</strong> is required at the time of booking and is{" "}
        <strong>credited toward your final service total</strong> at the appointment. The
        deposit is <strong>non-refundable</strong> in the events described below.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Tier Booking Fees
      </h2>
      <p>
        Premium ($25) and VIP ($50) tier booking fees are <strong>non-refundable</strong>{" "}
        under any circumstance once the booking is created. They cover the privilege of
        booking outside our standard schedule.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Rescheduling
      </h2>
      <p>
        You may reschedule your appointment <strong>once at no cost</strong>, provided you
        give us at least the following notice:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-white/70">
        <li><strong>Regular tier:</strong> 7 days&rsquo; notice</li>
        <li><strong>Premium tier:</strong> 5 days&rsquo; notice</li>
        <li><strong>VIP tier:</strong> 3 days&rsquo; notice</li>
      </ul>
      <p>
        Reschedules with less notice than the above will forfeit the deposit. A new
        deposit will be required to book a replacement appointment.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Cancellations
      </h2>
      <p>
        Cancellations made with the required advance notice (above) will forfeit the
        deposit. The tier booking fee is non-refundable regardless of notice.
      </p>
      <p>
        If you paid the full service amount upfront and cancel <em>before</em> the
        cutoff for your tier, you will be refunded the service portion (the amount paid
        in excess of the deposit and tier fee) within 5–10 business days. If you cancel{" "}
        <em>after</em> the cutoff, the entire amount paid is forfeited.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        No-Shows
      </h2>
      <p>
        If you do not arrive within 30 minutes of your scheduled appointment time and
        have not contacted us, the appointment will be marked as a no-show. The full
        deposit and tier booking fee will be forfeited, and a new deposit will be required
        to book future appointments.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Late Arrivals
      </h2>
      <p>
        If you arrive more than 15 minutes late, we may need to shorten your service or
        reschedule (at our discretion) to avoid impacting other clients. The deposit is
        not refunded in this case.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Service Quality
      </h2>
      <p>
        We stand by our work. If you&rsquo;re unhappy with the service for a reason that is
        within our control, please reach out within 48 hours of your appointment. We will
        do our best to make it right — typically by inviting you back for a complimentary
        adjustment.
      </p>
      <p>
        We do not issue refunds for services already rendered. We do not refund based on
        outcomes from undisclosed prior chemical treatments, scalp conditions, or failure
        to follow recommended aftercare.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Refund Method
      </h2>
      <p>
        Where refunds are owed, they are issued back to the original payment method via
        Stripe. Refunds typically appear in your bank statement within 5–10 business
        days, depending on your bank.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Emergencies and Special Circumstances
      </h2>
      <p>
        We understand life happens. If you need to cancel due to a documented emergency
        (illness, family emergency, severe weather), please contact us as soon as
        possible. We&rsquo;ll work with you in good faith on a case-by-case basis.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        Contact
      </h2>
      <p>
        Need to cancel, reschedule, or ask about a refund? Text us at{" "}
        <a href="sms:3464590146" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">346-459-0146</a> or email{" "}
        <a href="mailto:bookings@nubianluxebrand.com" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">bookings@nubianluxebrand.com</a>.
      </p>
    </LegalLayout>
  );
}
