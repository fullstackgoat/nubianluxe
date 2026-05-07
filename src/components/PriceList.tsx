"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUpRight, ChevronDown } from "lucide-react";

const categories = [
  {
    id: "extensions",
    title: "Braid Extension Services",
    accent: "var(--color-blush)",
    services: [
      { name: "Boho / Goddess Braids", price: "$300+", desc: "Knotless braids with flowing human hair curls. Size large to small, 80–150 braids.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Boho%2FGoddess%20Braids" },
      { name: "Box Braids",             price: "$100+", desc: "Classic top-knot braids. Size XX-large to XX-small, 15–250 braids.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Box%20Braids" },
      { name: "Cornrows",               price: "$150+", desc: "Straight backs to custom designed styles. Up to 50 rows.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Cornrows" },
      { name: "Crochet Braids",         price: "$100+", desc: "Pre-looped hair crocheted into cornrow base.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Crochet%20Braids" },
      { name: "Fulani / Tribal Braids", price: "$200+", desc: "Patterned cornrows with individual braid combo.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Fulani%2FTribal%20Braids" },
      { name: "Knotless Braids",        price: "$150+", desc: "Lightweight, tension-free braids with seamless feed-in technique. 15–250 braids.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Knotless%20Braids" },
      { name: "Illusion Locs",          price: "$200+", desc: "Palm-rolled locs base, two-strand twist extensions wrapped for a natural loc look.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Locs" },
      { name: "Mermaid Locs",           price: "$300+", desc: "Long, boho locs with flowing human hair curls added.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Locs" },
      { name: "Twist",                  price: "$100+", desc: "Two-strand twist with straight, curly, or kinky hair. Size XX-large to XX-small.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Extension%20Service%20Twist" },
    ],
  },
  {
    id: "natural",
    title: "Natural Hair Services",
    accent: "var(--color-gold)",
    services: [
      { name: "Cornrows",       price: "$75+",  desc: "Scalp braids with no added hair.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Cornrows" },
      { name: "Loc Maintenance",price: "$120+", desc: "Retwist or retie.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Loc%20Maintenance" },
      { name: "Coils",          price: "$125+", desc: "Palm-roll root and defined finger coils. Size large to XX-small, 80–250 coils.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Coils" },
      { name: "Plats",          price: "$75+",  desc: "Individual box-style braids using only your natural hair. 15–250 plats.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Plats" },
      { name: "Twist",          price: "$75+",  desc: "Two-strand twist using only your natural hair. 15–250 twists.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Hair%20Service%20Twist" },
      { name: "Illusion Locs",  price: "$150+", desc: "Faux loc look using only natural hair — no loc commitment.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Natural%20Service%20Illusion%20Loc%20Two%20Strand" },
    ],
  },
  {
    id: "other",
    title: "Add-On Services",
    accent: "var(--color-blush-dark)",
    services: [
      { name: "Braid Prep",          price: "$75+",  desc: "Professional sectioning to save you time — perfect before braiding your own hair.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Other%20Service%20Braid%20Prep" },
      { name: "Hair Color",          price: "$50+",  desc: "Professional color with bond treatment, conditioning, and color-safe toning. Book as add-on or standalone.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Other%20Natural%20Hair%20Services" },
      { name: "Olaplex Conditioning",price: "$45+",  desc: "Strengthens and repairs bonds with nano steam technology and deep moisture infusion.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services" },
      { name: "Detangling",          price: "$100+", desc: "Gentle removal of knots, mats, or shed hair with patience and care.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services" },
      { name: "Braid Take Down",     price: "$100+", desc: "Safe braid removal, thorough detangling, shampoo, deep conditioning, and blow-dry.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services" },
      { name: "Wig Braid Down",      price: "$75",   desc: "Flat, comfortable braid foundation tailored for wig installs or protective styling.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Extension%20Services" },
    ],
  },
  {
    id: "children",
    title: "Children's Services",
    accent: "var(--color-gold-light)",
    services: [
      { name: "Extensions", price: "$70+", desc: "Boho, box, cornrows, crochet, illusion locs, knotless & twist.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Services%20Natural%20Hair" },
      { name: "Natural",    price: "$50+", desc: "Coils, cornrows, crochet, detangling, illusion locs, plats, retie, retwist, twist.", url: "https://nubianluxebraidinglounge.as.me/schedule/38affb10/?categories[]=Children%20Services%20Natural%20Hair" },
    ],
  },
];

function ServiceCard({ service }: { service: typeof categories[0]["services"][0] }) {
  return (
    <motion.a
      href={service.url}
      target="_blank"
      rel="noopener noreferrer"
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
          {service.name}
        </h4>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xl font-semibold text-[var(--color-gold)]" style={{ fontFamily: "var(--font-body)" }}>
            {service.price}
          </span>
        </div>
      </div>
      <p className="text-white/40 text-xs leading-relaxed flex-1">{service.desc}</p>
      <div className="flex items-center gap-1.5 text-[var(--color-gold-dark)] text-xs tracking-[0.15em] uppercase group-hover:text-[var(--color-gold)] transition-colors duration-300">
        <span>Book This Style</span>
        <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
      </div>
    </motion.a>
  );
}

export default function PriceList() {
  const [open, setOpen] = useState<string>(categories[0].id);

  return (
    <section id="prices" className="relative py-28 bg-[var(--color-obsidian-soft)]">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

      <div className="section-container">
        {/* Header */}
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

        {/* Category tabs */}
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

        {/* Service grid */}
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
                {cat.services.map((s) => (
                  <ServiceCard key={s.name} service={s} />
                ))}
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* Bottom note */}
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
