"use client";

import { useState, useTransition } from "react";
import { Clock3 } from "lucide-react";
import { updateAppointmentBufferMinutes } from "@/app/actions/admin";
import {
  APPOINTMENT_BUFFER_PRESETS,
  formatBufferMinutes,
} from "@/lib/salon-settings.constants";

interface Props {
  initialBufferMinutes: number;
}

export default function AppointmentBufferPanel({ initialBufferMinutes }: Props) {
  const [bufferMinutes, setBufferMinutes] = useState(initialBufferMinutes);
  const [customMinutes, setCustomMinutes] = useState(
    APPOINTMENT_BUFFER_PRESETS.includes(
      initialBufferMinutes as (typeof APPOINTMENT_BUFFER_PRESETS)[number]
    )
      ? ""
      : String(initialBufferMinutes)
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedPreset = APPOINTMENT_BUFFER_PRESETS.includes(
    bufferMinutes as (typeof APPOINTMENT_BUFFER_PRESETS)[number]
  )
    ? bufferMinutes
    : null;

  function handlePresetChange(minutes: number) {
    setBufferMinutes(minutes);
    setCustomMinutes("");
    setError("");
    setSuccess("");
  }

  function handleCustomChange(value: string) {
    setCustomMinutes(value);
    setError("");
    setSuccess("");

    const parsed = Number(value);
    if (value.trim() === "") return;
    if (Number.isFinite(parsed) && parsed >= 0) {
      setBufferMinutes(Math.round(parsed));
    }
  }

  function handleSave() {
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await updateAppointmentBufferMinutes(bufferMinutes);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setSuccess(`Buffer updated to ${formatBufferMinutes(bufferMinutes)}.`);
    });
  }

  return (
    <div className="glass-card p-6 mb-8">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center shrink-0">
          <Clock3 className="w-4 h-4 text-gold" />
        </div>
        <div>
          <h2 className="font-display text-xl text-ivory font-light italic mb-1">
            Appointment Buffer
          </h2>
          <p className="font-body text-ivory/40 text-sm leading-relaxed">
            Add breathing room before and after each booked appointment. Clients
            won&apos;t be able to book slots that fall inside the buffer window.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {APPOINTMENT_BUFFER_PRESETS.map((minutes) => {
          const isSelected = selectedPreset === minutes;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => handlePresetChange(minutes)}
              className={`px-3 py-2.5 rounded-lg border text-sm font-body transition-all duration-200 ${
                isSelected
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-[rgba(201,168,76,0.15)] text-ivory/50 hover:border-gold/30 hover:text-ivory/80"
              }`}
            >
              {formatBufferMinutes(minutes)}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="block font-body text-ivory/40 text-xs tracking-widest uppercase mb-2">
            Custom Minutes
          </label>
          <input
            type="number"
            min={0}
            max={480}
            step={5}
            value={customMinutes}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="e.g. 75"
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.15)] rounded-lg px-4 py-3 text-ivory placeholder-ivory/20 text-sm focus:outline-none focus:border-gold/40"
          />
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`btn-gold px-6 py-3 text-xs tracking-widest uppercase shrink-0 ${
            isPending ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? "Saving…" : "Save Buffer"}
        </button>
      </div>

      <p className="font-body text-ivory/30 text-xs mt-4">
        Current setting:{" "}
        <span className="text-gold">{formatBufferMinutes(bufferMinutes)}</span> before and
        after each appointment.
      </p>

      {error && (
        <p className="font-body text-red-400 text-sm mt-3 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </p>
      )}
      {success && (
        <p className="font-body text-emerald-400 text-sm mt-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3">
          {success}
        </p>
      )}
    </div>
  );
}
