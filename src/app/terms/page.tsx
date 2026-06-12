import type { Metadata } from "next";
import LegalLayout from "../(legal)/_components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of Nubian Luxe Braiding Lounge's website and services.",
};

export default function TermsPage() {
  return (
    <LegalLayout
      eyebrow="The Fine Print"
      title="Terms of Service"
      lastUpdated="May 6, 2026"
    >
      <p className="text-white/50 italic text-sm">
        These terms are provided as a starting point and should be reviewed by a licensed
        attorney before you rely on them in production. They are not legal advice.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        1. Acceptance of Terms
      </h2>
      <p>
        By accessing this website (&ldquo;<strong>nubianluxebrand.com</strong>&rdquo;) and booking an
        appointment with Nubian Luxe Braiding Lounge (&ldquo;<strong>NLBL</strong>,&rdquo; &ldquo;<strong>we</strong>,&rdquo;
        &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;), you agree to be bound by these Terms of Service.
        If you do not agree to these terms, please do not use the site or services.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        2. Booking and Appointments
      </h2>
      <p>
        All appointments require a non-refundable <strong>$44 deposit</strong> to reserve your
        time. Premium and VIP tier appointments require an additional non-refundable booking
        fee ($25 and $50 respectively), collected at booking. Service balances are quoted at
        booking and finalized at the appointment based on your hair length, density, and
        chosen style.
      </p>
      <p>
        You may pay the full estimated service amount upfront or settle the balance at the
        appointment. Either way, the deposit is credited toward your service total.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        3. Cancellations and Rescheduling
      </h2>
      <p>
        See our <a href="/refund-policy" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Refund &amp; Cancellation Policy</a> for full
        details on rescheduling, late cancellations, and no-shows.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        4. Conduct at the Salon
      </h2>
      <p>
        NLBL is a drama-free, respectful environment. Disruptive, disrespectful, or
        threatening behavior toward staff or other clients may result in your appointment
        being terminated without refund and your account being banned from future bookings.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        5. Hair Care and Liability
      </h2>
      <p>
        We take pride in providing premium hair care services. However, results may vary
        based on hair type, condition, and home care. NLBL is not liable for outcomes that
        result from undisclosed prior chemical treatments, scalp conditions, or failure to
        follow recommended aftercare.
      </p>
      <p>
        You are responsible for disclosing any allergies, scalp sensitivities, or
        medications that may affect the service. NLBL is not responsible for allergic
        reactions to products that were not disclosed prior to service.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        6. Intellectual Property
      </h2>
      <p>
        All content on this site — including but not limited to text, photographs, video,
        graphics, and the brand identity (&ldquo;Nubian Luxe Braiding Lounge&rdquo;) — is the
        property of NLBL and is protected by copyright and trademark laws. You may not
        reproduce, distribute, or use any content without written permission.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        7. Account &amp; Security
      </h2>
      <p>
        You are responsible for maintaining the confidentiality of your login credentials
        and for all activity that occurs under your account. Notify us immediately if you
        suspect unauthorized access.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        8. Modifications
      </h2>
      <p>
        We may update these Terms from time to time. The &ldquo;Last updated&rdquo; date at the top
        of this page reflects the most recent revision. Continued use of the site after
        changes are posted constitutes your acceptance of the new terms.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        9. Governing Law
      </h2>
      <p>
        These Terms are governed by the laws of the State of Texas, without regard to
        conflict of law principles. Any disputes shall be resolved in the courts of
        Montgomery County, Texas.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        10. Contact
      </h2>
      <p>
        Questions? Text us at <a href="sms:3464590146" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">346-459-0146</a> or email <a href="mailto:bookings@nubianluxebrand.com" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">bookings@nubianluxebrand.com</a>.
      </p>
    </LegalLayout>
  );
}
