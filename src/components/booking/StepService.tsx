"use client";

import { useState } from "react";
import { SERVICES, parseServicePriceCents } from "@/lib/booking-data";
import type { BookingState } from "./BookingWizard";
import { ChevronDown } from "lucide-react";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
}

export default function StepService({ state, update, onNext }: Props) {
  const [openCategory, setOpenCategory] = useState<string>(
    state.serviceCategory || SERVICES[0].category
  );

  const selectedCategory = SERVICES.find((s) => s.category === openCategory);
  const canProceed = !!state.service;

  const select = (category: string, name: string, duration: number, price: string) => {
    update({
      serviceCategory: category,
      service: name,
      duration,
      servicePrice: price,
      servicePriceCents: parseServicePriceCents(price),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-light text-white italic mb-1">
          Choose Your Service
        </h2>
        <p className="text-white/40 text-sm">Select the style you want at your appointment.</p>
      </div>

      {/* Category tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {SERVICES.map((cat) => (
          <button
            key={cat.category}
            onClick={() => setOpenCategory(cat.category)}
            className={`px-3 py-2.5 rounded-lg text-xs tracking-[0.12em] uppercase font-medium border transition-all duration-300 text-left ${
              openCategory === cat.category
                ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      {/* Services grid */}
      <div className="grid sm:grid-cols-2 gap-3">
        {selectedCategory?.items.map((item) => {
          const isSelected = state.service === item.name && state.serviceCategory === openCategory;
          return (
            <button
              key={item.name}
              onClick={() => select(openCategory, item.name, item.duration, item.price)}
              className={`text-left p-5 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.08)]"
                  : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className={`text-xl font-light transition-colors duration-300 ${
                    isSelected ? "text-[var(--color-gold-light)]" : "text-white"
                  }`}
                >
                  {item.name}
                </span>
                <span className="text-[var(--color-gold)] font-semibold text-sm shrink-0">
                  {item.price}
                </span>
              </div>
              <p className="text-white/35 text-xs">
                Est. {item.duration >= 60 ? `${item.duration / 60}h` : `${item.duration}m`}
              </p>
              {isSelected && (
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
                  <span className="text-[var(--color-gold)] text-xs tracking-[0.15em] uppercase">Selected</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full btn-gold py-4 text-sm ${!canProceed ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        Continue — Choose Booking Tier
      </button>
    </div>
  );
}
