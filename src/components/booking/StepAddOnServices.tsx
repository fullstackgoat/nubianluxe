"use client";

import {
  buildBookingServicePricing,
  buildSelectedAddOnServices,
  findAddOnServicesCategory,
  mergeBookingPricingWithAddOns,
  type BookingCatalogCategory,
} from "@/lib/booking-services";
import type { BookingState } from "./BookingWizard";
import WizardStepNav from "./WizardStepNav";

interface Props {
  catalog: BookingCatalogCategory[];
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepAddOnServices({
  catalog,
  state,
  update,
  onNext,
  onBack,
}: Props) {
  const addOnCategory = findAddOnServicesCategory(catalog);
  const addOnServices = addOnCategory?.items ?? [];

  const toggleAddOn = (serviceId: string) => {
    const nextIds = state.selectedAddOnServiceIds.includes(serviceId)
      ? state.selectedAddOnServiceIds.filter((id) => id !== serviceId)
      : [...state.selectedAddOnServiceIds, serviceId];

    const match = catalog
      .flatMap((category) => category.items.map((item) => ({ category, item })))
      .find(({ item }) => item.id === state.serviceId);

    if (!match) return;

    const base = buildBookingServicePricing(match.item, state.selectedBulletIndices);
    const addOns = buildSelectedAddOnServices(catalog, nextIds);

    update({
      clientSecret: "",
      appointmentId: "",
      totalCharge: 0,
      ...mergeBookingPricingWithAddOns(base, addOns),
    });
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Add-On Services
        </h2>
        <p className="text-white/40 text-sm">
          Optional extras for your <span className="text-white/70">{state.service}</span>{" "}
          appointment. Select any that apply — or continue without add-ons.
        </p>
      </div>

      <div className="glass-card p-4 sm:p-5 space-y-3 min-w-0">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">
            Available Add-Ons
          </p>
          <div className="text-left sm:text-right">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30">Current total</p>
            <p className="text-[var(--color-gold)] text-xl font-semibold">{state.servicePrice}</p>
          </div>
        </div>

        <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
          {addOnServices.map((service) => {
            const isChecked = state.selectedAddOnServiceIds.includes(service.id);

            return (
              <label
                key={service.id}
                className={`flex items-start gap-3 p-3 sm:p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                  isChecked
                    ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.08)]"
                    : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleAddOn(service.id)}
                  className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-gold)]"
                />
                <span className="min-w-0 flex-1 text-left">
                  <span className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <span className="text-white text-sm font-medium">{service.name}</span>
                    <span className="text-[var(--color-gold)] text-sm font-semibold shrink-0">
                      {service.price}
                    </span>
                  </span>
                  <span className="text-white/35 text-xs block mt-1">
                    Est. {service.duration >= 60 ? `${service.duration / 60}h` : `${service.duration}m`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        {state.selectedAddOnServices.length > 0 && (
          <p className="text-white/35 text-xs border-t border-white/10 pt-3">
            {state.service} total includes{" "}
            {state.selectedAddOnServices.map((addOn) => addOn.name).join(", ")}.
          </p>
        )}
      </div>

      <WizardStepNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue — Choose Booking Tier"
      />
    </div>
  );
}
