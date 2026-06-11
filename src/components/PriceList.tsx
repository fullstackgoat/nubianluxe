"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { PriceListCategoryWithServices } from "@/lib/price-list-data";
import { getBookingUrlForService } from "@/lib/booking-services";
import {
  formatBulletPointMeta,
  normalizeBulletPointsForSave,
} from "@/lib/price-list-bullets";

function ServiceCard({
  service,
}: {
  service: PriceListCategoryWithServices["services"][number];
}) {
  const bullets = normalizeBulletPointsForSave(service.bulletPoints);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className="group glass-card p-6 flex flex-col gap-3 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <h4
          style={{ fontFamily: "var(--font-display)" }}
          className="text-xl font-light text-white group-hover:text-[var(--color-gold-light)] transition-colors duration-300"
        >
          {service.title}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className="text-xl font-semibold text-[var(--color-gold)]"
            style={{ fontFamily: "var(--font-body)" }}
          >
            {service.price}
          </span>
        </div>
      </div>

      {service.description && (
        <p className="text-white/40 text-xs leading-relaxed">{service.description}</p>
      )}

      {bullets.length > 0 && (
        <ul className="space-y-1">
          {bullets.map((point, index) => {
            const meta = formatBulletPointMeta(point);
            return (
              <li
                key={`${service.id}-${index}`}
                className="text-white/40 text-xs leading-relaxed flex gap-2"
              >
                <span className="text-[var(--color-gold-dark)] shrink-0">•</span>
                <span>
                  {point.label}
                  {meta ? (
                    <span className="text-white/25"> — {meta}</span>
                  ) : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      <Link
        href={getBookingUrlForService(service.id)}
        className="flex items-center gap-1.5 text-[var(--color-gold-dark)] text-xs tracking-[0.15em] uppercase group-hover:text-[var(--color-gold)] transition-colors duration-300 mt-auto"
      >
        <span>Book This Style</span>
        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </Link>
    </motion.div>
  );
}

export default function PriceList({
  categories,
}: {
  categories: PriceListCategoryWithServices[];
}) {
  const [open, setOpen] = useState<string>(categories[0]?.id ?? "");

  return (
    <section id="services" className="relative py-28 bg-[var(--color-obsidian-soft)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

      <div className="section-container">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-6"
        >
          <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-4">
            Investment in You
          </p>
          <h2
            style={{ fontFamily: "var(--font-display)" }}
            className="text-5xl md:text-6xl font-light text-white italic mb-6"
          >
            Price List
          </h2>
          <div className="gold-divider mb-6" />
          <p className="text-white/40 max-w-xl mx-auto text-sm leading-relaxed">
            All services include shampoo, deep conditioning bond treatment &amp; blow dry.
            All extension services include synthetic braiding hair.
          </p>
        </motion.div>

        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setOpen(cat.id)}
              className={`px-5 py-2.5 rounded-full text-xs tracking-[0.18em] uppercase font-medium transition-all duration-300 border ${
                open === cat.id
                  ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                  : "border-[rgba(201,168,76,0.2)] text-white/50 hover:border-[rgba(201,168,76,0.5)] hover:text-white/80"
              }`}
            >
              {cat.title}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {categories.map((cat) =>
            cat.id === open ? (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {cat.services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-white/30 text-xs mt-12 tracking-[0.12em]"
        >
          Prices are starting rates. Final pricing depends on hair length, density, and style complexity.
          See booking site for full descriptions.
        </motion.p>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />
    </section>
  );
}
