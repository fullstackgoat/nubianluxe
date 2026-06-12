"use client";

import { TIERS } from "@/lib/booking-data";
import { DEPOSIT_AMOUNT, formatCents } from "@/lib/stripe";
import type { BookingState } from "./BookingWizard";
import WizardStepNav from "./WizardStepNav";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between text-white/70 text-sm">
      <span className="min-w-0">{label}</span>
      <span className="shrink-0 font-medium">{value}</span>
    </div>
  );
}

export default function StepTier({ state, update, onNext, onBack }: Props) {
  const select = (id: "REGULAR" | "PREMIUM" | "VIP", fee: number) =>
    update({ tier: id, tierFee: fee });

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
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
              className={`text-left p-4 sm:p-6 rounded-xl border transition-all duration-300 w-full min-w-0 ${
                isSelected
                  ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.07)]"
                  : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${
                      isSelected ? "border-[var(--color-gold)]" : "border-white/30"
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[var(--color-gold)]" />}
                  </div>
                  <span
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-xl sm:text-2xl font-light text-white"
                  >
                    {tier.name}
                  </span>
                </div>
                <div className="text-left sm:text-right pl-7 sm:pl-0 shrink-0">
                  <span className="text-xl sm:text-2xl font-semibold text-[var(--color-gold)]">
                    {tier.feeLabel}
                  </span>
                  <span className="text-white/40 text-xs block">booking fee</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm text-white/50 pl-0 sm:pl-7">
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

      <div className="glass-card p-4 sm:p-5 space-y-2 min-w-0">
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">
          Required at Booking
        </p>
        <SummaryLine label="Deposit (applied to service total)" value={formatCents(DEPOSIT_AMOUNT)} />
        {state.tierFee > 0 && (
          <SummaryLine
            label={`${state.tier.charAt(0) + state.tier.slice(1).toLowerCase()} booking fee (non-refundable)`}
            value={formatCents(state.tierFee)}
          />
        )}
        <div className="border-t border-white/10 pt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-white font-semibold">
          <span>Booking fee total</span>
          <span className="text-[var(--color-gold)]">
            {formatCents(DEPOSIT_AMOUNT + state.tierFee)}
          </span>
        </div>
        {state.servicePriceCents > 0 && (
          <p className="text-white/40 text-xs pt-1 leading-relaxed">
            Service ({state.servicePrice}
            {state.baseServicePrice !== state.servicePrice
              ? ` · base ${state.baseServicePrice}`
              : ""}
            ) is optional at booking — choose to pay now or at your appointment on the Payment step.
          </p>
        )}
      </div>

      <WizardStepNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue — Select Date & Time"
      />
    </div>
  );
}
