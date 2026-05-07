"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";

const paragraphs = [
  "At NLBL, I've created a home-based, professional, and comfortable space where the artistry of braiding meets old-school hair care values and modern luxury accommodations. My goal is to provide exceptional service, expert hair care, and an uplifting environment where both clients and stylists can take pride in the experience.",
  "Braiding, to me, is more than just a style — it's an art form and a cultural tradition that honors our African American roots. As a Compton, California native with deep Louisiana and Texas ties, I celebrate the rich heritage of African American braiding as a way to embrace artistry, protect our hair, and simplify daily self-care.",
  "As a licensed cosmetologist, I am qualified to offer shampoo and conditioning treatments, scissor and clipper cuts, hair color, and scalp treatments — all designed to enhance your hair care experience. I specialize in working with tender-headed clients and those with long, thick hair, ensuring a gentle and stress-free service.",
  "More than anything, I am committed to fostering a positive, safe, and drama-free space where clients feel at ease, cared for, and uplifted. Your time in my chair is more than just an appointment — it's a space for restoration, relaxation, and empowerment.",
];

export default function AboutMe() {
  return (
    <section id="about" className="relative py-28 bg-[var(--color-obsidian)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

      <div className="section-container">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-4">
            The Artisan
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-6xl font-light text-white italic mb-6"
          >
            About Me
          </h2>
          <div className="gold-divider" />
        </motion.div>

        {/* Two-column editorial layout */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left — portrait + contact */}
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:sticky lg:top-28 space-y-8"
          >
            {/* Portrait */}
            <div className="relative max-w-sm mx-auto lg:mx-0">
              {/* Gold accent border */}
              <div className="absolute -inset-3 rounded-2xl border border-[rgba(201,168,76,0.2)]" />
              <div className="absolute -inset-6 rounded-3xl border border-[rgba(201,168,76,0.08)]" />

              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="/stylist-portrait.jpg"
                  alt="Taliah Mason, Owner & Stylist at Nubian Luxe"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Gold frame overlay */}
                <Image
                  src="/assets/gold-frame.png"
                  alt=""
                  fill
                  className="object-contain z-10 pointer-events-none"
                />
                {/* Name badge */}
                <div className="absolute bottom-5 right-5 z-20 bg-[rgba(10,10,10,0.85)] backdrop-blur-md px-4 py-3 rounded-xl border border-[rgba(201,168,76,0.3)]">
                  <p
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-lg text-[var(--color-gold)] font-light"
                  >
                    Taliah Mason
                  </p>
                  <p className="text-white/60 text-xs tracking-[0.15em] uppercase mt-0.5">
                    Owner &amp; Stylist
                  </p>
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className="glass-card p-7 space-y-5">
              <h3 className="text-[0.65rem] tracking-[0.3em] uppercase text-[var(--color-gold-dark)]">
                Contact &amp; Location
              </h3>
              {[
                { icon: Phone,  label: "Phone",    value: "346-459-0146 (TEXT)", href: "sms:3464590146" },
                { icon: MapPin, label: "Location", value: "The Woodlands / Spring, TX", href: undefined },
                { icon: Clock,  label: "Hours",    value: "Open 24/7", href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-full border border-[rgba(201,168,76,0.2)] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-[var(--color-gold)]" />
                  </div>
                  <div>
                    <p className="text-[0.65rem] text-white/30 uppercase tracking-widest">{label}</p>
                    {href ? (
                      <a href={href} className="text-white text-sm hover:text-[var(--color-gold)] transition-colors duration-300">
                        {value}
                      </a>
                    ) : (
                      <p className="text-white text-sm">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — bio text */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div>
              <h3
                style={{ fontFamily: "var(--font-display)" }}
                className="text-3xl md:text-4xl font-light text-[var(--color-gold)] italic mb-8"
              >
                Welcome to Nubian Luxe Braiding Lounge
              </h3>

              {paragraphs.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  style={{ fontFamily: "var(--font-body)" }}
                  className="text-white/70 leading-[1.9] mb-6 text-[0.95rem]"
                >
                  {p}
                </motion.p>
              ))}

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                style={{ fontFamily: "var(--font-body)" }}
                className="text-white/70 leading-[1.9] mb-6 text-[0.95rem]"
              >
                As a wife, mother of four adult children, and grandmother of two, I understand
                the importance of self-care and the need to pour into ourselves. At NLBL, I
                hope to provide a space where you feel rejuvenated, empowered, and ready to
                take on the world — despite whatever life throws your way.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ fontFamily: "var(--font-body)" }}
                className="text-white/70 leading-[1.9] mb-10 text-[0.95rem]"
              >
                With 24/7 booking options, I strive to accommodate your schedule and lifestyle,
                ensuring flexibility without compromising the quality of care.
              </motion.p>

              {/* Signature quote */}
              <motion.blockquote
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="border-l-2 border-[var(--color-gold)] pl-6 mb-10"
              >
                <p
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-2xl md:text-3xl font-light italic text-[var(--color-gold-light)]"
                >
                  &ldquo;Let&apos;s honor our roots and redefine the braiding experience together.&rdquo;
                </p>
                <footer className="mt-3 text-xs tracking-[0.2em] uppercase text-white/40">
                  — Taliah Mason
                </footer>
              </motion.blockquote>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <Link href="/#booking" className="btn-gold group inline-flex">
                  Book With Taliah
                  <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
    </section>
  );
}
