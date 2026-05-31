"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { SLOT_HOLD_MINUTES } from "@/lib/slot-utils";

interface Props {
  expiresAt: string;
  onExpired: () => void;
}

function formatRemaining(ms: number) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function SlotHoldTimer({ expiresAt, onExpired }: Props) {
  const expiryMs = new Date(expiresAt).getTime();
  const [remainingMs, setRemainingMs] = useState(() => expiryMs - Date.now());

  useEffect(() => {
    const tick = () => {
      const next = expiryMs - Date.now();
      setRemainingMs(next);
      if (next <= 0) onExpired();
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [expiryMs, onExpired]);

  if (remainingMs <= 0) return null;

  const urgent = remainingMs <= 60_000;

  return (
    <div
      className={`mb-6 flex items-start gap-3 rounded-xl border px-4 py-3 ${
        urgent
          ? "border-amber-500/40 bg-amber-500/10"
          : "border-[var(--color-gold)]/25 bg-[rgba(201,168,76,0.06)]"
      }`}
    >
      <Clock
        className={`mt-0.5 h-4 w-4 shrink-0 ${
          urgent ? "text-amber-400" : "text-[var(--color-gold)]"
        }`}
      />
      <div>
        <p
          className={`text-sm font-medium ${
            urgent ? "text-amber-300" : "text-[var(--color-gold-light)]"
          }`}
        >
          Complete your booking in {formatRemaining(remainingMs)}
        </p>
        <p className="mt-1 text-xs text-white/45">
          Your time slot is held for {SLOT_HOLD_MINUTES} minutes. If the timer runs out,
          you&apos;ll need to select a new date and time.
        </p>
      </div>
    </div>
  );
}
