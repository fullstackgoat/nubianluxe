import type { Metadata } from "next";
import LegalLayout from "../(legal)/_components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Nubian Luxe Braiding Lounge collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout
      eyebrow="Your Information, Respected"
      title="Privacy Policy"
      lastUpdated="May 6, 2026"
    >
      <p className="text-white/50 italic text-sm">
        This policy is provided as a starting point and should be reviewed by a licensed
        attorney before you rely on it in production. It is not legal advice.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        1. What We Collect
      </h2>
      <p>
        When you create an account or book an appointment, we collect:
      </p>
      <ul className="list-disc pl-6 space-y-1 text-white/70">
        <li>Your name, email address, and phone number</li>
        <li>Optional notes you provide about your appointment</li>
        <li>Payment information processed by our payment provider (we do not store full card numbers)</li>
        <li>Booking history (services, dates, deposits, status)</li>
      </ul>
      <p>
        When you visit the site, we may also collect standard technical information such as
        your IP address, browser type, and pages visited.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        2. How We Use It
      </h2>
      <ul className="list-disc pl-6 space-y-1 text-white/70">
        <li>To create and manage your account</li>
        <li>To schedule, confirm, and remind you of appointments</li>
        <li>To process payments and issue refunds when applicable</li>
        <li>To respond to inquiries and provide customer service</li>
        <li>To improve our services and the website</li>
      </ul>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        3. Third-Party Services
      </h2>
      <p>
        We rely on the following trusted vendors to operate our site and services. Each has
        its own privacy practices:
      </p>
      <ul className="list-disc pl-6 space-y-2 text-white/70">
        <li>
          <strong>Clerk</strong> — handles authentication and account management. See{" "}
          <a href="https://clerk.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Clerk&rsquo;s privacy policy</a>.
        </li>
        <li>
          <strong>Stripe</strong> — processes all payments. We never see or store your
          full card number. See{" "}
          <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Stripe&rsquo;s privacy policy</a>.
        </li>
        <li>
          <strong>Supabase</strong> — hosts our database (your appointment records). See{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Supabase&rsquo;s privacy policy</a>.
        </li>
        <li>
          <strong>Resend</strong> — sends transactional email (booking confirmations,
          reminders) when enabled. See{" "}
          <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Resend&rsquo;s privacy policy</a>.
        </li>
        <li>
          <strong>Vercel</strong> — hosts the website infrastructure. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">Vercel&rsquo;s privacy policy</a>.
        </li>
      </ul>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        4. Sharing &amp; Selling
      </h2>
      <p>
        We do not sell your personal information. We share information with the third-party
        vendors above only as needed to operate the service, and we may disclose information
        if required by law or to protect our legal rights.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        5. Cookies
      </h2>
      <p>
        We use a small number of cookies for essential site functionality (authentication,
        session management). We do not use third-party advertising cookies.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        6. Data Retention
      </h2>
      <p>
        We retain your account and appointment history for as long as your account is
        active, plus a reasonable period thereafter to satisfy tax, accounting, and legal
        obligations. You may request deletion of your account and associated data at any
        time (see Section 8).
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        7. Security
      </h2>
      <p>
        We use industry-standard practices to protect your information: encrypted
        connections (HTTPS), secure password hashing via Clerk, PCI-compliant payment
        processing via Stripe, and database row-level access controls. No system is 100%
        secure, but we work hard to keep yours safe.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        8. Your Rights
      </h2>
      <p>
        You have the right to access, correct, or delete your personal information. To
        exercise these rights, text us at <a href="sms:3464590146" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">346-459-0146</a> or email <a href="mailto:bookings@nubianluxebrand.com" className="text-[var(--color-gold)] underline hover:text-[var(--color-gold-light)]">bookings@nubianluxebrand.com</a>.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        9. Children
      </h2>
      <p>
        Our services are intended for adults aged 18 and older. We do not knowingly
        collect personal information from children under 13. Bookings for minors must be
        made by a parent or legal guardian.
      </p>

      <h2 className="text-2xl font-display italic text-[var(--color-gold)] mt-10">
        10. Changes
      </h2>
      <p>
        We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top
        of this page reflects the most recent revision.
      </p>
    </LegalLayout>
  );
}
