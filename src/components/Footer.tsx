"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

const services = [
  { label: "Knotless Braids",    href: "/#prices" },
  { label: "Box Braids",         href: "/#prices" },
  { label: "Goddess Braids",     href: "/#prices" },
  { label: "Cornrows",           href: "/#prices" },
  { label: "Fulani Braids",      href: "/#prices" },
  { label: "Crochet",            href: "/#prices" },
  { label: "Natural Hair",       href: "/#prices" },
  { label: "Children's Styles",  href: "/#prices" },
];

const quickLinks = [
  { label: "Services & Pricing", href: "/#prices" },
  { label: "Book Appointment",   href: "/#booking" },
  { label: "Accommodations",     href: "/#accommodations" },
  { label: "Hair Color Chart",   href: "/#colors" },
  { label: "Salon Policy",       href: "/#policy" },
  { label: "About Taliah",       href: "/#about" },
];

const tiers = [
  { name: "Regular",  fee: "Free",  hours: "Wed–Sat · 8AM–8PM" },
  { name: "Premium",  fee: "$25",   hours: "Tue–Sat · 6AM–10PM" },
  { name: "VIP",      fee: "$50",   hours: "24/7 Availability" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative bg-[var(--color-obsidian-soft)] border-t border-[rgba(201,168,76,0.1)]">
      {/* Top marquee strip */}
      <div className="overflow-hidden py-3 border-b border-[rgba(201,168,76,0.08)] bg-[var(--color-obsidian)]">
        <div className="marquee-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-8 pr-8 text-[0.6rem] tracking-[0.3em] uppercase text-[var(--color-gold-dark)] whitespace-nowrap"
            >
              Honoring The Craft
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
              Elevating The Experience
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
              Open 24/7
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
              The Woodlands, TX
              <span className="w-1 h-1 rounded-full bg-[var(--color-gold)]" />
            </span>
          ))}
        </div>
      </div>

      {/* Main footer body */}
      <div className="section-container py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <Link href="/" className="inline-block mb-6">
              <span
                style={{ fontFamily: "var(--font-accent)" }}
                className="text-3xl text-white tracking-[0.08em] block"
              >
                NUBIAN
              </span>
              <span
                style={{ fontFamily: "var(--font-body)" }}
                className="text-[0.55rem] tracking-[0.35em] uppercase text-[var(--color-gold)]"
              >
                LUXE BRAIDING LOUNGE
              </span>
            </Link>

            <p
              style={{ fontFamily: "var(--font-display)" }}
              className="text-white/50 text-lg italic font-light mb-8 leading-relaxed"
            >
              &ldquo;Honoring the craft.<br />Elevating the experience.&rdquo;
            </p>

            {/* Contact info */}
            <div className="space-y-3 mb-8">
              <a
                href="sms:3464590146"
                className="flex items-center gap-3 text-white/60 hover:text-[var(--color-gold)] transition-colors duration-300 group"
              >
                <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center group-hover:border-[var(--color-gold)] transition-colors duration-300">
                  <Phone className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                </div>
                <span className="text-sm">346-459-0146 (TEXT)</span>
              </a>
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                </div>
                <span className="text-sm">The Woodlands / Spring, TX</span>
              </div>
              <div className="flex items-center gap-3 text-white/60">
                <div className="w-8 h-8 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                </div>
                <span className="text-sm">Open 24/7</span>
              </div>
            </div>

            {/* Social */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center hover:border-[var(--color-gold)] hover:bg-[rgba(201,168,76,0.08)] transition-all duration-300 group"
              >
                <InstagramIcon className="w-4 h-4 text-white/60 group-hover:text-[var(--color-gold)] transition-colors duration-300" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center hover:border-[var(--color-gold)] hover:bg-[rgba(201,168,76,0.08)] transition-all duration-300 group"
              >
                <FacebookIcon className="w-4 h-4 text-white/60 group-hover:text-[var(--color-gold)] transition-colors duration-300" />
              </a>
            </div>
          </motion.div>

          {/* Services column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-6 font-medium">
              Our Services
            </h4>
            <ul className="space-y-2.5">
              {services.map((s) => (
                <li key={s.label}>
                  <Link
                    href={s.href}
                    className="text-white/50 hover:text-white text-sm transition-colors duration-300 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[var(--color-gold)] transition-all duration-300" />
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Quick links column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-6 font-medium">
              Navigate
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-white/50 hover:text-white text-sm transition-colors duration-300 flex items-center gap-1.5 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-[var(--color-gold)] transition-all duration-300" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Booking tiers + CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--color-gold)] mb-6 font-medium">
              Booking Tiers
            </h4>
            <div className="space-y-3 mb-8">
              {tiers.map((t) => (
                <div
                  key={t.name}
                  className="flex items-start justify-between gap-2 pb-3 border-b border-white/5"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-white/40 text-xs mt-0.5">{t.hours}</p>
                  </div>
                  <span className="text-[var(--color-gold)] text-sm font-semibold shrink-0">
                    {t.fee}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/#booking"
              className="btn-gold w-full justify-between group"
            >
              <span>Book Now</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[rgba(201,168,76,0.08)]">
        <div className="section-container py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs tracking-[0.1em]">
            &copy; {year} Nubian Luxe Braiding Lounge. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white/30 text-xs hover:text-white/60 transition-colors duration-300 tracking-[0.08em]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-white/30 text-xs hover:text-white/60 transition-colors duration-300 tracking-[0.08em]">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="text-white/30 text-xs hover:text-white/60 transition-colors duration-300 tracking-[0.08em]">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
