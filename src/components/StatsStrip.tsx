"use client";

import { motion } from "motion/react";

const stats = [
  { value: "500+", label: "Clients Served" },
  { value: "4.9★", label: "Average Rating" },
  { value: "24/7", label: "Availability" },
  { value: "28",   label: "Services Offered" },
  { value: "100%", label: "Braiding Hair Included" },
];

export default function StatsStrip() {
  return (
    <div className="relative bg-[var(--color-obsidian-muted)] border-y border-[rgba(201,168,76,0.1)] py-10">
      <div className="section-container">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="text-center"
            >
              <p
                style={{ fontFamily: "var(--font-display)" }}
                className="text-4xl font-light text-gold-gradient mb-1"
              >
                {s.value}
              </p>
              <p className="text-[0.65rem] tracking-[0.25em] uppercase text-white/40">
                {s.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
