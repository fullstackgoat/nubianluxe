"use client";

import { TIERS } from "@/lib/booking-data";
import type { BookingState } from "./BookingWizard";
import { ArrowLeft } from "lucide-react";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepTier({ state, update, onNext, onBack }: Props) {
  const select = (id: "REGULAR" | "PREMIUM" | "VIP", fee: number) =>
    update({ tier: id, tierFee: fee });

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-light text-white italic mb-1">
          Choose Your Tier
        </h2>
        <p className="text-white/40 text-sm">
          Select the availability that works best for your schedule.
        </p>
      </div>

      <div className="grid gap-4">
        {TIERS.map((tier) => {
          const isSelected = state.tier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => select(tier.id, tier.fee)}
              className={`text-left p-6 rounded-xl border transition-all duration-300 ${
                isSelected
                  ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.07)]"
                  : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                    isSelected ? "border-[var(--color-gold)]" : "border-white/30"
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />}
                  </div>
                  <span style={{ fontFamily: "var(--font-display)" }} className="text-2xl font-light text-white">
                    {tier.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-semibold text-[var(--color-gold)]">{tier.feeLabel}</span>
                  <span className="text-white/40 text-xs block">booking fee</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm text-white/50 pl-7">
                <div>
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">Days</p>
                  <p>{tier.schedule}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">Hours</p>
                  <p>{tier.hours}</p>
                </div>
                <div>
                  <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30 mb-0.5">Notice</p>
                  <p>{tier.notice}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cost summary */}
      <div className="glass-card p-5 space-y-2">
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">Required at Booking</p>
        <div className="flex justify-between text-white/70 text-sm">
          <span>Deposit (applied to service total)</span>
          <span>$100.00</span>
        </div>
        {state.tierFee > 0 && (
          <div className="flex justify-between text-white/70 text-sm">
            <span>{state.tier.charAt(0) + state.tier.slice(1).toLowerCase()} booking fee (non-refundable)</span>
            <span>${(state.tierFee / 100).toFixed(2)}</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-2 flex justify-between text-white font-semibold">
          <span>Booking fee total</span>
          <span className="text-[var(--color-gold)]">
            ${((10000 + state.tierFee) / 100).toFixed(2)}
          </span>
        </div>
        {state.servicePriceCents > 0 && (
          <p className="text-white/40 text-xs pt-1">
            Service ({state.servicePrice}) is optional at booking — choose to pay now or at your appointment on the Payment step.
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex items-center gap-2 px-5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={onNext} className="btn-gold flex-1 py-4 text-sm">
          Continue — Select Date & Time
        </button>
      </div>
    </div>
  );
}
