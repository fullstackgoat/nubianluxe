"use client";

import { useState, useEffect } from "react";
import { getAvailableSlots } from "@/lib/booking-data";
import type { BookingState } from "./BookingWizard";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, startOfDay, addDays } from "date-fns";

interface Props {
  state: BookingState;
  update: (patch: Partial<BookingState>) => void;
  onNext: () => void;
  onBack: () => void;
}

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// Minimum advance notice in days per tier
const ADVANCE_DAYS: Record<string, number> = { REGULAR: 7, PREMIUM: 5, VIP: 3 };

export default function StepDateTime({ state, update, onNext, onBack }: Props) {
  const [viewMonth, setViewMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    state.date ? new Date(state.date) : null
  );
  const [selectedSlot, setSelectedSlot] = useState(state.timeSlot);

  const minDate = addDays(new Date(), ADVANCE_DAYS[state.tier] ?? 3);
  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of calendar
  const startPad = monthStart.getDay();

  const slots = selectedDate
    ? getAvailableSlots(selectedDate, state.tier as "REGULAR" | "PREMIUM" | "VIP")
    : [];

  const pickDate = (day: Date) => {
    setSelectedDate(day);
    setSelectedSlot("");
    update({ date: format(day, "yyyy-MM-dd"), timeSlot: "" });
  };

  const pickSlot = (slot: string) => {
    setSelectedSlot(slot);
    update({ timeSlot: slot });
  };

  const canProceed = !!selectedDate && !!selectedSlot;

  return (
    <div className="space-y-6">
      <div>
        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-3xl font-light text-white italic mb-1">
          Pick Your Date & Time
        </h2>
        <p className="text-white/40 text-sm">
          Showing availability for <span className="text-white/70">{state.tier.charAt(0) + state.tier.slice(1).toLowerCase()}</span> tier.
          Minimum {ADVANCE_DAYS[state.tier]}-day advance notice required.
        </p>
      </div>

      {/* Calendar */}
      <div className="glass-card p-6">
        {/* Month nav */}
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

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_LABELS.map((d) => (
            <div key={d} className="text-center text-[0.6rem] tracking-[0.2em] uppercase text-white/30 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map((day) => {
            const isPast = isBefore(day, minDate);
            const daySlots = getAvailableSlots(day, state.tier as "REGULAR" | "PREMIUM" | "VIP");
            const isUnavailable = isPast || daySlots.length === 0;
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;

            return (
              <button
                key={day.toISOString()}
                disabled={isUnavailable}
                onClick={() => pickDate(day)}
                className={`aspect-square rounded-lg text-sm transition-all duration-200 font-medium ${
                  isSelected
                    ? "bg-[var(--color-gold)] text-[var(--color-obsidian)]"
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

      {/* Time slots */}
      {selectedDate && (
        <div>
          <p className="text-[0.65rem] tracking-[0.25em] uppercase text-[var(--color-gold-dark)] mb-3">
            Available times — {format(selectedDate, "EEE, MMM d")}
          </p>
          {slots.length === 0 ? (
            <p className="text-white/40 text-sm">No availability on this date for your tier.</p>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => pickSlot(slot)}
                  className={`py-3 rounded-lg text-sm border transition-all duration-200 ${
                    selectedSlot === slot
                      ? "border-[var(--color-gold)] bg-[rgba(201,168,76,0.1)] text-[var(--color-gold)]"
                      : "border-white/10 text-white/60 hover:border-white/30 hover:text-white"
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          )}
        </div>
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
