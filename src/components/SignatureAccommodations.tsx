"use client";

import { motion } from "motion/react";
import {
  Calendar, Package, Users, Palette, Droplets, Scissors,
  Sparkles, Coffee, UtensilsCrossed, Gift, Laptop, Ban,
  Car, Home, Armchair, Sofa, Tv, Clock, Camera, Star,
} from "lucide-react";

const amenities = [
  { icon: Calendar,       label: "24-Hour Booking Time Slots" },
  { icon: Package,        label: "Braiding Hair Included" },
  { icon: Users,          label: "Human Hair Pickup Available" },
  { icon: Palette,        label: "Custom Hair Color Blends" },
  { icon: Droplets,       label: "Shampoo & Nano Steam Conditioning" },
  { icon: Scissors,       label: "Hair Trims Included" },
  { icon: Sparkles,       label: "Luxury Hair Care Products" },
  { icon: Coffee,         label: "Complimentary Snacks & Beverages" },
  { icon: UtensilsCrossed,label: "Complimentary Meals (Extended Appts)" },
  { icon: Gift,           label: "At-Home Hair Care Gift Bag" },
  { icon: Laptop,         label: "Quiet Work Environment" },
  { icon: Ban,            label: "No Overbooking — Ever" },
  { icon: Car,            label: "Hassle-Free Parking" },
  { icon: Home,           label: "In-Home Professional Salon" },
  { icon: Armchair,       label: "Luxury Salon Chair" },
  { icon: Sofa,           label: "Comfortable Break Space" },
  { icon: Tv,             label: "Entertainment at Your Fingertips" },
  { icon: Clock,          label: "Scheduled Comfort Breaks" },
  { icon: Camera,         label: "Personalized Follow-Up Care" },
  { icon: Star,           label: "Referral Program Incentives" },
];

export default function SignatureAccommodations() {
  return (
    <section id="accommodations" className="relative py-28 bg-[var(--color-ivory)]">
      {/* Subtle top border accent */}
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
          <p
            style={{ fontFamily: "var(--font-body)" }}
            className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-4"
          >
            What&apos;s Included
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-6xl font-light text-[var(--color-obsidian)] mb-6 italic"
          >
            Signature Accommodations
          </h2>
          <div className="gold-divider mb-6" />
          <p
            style={{ fontFamily: "var(--font-body)" }}
            className="text-[var(--color-muted)] max-w-xl mx-auto text-sm leading-relaxed"
          >
            Every appointment is a full luxury experience — from the moment you arrive
            to the moment you leave.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {amenities.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.04 }}
              className="group flex items-start gap-4 p-5 rounded-xl bg-white border border-[var(--color-ivory-dark)] hover:border-[var(--color-gold-dark)] hover:shadow-md transition-all duration-300"
            >
              <div className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-gold-pale)] flex items-center justify-center group-hover:bg-[var(--color-gold)] transition-colors duration-300">
                <item.icon className="w-4 h-4 text-[var(--color-gold-dark)] group-hover:text-white transition-colors duration-300" />
              </div>
              <p
                style={{ fontFamily: "var(--font-body)" }}
                className="text-sm text-[var(--color-charcoal)] leading-snug pt-1.5"
              >
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-6 text-center"
        >
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className="text-xl italic text-[var(--color-obsidian)]"
          >
            Every service includes shampoo, deep conditioning &amp; blow dry.
          </p>
          <a
            href="/#booking"
            className="btn-gold shrink-0"
          >
            Book Now
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
    </section>
  );
}
