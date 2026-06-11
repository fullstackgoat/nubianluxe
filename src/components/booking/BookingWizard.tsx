"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import StepService from "./StepService";
import StepHairColor from "./StepHairColor";
import StepTier from "./StepTier";
import StepDateTime from "./StepDateTime";
import StepClientInfo from "./StepClientInfo";
import StepPayment from "./StepPayment";
import StepConfirmation from "./StepConfirmation";
import SlotHoldTimer from "./SlotHoldTimer";
import { TIERS } from "@/lib/booking-data";
import {
  findBookingService,
  buildBookingServicePricing,
  parseBulletIndicesFromParam,
  type BookingCatalogCategory,
} from "@/lib/booking-services";
import { parseServicePriceCents } from "@/lib/booking-data";
import type { SelectedServiceOption } from "@/lib/price-list-bullets";
import { getHairColorRequirement } from "@/lib/hair-colors";
import { getBookingSessionId } from "@/lib/booking-session";
import { getActiveSlotHold, releaseSlotHold } from "@/app/actions/booking";

export type BookingState = {
  bookingSessionId: string;
  slotHoldExpiresAt: string;
  serviceId: string;
  serviceCategoryId: string;
  serviceCategory: string;
  service: string;
  duration: number;
  servicePrice: string;
  servicePriceCents: number;
  baseServicePrice: string;
  baseServicePriceCents: number;
  baseDuration: number;
  serviceBulletPoints: import("@/lib/price-list-bullets").PriceListBulletPoint[];
  selectedBulletIndices: number[];
  selectedServiceOptions: SelectedServiceOption[];
  stripeProductId: string | null;
  stripePriceId: string | null;
  hairColorCategory: string;
  hairColorValue: string;
  hairColorSkipped: boolean;
  tier: "REGULAR" | "PREMIUM" | "VIP";
  tierFee: number;
  date: string;
  timeSlot: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  payServiceUpfront: boolean;
  appointmentId: string;
  clientSecret: string;
  totalCharge: number;
};

type WizardStep = "service" | "hairColor" | "tier" | "dateTime" | "clientInfo" | "payment" | "confirmation";

const STEP_LABELS: Record<WizardStep, string> = {
  service: "Service",
  hairColor: "Hair Color",
  tier: "Tier",
  dateTime: "Date & Time",
  clientInfo: "Your Info",
  payment: "Payment",
  confirmation: "Confirmed",
};

const VALID_TIERS = ["REGULAR", "PREMIUM", "VIP"] as const;

const HOLD_STEPS: WizardStep[] = ["dateTime", "clientInfo", "payment"];

function buildInitialState(
  catalog: BookingCatalogCategory[],
  tierFromUrl: string | null,
  serviceIdFromUrl: string | null,
  bulletIndicesFromUrl: number[],
  bookingSessionId: string
): BookingState {
  const upper = tierFromUrl?.toUpperCase() ?? "";
  const tier = (VALID_TIERS as readonly string[]).includes(upper)
    ? (upper as BookingState["tier"])
    : "REGULAR";
  const tierFee = TIERS.find((t) => t.id === tier)?.fee ?? 0;

  const match = findBookingService(catalog, serviceIdFromUrl);
  const serviceFields = match
    ? buildBookingServicePricing(match.service, bulletIndicesFromUrl)
    : {
        baseServicePrice: "",
        baseServicePriceCents: 0,
        baseDuration: 0,
        serviceBulletPoints: [] as import("@/lib/price-list-bullets").PriceListBulletPoint[],
        selectedBulletIndices: [] as number[],
        selectedServiceOptions: [] as SelectedServiceOption[],
        servicePrice: "",
        servicePriceCents: 0,
        duration: 0,
      };

  return {
    bookingSessionId,
    slotHoldExpiresAt: "",
    serviceId: match?.service.id ?? "",
    serviceCategoryId: match?.category.id ?? catalog[0]?.id ?? "",
    serviceCategory: match?.category.category ?? catalog[0]?.category ?? "",
    service: match?.service.name ?? "",
    ...serviceFields,
    stripeProductId: match?.service.stripeProductId ?? null,
    stripePriceId: match?.service.stripePriceId ?? null,
    hairColorCategory: "",
    hairColorValue: "",
    hairColorSkipped: false,
    tier,
    tierFee,
    date: "",
    timeSlot: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    notes: "",
    payServiceUpfront: false,
    appointmentId: "",
    clientSecret: "",
    totalCharge: 0,
  };
}

function buildWizardSteps(state: BookingState): WizardStep[] {
  const steps: WizardStep[] = ["service"];
  if (getHairColorRequirement(state.serviceCategoryId) !== "none") {
    steps.push("hairColor");
  }
  steps.push("tier", "dateTime", "clientInfo", "payment", "confirmation");
  return steps;
}

function getInitialStepIndex(
  catalog: BookingCatalogCategory[],
  tierFromUrl: string | null,
  serviceIdFromUrl: string | null,
  bulletIndicesFromUrl: number[]
): number {
  const state = buildInitialState(catalog, tierFromUrl, serviceIdFromUrl, bulletIndicesFromUrl, "");
  const steps = buildWizardSteps(state);
  if (!serviceIdFromUrl) return 0;

  const hairReq = getHairColorRequirement(state.serviceCategoryId);
  if (hairReq !== "none") {
    return Math.max(steps.indexOf("hairColor"), 0);
  }
  return Math.max(steps.indexOf("tier"), 0);
}

export default function BookingWizard({
  catalog,
  blockedDates,
}: {
  catalog: BookingCatalogCategory[];
  blockedDates: string[];
}) {
  const searchParams = useSearchParams();
  const sessionId = useMemo(() => getBookingSessionId(), []);

  const [state, setState] = useState<BookingState>(() =>
    buildInitialState(
      catalog,
      searchParams.get("tier"),
      searchParams.get("serviceId"),
      parseBulletIndicesFromParam(searchParams.get("bullets")),
      sessionId
    )
  );
  const [stepIndex, setStepIndex] = useState(() =>
    getInitialStepIndex(
      catalog,
      searchParams.get("tier"),
      searchParams.get("serviceId"),
      parseBulletIndicesFromParam(searchParams.get("bullets"))
    )
  );
  const [holdExpiredMessage, setHoldExpiredMessage] = useState("");

  useEffect(() => {
    if (!sessionId) return;

    getActiveSlotHold(sessionId).then((hold) => {
      if (!hold) return;
      setState((s) => ({
        ...s,
        bookingSessionId: sessionId,
        date: hold.date,
        timeSlot: hold.timeSlot,
        slotHoldExpiresAt: hold.expiresAt,
      }));
    });
  }, [sessionId]);

  const steps = useMemo(() => buildWizardSteps(state), [state.serviceCategoryId]);
  const currentStep = steps[stepIndex] ?? "service";
  const progressSteps = steps.filter((step) => step !== "confirmation");
  const progressIndex = progressSteps.indexOf(currentStep as Exclude<WizardStep, "confirmation">);
  const dateTimeStepIndex = steps.indexOf("dateTime");

  const update = useCallback((patch: Partial<BookingState>) => {
    setState((s) => {
      const nextState = { ...s, ...patch };
      if (
        patch.serviceCategoryId !== undefined &&
        patch.serviceCategoryId !== s.serviceCategoryId
      ) {
        const nextSteps = buildWizardSteps(nextState);
        setStepIndex((index) => Math.min(index, nextSteps.length - 1));
      }
      return nextState;
    });
  }, []);

  const clearSlotHold = useCallback(() => {
    setState((s) => {
      if (s.bookingSessionId) {
        void releaseSlotHold(s.bookingSessionId);
      }
      return {
        ...s,
        date: "",
        timeSlot: "",
        slotHoldExpiresAt: "",
        clientSecret: "",
        appointmentId: "",
        totalCharge: 0,
      };
    });
  }, []);

  const handleHoldExpired = useCallback(() => {
    clearSlotHold();
    setHoldExpiredMessage(
      "Your 7-minute hold expired. Please select a new date and time to continue."
    );
    if (dateTimeStepIndex >= 0) {
      setStepIndex(dateTimeStepIndex);
    }
  }, [clearSlotHold, dateTimeStepIndex]);

  const next = () => setStepIndex((index) => Math.min(index + 1, steps.length - 1));
  const back = () => setStepIndex((index) => Math.max(index - 1, 0));

  const showHoldTimer =
    !!state.slotHoldExpiresAt &&
    !!state.timeSlot &&
    HOLD_STEPS.includes(currentStep);

  return (
    <div className="section-container max-w-3xl wizard-shell">
      <div className="text-center mb-8 sm:mb-12">
        <p className="text-[0.65rem] tracking-[0.25em] sm:tracking-[0.35em] uppercase text-[var(--color-gold-dark)] mb-3">
          Reserve Your Seat
        </p>
        <h1
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl sm:text-5xl font-light italic text-white mb-4 px-1"
        >
          Book Your Appointment
        </h1>
        <div className="gold-divider" />
      </div>

      {currentStep !== "confirmation" && (
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center justify-between gap-1 sm:gap-2 mb-3 px-0.5">
            {progressSteps.map((step, i) => (
              <div key={step} className="flex flex-col items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[0.65rem] sm:text-xs font-semibold border transition-all duration-300 shrink-0 ${
                    i < progressIndex
                      ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-obsidian)]"
                      : i === progressIndex
                        ? "border-[var(--color-gold)] text-[var(--color-gold)] bg-transparent"
                        : "border-white/20 text-white/30 bg-transparent"
                  }`}
                >
                  {i < progressIndex ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[0.6rem] tracking-[0.15em] uppercase hidden sm:block transition-colors duration-300 ${
                    i === progressIndex ? "text-[var(--color-gold)]" : "text-white/30"
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-px bg-white/10 mt-1">
            <motion.div
              className="absolute inset-y-0 left-0 bg-[var(--color-gold)]"
              animate={{
                width: `${(progressIndex / Math.max(progressSteps.length - 1, 1)) * 100}%`,
              }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {showHoldTimer && (
        <SlotHoldTimer
          expiresAt={state.slotHoldExpiresAt}
          onExpired={handleHoldExpired}
        />
      )}

      {holdExpiredMessage && currentStep === "dateTime" && (
        <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {holdExpiredMessage}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {currentStep === "service" && (
            <StepService catalog={catalog} state={state} update={update} onNext={next} />
          )}
          {currentStep === "hairColor" && (
            <StepHairColor state={state} update={update} onNext={next} onBack={back} />
          )}
          {currentStep === "tier" && (
            <StepTier state={state} update={update} onNext={next} onBack={back} />
          )}
          {currentStep === "dateTime" && (
            <StepDateTime
              state={state}
              update={update}
              onNext={next}
              onBack={back}
              blockedDates={blockedDates}
              onHoldExpiredMessageClear={() => setHoldExpiredMessage("")}
            />
          )}
          {currentStep === "clientInfo" && (
            <StepClientInfo state={state} update={update} onNext={next} onBack={back} />
          )}
          {currentStep === "payment" && (
            <StepPayment state={state} update={update} onNext={next} onBack={back} />
          )}
          {currentStep === "confirmation" && <StepConfirmation state={state} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
