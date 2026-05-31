"use client";

import { useState } from "react";
import { parseServicePriceCents } from "@/lib/booking-data";
import type { BookingCatalogCategory } from "@/lib/booking-services";
import { getHairColorRequirement } from "@/lib/hair-colors";
import type { BookingState } from "./BookingWizard";

interface Props {
  catalog: BookingCatalogCategory[];
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
}

export default function StepService({ catalog, state, update, onNext }: Props) {
  const initialCategory =
    catalog.find((cat) => cat.category === state.serviceCategory)?.id ??
    catalog[0]?.id ??
    "";
  const [openCategoryId, setOpenCategoryId] = useState<string>(initialCategory);

  const selectedCategory = catalog.find((cat) => cat.id === openCategoryId);
  const canProceed = !!state.serviceId;
  const hairColorReq = getHairColorRequirement(state.serviceCategoryId);
  const continueLabel =
    hairColorReq !== "none" ? "Continue — Select Hair Color" : "Continue — Choose Booking Tier";

  const select = (
    category: BookingCatalogCategory,
    item: BookingCatalogCategory["items"][number]
  ) => {
    update({
      serviceId: item.id,
      serviceCategoryId: category.id,
      serviceCategory: category.category,
      service: item.name,
      duration: item.duration,
      servicePrice: item.price,
      servicePriceCents: parseServicePriceCents(item.price),
      stripeProductId: item.stripeProductId,
      stripePriceId: item.stripePriceId,
      hairColorCategory: "",
      hairColorValue: "",
      hairColorSkipped: false,
    });
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Choose Your Service
        </h2>
        <p className="text-white/40 text-sm">Select the style you want at your appointment.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {catalog.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setOpenCategoryId(cat.id)}
            className={`px-3 py-2.5 rounded-lg text-[0.65rem] sm:text-xs tracking-[0.1em] sm:tracking-[0.12em] uppercase font-medium border transition-all duration-300 text-left break-words ${
              openCategoryId === cat.id
                ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                : "border-white/10 text-white/50 hover:border-white/30 hover:text-white/80"
            }`}
          >
            {cat.category}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {selectedCategory?.items.map((item) => {
          const isSelected = state.serviceId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => select(selectedCategory, item)}
              className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 w-full min-w-0 ${
                isSelected
                  ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.08)]"
                  : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className={`text-lg sm:text-xl font-light transition-colors duration-300 break-words min-w-0 ${
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
                  <span className="text-[var(--color-gold)] text-xs tracking-[0.15em] uppercase">
                    Selected
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <button
        onClick={onNext}
        disabled={!canProceed}
        className={`w-full btn-gold py-3.5 sm:py-4 text-xs sm:text-sm ${!canProceed ? "opacity-40 cursor-not-allowed" : ""}`}
      >
        {continueLabel}
      </button>
    </div>
  );
}
