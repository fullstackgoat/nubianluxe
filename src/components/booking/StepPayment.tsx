"use client";

import { useState, useEffect } from "react";
import type { BookingState } from "./BookingWizard";
import { Lock, CreditCard, Calendar } from "lucide-react";
import WizardStepNav from "./WizardStepNav";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatHairColorSelection } from "@/lib/hair-colors";
import { formatSelectedServiceOptions } from "@/lib/price-list-bullets";
import { createBookingIntent, extendSlotHold } from "@/app/actions/booking";
import { DEPOSIT_AMOUNT, formatCents } from "@/lib/stripe";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const DEPOSIT_CENTS = DEPOSIT_AMOUNT;

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

function PaymentForm({ state, onNext }: { state: BookingState; onNext: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/book/confirmed?id=${state.appointmentId}`,
        receipt_email: state.clientEmail,
      },
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed. Please try again.");
      setLoading(false);
    } else {
      onNext();
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <div className="glass-card p-6">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading || !stripe}
        className={`btn-gold w-full py-4 text-sm flex items-center justify-center gap-2 ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <Lock className="w-4 h-4" />
        {loading ? "Processing…" : `Pay $${(state.totalCharge / 100).toFixed(2)} Securely`}
      </button>

      <p className="text-center text-white/30 text-xs">
        Secured by Stripe
      </p>
    </form>
  );
}

export default function StepPayment({ state, update, onNext, onBack }: Props) {
  const [initLoading, setInitLoading] = useState(false);
  const [initError, setInitError] = useState("");

  const hasClientSecret = !!state.clientSecret;

  // Pricing breakdown — always derived from current toggle so the UI stays in sync.
  const tierFee = state.tierFee;
  const servicePrice = state.servicePriceCents;
  const bookingFeeOnly = DEPOSIT_CENTS + tierFee;            // deposit + tier fee
  const fullUpfront = servicePrice + tierFee;                // service covers deposit; tier fee on top
  const remainingAtAppt = Math.max(0, servicePrice - DEPOSIT_CENTS);

  const totalNow = state.payServiceUpfront ? fullUpfront : bookingFeeOnly;

  useEffect(() => {
    if (!state.bookingSessionId || !state.date || !state.timeSlot) return;

    void extendSlotHold(state.bookingSessionId, state.date, state.timeSlot).then((result) => {
      if ("expiresAt" in result && result.expiresAt) {
        update({ slotHoldExpiresAt: result.expiresAt });
      }
    });
    // Refresh hold when entering the payment step.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetUpfront = (val: boolean) => {
    if (val === state.payServiceUpfront) return;
    // Toggling invalidates any existing PaymentIntent (the amount changes).
    update({
      payServiceUpfront: val,
      clientSecret: "",
      appointmentId: "",
      totalCharge: 0,
    });
    setInitError("");
  };

  const handleInitPayment = async () => {
    setInitLoading(true);
    setInitError("");

    const result = await createBookingIntent({
      serviceId:         state.serviceId,
      serviceCategoryId: state.serviceCategoryId,
      bookingSessionId:  state.bookingSessionId,
      clientName:        state.clientName,
      clientEmail:       state.clientEmail,
      clientPhone:       state.clientPhone,
      service:           state.service,
      serviceCategory:   state.serviceCategory,
      servicePrice:      state.servicePriceCents,
      selectedBulletIndices: state.selectedBulletIndices,
      stripeProductId:   state.stripeProductId ?? undefined,
      stripePriceId:     state.stripePriceId ?? undefined,
      hairColorCategory: state.hairColorCategory || undefined,
      hairColorValue:    state.hairColorValue || undefined,
      hairColorSkipped:  state.hairColorSkipped,
      tier:              state.tier,
      date:              state.date,
      timeSlot:          state.timeSlot,
      duration:          state.duration,
      payServiceUpfront: state.payServiceUpfront,
      notes:             state.notes,
    });

    setInitLoading(false);

    if ("error" in result && result.error) {
      setInitError(result.error as string);
      return;
    }

    update({
      appointmentId: result.appointmentId!,
      clientSecret:  result.clientSecret!,
      totalCharge:   result.totalCharge!,
    });
  };

  const handleBack = () => {
    // Invalidate the intent on back so editing earlier steps and re-arriving
    // here re-initializes the charge at the latest amounts.
    if (hasClientSecret) {
      update({ clientSecret: "", appointmentId: "", totalCharge: 0 });
    }
    onBack();
  };

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Payment
        </h2>
        <p className="text-white/40 text-sm">
          A {formatCents(DEPOSIT_AMOUNT)} deposit + booking fee is required now. The service balance is optional — pay upfront or at your appointment.
        </p>
      </div>

      {/* Pay-now / pay-later choice */}
      <div className="grid sm:grid-cols-2 gap-3">
        <PayChoiceCard
          icon={Calendar}
          title="Pay at Appointment"
          subtitle="Recommended"
          highlightAmount={`$${(bookingFeeOnly / 100).toFixed(2)}`}
          highlightLabel="due now"
          footer={
            servicePrice > 0
              ? `$${(remainingAtAppt / 100).toFixed(2)} balance at appointment`
              : "Service balance settled at appointment"
          }
          selected={!state.payServiceUpfront}
          onClick={() => handleSetUpfront(false)}
        />
        <PayChoiceCard
          icon={CreditCard}
          title="Pay in Full Now"
          subtitle="Nothing owed at appointment"
          highlightAmount={`$${(fullUpfront / 100).toFixed(2)}`}
          highlightLabel="due now"
          footer="$0 at appointment · Deposit applied to total"
          selected={state.payServiceUpfront}
          onClick={() => handleSetUpfront(true)}
          disabled={servicePrice === 0}
        />
      </div>

      {/* Order summary — adapts to the chosen option */}
      <div className="glass-card p-4 sm:p-5 space-y-2 min-w-0">
        <p className="text-[0.6rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-3">
          Order Summary
        </p>

        <Line label={`Service (${state.service})`} value={state.servicePrice} subtle />

        {state.selectedServiceOptions.length > 0 && (
          <Line
            label="Selected options"
            value={formatSelectedServiceOptions(state.selectedServiceOptions)}
            subtle
          />
        )}

        {state.baseServicePrice !== state.servicePrice && (
          <Line label="Base service price" value={state.baseServicePrice} subtle />
        )}

        {state.hairColorValue && state.hairColorCategory && (
          <Line
            label="Hair Color"
            value={formatHairColorSelection(state.hairColorCategory, state.hairColorValue)}
            subtle
          />
        )}

        {state.payServiceUpfront ? (
          <>
            <Line label="Service fee" value={`$${(servicePrice / 100).toFixed(2)}`} />
            <Line label="Deposit applied toward service" value={`–$${(DEPOSIT_CENTS / 100).toFixed(2)}`} subtle />
            <Line label="Deposit (held to reserve appointment)" value={`$${(DEPOSIT_CENTS / 100).toFixed(2)}`} subtle />
            {tierFee > 0 && (
              <Line
                label={`${state.tier.charAt(0) + state.tier.slice(1).toLowerCase()} booking fee (non-refundable)`}
                value={`$${(tierFee / 100).toFixed(2)}`}
              />
            )}
          </>
        ) : (
          <>
            <Line label="Deposit (applied toward service balance)" value={`$${(DEPOSIT_CENTS / 100).toFixed(2)}`} />
            {tierFee > 0 && (
              <Line
                label={`${state.tier.charAt(0) + state.tier.slice(1).toLowerCase()} booking fee (non-refundable)`}
                value={`$${(tierFee / 100).toFixed(2)}`}
              />
            )}
            {servicePrice > 0 && (
              <Line
                label={`Service balance at appointment (${state.service})`}
                value={`$${(remainingAtAppt / 100).toFixed(2)}`}
                subtle
              />
            )}
          </>
        )}

        <div className="border-t border-white/10 pt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-white font-semibold">
          <span>Total charged now</span>
          <span className="text-[var(--color-gold)]">${(totalNow / 100).toFixed(2)}</span>
        </div>
      </div>

      {/* Either: Init payment button, or Stripe Elements */}
      {!hasClientSecret ? (
        <>
          {initError && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
              {initError}
            </p>
          )}
          <button
            onClick={handleInitPayment}
            disabled={initLoading}
            className={`btn-gold w-full py-4 text-sm flex items-center justify-center gap-2 ${
              initLoading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <Lock className="w-4 h-4" />
            {initLoading ? "Preparing payment…" : `Continue to Card Entry — $${(totalNow / 100).toFixed(2)}`}
          </button>
        </>
      ) : (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: state.clientSecret,
            appearance: { theme: "night" },
          }}
        >
          <PaymentForm state={state} onNext={onNext} />
        </Elements>
      )}

      <WizardStepNav onBack={handleBack} />
    </div>
  );
}

function Line({ label, value, subtle = false }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div
      className={`flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between text-sm min-w-0 ${
        subtle ? "text-white/40" : "text-white/70"
      }`}
    >
      <span className="min-w-0 break-words">{label}</span>
      <span className="shrink-0 sm:text-right">{value}</span>
    </div>
  );
}

function PayChoiceCard({
  icon: Icon,
  title,
  subtitle,
  highlightAmount,
  highlightLabel,
  footer,
  selected,
  onClick,
  disabled = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  highlightAmount: string;
  highlightLabel: string;
  footer: string;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-left p-4 sm:p-5 rounded-xl border transition-all duration-300 w-full min-w-0 ${
        disabled
          ? "border-white/5 bg-[rgba(255,255,255,0.01)] opacity-40 cursor-not-allowed"
          : selected
          ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.07)]"
          : "border-white/10 hover:border-white/25 bg-[rgba(255,255,255,0.02)]"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-9 h-9 rounded-full border flex items-center justify-center ${
            selected ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.1)]" : "border-white/15"
          }`}
        >
          <Icon className={`w-4 h-4 ${selected ? "text-[var(--color-gold)]" : "text-white/60"}`} />
        </div>
        <div>
          <p
            style={{ fontFamily: "var(--font-display)" }}
            className={`text-lg font-light ${selected ? "text-[var(--color-gold-light)]" : "text-white"}`}
          >
            {title}
          </p>
          <p className="text-white/40 text-[0.65rem] tracking-[0.18em] uppercase">{subtitle}</p>
        </div>
      </div>
      <p className="text-white text-2xl font-semibold">
        {highlightAmount}
        <span className="text-white/40 text-xs font-normal ml-1.5">{highlightLabel}</span>
      </p>
      <p className="text-white/50 text-xs mt-2">{footer}</p>
    </button>
  );
}
