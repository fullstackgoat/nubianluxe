"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import StepService from "./StepService";
import StepTier from "./StepTier";
import StepDateTime from "./StepDateTime";
import StepClientInfo from "./StepClientInfo";
import StepPayment from "./StepPayment";
import StepConfirmation from "./StepConfirmation";
import { TIERS } from "@/lib/booking-data";

export type BookingState = {
  // Step 1
  serviceCategory: string;
  service: string;
  duration: number;
  servicePrice: string;        // raw catalog string for display ("$300+")
  servicePriceCents: number;   // parsed starting price for charging (30000)
  // Step 2
  tier: "REGULAR" | "PREMIUM" | "VIP";
  tierFee: number;
  // Step 3
  date: string;
  timeSlot: string;
  // Step 4
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  // Step 5 — payment choice
  payServiceUpfront: boolean;
  // Step 5 result
  appointmentId: string;
  clientSecret: string;
  totalCharge: number;
};

const STEP_LABELS = [
  "Service",
  "Tier",
  "Date & Time",
  "Your Info",
  "Payment",
  "Confirmed",
];

const VALID_TIERS = ["REGULAR", "PREMIUM", "VIP"] as const;

function buildInitialState(tierFromUrl: string | null): BookingState {
  const upper = tierFromUrl?.toUpperCase() ?? "";
  const tier = (VALID_TIERS as readonly string[]).includes(upper)
    ? (upper as BookingState["tier"])
    : "REGULAR";
  const tierFee = TIERS.find((t) => t.id === tier)?.fee ?? 0;

  return {
    serviceCategory: "", service: "", duration: 0, servicePrice: "", servicePriceCents: 0,
    tier, tierFee,
    date: "", timeSlot: "",
    clientName: "", clientEmail: "", clientPhone: "", notes: "",
    payServiceUpfront: false,
    appointmentId: "", clientSecret: "", totalCharge: 0,
  };
}

export default function BookingWizard() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [state, setState] = useState<BookingState>(() =>
    buildInitialState(searchParams.get("tier"))
  );

  const update = (patch: Partial<BookingState>) =>
    setState((s) => ({ ...s, ...patch }));

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <div className="section-container max-w-3xl">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-[0.65rem] tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-3">
          Reserve Your Seat
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-5xl font-light italic text-white mb-4"
        >
          Book Your Appointment
        </h1>
        <div className="gold-divider" />
      </div>

      {/* Step progress */}
      {step < 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {STEP_LABELS.slice(0, 5).map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1.5 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border transition-all duration-300 ${
                    i < step
                      ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                      : i === step
                      ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-transparent"
                      : "border-white/20 text-white/30 bg-transparent"
                  }`}
                >
                  {i < step ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[0.6rem] tracking-[0.15em] uppercase hidden sm:block transition-colors duration-300 ${
                    i === step ? "text-[var(--color-gold)]" : "text-white/30"
                  }`}
                >
                  {label}
                </span>
              </div>
            ))}
            {/* Connecting lines */}
          </div>
          <div className="relative h-px bg-white/10 mt-1">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--color-gold)]"
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {step === 0 && (
            <StepService state={state} update={update} onNext={next} />
          )}
          {step === 1 && (
            <StepTier state={state} update={update} onNext={next} onBack={back} />
          )}
          {step === 2 && (
            <StepDateTime state={state} update={update} onNext={next} onBack={back} />
          )}
          {step === 3 && (
            <StepClientInfo state={state} update={update} onNext={next} onBack={back} />
          )}
          {step === 4 && (
            <StepPayment state={state} update={update} onNext={next} onBack={back} />
          )}
          {step === 5 && (
            <StepConfirmation state={state} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
