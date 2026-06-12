"use client";

import { useState } from "react";
import type { BookingCatalogCategory } from "@/lib/booking-services";
import { buildBookingServicePricing } from "@/lib/booking-services";
import { getHairColorRequirement } from "@/lib/hair-colors";
import {
  getPricedBulletIndices,
  normalizeBulletPointsForSave,
} from "@/lib/price-list-bullets";
import AddOnOptionDropdown from "@/components/AddOnOptionDropdown";
import type { BookingState } from "./BookingWizard";

interface Props {
  catalog: BookingCatalogCategory[];
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  showAddOnStep?: boolean;
}

export default function StepService({ catalog, state, update, onNext, showAddOnStep = false }: Props) {
  const initialCategory =
    catalog.find((cat) => cat.category === state.serviceCategory)?.id ??
    catalog[0]?.id ??
    "";
  const [openCategoryId, setOpenCategoryId] = useState<string>(initialCategory);

  const selectedCategory = catalog.find((cat) => cat.id === openCategoryId);
  const selectedItem = selectedCategory?.items.find((item) => item.id === state.serviceId);
  const pricedBulletIndices = selectedItem
    ? getPricedBulletIndices(selectedItem.bulletPoints)
    : [];
  const normalizedBullets = selectedItem
    ? normalizeBulletPointsForSave(selectedItem.bulletPoints)
    : [];
  const requiresBulletSelection = pricedBulletIndices.length > 0;
  const hasValidBulletSelection =
    !requiresBulletSelection ||
    state.selectedBulletIndices.some((index) => pricedBulletIndices.includes(index));
  const canProceed = !!state.serviceId && hasValidBulletSelection;
  const hairColorReq = getHairColorRequirement(state.serviceCategoryId);
  const continueLabel = hairColorReq !== "none"
    ? "Continue — Select Hair Color"
    : showAddOnStep
      ? "Continue — Add-On Services"
      : "Continue — Choose Booking Tier";

  const selectService = (
    category: BookingCatalogCategory,
    item: BookingCatalogCategory["items"][number]
  ) => {
    update({
      serviceId: item.id,
      serviceCategoryId: category.id,
      serviceCategory: category.category,
      service: item.name,
      stripeProductId: item.stripeProductId,
      stripePriceId: item.stripePriceId,
      hairColorCategory: "",
      hairColorValue: "",
      hairColorSkipped: false,
      clientSecret: "",
      appointmentId: "",
      totalCharge: 0,
      ...buildBookingServicePricing(item, []),
    });
  };

  const toggleBulletOption = (index: number) => {
    if (!selectedItem) return;

    const isSelected = state.selectedBulletIndices.includes(index);
    const nextIndices = isSelected ? [] : [index];

    update({
      clientSecret: "",
      appointmentId: "",
      totalCharge: 0,
      ...buildBookingServicePricing(selectedItem, nextIndices),
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
              onClick={() => selectService(selectedCategory, item)}
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

      {selectedItem && requiresBulletSelection && (
        <div className="glass-card p-4 sm:p-5 space-y-4 min-w-0">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">
                Service Options
              </p>
              <p className="text-white/50 text-sm mt-1">
                Choose an add-on from the list. Your total updates automatically.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30">Current total</p>
              <p className="text-[var(--color-gold)] text-xl font-semibold">{state.servicePrice}</p>
            </div>
          </div>

          <AddOnOptionDropdown
            bulletPoints={selectedItem.bulletPoints}
            pricedIndices={pricedBulletIndices}
            selectedIndices={state.selectedBulletIndices}
            onToggle={toggleBulletOption}
            idPrefix={selectedItem.id}
            placeholder="Select service option"
          />

          <p className="text-white/35 text-xs">
            Base price {state.baseServicePrice}
            {state.selectedServiceOptions.length > 0
              ? ` + ${state.selectedServiceOptions
                  .map((option) => `$${(option.costCents / 100).toFixed(0)}`)
                  .join(" + ")}`
              : ""}{" "}
            = {state.servicePrice}
          </p>
        </div>
      )}

      {!hasValidBulletSelection && state.serviceId && (
        <p className="text-amber-200/90 text-sm bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-3">
          Select a service option above to continue.
        </p>
      )}

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
