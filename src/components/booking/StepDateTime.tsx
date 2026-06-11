"use client";

import { useState, useEffect, useMemo } from "react";
import { getAvailableSlots } from "@/lib/booking-data";
import {
  getDaySlotAvailabilityForBooking,
  reserveSlotHold,
  releaseSlotHold,
} from "@/app/actions/booking";
import { toLocalDateKey } from "@/lib/dates";
import type { BookingState } from "./BookingWizard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WizardStepNav from "./WizardStepNav";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isBefore,
  addDays,
} from "date-fns";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
  blockedDates: string[];
  onHoldExpiredMessageClear?: () => void;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const ADVANCE_DAYS: Record<string, number> = { REGULAR: 7, PREMIUM: 5, VIP: 3 };

type SlotAvailabilityState = {
  available: string[];
  occupied: string[];
  blocked: string[];
};

const EMPTY_AVAILABILITY: SlotAvailabilityState = {
  available: [],
  occupied: [],
  blocked: [],
};

function formatDurationLabel(minutes: number): string {
  if (minutes >= 60 && minutes % 60 === 0) {
    return `${minutes / 60}h`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }
  return `${minutes}m`;
}

export default function StepDateTime({
  state,
  update,
  onNext,
  onBack,
  blockedDates,
  onHoldExpiredMessageClear,
}: Props) {
  const [viewMonth, setViewMonth] = useState(() =>
    state.date ? new Date(state.date + "T12:00:00") : new Date()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    state.date ? new Date(state.date + "T12:00:00") : null
  );
  const [selectedSlot, setSelectedSlot] = useState(state.timeSlot);
  const [slotAvailability, setSlotAvailability] =
    useState<SlotAvailabilityState>(EMPTY_AVAILABILITY);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [reservingSlot, setReservingSlot] = useState(false);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const minDate = addDays(new Date(), ADVANCE_DAYS[state.tier] ?? 3);
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();
  const tier = state.tier as "REGULAR" | "PREMIUM" | "VIP";

  useEffect(() => {
    if (!selectedDate || state.duration <= 0) {
      setSlotAvailability(EMPTY_AVAILABILITY);
      return;
    }

    const dateKey = toLocalDateKey(selectedDate);
    setLoadingSlots(true);
    getDaySlotAvailabilityForBooking(
      dateKey,
      state.duration,
      tier,
      state.bookingSessionId
    )
      .then(setSlotAvailability)
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, state.bookingSessionId, state.duration, tier]);

  const tierSlots = selectedDate ? getAvailableSlots(selectedDate, tier) : [];

  const pickDate = async (day: Date) => {
    if (state.bookingSessionId && state.timeSlot) {
      await releaseSlotHold(state.bookingSessionId);
    }
    setSelectedDate(day);
    setSelectedSlot("");
    setSlotError("");
    onHoldExpiredMessageClear?.();
    update({ date: toLocalDateKey(day), timeSlot: "", slotHoldExpiresAt: "" });
  };

  const pickSlot = async (slot: string) => {
    if (!selectedDate || !state.bookingSessionId) return;

    setReservingSlot(true);
    setSlotError("");
    onHoldExpiredMessageClear?.();

    const dateKey = toLocalDateKey(selectedDate);
    const result = await reserveSlotHold(
      state.bookingSessionId,
      dateKey,
      slot,
      state.duration,
      tier
    );
    setReservingSlot(false);

    if ("error" in result) {
      setSlotError(result.error);
      setSelectedSlot("");
      update({ timeSlot: "", slotHoldExpiresAt: "" });
      const refreshed = await getDaySlotAvailabilityForBooking(
        dateKey,
        state.duration,
        tier,
        state.bookingSessionId
      );
      setSlotAvailability(refreshed);
      return;
    }

    setSelectedSlot(slot);
    update({
      date: dateKey,
      timeSlot: slot,
      slotHoldExpiresAt: result.expiresAt,
    });
  };

  const canProceed = !!selectedDate && !!selectedSlot && !!state.slotHoldExpiresAt;

  function isDayBlocked(day: Date) {
    return blockedSet.has(toLocalDateKey(day));
  }

  function isDayUnavailable(day: Date) {
    if (isBefore(day, minDate)) return true;
    if (isDayBlocked(day)) return true;
    const daySlots = getAvailableSlots(day, tier);
    return daySlots.length === 0;
  }

  return (
    <div className="space-y-6 min-w-0">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="wizard-step-title font-light text-white italic mb-1"
        >
          Pick Your Date & Time
        </h2>
        <p className="text-white/40 text-sm">
          Showing availability for{" "}
          <span className="text-white/70">
            {state.tier.charAt(0) + state.tier.slice(1).toLowerCase()}
          </span>{" "}
          tier. Minimum {ADVANCE_DAYS[state.tier]}-day advance notice required.
        </p>
        <p className="text-white/35 text-xs mt-2">
          Your service runs about{" "}
          <span className="text-white/55">{formatDurationLabel(state.duration)}</span>. Booked
          times block the full duration so appointments never overlap.
        </p>
        <p className="text-white/35 text-xs mt-1">
          Once you select a time, it&apos;s held for you for 7 minutes while you complete checkout.
        </p>
      </div>

      <div className="glass-card p-4 sm:p-6 min-w-0">
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span style={{ fontFamily: "var(--font-display)" }} className="text-lg text-white font-light">
            {format(viewMonth, "MMMM yyyy")}
          </span>
          <button
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[0.6rem] tracking-[0.2em] uppercase text-white/30 py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {days.map((day) => {
            const blocked = isDayBlocked(day);
            const isUnavailable = isDayUnavailable(day);
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={toLocalDateKey(day)}
                disabled={isUnavailable}
                title={blocked ? "Unavailable — salon closed" : undefined}
                onClick={() => pickDate(day)}
                className={`aspect-square rounded-lg text-sm transition-all duration-200 font-medium ${
                  isSelected
                    ? "bg-[var(--color-gold)] text-[var(--color-obsidian)]"
                    : blocked
                      ? "text-white/10 line-through cursor-not-allowed bg-red-500/5"
                      : isUnavailable
                        ? "text-white/15 cursor-not-allowed"
                        : "text-white/70 hover:bg-[rgba(201,168,76,0.12)] hover:text-white"
                }`}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
            <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)]">
              Available times — {format(selectedDate, "EEE, MMM d")}
            </p>
            <div className="flex flex-wrap gap-3 text-[0.6rem] tracking-[0.12em] uppercase text-white/35">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-white/20 bg-transparent" />
                Open
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-red-400/30 bg-red-500/15" />
                Booked
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm border border-white/10 bg-white/5" />
                Unavailable
              </span>
            </div>
          </div>
          {isDayBlocked(selectedDate) ? (
            <p className="text-white/40 text-sm">This date is blocked and unavailable for booking.</p>
          ) : loadingSlots ? (
            <p className="text-white/40 text-sm">Loading available times…</p>
          ) : tierSlots.length === 0 ? (
            <p className="text-white/40 text-sm">No availability on this date for your tier.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tierSlots.map((slot) => {
                const isOccupied = slotAvailability.occupied.includes(slot);
                const isAvailable = slotAvailability.available.includes(slot);
                const isSelected = selectedSlot === slot;

                return (
                  <button
                    key={slot}
                    disabled={reservingSlot || !isAvailable}
                    onClick={() => isAvailable && pickSlot(slot)}
                    title={
                      isOccupied
                        ? "This time is already booked"
                        : !isAvailable
                          ? `Not enough open time for a ${formatDurationLabel(state.duration)} appointment`
                          : undefined
                    }
                    className={`py-3 rounded-lg text-sm border transition-all duration-200 ${
                      isSelected
                        ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.15)] text-[var(--color-gold)]"
                        : isOccupied
                          ? "border-red-400/25 bg-red-500/10 text-red-200/70 cursor-not-allowed"
                          : isAvailable
                            ? "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                            : "border-white/8 bg-white/[0.02] text-white/20 cursor-not-allowed"
                    } ${reservingSlot && isAvailable ? "opacity-60 cursor-wait" : ""}`}
                  >
                    {slot}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {slotError && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {slotError}
        </p>
      )}

      <WizardStepNav
        onBack={onBack}
        onNext={onNext}
        nextLabel="Continue — Your Information"
        nextDisabled={!canProceed}
      />
    </div>
  );
}
