"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowUpRight, Clock, CalendarCheck, Shield, FileDown } from "lucide-react";

const PARTING_SIZE_GUIDE_PDF = "/downloads/parting-size-guide.pdf";

const tiers = [
  {
    name: "Regular",
    tagline: "Perfect for planners",
    fee: "Free",
    feeNote: "No booking fee",
    deposit: "$44 deposit",
    schedule: "Wed – Sat",
    hours: "8 AM – 8 PM",
    notice: "7-day advance notice",
    icon: CalendarCheck,
    href: "/book?tier=REGULAR",
    accent: false,
  },
  {
    name: "Premium",
    tagline: "More flexibility, more time",
    fee: "$25",
    feeNote: "Booking fee",
    deposit: "$44 deposit",
    schedule: "Tue – Sat",
    hours: "6 AM – 10 PM",
    notice: "5-day advance notice",
    icon: Clock,
    href: "/book?tier=PREMIUM",
    accent: true,
  },
  {
    name: "VIP",
    tagline: "Total access, any time",
    fee: "$50",
    feeNote: "Booking fee",
    deposit: "$44 deposit",
    schedule: "7 Days a Week",
    hours: "24 / 7",
    notice: "3-day advance notice",
    icon: Shield,
    href: "/book?tier=VIP",
    accent: false,
  },
];

const steps = [
  { n: "01", label: "Pick Your Style" },
  { n: "02", label: "Pick Your Size" },
  { n: "03", label: "Choose a Booking Tier" },
  { n: "04", label: "Schedule Your Service" },
];

export default function WaysToBook() {
  return (
    <section id="booking" className="relative py-28 bg-[var(--color-obsidian-soft)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-4">
            Reserve Your Seat
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-6xl font-light text-white mb-6 italic"
          >
            Ways to Book
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-white/50 max-w-lg mx-auto text-sm leading-relaxed">
            Choose the tier that fits your schedule. All bookings require a{" "}
            <span className="text-[var(--color-gold)]">$44 deposit</span> applied
            toward your total — booking fees are separate and non-refundable.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={PARTING_SIZE_GUIDE_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-xs inline-flex items-center gap-2 group"
            >
              <FileDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
              Parting Size Guide
            </a>
          </div>
        </motion.div>

        {/* Tier cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {tiers.map((tier, i) => (
            <Link key={tier.name} href={tier.href} className="block">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className={`group relative flex flex-col h-full rounded-2xl p-8 border transition-all duration-400 hover:-translate-y-1 ${
                tier.accent
                  ? "bg-gradient-to-b from-[var(--color-gold-dark)] to-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                  : "glass-card text-white"
              }`}
            >
              {tier.accent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-obsidian)] border border-[var(--color-gold)] text-[var(--color-gold)] text-[0.6rem] tracking-[0.25em] uppercase px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-6 ${
                tier.accent ? "bg-[rgba(10,10,10,0.15)]" : "bg-[rgba(201,168,76,0.1)]"
              }`}>
                <tier.icon className={`w-5 h-5 ${tier.accent ? "text-[var(--color-obsidian)]" : "text-[var(--color-gold)]"}`} />
              </div>

              {/* Tier name */}
              <p className={`text-[0.65rem] tracking-[0.3em] uppercase mb-1 ${tier.accent ? "text-[rgba(10,10,10,0.6)]" : "text-[var(--color-gold-dark)]"}`}>
                {tier.tagline}
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl font-light mb-6"
              >
                {tier.name}
              </h3>

              {/* Fee highlight */}
              <div className={`flex items-baseline gap-2 mb-6 pb-6 border-b ${
                tier.accent ? "border-[rgba(10,10,10,0.15)]" : "border-[rgba(201,168,76,0.15)]"
              }`}>
                <span className="text-4xl font-semibold" style={{ fontFamily: "var(--font-body)" }}>
                  {tier.fee}
                </span>
                <span className={`text-sm ${tier.accent ? "text-[rgba(10,10,10,0.6)]" : "text-white/40"}`}>
                  {tier.feeNote}
                </span>
              </div>

              {/* Details */}
              <ul className="space-y-3 mb-8 flex-1">
                {[tier.schedule, tier.hours, tier.notice, tier.deposit].map((d) => (
                  <li key={d} className={`flex items-center gap-2 text-sm ${tier.accent ? "text-[rgba(10,10,10,0.8)]" : "text-white/60"}`}>
                    <span className={`w-1 h-1 rounded-full shrink-0 ${tier.accent ? "bg-[var(--color-obsidian)]" : "bg-[var(--color-gold)]"}`} />
                    {d}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className={`flex items-center justify-between text-sm font-medium ${
                tier.accent ? "text-[var(--color-obsidian)]" : "text-[var(--color-gold)]"
              }`}>
                <span className="tracking-[0.12em] uppercase text-xs">Book {tier.name}</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
              </div>
            </motion.div>
            </Link>
          ))}
        </div>

        {/* How it works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass-card p-10 md:p-14"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-3">
                The Process
              </p>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl font-light text-white italic mb-4"
              >
                How to Book
              </h3>
              <p className="text-white/50 text-sm leading-relaxed mb-8">
                Review the full price list below, choose your service, pick a tier,
                and secure your spot.
              </p>
              <Link href="/#services" className="btn-outline text-xs">
                View Full Price List
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {steps.map((s, i) => (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  className="p-5 rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(201,168,76,0.1)] hover:border-[rgba(201,168,76,0.25)] transition-colors duration-300"
                >
                  <span className="text-[var(--color-gold-dark)] text-xs font-mono block mb-2">
                    {s.n}
                  </span>
                  <span
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-white text-xl font-light"
                  >
                    {s.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
    </section>
  );
}
