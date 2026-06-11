"use client";

import type { BookingState } from "./BookingWizard";
import WizardStepNav from "./WizardStepNav";
import { extendSlotHold } from "@/app/actions/booking";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepClientInfo({ state, update, onNext, onBack }: Props) {
  const isValid =
    state.clientName.length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.clientEmail) &&
    state.clientPhone.replace(/\D/g, "").length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    if (state.clientSecret) {
      update({ clientSecret: "", appointmentId: "", totalCharge: 0 });
    }
    if (state.bookingSessionId && state.date && state.timeSlot) {
      const result = await extendSlotHold(
        state.bookingSessionId,
        state.date,
        state.timeSlot
      );
      if ("expiresAt" in result && result.expiresAt) {
        update({ slotHoldExpiresAt: result.expiresAt });
      }
    }
    onNext();
  };

  const field = (
    label: string,
    key: keyof BookingState,
    type = "text",
    placeholder = ""
  ) => (
    <div>
      <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-white/40 mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={state[key] as string}
        onChange={(e) => update({ [key]: e.target.value } as Partial<BookingState>)}
        className="w-full min-w-0 bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors duration-200"
      />
    </div>
  );

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Your Information
        </h2>
        <p className="text-white/40 text-sm">
          We&apos;ll use this to confirm your appointment and send reminders.
        </p>
      </div>

      <div className="glass-card p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm min-w-0">
        {[
          { label: "Service", value: state.service },
          ...(state.selectedServiceOptions.length > 0
            ? [{
                label: "Options",
                value: state.selectedServiceOptions
                  .map((option) => `${option.label} (+$${(option.costCents / 100).toFixed(0)})`)
                  .join(", "),
              }]
            : []),
          { label: "Price", value: state.servicePrice },
          { label: "Tier", value: state.tier.charAt(0) + state.tier.slice(1).toLowerCase() },
          {
            label: "Date",
            value: state.date
              ? new Date(state.date + "T12:00:00").toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "long",
                  day: "numeric",
                })
              : "",
          },
          { label: "Time", value: state.timeSlot },
        ].map(({ label, value }) => (
          <div key={label} className="min-w-0">
            <p className="text-[0.6rem] tracking-[0.2em] uppercase text-white/30">{label}</p>
            <p className="text-white mt-0.5 break-words">{value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {field("Full Name", "clientName", "text", "Your name")}
        {field("Email Address", "clientEmail", "email", "you@example.com")}
        {field("Phone Number", "clientPhone", "tel", "(555) 000-0000")}
        <div>
          <label className="block text-[0.65rem] tracking-[0.2em] uppercase text-white/40 mb-2">
            Notes (optional)
          </label>
          <textarea
            placeholder="Hair length, inspiration style, allergies, or anything we should know..."
            value={state.notes}
            onChange={(e) => update({ notes: e.target.value })}
            rows={3}
            className="w-full min-w-0 bg-[rgba(255,255,255,0.04)] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 text-sm focus:outline-none focus:border-[var(--color-gold)] transition-colors duration-200 resize-none"
          />
        </div>
      </div>

      <WizardStepNav
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel="Continue — Choose Payment"
        nextDisabled={!isValid}
      />
    </div>
  );
}
