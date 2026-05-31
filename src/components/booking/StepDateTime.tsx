"use client";

import { useState, useEffect, useMemo } from "react";
import { getAvailableSlots } from "@/lib/booking-data";
import { getBookedSlots, reserveSlotHold, releaseSlotHold } from "@/app/actions/booking";
import { toLocalDateKey } from "@/lib/dates";
import type { BookingState } from "./BookingWizard";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [reservingSlot, setReservingSlot] = useState(false);

  const blockedSet = useMemo(() => new Set(blockedDates), [blockedDates]);
  const minDate = addDays(new Date(), ADVANCE_DAYS[state.tier] ?? 3);
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPad = monthStart.getDay();

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    const dateKey = toLocalDateKey(selectedDate);
    setLoadingSlots(true);
    getBookedSlots(dateKey, state.bookingSessionId)
      .then(setBookedSlots)
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, state.bookingSessionId]);

  const tierSlots = selectedDate
    ? getAvailableSlots(selectedDate, state.tier as "REGULAR" | "PREMIUM" | "VIP")
    : [];

  const slots = tierSlots.filter((slot) => !bookedSlots.includes(slot));

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
    const result = await reserveSlotHold(state.bookingSessionId, dateKey, slot);
    setReservingSlot(false);

    if ("error" in result) {
      setSlotError(result.error);
      setSelectedSlot("");
      update({ timeSlot: "", slotHoldExpiresAt: "" });
      const refreshed = await getBookedSlots(dateKey, state.bookingSessionId);
      setBookedSlots(refreshed);
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
    const daySlots = getAvailableSlots(day, state.tier as "REGULAR" | "PREMIUM" | "VIP");
    return daySlots.length === 0;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2
          style={{ fontFamily: "var(--font-display)" }}
          className="text-3xl font-light text-white italic mb-1"
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
          Once you select a time, it&apos;s held for you for 7 minutes while you complete checkout.
        </p>
      </div>

      <div className="glass-card p-6">
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
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-3">
            Available times — {format(selectedDate, "EEE, MMM d")}
          </p>
          {isDayBlocked(selectedDate) ? (
            <p className="text-white/40 text-sm">This date is blocked and unavailable for booking.</p>
          ) : loadingSlots ? (
            <p className="text-white/40 text-sm">Loading available times…</p>
          ) : slots.length === 0 ? (
            <p className="text-white/40 text-sm">No availability on this date for your tier.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  disabled={reservingSlot}
                  onClick={() => pickSlot(slot)}
                  className={`py-3 rounded-lg text-sm border transition-all duration-200 ${
                    selectedSlot === slot
                      ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.1)] text-[var(--color-gold)]"
                      : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                  } ${reservingSlot ? "opacity-60 cursor-wait" : ""}`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {slotError && (
        <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {slotError}
        </p>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} className="btn-outline flex items-center gap-2 px-5">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`btn-gold flex-1 py-4 text-sm ${!canProceed ? "opacity-40 cursor-not-allowed" : ""}`}
        >
          Continue — Your Information
        </button>
      </div>
    </div>
  );
}
